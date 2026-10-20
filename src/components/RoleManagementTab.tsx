import React, { useState, useMemo } from 'react';
import {
  Crown,
  Shield,
  User,
  Search,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  UserX,
  Mail,
  Sparkles,
  HelpCircle,
  Building2,
  MapPin,
  Users2,
  Calendar,
  Plus,
  Trash2,
  Info,
  ShieldCheck,
  Check,
  Flame,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { UserAccount, UserRole, RoleAssignment, Company, Area, Department } from '../types/edulms';
import { BOOTSTRAP_SUPER_ADMIN_EMAILS } from '../firebase';

interface RoleManagementTabProps {
  currentUser: UserAccount | null;
  usersList: UserAccount[];
  companies: Company[];
  areas: Area[];
  departments: Department[];
  onUpdateUserRole: (targetUserId: string, newRole: UserRole, targetName: string) => Promise<void>;
  preAssignedRoles?: RoleAssignment[];
  onPreAssignRole?: (email: string, role: UserRole, note?: string) => Promise<void>;
  onDeletePreAssignedRole?: (email: string) => Promise<void>;
  onShowNotification: (msg: string) => void;
}

export const RoleManagementTab: React.FC<RoleManagementTabProps> = ({
  currentUser,
  usersList,
  companies,
  areas,
  departments,
  onUpdateUserRole,
  preAssignedRoles = [],
  onPreAssignRole,
  onDeletePreAssignedRole,
  onShowNotification,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Quick Pre-Grant Form States
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('ADMIN');
  const [newNote, setNewNote] = useState('');
  const [isSubmittingPreGrant, setIsSubmittingPreGrant] = useState(false);

  // Check if current logged-in user is Super Admin
  const isSuperAdmin = useMemo(() => {
    if (!currentUser) return false;
    if (currentUser.role === 'SUPER_ADMIN') return true;
    const cleanEmail = (currentUser.email || '').toLowerCase().trim();
    if (BOOTSTRAP_SUPER_ADMIN_EMAILS.some((e) => e.toLowerCase() === cleanEmail)) {
      return true;
    }
    if (preAssignedRoles.some((p) => p.email.toLowerCase() === cleanEmail && p.role === 'SUPER_ADMIN')) {
      return true;
    }
    return false;
  }, [currentUser, preAssignedRoles]);

  // Statistics
  const stats = useMemo(() => {
    const totalUsers = usersList.length;
    let superAdminsCount = 0;
    let adminsCount = 0;
    let membersCount = 0;

    usersList.forEach((u) => {
      const uEmail = (u.email || '').toLowerCase().trim();
      const isUserSuper =
        u.role === 'SUPER_ADMIN' ||
        BOOTSTRAP_SUPER_ADMIN_EMAILS.some((e) => e.toLowerCase() === uEmail) ||
        preAssignedRoles.some((p) => p.email.toLowerCase() === uEmail && p.role === 'SUPER_ADMIN');

      if (isUserSuper) {
        superAdminsCount++;
      } else if (u.role === 'ADMIN' || preAssignedRoles.some((p) => p.email.toLowerCase() === uEmail && p.role === 'ADMIN')) {
        adminsCount++;
      } else {
        membersCount++;
      }
    });

    return { totalUsers, superAdminsCount, adminsCount, membersCount };
  }, [usersList, preAssignedRoles]);

  // Filtered User list
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const uEmail = (u.email || '').toLowerCase().trim();
      const isUserSuper =
        u.role === 'SUPER_ADMIN' ||
        BOOTSTRAP_SUPER_ADMIN_EMAILS.some((e) => e.toLowerCase() === uEmail) ||
        preAssignedRoles.some((p) => p.email.toLowerCase() === uEmail && p.role === 'SUPER_ADMIN');
      const isUserAdmin =
        isUserSuper ||
        u.role === 'ADMIN' ||
        preAssignedRoles.some((p) => p.email.toLowerCase() === uEmail && p.role === 'ADMIN');

      // Role filter
      if (roleFilter !== 'ALL') {
        const effectiveRole: UserRole = isUserSuper ? 'SUPER_ADMIN' : isUserAdmin ? 'ADMIN' : 'MEMBER';
        if (effectiveRole !== roleFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = u.fullName?.toLowerCase().includes(q);
        const matchEmail = u.email?.toLowerCase().includes(q);
        const matchCompany = u.companyCode?.toLowerCase().includes(q);
        const matchArea = u.areaCode?.toLowerCase().includes(q);
        return matchName || matchEmail || matchCompany || matchArea;
      }

      return true;
    });
  }, [usersList, roleFilter, searchQuery, preAssignedRoles]);

  // Change user role handler
  const handleRoleChange = async (targetUser: UserAccount, targetRole: UserRole) => {
    if (!isSuperAdmin) {
      onShowNotification('Chỉ Quản trị viên tổng (Super Admin) mới có quyền thay đổi vai trò tài khoản!');
      return;
    }

    if (targetUser.id === currentUser?.id && targetRole !== 'SUPER_ADMIN') {
      onShowNotification('Để bảo vệ an toàn quyền quản trị, bạn không thể tự hạ quyền của chính mình.');
      return;
    }

    setIsUpdating(targetUser.id);
    try {
      await onUpdateUserRole(targetUser.id, targetRole, targetUser.fullName);
      onShowNotification(
        `Đã cập nhật vai trò của "${targetUser.fullName}" thành ${
          targetRole === 'SUPER_ADMIN'
            ? 'Quản Trị Viên Tổng'
            : targetRole === 'ADMIN'
            ? 'Ban Quản Trị'
            : 'Thành Viên'
        }!`
      );
    } catch (err: any) {
      onShowNotification(`Lỗi cập nhật vai trò: ${err?.message || 'Thao tác thất bại'}`);
    } finally {
      setIsUpdating(null);
    }
  };

  // Submit Pre-Grant form
  const handlePreGrantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailClean = newEmail.trim().toLowerCase();
    if (!emailClean || !emailClean.includes('@')) {
      onShowNotification('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    if (!isSuperAdmin) {
      onShowNotification('Chỉ Quản trị viên tổng mới có quyền cấp quyền quản trị.');
      return;
    }

    setIsSubmittingPreGrant(true);
    try {
      // If user already exists in the system, update directly
      const existing = usersList.find((u) => u.email?.toLowerCase() === emailClean);
      if (existing) {
        await onUpdateUserRole(existing.id, newRole, existing.fullName);
      }

      // Also record in pre-assigned list
      if (onPreAssignRole) {
        await onPreAssignRole(emailClean, newRole, newNote.trim());
      }

      onShowNotification(
        `Đã cấp quyền ${
          newRole === 'SUPER_ADMIN' ? 'Quản Trị Viên Tổng' : 'Ban Quản Trị'
        } thành công cho email: ${emailClean}`
      );
      setNewEmail('');
      setNewNote('');
    } catch (err: any) {
      onShowNotification(`Lỗi cấp quyền: ${err?.message || 'Không thể cấp quyền'}`);
    } finally {
      setIsSubmittingPreGrant(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Super Admin Prestigious Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 p-6 sm:p-8 text-white shadow-xl shadow-purple-950/20">
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                <Crown className="w-3.5 h-3.5" />
                Quản Trị Viên Tổng (Super Admin)
              </span>
              <span className="text-xs text-purple-200 font-medium">Phân Quyền & Kiểm Soát Truy Cập</span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Trung Tâm Phân Quyền & Quản Lý Vai Trò Tài Khoản</span>
              <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Quản trị viên tổng có toàn quyền nâng cấp, hạ cấp và chỉ định vai trò cho tất cả tài khoản trong hệ thống EduLMS. Dữ liệu phân quyền được lưu an toàn trực tiếp trên Firestore.
            </p>
          </div>

          {/* Current User Status Pill */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 shrink-0 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
              {isSuperAdmin ? <Crown className="w-6 h-6" /> : <Shield className="w-6 h-6 text-white" />}
            </div>
            <div>
              <div className="text-[11px] text-purple-200 font-semibold uppercase tracking-wider">Vai trò của bạn</div>
              <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <span>{currentUser?.fullName || 'Người dùng'}</span>
                {isSuperAdmin ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    SUPER ADMIN
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-400/20 text-blue-300 border border-blue-400/30">
                    ADMIN
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{currentUser?.email}</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Tổng tài khoản</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
            {stats.totalUsers}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Đã kích hoạt trên hệ thống</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50/80 to-purple-100/50 dark:from-purple-950/40 dark:to-slate-900 p-4 sm:p-5 rounded-2xl border border-purple-200/80 dark:border-purple-800/50 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-700 dark:text-purple-300">Quản trị viên tổng</span>
            <div className="p-2 rounded-xl bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100">
              <Crown className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-950 dark:text-purple-100 tabular-nums">
            {stats.superAdminsCount}
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-300 mt-1 font-medium">Toàn quyền cao nhất</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/50 dark:from-blue-950/40 dark:to-slate-900 p-4 sm:p-5 rounded-2xl border border-blue-200/80 dark:border-blue-800/50 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Ban Quản Trị</span>
            <div className="p-2 rounded-xl bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-950 dark:text-blue-100 tabular-nums">
            {stats.adminsCount}
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-300 mt-1 font-medium">Quản lý danh mục & Excel</div>
        </div>

        <div className="bg-white dark:bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Thành viên thường</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
            {stats.membersCount}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Ghi nhận thi đua cá nhân</div>
        </div>
      </div>

      {/* Pre-Grant / Quick Assign by Email */}
      {isSuperAdmin && (
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-700/60">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-1">
                <Mail className="w-3.5 h-3.5" />
                <span>Cấp Quyền Nhanh Bằng Email</span>
              </div>
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                Chỉ định trước quyền Quản trị viên cho tài khoản mới hoặc đã có
              </h4>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Nhập email để cấp quyền ngay (áp dụng tự động khi họ đăng nhập)
            </div>
          </div>

          <form onSubmit={handlePreGrantSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Địa chỉ Email tài khoản <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ví dụ: admin.khuvuc1@gmail.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Vai trò cấp <span className="text-rose-500">*</span>
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
              >
                <option value="ADMIN">🛡️ Ban Quản Trị (ADMIN)</option>
                <option value="SUPER_ADMIN">👑 Quản Trị Viên Tổng (SUPER_ADMIN)</option>
                <option value="MEMBER">👤 Thành Viên (MEMBER)</option>
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Ghi chú / Đơn vị phụ trách
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Ghi chú (tùy chọn)..."
                  className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={isSubmittingPreGrant}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-xs shrink-0 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cấp quyền</span>
                </button>
              </div>
            </div>
          </form>

          {/* Pre-assigned list if any */}
          {preAssignedRoles.length > 0 && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60">
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2.5">
                Danh sách email được cấp quyền trước ({preAssignedRoles.length}):
              </div>
              <div className="flex flex-wrap gap-2">
                {preAssignedRoles.map((pa) => (
                  <div
                    key={pa.email}
                    className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200"
                  >
                    <span className="font-semibold">{pa.email}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                        pa.role === 'SUPER_ADMIN'
                          ? 'bg-amber-300 text-slate-950'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {pa.role}
                    </span>
                    {pa.note && <span className="text-[10px] text-slate-500">({pa.note})</span>}
                    {onDeletePreAssignedRole && (
                      <button
                        type="button"
                        onClick={() => onDeletePreAssignedRole(pa.email)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Thu hồi quyền"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Users Roster & Role Assignment Table */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
        
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h4 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <span>Danh Sách Tài Khoản & Phân Quyền Trực Tiếp</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                {filteredUsers.length} tài khoản
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Thay đổi vai trò sẽ có hiệu lực ngay lập tức trong toàn hệ thống và cơ sở dữ liệu Firestore.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm theo tên, email, công ty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 w-52 sm:w-64"
              />
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setRoleFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  roleFilter === 'ALL'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setRoleFilter('SUPER_ADMIN')}
                className={`px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  roleFilter === 'SUPER_ADMIN'
                    ? 'bg-purple-900 text-white shadow-2xs'
                    : 'text-purple-700 dark:text-purple-300 hover:text-purple-900'
                }`}
              >
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Quản trị tổng</span>
              </button>
              <button
                onClick={() => setRoleFilter('ADMIN')}
                className={`px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  roleFilter === 'ADMIN'
                    ? 'bg-blue-900 text-white shadow-2xs'
                    : 'text-blue-700 dark:text-blue-300 hover:text-blue-900'
                }`}
              >
                <Shield className="w-3 h-3" />
                <span>Ban Quản trị</span>
              </button>
              <button
                onClick={() => setRoleFilter('MEMBER')}
                className={`px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  roleFilter === 'MEMBER'
                    ? 'bg-emerald-900 text-white shadow-2xs'
                    : 'text-emerald-700 dark:text-emerald-300 hover:text-emerald-900'
                }`}
              >
                <User className="w-3 h-3" />
                <span>Thành viên</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase text-[10px] tracking-wider font-extrabold">
                <th className="py-3 px-3">Tài khoản & Email</th>
                <th className="py-3 px-3">Đơn vị trực thuộc</th>
                <th className="py-3 px-3">Ngày tạo</th>
                <th className="py-3 px-3">Vai trò hiện tại</th>
                <th className="py-3 px-3 text-right">Thao tác phân quyền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                    Không tìm thấy tài khoản nào khớp với tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isUserSuper =
                    user.role === 'SUPER_ADMIN' ||
                    (user.email && BOOTSTRAP_SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase()));
                  const isUserAdminRole = user.role === 'ADMIN';
                  const isSelf = user.id === currentUser?.id;
                  const companyObj = companies.find((c) => c.code === user.companyCode);
                  const areaObj = areas.find((a) => a.code === user.areaCode);

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${
                        isSelf ? 'bg-purple-50/40 dark:bg-purple-950/20' : ''
                      }`}
                    >
                      {/* Column 1: Account & Email */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.fullName}
                                className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                              </div>
                            )}
                            {isUserSuper && (
                              <span
                                className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-[10px] text-slate-950 ring-2 ring-white dark:ring-slate-900 shadow-xs"
                                title="Quản trị viên tổng"
                              >
                                👑
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white truncate">
                              <span>{user.fullName}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-200">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] truncate">
                              <span>{user.email}</span>
                              {user.emailVerified ? (
                                <span className="text-emerald-500" title="Email đã xác thực">
                                  ✓
                                </span>
                              ) : (
                                <span className="text-amber-500 text-[9px]" title="Chưa bấm xác thực email">
                                  (chưa xác thực)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Unit */}
                      <td className="py-3.5 px-3">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">
                          {companyObj?.name || user.companyCode}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <span>Khu vực {areaObj?.name || user.areaCode}</span>
                          <span>•</span>
                          <span>{user.departmentCode}</span>
                        </div>
                      </td>

                      {/* Column 3: Join Date */}
                      <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {user.createdAt || 'Mới tham gia'}
                      </td>

                      {/* Column 4: Role Badge */}
                      <td className="py-3.5 px-3">
                        {isUserSuper ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-purple-700 to-indigo-700 text-amber-200 shadow-xs border border-purple-500/40">
                            <Crown className="w-3 h-3 text-amber-300" />
                            Quản Trị Tổng
                          </span>
                        ) : isUserAdminRole ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
                            <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            Ban Quản Trị
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <User className="w-3 h-3 text-slate-400" />
                            Thành viên
                          </span>
                        )}
                      </td>

                      {/* Column 5: Action Controls */}
                      <td className="py-3.5 px-3 text-right">
                        {isSuperAdmin ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Role Dropdown / Buttons */}
                            <select
                              value={isUserSuper ? 'SUPER_ADMIN' : user.role}
                              disabled={isUpdating === user.id}
                              onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                              className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="MEMBER">👤 Thành viên</option>
                              <option value="ADMIN">🛡️ Ban Quản Trị</option>
                              <option value="SUPER_ADMIN">👑 Quản Trị Tổng</option>
                            </select>

                            {/* Quick button to toggle Admin */}
                            {user.role === 'MEMBER' && !isUserSuper && (
                              <button
                                onClick={() => handleRoleChange(user, 'ADMIN')}
                                disabled={isUpdating === user.id}
                                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-200 font-bold text-xs rounded-xl transition cursor-pointer border border-blue-200/80 dark:border-blue-800 whitespace-nowrap"
                                title="Thăng cấp thành Ban Quản Trị"
                              >
                                Cấp Admin
                              </button>
                            )}

                            {isUserAdminRole && !isUserSuper && (
                              <button
                                onClick={() => handleRoleChange(user, 'SUPER_ADMIN')}
                                disabled={isUpdating === user.id}
                                className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-200 font-bold text-xs rounded-xl transition cursor-pointer border border-purple-200/80 dark:border-purple-800 whitespace-nowrap"
                                title="Thăng cấp lên Quản trị viên tổng"
                              >
                                Lên Tổng
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Chỉ Quản trị viên tổng mới có quyền đổi vai trò
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permission Matrix & Technical Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Permission Comparison Matrix */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Bảng So Sánh Quyền Hạn (Ma trận phân quyền)</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 text-[10px] uppercase font-bold">
                  <th className="py-2 px-2">Chức năng</th>
                  <th className="py-2 px-2 text-center text-purple-700 dark:text-purple-300">Tổng</th>
                  <th className="py-2 px-2 text-center text-blue-700 dark:text-blue-300">Admin</th>
                  <th className="py-2 px-2 text-center text-slate-600 dark:text-slate-400">TV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                <tr>
                  <td className="py-2 px-2 text-slate-700 dark:text-slate-300 font-medium">Xem Bảng vàng thi đua & Bục Top 3</td>
                  <td className="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                  <td className="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                  <td className="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 text-slate-700 dark:text-slate-300 font-medium">Nhập mục tiêu & ghi nhận đối tượng cá nhân</td>
                  <td className="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                  <td className="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                  <td className="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 text-slate-700 dark:text-slate-300 font-medium">Đăng bài hương khí, thả cảm xúc, bình luận</td>
                  <td className="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                  <td className="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                  <td className="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 text-slate-700 dark:text-slate-300 font-medium">Quản lý Công ty, Khu vực, Ban ngành</td>
                  <td className="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                  <td className="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                  <td className="py-2 px-2 text-center text-slate-300">✗</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 text-slate-700 dark:text-slate-300 font-medium">Quản lý danh sách thành viên thi đua</td>
                  <td className="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                  <td className="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                  <td className="py-2 px-2 text-center text-slate-300">✗</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 text-slate-700 dark:text-slate-300 font-medium">Nhập / Xuất dữ liệu Excel (2 chiều)</td>
                  <td className="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                  <td className="py-2 px-2 text-center text-emerald-600 font-bold">✓</td>
                  <td className="py-2 px-2 text-center text-slate-300">✗</td>
                </tr>
                <tr className="bg-purple-50/50 dark:bg-purple-950/30">
                  <td className="py-2 px-2 text-purple-900 dark:text-purple-200 font-bold">Phân quyền, nâng/hạ cấp Quản trị viên</td>
                  <td className="py-2 px-2 text-center text-purple-700 dark:text-purple-300 font-black">Toàn quyền</td>
                  <td className="py-2 px-2 text-center text-slate-400">Chỉ xem</td>
                  <td className="py-2 px-2 text-center text-slate-300">✗</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Technical Explanation: Why firestore.rules alone didn't change UI */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Giải thích kỹ thuật: Phân Quyền Firestore vs Giao diện Web</span>
          </div>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 text-amber-950 dark:text-amber-200">
              <span className="font-bold">❓ Vì sao thêm email vào `firestore.rules` không thấy tác dụng trên web?</span>
              <ul className="list-disc pl-4 mt-1.5 space-y-1 text-[11px] text-amber-900 dark:text-amber-300">
                <li>
                  <strong>Tường lửa máy chủ vs Giao diện:</strong> `firestore.rules` là luật bảo mật chạy trên server Google Firebase để kiểm tra đọc/ghi DB. Web app không đọc file rules này mà đọc vai trò từ collection <code>users</code> (trường <code>role</code>).
                </li>
                <li>
                  <strong>Cần Deploy Rules:</strong> Khi chỉnh sửa file `firestore.rules`, phải thực hiện thao tác triển khai (Deploy) thì Firebase mới áp dụng.
                </li>
                <li>
                  <strong>Đồng bộ hai chiều:</strong> Khi dùng bảng phân quyền ở trên, hệ thống sẽ trực tiếp ghi trường <code>role: 'SUPER_ADMIN'</code> hoặc <code>'ADMIN'</code> vào tài khoản, giúp người dùng nhận quyền quản trị ngay trên web mà không cần sửa code!
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                Hệ thống hiện đã cấu hình sẵn <strong>{BOOTSTRAP_SUPER_ADMIN_EMAILS.join(', ')}</strong> làm Quản trị viên tổng khởi tạo và đã triển khai đồng bộ rules mới lên Firebase.
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
