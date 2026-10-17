import { Company, Area, Department, Member, TargetRecord } from '../types/edulms';
import { calculateTargetScore, computeMemberScore, rankMembers } from '../utils/scoringEngine';

export const INITIAL_COMPANIES: Company[] = [
  { id: 'c-th1', code: 'Th1', name: 'Thương Hội 1 (Th1)', description: 'Công ty Thương Hội 1', active: true },
  { id: 'c-th2', code: 'Th2', name: 'Thương Hội 2 (Th2)', description: 'Công ty Thương Hội 2', active: true },
  { id: 'c-th3', code: 'Th3', name: 'Thương Hội 3 (Th3)', description: 'Công ty Thương Hội 3', active: true },
  { id: 'c-ht', code: 'HT', name: 'Hội Thánh (HT)', description: 'Công ty Hội Thánh trung tâm', active: true },
  { id: 'c-nc', code: 'NC', name: 'Nam Cali (NC)', description: 'Chi nhánh Nam Cali', active: true },
  { id: 'c-qn', code: 'QN', name: 'Quảng Nam (QN)', description: 'Đơn vị Quảng Nam', active: true },
];

export const INITIAL_AREAS: Area[] = [
  { id: 'a-1.1', code: '1.1', name: 'Khu vực 1.1', companyCode: 'Th1', active: true },
  { id: 'a-1.2', code: '1.2', name: 'Khu vực 1.2', companyCode: 'Th1', active: true },
  { id: 'a-2.1', code: '2.1', name: 'Khu vực 2.1', companyCode: 'Th2', active: true },
  { id: 'a-2.2', code: '2.2', name: 'Khu vực 2.2', companyCode: 'Th2', active: true },
  { id: 'a-3.1', code: '3.1', name: 'Khu vực 3.1', companyCode: 'Th3', active: true },
  { id: 'a-4.1', code: '4.1', name: 'Khu vực 4.1', companyCode: 'HT', active: true },
  { id: 'a-5.1', code: '5.1', name: 'Khu vực 5.1', companyCode: 'NC', active: true },
  { id: 'a-6.1', code: '6.1', name: 'Khu vực 6.1', companyCode: 'QN', active: true },
];

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'd-tn', code: 'Tráng Niên', name: 'Tráng Niên', active: true },
  { id: 'd-pn', code: 'Phụ Nữ', name: 'Phụ Nữ', active: true },
  { id: 'd-tnn', code: 'Thanh Niên Nam', name: 'Thanh Niên Nam', active: true },
  { id: 'd-tnnu', code: 'Thanh Niên Nữ', name: 'Thanh Niên Nữ', active: true },
];

