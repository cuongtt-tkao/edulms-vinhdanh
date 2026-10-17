export interface KpiSummary {
  totalTeams: number;
  totalMembers: number;
  totalTargets: number;
  totalPoints: number;
  lastUpdated: string;
}

export interface Company {
  id: string;
  code: string; // Th1, Th2, Th3, HT, NC, QN,...
  name: string;
  description?: string;
  active: boolean;
}

export interface Area {
  id: string;
  code: string; // 1.1, 1.2, 2.1,...
  name: string;
  companyCode: string;
  active: boolean;
}

export interface Department {
  id: string;
  code: string;
  name: string; // Tráng Niên, Phụ Nữ, Thanh Niên Nam, Thanh Niên Nữ
  active: boolean;
}

export interface TargetSteps {
  s1: boolean; // Kết bạn (5đ)
  s2: boolean; // Tương tác (2đ)
  s3: boolean; // Gặp (50đ)
  s4: boolean; // Thăm (100đ)
  s5: boolean; // Cơm (100đ)
  s6: boolean; // Gợi mở (500đ)
}

export interface StepDates {
  s1?: string; // YYYY-MM-DD
  s2?: string;
  s3?: string;
  s4?: string;
  s5?: string;
  s6?: string;
}

export type TargetScoreStatus =
  | 'NOT_STARTED'
  | 'ELIMINATED'
  | 'CANCELLED_LACK_STEPS'
  | 'PENALIZED_MISSING'
  | 'SEQUENTIAL_PROGRESS'
  | 'FULL_COMPLETED';

export interface TargetRecord {
  id: string;
  memberId: string;
  targetName: string;
  steps: TargetSteps;
  stepDates?: StepDates;
  score: number;
  status: TargetScoreStatus;
  explanation: string;
  recordedAt: string;
}

export interface StepMetric {
  id: 1 | 2 | 3 | 4 | 5 | 6;
  name: string;
  points: number;
}

export interface MemberGoals {
  s1: number; // Kết bạn
  s2: number; // Tương tác
  s3: number; // Gặp
  s4: number; // Thăm
  s5: number; // Cơm
  s6: number; // Gợi mở
}

export interface MemberResults {
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  s5: number;
  s6: number;
}

export interface Member {
  id: string;
  code: string;
  fullName: string;
  companyCode: string;
  areaCode: string;
  departmentCode: string;
  active: boolean;
  score: number;
  rank?: number;
  rankDelta?: number;
  goals: MemberGoals;
  results: MemberResults;
  targets: TargetRecord[];
  createdAt: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
}

export type UserRole = 'ADMIN' | 'MEMBER';

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  password?: string;
  fullName: string;
  role: UserRole;
  memberId?: string;
  companyCode: string;
  areaCode: string;
  departmentCode: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  emailVerified?: boolean;
  verificationCode?: string;
  createdAt: string;
}

export type ReactionType = 'heart' | 'pray' | 'praise' | 'fire' | 'blessing' | 'like';

export interface ReactionCounts {
  heart: number;
  pray: number;
  praise: number;
  fire: number;
  blessing: number;
  like: number;
}

export interface HuongKhiComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  companyCode?: string;
  areaCode?: string;
  content: string;
  createdAt: string;
}

export interface HuongKhiItem {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  companyCode: string;
  areaCode: string;
  departmentCode?: string;
  title: string;
  content: string;
  category: 'THAM_VIENG' | 'LAM_CHUNG' | 'BAP_TEM' | 'COM_YEU_THUONG' | 'CAU_NGUYEN' | 'GIUP_DO';
  date: string;
  likesCount: number;
  reactions?: ReactionCounts;
  userReaction?: ReactionType; // chỉ dùng để hiển thị (tính từ userReactions của người đang đăng nhập)
  userReactions?: Record<string, ReactionType>; // uid -> cảm xúc đã chọn (lưu chung trên Firestore)
  comments?: HuongKhiComment[];
  imageUrl?: string;
  isFeatured?: boolean;
}

export interface InAppNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'LIKE' | 'COMMENT' | 'RANK_UP' | 'BADGE' | 'SYSTEM';
  read: boolean;
  createdAt: string;
  linkTab?: 'HONORS' | 'ENTRY' | 'PROFILE';
}

export interface MilestoneBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  progressText?: string;
}

export interface CompanyRankItem {
  companyCode: string;
  companyName: string;
  activeMembersCount: number;
  totalScore: number;
  averageScore: number;
  rank: number;
  rankDelta: number;
}

export interface AreaRankItem {
  areaCode: string;
  areaName: string;
  companyCode: string;
  activeMembersCount: number;
  totalScore: number;
  averageScore: number;
  rank: number;
  rankDelta: number;
  color?: string;
}

export interface FestivalRule {
  ruleId: string;
  ruleName: string;
  category: string;
  points: number;
  description: string;
  isElimination?: boolean;
}

export interface DailyVerse {
  verse: string;
  reference: string;
  theme: string;
  reflection?: string;
}

export const STEP_DEFINITIONS: StepMetric[] = [
  { id: 1, name: 'Kết bạn', points: 5 },
  { id: 2, name: 'Tương tác', points: 2 },
  { id: 3, name: 'Gặp', points: 50 },
  { id: 4, name: 'Thăm', points: 100 },
  { id: 5, name: 'Cơm', points: 100 },
  { id: 6, name: 'Gợi mở', points: 500 },
];
