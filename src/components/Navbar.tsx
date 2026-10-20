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
  Sun,
  Moon,
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
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
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
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    onRefreshNow();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-xs backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo - Prestigious Emblem */}
          <div
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none shrink-0"
            onClick={() => setActiveTab('HONORS')}
            title="Trang chủ Bảng vinh danh EduLMS"
          >
            <div className="relative shrink-0">
              {/* Crest background with luxury metallic sheen */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-md shadow-amber-500/25 ring-2 ring-amber-200/60 dark:ring-amber-500/30 group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center relative overflow-hidden">
                  {/* Subtle inner gold glow */}
                  <div className="absolute inset-0 bg-radial from-amber-400/30 via-transparent to-transparent opacity-80" />
                  
                  {/* Intricate Heraldic SVG: Radiant Scripture & Flame */}
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 drop-shadow-sm relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    {/* Crown / Star radiance */}
                    <path
                      d="M12 2L13.5 5.5L17 6L14.5 8.5L15 12L12 10.2L9 12L9.5 8.5L7 6L10.5 5.5L12 2Z"
                      fill="currentColor"
                      fillOpacity="0.9"
                      strokeWidth="0.5"
                      stroke="#fef08a"
                    />
                    {/* Open Sacred Scripture */}
                    <path
                      d="M4 19.5C5.5 18 8 18 12 19C16 18 18.5 18 20 19.5V8.5C18.5 7 16 7 12 8C8 7 5.5 7 4 8.5V19.5Z"
                      fill="#fef3c7"
                      fillOpacity="0.25"
                      stroke="#fde047"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                    {/* Center Spine */}
                    <line x1="12" y1="8" x2="12" y2="19" stroke="#fde047" strokeWidth="1.2" />
                    {/* Gospel Light Lines */}
                    <line x1="6" y1="11.5" x2="10" y2="12" stroke="#fef08a" strokeWidth="0.9" strokeLinecap="round" />
                    <line x1="6" y1="14.5" x2="10" y2="15" stroke="#fef08a" strokeWidth="0.9" strokeLinecap="round" />
                    <line x1="14" y1="12" x2="18" y2="11.5" stroke="#fef08a" strokeWidth="0.9" strokeLinecap="round" />
                    <line x1="14" y1="15" x2="18" y2="14.5" stroke="#fef08a" strokeWidth="0.9" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Sparkle badge */}
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 text-[9px] font-black text-amber-950 shadow-xs">
                ★
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white font-cinzel group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
                  EduLMS
                </span>
                <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-md shadow-xs shadow-amber-500/20 whitespace-nowrap">
                  Lễ Hội Thi Đua
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden md:block">Bảng Vàng Vinh Danh & Mục Tiêu</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs - Beautiful spacing, responsive labels, no text overflow */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 xl:gap-2 text-xs font-bold shrink-0">
            {/* Tab 1: Vinh danh */}
            <button
              onClick={() => setActiveTab('HONORS')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 lg:px-3 lg:py-2 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'HONORS'
                  ? 'text-amber-950 dark:text-amber-200 bg-amber-100/80 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 shadow-xs ring-1 ring-amber-400/30 font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-amber-900 dark:hover:text-amber-200 hover:bg-amber-50/70 dark:hover:bg-slate-800 border border-transparent'
              }`}
            >
              <div className={`p-1 rounded-lg ${activeTab === 'HONORS' ? 'bg-amber-200/90 dark:bg-amber-800/80 text-amber-900 dark:text-amber-100' : 'bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400'}`}>
                <Trophy className="w-3.5 h-3.5" />
              </div>
              <span>Vinh danh</span>
            </button>

            {/* Tab 2: Nhập kết quả & mục tiêu */}
            <button
              onClick={() => setActiveTab('ENTRY')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 lg:px-3 lg:py-2 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'ENTRY'
                  ? 'text-emerald-950 dark:text-emerald-200 bg-emerald-100/80 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 shadow-xs ring-1 ring-emerald-400/30 font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-900 dark:hover:text-emerald-200 hover:bg-emerald-50/70 dark:hover:bg-slate-800 border border-transparent'
              }`}
            >
              <div className={`p-1 rounded-lg ${activeTab === 'ENTRY' ? 'bg-emerald-200/90 dark:bg-emerald-800/80 text-emerald-900 dark:text-emerald-100' : 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400'}`}>
                <PenTool className="w-3.5 h-3.5" />
              </div>
              <span className="hidden xl:inline">Nhập kết quả & mục tiêu</span>
              <span className="xl:hidden">Nhập kết quả</span>
            </button>

            {/* Tab 3: Hồ sơ cá nhân (Profile) */}
            <button
              onClick={() => setActiveTab('PROFILE')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 lg:px-3 lg:py-2 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'PROFILE'
                  ? 'text-blue-950 dark:text-blue-200 bg-blue-100/80 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-700 shadow-xs ring-1 ring-blue-400/30 font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-900 dark:hover:text-blue-200 hover:bg-blue-50/70 dark:hover:bg-slate-800 border border-transparent'
              }`}
            >
              <div className={`p-1 rounded-lg ${activeTab === 'PROFILE' ? 'bg-blue-200/90 dark:bg-blue-800/80 text-blue-900 dark:text-blue-100' : 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400'}`}>
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="hidden lg:inline">Hồ sơ cá nhân</span>
              <span className="lg:hidden">Hồ sơ</span>
            </button>

            {/* Tab 4: Quản trị (Admin) - Hiện khi role === 'ADMIN' hoặc 'SUPER_ADMIN' */}
            {(currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') && (
              <button
                onClick={() => setActiveTab('ADMIN')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 lg:px-3 lg:py-2 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeTab === 'ADMIN'
                    ? 'text-purple-950 dark:text-purple-200 bg-purple-100/90 dark:bg-purple-950/80 border border-purple-300 dark:border-purple-600 shadow-xs ring-1 ring-purple-400/30 font-black scale-102'
                    : 'text-purple-700 dark:text-purple-300 hover:text-purple-950 dark:hover:text-purple-100 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-transparent hover:scale-102'
                }`}
              >
                <div className={`p-1 rounded-lg ${activeTab === 'ADMIN' ? 'bg-purple-200/90 dark:bg-purple-800/80 text-purple-900 dark:text-purple-100' : 'bg-purple-100/80 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'}`}>
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <span>{currentUser?.role === 'SUPER_ADMIN' ? 'Quản trị Tổng' : 'Quản trị'}</span>
              </button>
            )}

            {/* Thể lệ điểm Button (Spaced & Distinctive) */}
            <button
              onClick={onOpenRulesModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 lg:px-3 lg:py-2 rounded-xl text-amber-800 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/80 dark:border-amber-700/60 transition-all duration-200 font-bold cursor-pointer shadow-2xs hover:scale-102 whitespace-nowrap"
              title="Xem chi tiết thể lệ tính điểm & công thức 6 bước"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="hidden xl:inline">Thể lệ điểm</span>
              <span className="xl:hidden">Thể lệ</span>
            </button>
          </nav>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Dark / Light Mode Switcher */}
            {onToggleDarkMode && (
              <button
                onClick={onToggleDarkMode}
                className="p-2 rounded-xl text-slate-500 hover:text-amber-500 dark:text-slate-300 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title={isDarkMode ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối (Dark mode)'}
                aria-label="Đổi giao diện Sáng / Tối"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>
            )}

            {/* Auto-Refresh Status Pill */}
            <div className="hidden sm:flex items-center bg-slate-100/90 dark:bg-slate-800/90 rounded-full pl-2.5 pr-1 py-1 text-xs border border-slate-200 dark:border-slate-700">
              <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300 mr-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isAutoRefreshPaused ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'
                  }`}
                />
                <span className="hidden lg:inline">
                  {isAutoRefreshPaused ? 'Tạm dừng' : 'Làm mới:'}
                </span>
                <span className="font-bold tabular-nums text-slate-800 dark:text-slate-100">
                  {isAutoRefreshPaused ? '--' : `${countdown}s`}
                </span>
              </span>

              {/* Pause/Resume button */}
              <button
                onClick={onTogglePause}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-white dark:hover:bg-slate-700 transition"
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
                className={`p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-full hover:bg-white dark:hover:bg-slate-700 transition ${
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
                  className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition text-left cursor-pointer"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-2xs ${
                    currentUser.role === 'SUPER_ADMIN'
                      ? 'bg-gradient-to-br from-amber-500 to-purple-700 ring-1 ring-amber-300'
                      : currentUser.role === 'ADMIN'
                      ? 'bg-purple-600'
                      : 'bg-blue-600'
                  }`}>
                    {currentUser.role === 'SUPER_ADMIN' ? (
                      <span className="text-[12px]">👑</span>
                    ) : currentUser.role === 'ADMIN' ? (
                      <Shield className="w-3.5 h-3.5" />
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="hidden sm:block text-xs">
                    <div className="font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[100px] lg:max-w-[130px]">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-400 font-medium leading-none">
                      {currentUser.role === 'SUPER_ADMIN' ? '👑 Quản trị Tổng' : currentUser.role === 'ADMIN' ? 'Ban Quản trị' : `${currentUser.companyCode} • KV ${currentUser.areaCode}`}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{currentUser.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">@{currentUser.username}</div>
                      <div className="mt-1 text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/70 px-2 py-0.5 rounded w-fit">
                        {currentUser.role === 'SUPER_ADMIN' ? '👑 Quản Trị Viên Tổng' : currentUser.role === 'ADMIN' ? '🛡️ Ban Quản Trị Hệ Thống' : 'Tài khoản Cá nhân'}
                      </div>
                    </div>

                    <div className="space-y-1 mt-1 text-xs font-semibold">
                      <button
                        onClick={() => {
                          setActiveTab('PROFILE');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Xem Hồ sơ của tôi</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('ENTRY');
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <PenTool className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Nhập kết quả & mục tiêu</span>
                      </button>

                      {(currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
                        <button
                          onClick={() => {
                            setActiveTab('ADMIN');
                            setShowUserDropdown(false);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-purple-800 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center gap-2 cursor-pointer"
                        >
                          <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <span>{currentUser.role === 'SUPER_ADMIN' ? 'Trang Quản trị Tổng' : 'Trang Quản trị hệ thống'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenAuthModal();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span>Chuyển tài khoản</span>
                      </button>

                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            onLogout();
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
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
                className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-2 px-1 text-[11px] font-bold shadow-lg">
        <button
          onClick={() => setActiveTab('HONORS')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'HONORS'
              ? 'text-amber-950 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Trophy className={`w-4 h-4 mb-0.5 ${activeTab === 'HONORS' ? 'text-amber-600 dark:text-amber-400 scale-110' : 'text-slate-400'}`} />
          <span>Vinh danh</span>
        </button>

        <button
          onClick={() => setActiveTab('ENTRY')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'ENTRY'
              ? 'text-emerald-950 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <PenTool className={`w-4 h-4 mb-0.5 ${activeTab === 'ENTRY' ? 'text-emerald-600 dark:text-emerald-400 scale-110' : 'text-slate-400'}`} />
          <span>Nhập điểm</span>
        </button>

        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'PROFILE'
              ? 'text-blue-950 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <User className={`w-4 h-4 mb-0.5 ${activeTab === 'PROFILE' ? 'text-blue-600 dark:text-blue-400 scale-110' : 'text-slate-400'}`} />
          <span>Hồ sơ</span>
        </button>

        {(currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') && (
          <button
            onClick={() => setActiveTab('ADMIN')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
              activeTab === 'ADMIN'
                ? 'text-purple-950 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 font-black'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Shield className={`w-4 h-4 mb-0.5 ${activeTab === 'ADMIN' ? 'text-purple-600 dark:text-purple-400 scale-110' : 'text-slate-400'}`} />
            <span>{currentUser?.role === 'SUPER_ADMIN' ? 'QTV Tổng' : 'Admin'}</span>
          </button>
        )}

        <button
          onClick={onOpenRulesModal}
          className="flex flex-col items-center py-1 px-2.5 rounded-xl text-amber-800 dark:text-amber-300 hover:bg-amber-50/70 dark:hover:bg-amber-950/40 transition cursor-pointer"
        >
          <BookOpen className="w-4 h-4 mb-0.5 text-amber-600 dark:text-amber-400" />
          <span>Thể lệ</span>
        </button>
      </div>
    </header>
  );
};