// Seed sample targets for initial members demonstrating the scoring rules
const createSeedTarget = (
  id: string,
  memberId: string,
  targetName: string,
  s1: boolean,
  s2: boolean,
  s3: boolean,
  s4: boolean,
  s5: boolean,
  s6: boolean,
  recordedAt: string
): TargetRecord => {
  const steps = { s1, s2, s3, s4, s5, s6 };
  const result = calculateTargetScore(steps);
  return {
    id,
    memberId,
    targetName,
    steps,
    score: result.score,
    status: result.status,
    explanation: result.explanation,
    recordedAt,
  };
};

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm-01',
    code: 'MEM-001',
    fullName: 'Nguyễn Văn An',
    companyCode: 'Th1',
    areaCode: '1.1',
    departmentCode: 'Thanh Niên Nam',
    active: true,
    score: 0, // recomputed below
    rankDelta: 2,
    goals: { s1: 10, s2: 8, s3: 5, s4: 4, s5: 4, s6: 3 },
    results: { s1: 8, s2: 7, s3: 4, s4: 3, s5: 3, s6: 2 },
    targets: [
      createSeedTarget('t-01', 'm-01', 'Anh Tuấn (Hàng xóm)', true, true, true, true, true, true, '16/10/2026 09:30'),
      createSeedTarget('t-02', 'm-01', 'Anh Hoàng (Bạn học cũ)', true, true, true, true, true, false, '15/10/2026 14:15'),
      createSeedTarget('t-03', 'm-01', 'Chú Minh (Đồng nghiệp)', true, true, true, true, true, true, '14/10/2026 18:00'),
    ],
    createdAt: '2026-10-01',
  },
  {
    id: 'm-02',
    code: 'MEM-002',
    fullName: 'Trần Thị Mai',
    companyCode: 'Th1',
    areaCode: '1.2',
    departmentCode: 'Phụ Nữ',
    active: true,
    score: 0,
    rankDelta: 1,
    goals: { s1: 8, s2: 8, s3: 4, s4: 4, s5: 3, s6: 2 },
    results: { s1: 6, s2: 5, s3: 3, s4: 3, s5: 2, s6: 2 },
    targets: [
      createSeedTarget('t-04', 'm-02', 'Chị Lan (Khu tập thể)', true, true, true, true, true, true, '16/10/2026 08:20'),
      createSeedTarget('t-05', 'm-02', 'Cô Hà (Chợ phiên)', true, true, true, true, false, false, '15/10/2026 10:45'),
    ],
    createdAt: '2026-10-02',
  },
  {
    id: 'm-03',
    code: 'MEM-003',
    fullName: 'Lê Hoàng Long',
    companyCode: 'Th2',
    areaCode: '2.1',
    departmentCode: 'Tráng Niên',
    active: true,
    score: 0,
    rankDelta: 0,
    goals: { s1: 6, s2: 6, s3: 4, s4: 3, s5: 3, s6: 2 },
    results: { s1: 5, s2: 4, s3: 3, s4: 2, s5: 2, s6: 1 },
    targets: [
      createSeedTarget('t-06', 'm-03', 'Bác Thành (Tổ dân phố)', true, true, true, true, true, true, '15/10/2026 16:30'),
      // Example of penalty missing 1 step (done 1,2,3,4,6, missing 5: (5+2+50+100+500) - 100 = 657 - 100 = 557)
      createSeedTarget('t-07', 'm-03', 'Anh Dũng (CLB Thể thao)', true, true, true, true, false, true, '14/10/2026 11:20'),
    ],
    createdAt: '2026-10-03',
  },
  {
    id: 'm-04',
    code: 'MEM-004',
    fullName: 'Phạm Đức Minh',
    companyCode: 'Th2',
    areaCode: '2.2',
    departmentCode: 'Thanh Niên Nam',
    active: true,
    score: 0,
    rankDelta: -1,
    goals: { s1: 7, s2: 6, s3: 3, s4: 3, s5: 2, s6: 1 },
    results: { s1: 4, s2: 3, s3: 2, s4: 2, s5: 1, s6: 1 },
    targets: [
      createSeedTarget('t-08', 'm-04', 'Bạn Hưng (Đại học)', true, true, true, true, true, true, '16/10/2026 10:00'),
    ],
    createdAt: '2026-10-04',
  },
  {
    id: 'm-05',
    code: 'MEM-005',
    fullName: 'Võ Thị Bích',
    companyCode: 'HT',
    areaCode: '4.1',
    departmentCode: 'Thanh Niên Nữ',
    active: true,
    score: 0,
    rankDelta: 1,
    goals: { s1: 5, s2: 5, s3: 3, s4: 2, s5: 2, s6: 1 },
    results: { s1: 3, s2: 3, s3: 2, s4: 1, s5: 1, s6: 1 },
    targets: [
      createSeedTarget('t-09', 'm-05', 'Em Thảo (Nhóm múa)', true, true, true, true, true, true, '16/10/2026 09:10'),
    ],
    createdAt: '2026-10-05',
  },
  {
    id: 'm-06',
    code: 'MEM-006',
    fullName: 'Đặng Thanh Tùng',
    companyCode: 'NC',
    areaCode: '5.1',
    departmentCode: 'Tráng Niên',
    active: true,
    score: 0,
    rankDelta: 0,
    goals: { s1: 6, s2: 5, s3: 3, s4: 2, s5: 2, s6: 1 },
    results: { s1: 4, s2: 3, s3: 1, s4: 1, s5: 1, s6: 0 },
    targets: [
      // Example of missing >= 3 steps -> 0 score
      createSeedTarget('t-10', 'm-06', 'Anh Nam (Hội xe)', true, true, true, false, false, false, '14/10/2026 15:00'),
    ],
    createdAt: '2026-10-06',
  },
  {
    id: 'm-07',
    code: 'MEM-007',
    fullName: 'Hoàng Quốc Bảo',
    companyCode: 'QN',
    areaCode: '6.1',
    departmentCode: 'Thanh Niên Nam',
    active: true,
    score: 0,
    rankDelta: 0,
    goals: { s1: 5, s2: 4, s3: 2, s4: 2, s5: 1, s6: 1 },
    results: { s1: 0, s2: 0, s3: 0, s4: 0, s5: 0, s6: 0 },
    targets: [], // Member with 0 targets -> 0 score
    createdAt: '2026-10-07',
  },
  {
    id: 'm-08',
    code: 'MEM-008',
    fullName: 'Ngô Thu Thảo',
    companyCode: 'Th3',
    areaCode: '3.1',
    departmentCode: 'Phụ Nữ',
    active: true,
    score: 0,
    rankDelta: 0,
    goals: { s1: 6, s2: 5, s3: 3, s4: 3, s5: 2, s6: 1 },
    results: { s1: 3, s2: 2, s3: 2, s4: 1, s5: 1, s6: 1 },
    targets: [
      createSeedTarget('t-11', 'm-08', 'Chị Tuyết (Tiệm bánh)', true, true, true, true, true, true, '15/10/2026 19:20'),
    ],
    createdAt: '2026-10-08',
  },
];

