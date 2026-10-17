import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { collection, doc, onSnapshot, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import {
  INITIAL_COMPANIES,
  INITIAL_AREAS,
  INITIAL_DEPARTMENTS,
} from './competitionStore';

/**
 * Lớp đồng bộ Firestore.
 *
 * Mỗi phần tử (thành viên, công ty, bài hương khí...) là MỘT tài liệu trong collection.
 * Hook useCloudCollection hoạt động giống useState:
 *   const [members, setMembers] = useCloudCollection<Member>('members', { enabled });
 *   setMembers(prev => prev.map(...));   // tự so sánh và chỉ ghi các tài liệu thay đổi
 *
 * Dữ liệu cập nhật theo thời gian thực giữa mọi thiết bị (onSnapshot).
 */

type Updater<T> = SetStateAction<T[]>;

export interface CloudCollectionOptions<T> {
  /** Chỉ lắng nghe khi true (ví dụ: đã đăng nhập) */
  enabled: boolean;
  /** Giữ thứ tự thêm vào (dùng cho công ty / khu vực / ban ngành) */
  ordered?: boolean;
  /** Hàm sắp xếp riêng */
  sort?: (a: T, b: T) => number;
  /** Nhận thông báo lỗi (hiển thị toast) */
  onError?: (message: string) => void;
}

const MAX_BATCH = 400;

/** Chuẩn hóa dữ liệu trước khi ghi: bỏ id và mọi giá trị undefined (Firestore không nhận undefined) */
function toDocData(item: { id: string }): Record<string, unknown> {
  const { id: _id, ...rest } = item as any;
  return JSON.parse(JSON.stringify(rest));
}

async function persistDiff<T extends { id: string }>(name: string, prev: T[], next: T[]): Promise<void> {
  const prevById = new Map(prev.map((i) => [i.id, i]));
  const nextIds = new Set<string>();
  const ops: Array<{ kind: 'set' | 'delete'; id: string; data?: Record<string, unknown> }> = [];

  for (const item of next) {
    nextIds.add(item.id);
    const before = prevById.get(item.id);
    if (before === item) continue;
    const data = toDocData(item);
    if (before && JSON.stringify(toDocData(before)) === JSON.stringify(data)) continue;
    ops.push({ kind: 'set', id: item.id, data });
  }
  for (const p of prev) {
    if (!nextIds.has(p.id)) ops.push({ kind: 'delete', id: p.id });
  }

  for (let i = 0; i < ops.length; i += MAX_BATCH) {
    const batch = writeBatch(db);
    for (const op of ops.slice(i, i + MAX_BATCH)) {
      const ref = doc(db, name, op.id);
      if (op.kind === 'set') batch.set(ref, op.data as any);
      else batch.delete(ref);
    }
    await batch.commit();
  }
}

export function useCloudCollection<T extends { id: string }>(
  name: string,
  options: CloudCollectionOptions<T>
): [T[], Dispatch<Updater<T>>, boolean] {
  const { enabled, ordered, sort } = options;
  const [items, setItemsState] = useState<T[]>([]);
  const [loaded, setLoaded] = useState(false);
  const itemsRef = useRef<T[]>([]);
  const onErrorRef = useRef(options.onError);
  onErrorRef.current = options.onError;
  const sortRef = useRef(sort);
  sortRef.current = sort;

  const arrange = useCallback(
    (list: T[]): T[] => {
      if (ordered) {
        return [...list].sort((a: any, b: any) => {
          const ao = a._order ?? Number.MAX_SAFE_INTEGER;
          const bo = b._order ?? Number.MAX_SAFE_INTEGER;
          return ao !== bo ? ao - bo : String(a.id).localeCompare(String(b.id));
        });
      }
      if (sortRef.current) return [...list].sort(sortRef.current);
      return list;
    },
    [ordered]
  );

  // Lắng nghe dữ liệu thời gian thực
  useEffect(() => {
    if (!enabled) {
      itemsRef.current = [];
      setItemsState([]);
      setLoaded(false);
      return;
    }
    const unsubscribe = onSnapshot(
      collection(db, name),
      (snap) => {
        const next = arrange(snap.docs.map((d) => ({ ...(d.data() as object), id: d.id }) as T));
        itemsRef.current = next;
        setItemsState(next);
        // Chỉ coi là "đã tải xong" khi dữ liệu đến từ máy chủ (tránh nhầm bộ nhớ đệm còn trống)
        if (!snap.metadata.fromCache) setLoaded(true);
      },
      (err) => {
        console.error(`[Firestore] Không đọc được "${name}":`, err);
        onErrorRef.current?.(`Không đọc được dữ liệu "${name}": ${err.message}`);
      }
    );
    return unsubscribe;
  }, [name, enabled, arrange]);

  // Ghi dữ liệu: cập nhật giao diện ngay, rồi chỉ ghi lên Firestore các tài liệu thay đổi
  const setItems = useCallback<Dispatch<Updater<T>>>(
    (value) => {
      const prev = itemsRef.current;
      let next = typeof value === 'function' ? (value as (p: T[]) => T[])(prev) : value;
      if (next === prev) return;

      if (ordered) {
        const stamp = Date.now();
        next = next.map((it: any, idx) => (it._order == null ? { ...it, _order: stamp + idx } : it));
      }

      const arranged = arrange(next);
      itemsRef.current = arranged;
      setItemsState(arranged);

      persistDiff(name, prev, next).catch((err) => {
        console.error(`[Firestore] Không ghi được "${name}":`, err);
        onErrorRef.current?.(`Không lưu được lên máy chủ (${name}): ${err.message}`);
      });
    },
    [name, ordered, arrange]
  );

  return [items, setItems, loaded];
}

/** Sắp xếp bài hương khí: mới nhất lên đầu (id dạng hk-<thời gian>) */
export function sortHuongKhiNewestFirst(a: { id: string }, b: { id: string }): number {
  const na = Number(a.id.replace(/\D/g, '')) || 0;
  const nb = Number(b.id.replace(/\D/g, '')) || 0;
  return nb - na;
}

/**
 * Nạp danh mục mẫu (công ty, khu vực, ban ngành) lên Firestore.
 * Không xóa dữ liệu hiện có; chỉ thêm/ghi đè các mục mẫu cùng id.
 * Yêu cầu quyền ADMIN.
 */
export async function seedStructure(): Promise<number> {
  const batch = writeBatch(db);
  let count = 0;
  const put = (name: string, list: Array<{ id: string }>) => {
    list.forEach((item, index) => {
      const data = { ...toDocData(item), _order: index };
      batch.set(doc(db, name, item.id), data);
      count++;
    });
  };
  put('companies', INITIAL_COMPANIES);
  put('areas', INITIAL_AREAS);
  put('departments', INITIAL_DEPARTMENTS);
  await batch.commit();
  return count;
}
