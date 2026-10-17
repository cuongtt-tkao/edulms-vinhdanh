import React, { useState } from 'react';
import {
  Trophy,
  BarChart3,
  BookOpen,
  User,
  Shield,
  PenTool,
  RefreshCw,
  Pause,
  Play,
  ChevronDown,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { UserAccount } from '../types/edulms';

interface NavbarProps {
  countdown: number;
  isAutoRefreshPaused: boolean;
  onTogglePause: () => void;
  onRefreshNow: () => void;
  onOpenRulesModal: () => void;
  onOpenAuthModal: () => void;
  activeTab: 'HONORS' | 'ENTRY' | 'PROFILE' | 'ADMIN';
  setActiveTab: (tab: 'HONORS' | 'ENTRY' | 'PROFILE' | 'ADMIN') => void;
  currentUser: UserAccount | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  countdown,
  isAutoRefreshPaused,
  onTogglePause,
  onRefreshNow,
  onOpenRulesModal,
  onOpenAuthModal,
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    onRefreshNow();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <header className="bg-white/95 border-b border-slate-200 sticky top-0 z-50 shadow-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab('HONORS')}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 via-amber-400 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 ring-2 ring-amber-100">
              <svg className="w-5 h-5 text-amber-950 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v-3H9V9h2V6h2v3h2v2h-2v3h2v2h-2v2h-2v-2z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight font-cinzel">EduLMS</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 rounded">Thi Đua</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Lễ hội thi đua Truyền Đạo</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Không cùng 1 trang, chia tab rõ ràng) */}
          <nav className="hidden md:flex items-center gap-1 text-xs sm:text-sm font-bold text-slate-600">
            {/* Tab 1: Vinh danh */}
            <button
              onClick={() => setActiveTab('HONORS')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition ${
                activeTab === 'HONORS'
                  ? 'text-blue-700 bg-blue-50 shadow-2xs font-extrabold'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Vinh danh</span>
            </button>

            {/* Tab 2: Nhập kết quả & mục tiêu */}
            <button
              onClick={() => setActiveTab('ENTRY')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition ${
                activeTab === 'ENTRY'
                  ? 'text-blue-700 bg-blue-50 shadow-2xs font-extrabold'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PenTool className="w-4 h-4 text-emerald-600" />
              <span>Nhập mục tiêu & kết quả</span>
            </button>

            {/* Tab 3: Hồ sơ cá nhân (Profile) */}
            <button
              onClick={() => setActiveTab('PROFILE')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition ${
                activeTab === 'PROFILE'
                  ? 'text-blue-700 bg-blue-50 shadow-2xs font-extrabold'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4 text-blue-600" />
              <span>Hồ sơ cá nhân</span>
            </button>

            {/* Tab 4: Quản trị (Admin) - Chỉ hiện khi role === 'ADMIN' */}
            {currentUser?.role === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('ADMIN')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition ${
                  activeTab === 'ADMIN'
                    ? 'text-purple-700 bg-purple-50 shadow-2xs font-extrabold'
                    : 'hover:text-purple-900 hover:bg-purple-50/60'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Quản trị</span>
              </button>
            )}

            {/* Thể lệ điểm */}
            <button
              onClick={onOpenRulesModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:text-slate-900 hover:bg-slate-100 transition text-amber-700 font-semibold"
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Thể lệ điểm</span>
            </button>
          </nav>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Auto-Refresh Status Pill */}
            <div className="flex items-center bg-slate-100/90 rounded-full pl-2.5 pr-1 py-1 text-xs border border-slate-200">
              <span className="flex items-center gap-1.5 font-medium text-slate-600 mr-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isAutoRefreshPaused ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'
                  }`}
                />
                <span className="hidden sm:inline">
                  {isAutoRefreshPaused ? 'Tạm dừng' : 'Làm mới:'}
                </span>
                <span className="font-bold tabular-nums text-slate-800">
                  {isAutoRefreshPaused ? '--' : `${countdown}s`}
                </span>
              </span>

              {/* Pause/Resume button */}
              <button
                onClick={onTogglePause}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-white transition"
                title={isAutoRefreshPaused ? 'Tiếp tục tự động làm mới' : 'Tạm dừng tự động làm mới'}
              >
                {isAutoRefreshPaused ? (
                  <Play className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Pause className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Manual Refresh button */}
              <button
                onClick={handleManualRefresh}
                className={`p-1 text-slate-500 hover:text-slate-900 rounded-full hover:bg-white transition ${
                  isRefreshing ? 'animate-spin text-blue-600' : ''
                }`}
                title="Làm mới bảng xếp hạng ngay"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* User Profile / Auth Area */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition text-left"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-2xs ${
                    currentUser.role === 'ADMIN' ? 'bg-purple-600' : 'bg-blue-600'
                  }`}>
                    {currentUser.role === 'ADMIN' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className="hidden sm:block text-xs">
                    <div className="font-bold text-slate-900 leading-tight truncate max-w-[110px]">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium leading-none">
                      {currentUser.role === 'ADMIN' ? 'Quản trị' : `${currentUser.companyCode} • KV ${currentUser.areaCode}`}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 border-b border-slate-100">
                      <div className="font-bold text-slate-900 text-xs">{currentUser.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">@{currentUser.username}</div>
                      <div className="mt-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded w-fit">
                        {currentUser.role === 'ADMIN' ? 'Quyền Quản trị viên' : 'Tài khoản Cá nhân'}
                      </div>
                    </div>

                    <div className="space-y-1 mt-1 text-xs font-semibold">
                      <button
                        onClick={() => {
                          setActiveTab('PROFILE');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        <span>Xem Hồ sơ của tôi</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('ENTRY');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                      >
                        <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Nhập kết quả & mục tiêu</span>
                      </button>

                      {currentUser.role === 'ADMIN' && (
                        <button
                          onClick={() => {
                            setActiveTab('ADMIN');
                            setShowUserDropdown(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-purple-800 hover:bg-purple-50 flex items-center gap-2"
                        >
                          <Shield className="w-3.5 h-3.5 text-purple-600" />
                          <span>Trang Quản trị hệ thống</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenAuthModal();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                      >
                        <LogIn className="w-3.5 h-3.5 text-slate-500" />
                        <span>Chuyển tài khoản</span>
                      </button>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            onLogout();
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 bg-white py-1.5 px-2 text-[11px] font-bold">
        <button
          onClick={() => setActiveTab('HONORS')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg ${
            activeTab === 'HONORS' ? 'text-blue-700' : 'text-slate-500'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Vinh danh</span>
        </button>

        <button
          onClick={() => setActiveTab('ENTRY')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg ${
            activeTab === 'ENTRY' ? 'text-blue-700' : 'text-slate-500'
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span>Nhập điểm</span>
        </button>

        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg ${
            activeTab === 'PROFILE' ? 'text-blue-700' : 'text-slate-500'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Hồ sơ</span>
        </button>

        {currentUser?.role === 'ADMIN' && (
          <button
            onClick={() => setActiveTab('ADMIN')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg ${
              activeTab === 'ADMIN' ? 'text-purple-700' : 'text-slate-500'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin</span>
          </button>
        )}
      </div>
    </header>
  );
};