// Initialize score for members
INITIAL_MEMBERS.forEach((m) => {
  m.score = computeMemberScore(m.targets);
});

const STORAGE_KEYS = {
  COMPANIES: 'edulms_competition_companies_v2',
  AREAS: 'edulms_competition_areas_v2',
  DEPARTMENTS: 'edulms_competition_departments_v2',
  MEMBERS: 'edulms_competition_members_v2',
};

export function loadStoredCompanies(): Company[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse stored companies', e);
  }
  return INITIAL_COMPANIES;
}

export function saveStoredCompanies(data: Company[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save companies', e);
  }
}

export function loadStoredAreas(): Area[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AREAS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse stored areas', e);
  }
  return INITIAL_AREAS;
}

export function saveStoredAreas(data: Area[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AREAS, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save areas', e);
  }
}

export function loadStoredDepartments(): Department[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse stored departments', e);
  }
  return INITIAL_DEPARTMENTS;
}

export function saveStoredDepartments(data: Department[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save departments', e);
  }
}

export function loadStoredMembers(): Member[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (raw) {
      const parsed: Member[] = JSON.parse(raw);
      // Re-verify scores
      parsed.forEach((m) => {
        m.score = computeMemberScore(m.targets || []);
      });
      return rankMembers(parsed);
    }
  } catch (e) {
    console.warn('Failed to parse stored members', e);
  }
  return rankMembers(INITIAL_MEMBERS);
}

export function saveStoredMembers(data: Member[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save members', e);
  }
}

export const INITIAL_ACCOUNTS: import('../types/edulms').UserAccount[] = [
  {
    id: 'user-admin',
    username: 'admin',
    email: 'admin@edulms.vn',
    fullName: 'Ban Quản Trị Hệ Thống',
    role: 'ADMIN',
    companyCode: 'Th1',
    areaCode: '1.1',
    departmentCode: 'Tráng Niên',
    createdAt: '2026-10-01',
  },
  {
    id: 'user-01',
    username: 'nguyenvanan',
    email: 'an.nguyen@edulms.vn',
    fullName: 'Nguyễn Văn An',
    role: 'MEMBER',
    memberId: 'm-01',
    companyCode: 'Th1',
    areaCode: '1.1',
    departmentCode: 'Thanh Niên Nam',
    createdAt: '2026-10-01',
  },
  {
    id: 'user-02',
    username: 'tranmai',
    email: 'mai.tran@edulms.vn',
    fullName: 'Trần Thị Mai',
    role: 'MEMBER',
    memberId: 'm-02',
    companyCode: 'Th1',
    areaCode: '1.2',
    departmentCode: 'Phụ Nữ',
    createdAt: '2026-10-02',
  },
];

const AUTH_KEYS = {
  ACCOUNTS: 'edulms_competition_accounts_v2',
  CURRENT_USER: 'edulms_current_user_v2',
};

