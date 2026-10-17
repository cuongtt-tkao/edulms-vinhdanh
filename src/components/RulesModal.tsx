import React from 'react';
import { X, BookOpen, AlertTriangle, CheckCircle2, Scale, Trophy, Users, ShieldAlert } from 'lucide-react';
import { STEP_DEFINITIONS } from '../types/edulms';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-7 relative cursor-default"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Thể Lệ Tính Điểm & Cơ Chế Xếp Hạng
            </h3>
            <p className="text-xs text-slate-500">
              Quy chế thi đua 6 bước hành động đối tượng
            </p>
          </div>
        </div>

        {/* 6 Steps Table */}
        <div className="mt-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-blue-600" />
            <span>Thang điểm 6 bước hành động (Tổng tối đa: 757 điểm)</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {STEP_DEFINITIONS.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center"
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase">Bước {s.id}</div>
                <div className="font-extrabold text-sm text-slate-900 mt-0.5">{s.name}</div>
                <div className="mt-1 text-xs font-black text-blue-700">+{s.points} điểm</div>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation Order */}
        <div className="mt-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Thứ tự kiểm tra & Công thức tính điểm từng đối tượng</span>
          </h4>

          <div className="space-y-2.5 text-xs text-slate-700">
            
            {/* Rule 1 */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900">1. Chưa làm bước nào:</span>
              <p className="text-slate-600 mt-1">
                Tính <strong>0 điểm</strong>.
              </p>
            </div>

            {/* Rule 2: Điểm liệt */}
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950">
              <div className="flex items-center gap-1.5 font-bold text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>2. Điểm liệt (Đã làm bước 6 mà chưa làm bước 3):</span>
              </div>
              <p className="mt-1.5 text-xs text-rose-900 leading-relaxed">
                Khi thực hiện bước 6 (Gợi mở) mà chưa làm bước 3 (Gặp): Các bước 3, 4, 5, 6 đều tính âm dù đã làm hay chưa (tổng phạt: -(50 + 100 + 100 + 500) = <strong>-750</strong>).
                Bước 1, 2 đã làm thì cộng, chưa làm thì trừ.
              </p>
              <div className="mt-2 p-2 bg-white/80 rounded-xl font-mono text-[11px] space-y-0.5 text-rose-950">
                <div>• Công thức: <code>±5 ± 2 − 750</code></div>
                <div>• Làm 1, 2, 6: <code>5 + 2 − 750 = −743 điểm</code></div>
                <div>• Làm 1, 4, 6: <code>5 − 2 − 750 = −747 điểm</code></div>
                <div>• Chỉ làm 6: <code>−5 − 2 − 750 = −757 điểm</code></div>
              </div>
            </div>

            {/* Rule 3 */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
              <span className="font-bold text-amber-900">3. Thiếu từ 3 bước trở lên:</span>
              <p className="text-amber-900 mt-1">
                Hủy kết quả đối tượng đó, tính <strong>0 điểm</strong>.
              </p>
            </div>

            {/* Rule 4 */}
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950">
              <span className="font-bold text-blue-900">4. Thiếu 1–2 bước:</span>
              <div className="mt-1 space-y-1.5 text-xs text-blue-950">
                <p>
                  • <strong>Thực hiện tuần tự từ Bước 1:</strong> <em>Không trừ điểm bước thiếu</em>. Bảo lưu và cộng trọn vẹn điểm các bước đã làm (Ví dụ: làm liên tục B1..B4 đạt <strong>+157 điểm</strong>; làm B1..B5 đạt <strong>+257 điểm</strong>).
                </p>
                <p className="text-slate-600 text-[11px]">
                  • <strong>Không tuần tự (nhảy cóc, bỏ bước ở giữa):</strong> Tổng điểm các bước đã làm trừ đi điểm các bước bị thiếu (Ví dụ: làm B1, B3, B4, B5 bỏ qua B2).
                </p>
              </div>
            </div>

            {/* Rule 5 */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
              <span className="font-bold text-emerald-900">5. Không thiếu bước nào:</span>
              <p className="text-emerald-900 mt-1">
                Tổng các bước đã làm = <strong>+757 điểm</strong>.
              </p>
            </div>

          </div>
        </div>

        {/* Mechanism of Ranking & Ties */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-100 text-slate-800 text-xs space-y-2">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Quy tắc xếp hạng & Tính điểm công bằng</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px] leading-relaxed">
            <li>
              <strong>Điểm thành viên:</strong> Bằng tổng điểm tất cả các đối tượng của thành viên đó.
            </li>
            <li>
              <strong>Xếp hạng Cá nhân:</strong> Sắp xếp theo tổng điểm thành viên.
            </li>
            <li>
              <strong>Xếp hạng Khu vực và Công ty:</strong> Theo <strong>điểm trung bình mỗi thành viên</strong> (chia cho tất cả thành viên đang hoạt động trong đơn vị đó, người chưa ghi gì tính 0 điểm), giúp đảm bảo đơn vị đông người không bị lợi thế và đơn vị có 1 người điểm cao không áp đảo.
            </li>
            <li>
              <strong>Quy tắc đồng hạng:</strong> Hai thành viên hoặc đơn vị bằng điểm nhau sẽ có <strong>cùng hạng</strong>.
            </li>
            <li>
              <strong>Ghi nhận tự động:</strong> Thành viên tự ghi nhận, hệ thống tính điểm ngay lập tức, không cần duyệt.
            </li>
          </ul>
        </div>

        {/* Modal Action */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
          >
            Đã hiểu thể lệ
          </button>
        </div>
      </div>
    </div>
  );
};
