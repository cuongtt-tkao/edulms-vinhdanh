import React, { useState } from 'react';
import {
  User,
  Shield,
  Building2,
  MapPin,
  Users2,
  Trophy,
  Target,
  Sparkles,
  Calendar,
  LogOut,
  PenTool,
  CheckCircle2,
  Clock,
  ArrowRight,
  Heart,
  Pencil,
  Image as ImageIcon,
  KeyRound,
  Send,
  Plus,
  Lock,
  Camera,
  X,
  Mail,
  Check,
  MessageCircle,
  ThumbsUp,
  Flame,
  Star,
  Quote,
} from 'lucide-react';
import {
  UserAccount,
  Member,
  STEP_DEFINITIONS,
  TargetSteps,
  HuongKhiItem,
  Company,
  Area,
  Department,
  ReactionType,
} from '../types/edulms';
import { REACTION_CONFIG } from './NewsSection';
import { SPOTLIGHT_COVERS } from './HeroBanner';

interface ProfilePageProps {
  currentUser: UserAccount;
  memberData: Member | null;
  myHuongKhiList: HuongKhiItem[];
  companies: Company[];
  areas: Area[];
  departments: Department[];
  onNavigateToEntry: () => void;
  onNavigateToHonors: () => void;
  onLogout: () => void;
  onOpenRules: () => void;
  onAddHuongKhi: (item: Omit<HuongKhiItem, 'id' | 'likesCount'>) => void;
  onReactHuongKhi?: (id: string, reaction: ReactionType) => void;
  onAddComment?: (huongKhiId: string, content: string) => void;
  onUpdateProfile: (updatedData: {
    fullName: string;
    avatarUrl?: string;
    coverUrl?: string;
    bio?: string;
    newPassword?: string;
    companyCode: string;
    areaCode: string;
    departmentCode: string;
  }) => void;
  onShowNotification: (msg: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  memberData,
  myHuongKhiList,
  companies,
  areas,
  departments,
  onNavigateToEntry,
  onNavigateToHonors,
  onLogout,
  onOpenRules,
  onAddHuongKhi,
  onReactHuongKhi,
  onAddComment,
  onUpdateProfile,
  onShowNotification,
}) => {
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isAddHuongKhiModalOpen, setIsAddHuongKhiModalOpen] = useState(false);

  // Reaction picker & comment expansion states
  const [activeReactionPickerId, setActiveReactionPickerId] = useState<string | null>(null);
  const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Edit Profile Form State
  const [editFullName, setEditFullName] = useState(currentUser.fullName);
  const [editAvatarUrl, setEditAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [editCoverUrl, setEditCoverUrl] = useState(currentUser.coverUrl || '');
  const [editBio, setEditBio] = useState(currentUser.bio || 'Nguyện làm muối của đất và ánh sáng cho trần gian.');
  const [editCompany, setEditCompany] = useState(currentUser.companyCode);
  const [editArea, setEditArea] = useState(currentUser.areaCode);
  const [editDepartment, setEditDepartment] = useState(currentUser.departmentCode);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editError, setEditError] = useState('');

  // Quick In-page Add Huong Khi Form State
  const [quickHkTitle, setQuickHkTitle] = useState('');
  const [quickHkCategory, setQuickHkCategory] = useState<HuongKhiItem['category']>('COM_YEU_THUONG');
  const [quickHkContent, setQuickHkContent] = useState('');
  const [isQuickComposerOpen, setIsQuickComposerOpen] = useState(false);

  const formatNumber = (num: number) => {
    return (num || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const memberScore = memberData?.score || 0;
  const memberRank = memberData?.rank || 1;
  const targetsCount = memberData?.targets?.length || 0;

  // Preset Avatars
  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  ];

  // Preset Covers without cross
  const presetCovers = SPOTLIGHT_COVERS.map((c) => c.url);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');

    if (!editFullName.trim()) {
      setEditError('Họ và tên không được để trống.');
      return;
    }

    onUpdateProfile({
      fullName: editFullName.trim(),
      avatarUrl: editAvatarUrl.trim(),
      coverUrl: editCoverUrl.trim(),
      bio: editBio.trim(),
      companyCode: editCompany,
      areaCode: editArea,
      departmentCode: editDepartment,
    });

    setIsEditProfileModalOpen(false);
    onShowNotification('Đã cập nhật thông tin cá nhân thành công!');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');

    if (!newPassword || newPassword.length < 6) {
      setEditError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setEditError('Mật khẩu xác nhận không khớp.');
      return;
    }

    onUpdateProfile({
      fullName: currentUser.fullName,
      newPassword,
      companyCode: currentUser.companyCode,
      areaCode: currentUser.areaCode,
      departmentCode: currentUser.departmentCode,
    });

    setIsPasswordModalOpen(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onShowNotification('Đã đổi mật khẩu thành công!');
  };

  const handlePostQuickHuongKhi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickHkTitle.trim() || !quickHkContent.trim()) {
      onShowNotification('Vui lòng điền đủ tiêu đề và nội dung hương khí.');
      return;
    }

    onAddHuongKhi({
      authorId: memberData?.id || currentUser.id,
      authorName: currentUser.fullName,
      authorAvatar: currentUser.avatarUrl,
      companyCode: currentUser.companyCode,
      areaCode: currentUser.areaCode,
      departmentCode: currentUser.departmentCode,
      title: quickHkTitle.trim(),
      content: quickHkContent.trim(),
      category: quickHkCategory,
      date: new Date().toLocaleDateString('vi-VN'),
      isFeatured: true,
      reactions: {
        heart: 1,
        pray: 1,
        praise: 0,
        fire: 0,
        blessing: 0,
        like: 0,
      },
      comments: [],
    });

    setQuickHkTitle('');
    setQuickHkContent('');
    setIsQuickComposerOpen(false);
    setIsAddHuongKhiModalOpen(false);
    onShowNotification('Đã đăng câu chuyện hương khí! Bài viết đã xuất hiện trên Bản tin cộng đồng.');
  };

  const handleCommentSubmit = (storyId: string) => {
    const text = commentInputs[storyId]?.trim();
    if (!text) return;
    if (onAddComment) {
      onAddComment(storyId, text);
    }
    setCommentInputs((prev) => ({ ...prev, [storyId]: '' }));
  };

  // Helper for reaction total count
  const getTotalReactions = (story: HuongKhiItem) => {
    if (story.reactions) {
      return (
        (story.reactions.heart || 0) +
        (story.reactions.pray || 0) +
        (story.reactions.praise || 0) +
        (story.reactions.fire || 0) +
        (story.reactions.like || 0) +
        (story.reactions.blessing || 0)
      );
    }
    return story.likesCount || 0;
  };

  const coverImage = currentUser.coverUrl || SPOTLIGHT_COVERS[0].url;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-in fade-in space-y-6">
      
      {/* ========================================================
          1. HARMONIOUS PROFILE HEADER CARD
          - Generous widescreen banner with spotlight gradient
          - Perfectly balanced avatar and user details
          - Neatly aligned action buttons
          ======================================================== */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Cover Photo Container */}
        <div className="relative w-full h-48 sm:h-60 md:h-72 bg-slate-950 overflow-hidden group">
          <img
            src={coverImage}
            alt="Ảnh bìa trang cá nhân"
            className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 ease-out"
            referrerPolicy="no-referrer"
          />
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          <div className="absolute inset-0 bg-radial from-amber-400/20 via-transparent to-transparent pointer-events-none" />

          {/* Quick Edit Cover Button */}
          <button
            onClick={() => setIsEditProfileModalOpen(true)}
            className="absolute top-4 right-4 px-3.5 py-1.5 bg-black/50 hover:bg-black/75 text-white rounded-xl text-xs font-semibold backdrop-blur-md transition flex items-center gap-1.5 border border-white/20 cursor-pointer shadow-md"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Đổi ảnh bìa</span>
          </button>
        </div>

        {/* Profile Info Section (Aligned & Balanced) */}
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 relative">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            
            {/* Avatar & User Info Cluster */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              
              {/* Avatar with Thick White Border & Golden Glow Ring */}
              <div className="relative group shrink-0">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white p-1.5 shadow-2xl ring-4 ring-amber-400/50 relative overflow-hidden">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.fullName}
                      className="w-full h-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-700 via-indigo-700 to-amber-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-black">
                      {currentUser.role === 'ADMIN' ? (
                        <Shield className="w-12 h-12 text-white" />
                      ) : (
                        currentUser.fullName.charAt(0)
                      )}
                    </div>
                  )}

                  {/* Change Avatar Button Overlay */}
                  <button
                    onClick={() => setIsEditProfileModalOpen(true)}
                    className="absolute inset-1.5 rounded-full bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    title="Đổi ảnh đại diện"
                  >
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span className="text-[10px] font-bold">Thay ảnh</span>
                  </button>
                </div>
              </div>

              {/* User Names, Badges, and Details */}
              <div className="pt-2 sm:pt-0 sm:pb-1 space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span
                    className={`px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                      currentUser.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {currentUser.role === 'ADMIN' ? 'Ban Quản Trị' : 'Tài Khoản Cá Nhân'}
                  </span>
                  
                  <span className="text-xs text-slate-400 font-mono">@{currentUser.username}</span>

                  {currentUser.emailVerified && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã xác thực Gmail
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {currentUser.fullName}
                </h1>

                {/* Units Bar */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-600 font-medium">
                  <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg">
                    <Building2 className="w-3.5 h-3.5 text-blue-700" />
                    Cty: <strong className="text-slate-800">{currentUser.companyCode}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg">
                    <MapPin className="w-3.5 h-3.5 text-blue-700" />
                    KV: <strong className="text-slate-800">{currentUser.areaCode}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg">
                    <Users2 className="w-3.5 h-3.5 text-blue-700" />
                    <strong className="text-slate-800">{currentUser.departmentCode}</strong>
                  </span>
                </div>

                {/* Bio / Life Verse */}
                <p className="text-xs text-slate-500 italic max-w-lg pt-0.5">
                  “{currentUser.bio || 'Nguyện làm muối của đất và ánh sáng cho trần gian.'}”
                </p>
              </div>

            </div>

            {/* Harmonious Action Buttons Toolbar */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 pt-2 md:pt-0">
              <button
                onClick={() => setIsEditProfileModalOpen(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 cursor-pointer shadow-2xs"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-500" />
                <span>Sửa thông tin</span>
              </button>

              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 cursor-pointer shadow-2xs"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                <span>Đổi mật khẩu</span>
              </button>

              <button
                onClick={onNavigateToEntry}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Nhập kết quả</span>
              </button>

              <button
                onClick={onLogout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition border border-slate-200 cursor-pointer"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* 3 Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
                <span>Tổng điểm cá nhân</span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-950 tabular-nums">
                {formatNumber(memberScore)} <span className="text-xs font-bold text-amber-700">điểm</span>
              </div>
              <p className="text-[11px] text-amber-800/80 mt-1">Cộng dồn từ các đối tượng đã ghi</p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                <span>Xếp hạng toàn quốc</span>
                <Trophy className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-blue-950 tabular-nums">
                #{memberRank}
              </div>
              <p className="text-[11px] text-blue-800/80 mt-1">Trong bảng xếp hạng cá nhân</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">
                <span>Số đối tượng đã ghi</span>
                <Target className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-950 tabular-nums">
                {targetsCount} <span className="text-xs font-bold text-emerald-700">đối tượng</span>
              </div>
              <p className="text-[11px] text-emerald-800/80 mt-1">Tính điểm ngay không cần duyệt</p>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================
          2. MỤC NHẬP HƯƠNG KHÍ TRONG HỒ SƠ CÁ NHÂN
          - Facebook-style composer box
          - Post stories, good deeds, testimonies
          ======================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full w-fit mb-1 border border-rose-200">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>Hương Khí Của Tôi</span>
            </div>
            <h3 className="text-lg font-black text-slate-900">
              Nhật Ký Lời Chứng & Việc Lành Đã Làm
            </h3>
            <p className="text-xs text-slate-500">
              Ghi lại những ơn phước, bữa cơm ấm áp hoặc việc lành lan tỏa hương thơm Đấng Christ.
            </p>
          </div>

          <button
            onClick={() => setIsAddHuongKhiModalOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Đăng Hương Khí mới</span>
          </button>
        </div>

        {/* Inline Quick Composer Bar */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center shrink-0">
              {currentUser.fullName.charAt(0)}
            </div>
            <button
              onClick={() => setIsAddHuongKhiModalOpen(true)}
              className="flex-1 bg-white hover:bg-slate-100/80 border border-slate-300 rounded-full px-4 py-2.5 text-xs text-slate-500 text-left transition cursor-pointer flex items-center justify-between"
            >
              <span>{currentUser.fullName} ơi, bạn có câu chuyện hương khí phước hạnh nào muốn chia sẻ?</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </button>
          </div>
        </div>

        {/* List of My Posted Huong Khi with Facebook Reactions & Comments */}
        {myHuongKhiList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            {myHuongKhiList.map((item) => {
              const totalR = getTotalReactions(item);
              const isCommentsOpen = expandedCommentsId === item.id;
              const userCurrentReaction = item.userReaction
                ? REACTION_CONFIG[item.userReaction]
                : null;

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-gradient-to-br from-rose-50/30 via-white to-amber-50/20 border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md font-extrabold text-[10px] bg-rose-100 text-rose-800">
                        {item.category === 'COM_YEU_THUONG'
                          ? '🍲 Bữa cơm yêu thương'
                          : item.category === 'THAM_VIENG'
                          ? '🤝 Thăm viếng'
                          : '✨ Lời chứng'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{item.date}</span>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 leading-snug mt-2">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed mt-1 whitespace-pre-line">
                      "{item.content}"
                    </p>
                  </div>

                  {/* Reaction Summary & Actions */}
                  <div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Hiển thị tại Bản tin Lễ hội
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                        <span>❤️ 🙏 🔥</span>
                        <span>{totalR}</span>
                      </div>
                    </div>

                    {/* Interactive Reactions Bar */}
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between relative">
                      {/* Reaction Trigger */}
                      <div
                        className="relative"
                        onMouseEnter={() => setActiveReactionPickerId(item.id)}
                        onMouseLeave={() => setActiveReactionPickerId(null)}
                      >
                        {activeReactionPickerId === item.id && (
                          <div className="absolute -top-11 left-0 z-30 flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-full shadow-2xl border border-slate-200">
                            {(Object.keys(REACTION_CONFIG) as ReactionType[]).map((rType) => {
                              const cfg = REACTION_CONFIG[rType];
                              return (
                                <button
                                  key={rType}
                                  type="button"
                                  onClick={() => {
                                    if (onReactHuongKhi) onReactHuongKhi(item.id, rType);
                                    setActiveReactionPickerId(null);
                                  }}
                                  className="text-lg hover:scale-135 transition-transform p-1 cursor-pointer"
                                  title={cfg.label}
                                >
                                  {cfg.emoji}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (onReactHuongKhi) {
                              onReactHuongKhi(item.id, item.userReaction ? 'like' : 'heart');
                            }
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                            userCurrentReaction
                              ? `${userCurrentReaction.bgColor} ${userCurrentReaction.color}`
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          <span>{userCurrentReaction ? userCurrentReaction.emoji : '👍'}</span>
                          <span>{userCurrentReaction ? userCurrentReaction.label : 'Thả cảm xúc'}</span>
                        </button>
                      </div>

                      {/* Comments Toggle */}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedCommentsId(isCommentsOpen ? null : item.id)
                        }
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                        <span>Bình luận ({item.comments?.length || 0})</span>
                      </button>
                    </div>

                    {/* Comments section */}
                    {isCommentsOpen && (
                      <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2 animate-in fade-in">
                        {item.comments && item.comments.length > 0 ? (
                          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                            {item.comments.map((c) => (
                              <div key={c.id} className="bg-slate-100 rounded-xl p-2 text-xs">
                                <div className="flex justify-between font-bold text-[10px] text-slate-800">
                                  <span>{c.authorName}</span>
                                  <span className="text-slate-400 font-mono">{c.createdAt}</span>
                                </div>
                                <p className="text-slate-700 text-[11px] mt-0.5">{c.content}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 italic text-center py-1">
                            Chưa có bình luận nào.
                          </div>
                        )}

                        <div className="flex gap-1.5 pt-1">
                          <input
                            type="text"
                            value={commentInputs[item.id] || ''}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCommentSubmit(item.id);
                              }
                            }}
                            placeholder="Viết bình luận..."
                            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleCommentSubmit(item.id)}
                            className="px-2.5 py-1 bg-blue-700 text-white rounded-xl text-xs font-bold"
                          >
                            <Send className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 mt-5">
            Bạn chưa đăng hương khí nào. Hãy nhấn "Đăng Hương Khí mới" để chia sẻ câu chuyện phước hạnh của bạn cho toàn thể anh chị em!
          </div>
        )}
      </div>

      {/* ========================================================
          3. TIẾN ĐỘ 6 BƯỚC MỤC TIÊU
          ======================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              <span>Tiến độ hoàn thành mục tiêu 6 bước</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              So sánh giữa mục tiêu đăng ký và kết quả thực hiện theo thời gian thực
            </p>
          </div>

          <button
            onClick={onNavigateToEntry}
            className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Cập nhật mục tiêu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STEP_DEFINITIONS.map((step) => {
            const stepKey = `s${step.id}` as keyof import('../types/edulms').MemberGoals;
            const goalVal = memberData?.goals?.[stepKey] || 1;
            const resVal = memberData?.results?.[stepKey] || 0;
            const percent = goalVal > 0 ? Math.min(100, Math.round((resVal / goalVal) * 100)) : 0;

            return (
              <div
                key={step.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-black inline-flex items-center justify-center">
                      B{step.id}
                    </span>
                    <span className="font-extrabold text-xs text-slate-900">{step.name}</span>
                  </div>
                  <span className="text-xs font-black text-blue-700">{percent}%</span>
                </div>

                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>Kết quả: <strong>{resVal}</strong></span>
                  <span>Mục tiêu: <strong>{goalVal}</strong></span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          4. NHẬT KÝ ĐỐI TƯỢNG VỚI NGÀY THỰC HIỆN
          ======================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Nhật ký đối tượng & Ngày thực hiện</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chi tiết ngày giờ thực hiện cho từng bước hành động
            </p>
          </div>

          <button
            onClick={onOpenRules}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
          >
            Xem thể lệ điểm
          </button>
        </div>

        {memberData?.targets && memberData.targets.length > 0 ? (
          <div className="space-y-3">
            {memberData.targets.map((tgt) => (
              <div
                key={tgt.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{tgt.targetName}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        tgt.status === 'FULL_COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tgt.status === 'ELIMINATED'
                          ? 'bg-rose-100 text-rose-800'
                          : tgt.status === 'PENALIZED_MISSING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tgt.score > 0 ? `+${tgt.score}` : tgt.score} điểm
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Ghi lúc: {tgt.recordedAt}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 font-medium">{tgt.explanation}</div>

                {/* Step dates tags */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 border-t border-slate-200/60">
                  {STEP_DEFINITIONS.map((s) => {
                    const isDone = tgt.steps[`s${s.id}` as keyof TargetSteps];
                    const dateStr = tgt.stepDates?.[`s${s.id}` as keyof typeof tgt.stepDates];

                    return (
                      <div
                        key={s.id}
                        className={`p-2 rounded-xl text-[10px] ${
                          isDone
                            ? 'bg-blue-50 border border-blue-200 text-blue-900 font-semibold'
                            : 'bg-slate-100/70 border border-slate-200 text-slate-400 line-through'
                        }`}
                      >
                        <div className="font-bold">B{s.id}: {s.name}</div>
                        <div className="text-[9px] mt-0.5 opacity-80">
                          {isDone ? (dateStr || 'Hôm nay') : 'Chưa làm'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            Bạn chưa ghi nhận đối tượng nào. Hãy chuyển sang tab "Nhập kết quả" để bắt đầu ghi nhận và tích lũy điểm!
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL 1: CHỈNH SỬA THÔNG TIN CÁ NHÂN, AVATAR, ẢNH BÌA
          ======================================================== */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-7 relative">
            <button
              onClick={() => setIsEditProfileModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 mb-1">
              Chỉnh Sửa Thông Tin Cá Nhân
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Cập nhật tên hiển thị, hình đại diện, ảnh bìa và đơn vị công tác.
            </p>

            {editError && (
              <div className="mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Tên hiển thị */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên hiển thị *
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              {/* Tiểu sử / Châm ngôn */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Châm ngôn sống / Lời chứng ngắn
                </label>
                <input
                  type="text"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Ví dụ: Nguyện làm muối của đất và ánh sáng cho trần gian."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              {/* Avatar Preset & Custom URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Chọn hình đại diện (Avatar)
                </label>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {presetAvatars.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="Preset avatar"
                      onClick={() => setEditAvatarUrl(url)}
                      className={`w-11 h-11 rounded-2xl object-cover cursor-pointer border-2 transition ${
                        editAvatarUrl === url ? 'border-blue-600 scale-105 shadow-md ring-2 ring-blue-300' : 'border-slate-200 hover:border-slate-400'
                      }`}
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
                <input
                  type="text"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  placeholder="Hoặc dán URL hình ảnh đại diện tùy ý..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700"
                />
              </div>

              {/* Cover Preset & Custom URL (Spotlight covers without cross) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Chọn ảnh bìa Spotlight (Không có biểu tượng thập tự giá)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {SPOTLIGHT_COVERS.map((cover, i) => (
                    <div
                      key={cover.id}
                      onClick={() => setEditCoverUrl(cover.url)}
                      className={`h-16 rounded-xl overflow-hidden cursor-pointer border-2 relative ${
                        editCoverUrl === cover.url ? 'border-amber-500 ring-2 ring-amber-300 shadow-sm' : 'border-slate-200'
                      }`}
                    >
                      <img src={cover.url} alt={cover.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      {editCoverUrl === cover.url && (
                        <div className="absolute top-1 right-1 bg-amber-500 text-white rounded-full p-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  value={editCoverUrl}
                  onChange={(e) => setEditCoverUrl(e.target.value)}
                  placeholder="Hoặc dán link ảnh bìa riêng của bạn..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700"
                />
              </div>

              {/* Units */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Công ty</label>
                  <select
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-1.5 text-xs font-semibold text-slate-800"
                  >
                    {companies.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Khu vực</label>
                  <input
                    type="text"
                    value={editArea}
                    onChange={(e) => setEditArea(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-1.5 text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Ban ngành</label>
                  <select
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-1.5 text-xs font-semibold text-slate-800"
                  >
                    {departments.map((d) => (
                      <option key={d.code} value={d.code}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: ĐỔI MẬT KHẨU
          ======================================================== */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 sm:p-7 relative">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-black text-slate-900">
                Đổi Mật Khẩu
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Nhập mật khẩu mới an toàn để bảo vệ tài khoản của bạn.
            </p>

            {editError && (
              <div className="mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl">
                {editError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu mới (tối thiểu 6 ký tự) *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Xác nhận lại mật khẩu mới *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                  required
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Cập nhật mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: ĐĂNG HƯƠNG KHÍ TRONG HỒ SƠ
          ======================================================== */}
      {isAddHuongKhiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-7 relative">
            <button
              onClick={() => setIsAddHuongKhiModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-black text-slate-900">
                Đăng Hương Khí Truyền Đạo
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Chia sẻ những điều mắt thấy tai nghe, ơn phước Chúa ban qua từng bước kết bạn, thăm viếng và bữa cơm thân tình.
            </p>

            <form onSubmit={handlePostQuickHuongKhi} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Thể loại hương khí *
                </label>
                <select
                  value={quickHkCategory}
                  onChange={(e) => setQuickHkCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                >
                  <option value="COM_YEU_THUONG">🍲 Bữa cơm yêu thương mở lối</option>
                  <option value="THAM_VIENG">🤝 Thăm viếng chăm sóc</option>
                  <option value="LAM_CHUNG">✨ Lời chứng đức tin biến đổi</option>
                  <option value="GIUP_DO">❤️ Việc lành bác ái cụ thể</option>
                  <option value="CAU_NGUYEN">🙏 Cầu nguyện chữa lành & giải cứu</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề câu chuyện *
                </label>
                <input
                  type="text"
                  value={quickHkTitle}
                  onChange={(e) => setQuickHkTitle(e.target.value)}
                  placeholder="Ví dụ: Bữa cơm thân mật cùng gia đình người bạn mới..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội dung chia sẻ hương thơm Đấng Christ *
                </label>
                <textarea
                  rows={4}
                  value={quickHkContent}
                  onChange={(e) => setQuickHkContent(e.target.value)}
                  placeholder="Kể lại hoàn cảnh, cảm xúc, lời cầu nguyện và những điều Chúa đã làm..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs leading-relaxed text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-900 leading-relaxed border border-amber-200">
                ✨ Câu chuyện của bạn sẽ xuất hiện trên mục <strong>Hương Khí Nổi Bật</strong> tại trang Bản tin Lễ hội để khích lệ đức tin cho toàn thể các đội ngũ thi đua.
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddHuongKhiModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Đăng ngay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