export function loadStoredAccounts(): import('../types/edulms').UserAccount[] {
  try {
    const raw = localStorage.getItem(AUTH_KEYS.ACCOUNTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse stored accounts', e);
  }
  return INITIAL_ACCOUNTS;
}

export function saveStoredAccounts(data: import('../types/edulms').UserAccount[]): void {
  try {
    localStorage.setItem(AUTH_KEYS.ACCOUNTS, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save accounts', e);
  }
}

export function loadCurrentAuthUser(): import('../types/edulms').UserAccount | null {
  try {
    const raw = localStorage.getItem(AUTH_KEYS.CURRENT_USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse current user', e);
  }
  // Default to Member account Nguyễn Văn An for instant smooth experience
  return INITIAL_ACCOUNTS[1];
}

export function saveCurrentAuthUser(user: import('../types/edulms').UserAccount | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_KEYS.CURRENT_USER);
    }
  } catch (e) {
    console.warn('Failed to save current user', e);
  }
}

export const INITIAL_HUONG_KHI: import('../types/edulms').HuongKhiItem[] = [
  {
    id: 'hk-01',
    authorId: 'm-01',
    authorName: 'Nguyễn Văn An',
    companyCode: 'Th1',
    areaCode: '1.1',
    departmentCode: 'Thanh Niên Nam',
    title: 'Bữa cơm yêu thương mở lối tấm lòng người hàng xóm',
    content: 'Sau 3 tuần kiên trì tương tác và thăm hỏi, tôi đã mời được anh Tuấn (hàng xóm cạnh nhà) cùng dùng bữa tối thân mật. Qua bữa cơm ấm cúng, anh đã mở lòng chia sẻ những gánh nặng công việc và gia đình. Tạ ơn Chúa vì cơ hội gợi mở Lời Ngài thật tự nhiên!',
    category: 'COM_YEU_THUONG',
    date: '16/10/2026',
    likesCount: 24,
    reactions: {
      heart: 12,
      pray: 8,
      praise: 5,
      fire: 4,
      blessing: 3,
      like: 6,
    },
    comments: [
      {
        id: 'c-101',
        authorId: 'm-02',
        authorName: 'Trần Thị Mai',
        companyCode: 'Th1',
        areaCode: '1.2',
        content: 'Amen! Tấm lòng chân thành và bữa cơm ấm áp luôn là nhịp cầu tuyệt vời nhất.',
        createdAt: '16/10/2026 10:15',
      },
      {
        id: 'c-102',
        authorId: 'm-03',
        authorName: 'Lê Hoàng Long',
        companyCode: 'Th2',
        areaCode: '2.1',
        content: 'Tuyệt vời anh An ơi! Đội Th2 xin hiệp ý cầu nguyện cho anh Tuấn sớm tiếp nhận Tin Lành.',
        createdAt: '16/10/2026 11:30',
      },
    ],
    isFeatured: true,
  },
  {
    id: 'hk-02',
    authorId: 'm-02',
    authorName: 'Trần Thị Mai',
    companyCode: 'Th1',
    areaCode: '1.2',
    departmentCode: 'Phụ Nữ',
    title: 'Thăm viếng gia đình chị Lan tại khu tập thể cũ',
    content: 'Ban Phụ Nữ đã đến thăm và cùng cầu nguyện cho mẹ của chị Lan đang nằm viện. Tấm lòng chân thành và sự quan tâm chu đáo đã khiến gia đình chị rất xúc động. Chị Lan ngỏ ý muốn tìm hiểu về đức tin và đã đồng ý tham gia buổi học Kinh Thánh tuần tới.',
    category: 'THAM_VIENG',
    date: '15/10/2026',
    likesCount: 19,
    reactions: {
      heart: 9,
      pray: 11,
      praise: 4,
      fire: 2,
      blessing: 6,
      like: 4,
    },
    comments: [
      {
        id: 'c-201',
        authorId: 'm-05',
        authorName: 'Võ Thị Bích',
        companyCode: 'HT',
        areaCode: '4.1',
        content: 'Cảm tạ Chúa vì ban Phụ Nữ đã làm việc lành đúng lúc gia đình chị Lan cần nhất!',
        createdAt: '15/10/2026 16:45',
      },
    ],
    isFeatured: true,
  },
  {
    id: 'hk-03',
    authorId: 'm-03',
    authorName: 'Lê Hoàng Long',
    companyCode: 'Th2',
    areaCode: '2.1',
    departmentCode: 'Tráng Niên',
    title: 'Hạt giống nảy mầm qua câu lạc bộ thể thao',
    content: 'Tại sân bóng đá thanh niên phường, tôi đã làm quen và kết bạn với 5 bạn trẻ. Sau trận bóng, chúng tôi ngồi uống trà và chia sẻ về ý nghĩa cuộc sống. Một bạn đã bật khóc khi nghe câu chuyện Chúa biến đổi cuộc đời tôi.',
    category: 'LAM_CHUNG',
    date: '14/10/2026',
    likesCount: 31,
    reactions: {
      heart: 14,
      pray: 6,
      praise: 8,
      fire: 9,
      blessing: 5,
      like: 8,
    },
    comments: [
      {
        id: 'c-301',
        authorId: 'm-01',
        authorName: 'Nguyễn Văn An',
        companyCode: 'Th1',
        areaCode: '1.1',
        content: 'Phương pháp tiếp cận rất gần gũi và tự nhiên anh Long ơi! Khích lệ anh em thanh niên rất nhiều.',
        createdAt: '14/10/2026 20:10',
      },
    ],
    isFeatured: true,
  },
  {
    id: 'hk-04',
    authorId: 'm-05',
    authorName: 'Võ Thị Bích',
    companyCode: 'HT',
    areaCode: '4.1',
    departmentCode: 'Thanh Niên Nữ',
    title: 'Giúp đỡ gia đình neo đơn dọn dẹp sau bão',
    content: 'Các bạn trẻ đã cùng nhau đến hỗ trợ lợp lại mái tôn và dọn dẹp vườn cho một cụ bà neo đơn trong khu xóm. Bằng hành động yêu thương cụ thể, bà đã nhận ra hương thơm của Đấng Christ trong từng việc làm.',
    category: 'GIUP_DO',
    date: '13/10/2026',
    likesCount: 28,
    reactions: {
      heart: 16,
      pray: 7,
      praise: 10,
      fire: 5,
      blessing: 8,
      like: 7,
    },
    comments: [
      {
        id: 'c-401',
        authorId: 'm-04',
        authorName: 'Phạm Minh Tuấn',
        companyCode: 'Th3',
        areaCode: '3.1',
        content: 'Ánh sáng việc lành chiếu sáng giữa thế gian! Xin Chúa ban phước dồi dào cho các bạn.',
        createdAt: '13/10/2026 18:22',
      },
    ],
    isFeatured: true,
  },
];

const HUONG_KHI_KEY = 'edulms_huong_khi_items_v2';

export function loadStoredHuongKhi(): import('../types/edulms').HuongKhiItem[] {
  try {
    const raw = localStorage.getItem(HUONG_KHI_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse stored huong khi', e);
  }
  return INITIAL_HUONG_KHI;
}

export function saveStoredHuongKhi(data: import('../types/edulms').HuongKhiItem[]): void {
  try {
    localStorage.setItem(HUONG_KHI_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save huong khi', e);
  }
}

import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
//import { Member } from './types/edulms';

// Hàm 1: Đẩy dữ liệu một thành viên lên Firebase Firestore
export const saveMemberToCloud = async (member: Member) => {
  try {
    // Lưu vào bảng 'members' với ID chính là id của thành viên đó
    await setDoc(doc(db, 'members', member.id), member);
  } catch (error) {
    console.error("Lỗi đồng bộ lên đám mây: ", error);
  }
};

// Hàm 2: Lắng nghe dữ liệu thay đổi theo thời gian thực (Realtime)
export const subscribeMembersCloud = (callback: (members: Member[]) => void) => {
  return onSnapshot(collection(db, 'members'), (snapshot) => {
    const membersList: Member[] = [];
    snapshot.forEach((doc) => {
      membersList.push(doc.data() as Member);
    });
    if (membersList.length > 0) {
      callback(membersList);
    }
  });
};
