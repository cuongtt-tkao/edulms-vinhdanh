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
  Trash2,
  AlertCircle,
  Save,
  Upload,
} from 'lucide-react';
import {
  UserAccount,
  Member,
  STEP_DEFINITIONS,
  TargetSteps,
  TargetRecord,
  StepDates,
  HuongKhiItem,
  Company,
  Area,
  Department,
  ReactionType,
} from '../types/edulms';
import { REACTION_CONFIG } from './NewsSection';
import { SPOTLIGHT_COVERS } from './HeroBanner';
import { calculateTargetScore } from '../utils/scoringEngine';

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
  }) => void | boolean | Promise<boolean | void>;
  onEditTarget?: (
    memberId: string,
    targetId: string,
    targetName: string,
    steps: TargetSteps,
    stepDates?: StepDates
  ) => void;
  onDeleteTarget?: (memberId: string, targetId: string) => void;
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
  onEditTarget,
  onDeleteTarget,
  onShowNotification,
}) => {
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isAddHuongKhiModalOpen, setIsAddHuongKhiModalOpen] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'POSTS' | 'TARGETS' | 'GOALS' | 'ABOUT'>('POSTS');

  const avatarFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const coverFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Edit Target Modal State
  const [editingTarget, setEditingTarget] = useState<TargetRecord | null>(null);
  const [editTargetName, setEditTargetName] = useState('');
  const [editTargetSteps, setEditTargetSteps] = useState<TargetSteps>({
    s1: false,
    s2: false,
    s3: false,
    s4: false,
    s5: false,
    s6: false,
  });
  const [editTargetDates, setEditTargetDates] = useState<StepDates>({});

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

  const handleOpenEditTarget = (tgt: TargetRecord) => {
    setEditingTarget(tgt);
    setEditTargetName(tgt.targetName);
    setEditTargetSteps({ ...tgt.steps });
    setEditTargetDates({ ...(tgt.stepDates || {}) });
  };

  const handleSaveEditTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget) return;
    if (!editTargetName.trim()) {
      onShowNotification('Vui lòng nhập tên đối tượng.');
      return;
    }
    if (onEditTarget) {
      onEditTarget(
        memberData?.id || currentUser.memberId || currentUser.id,
        editingTarget.id,
        editTargetName.trim(),
        editTargetSteps,
        editTargetDates
      );
    }
    setEditingTarget(null);
  };

  const liveScoreCalc = editingTarget ? calculateTargetScore(editTargetSteps) : null;

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsEditProfileModalOpen(false);
        setIsAvatarModalOpen(false);
        setIsCoverModalOpen(false);
        setIsPasswordModalOpen(false);
        setIsAddHuongKhiModalOpen(false);
        setEditingTarget(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  ];

  // Preset Covers without cross
  const presetCovers = SPOTLIGHT_COVERS.map((c) => c.url);

  // Dedicated Save Avatar Only
  const handleSaveAvatarOnly = async () => {
    setEditError('');
    const saved = await onUpdateProfile({
      fullName: currentUser.fullName,
      avatarUrl: editAvatarUrl.trim(),
      companyCode: currentUser.companyCode,
      areaCode: currentUser.areaCode,
      departmentCode: currentUser.departmentCode,
    });
    if (saved === false) return;
    setIsAvatarModalOpen(false);
    onShowNotification('Đã cập nhật ảnh đại diện thành công!');
  };

  // Dedicated Save Cover Only
  const handleSaveCoverOnly = async () => {
    setEditError('');
    const saved = await onUpdateProfile({
      fullName: currentUser.fullName,
      coverUrl: editCoverUrl.trim(),
      companyCode: currentUser.companyCode,
      areaCode: currentUser.areaCode,
      departmentCode: currentUser.departmentCode,
    });
    if (saved === false) return;
    setIsCoverModalOpen(false);
    onShowNotification('Đã cập nhật ảnh bìa thành công!');
  };

  // Handle Local File Upload for Avatar
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      onShowNotification('Kích thước ảnh quá lớn (vui lòng chọn ảnh dưới 5MB).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setEditAvatarUrl(dataUrl);
        onShowNotification('Đã tải ảnh lên! Hãy bấm "Lưu ảnh đại diện" để áp dụng.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Local File Upload for Cover
  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      onShowNotification('Kích thước ảnh bìa quá lớn (vui lòng chọn ảnh dưới 8MB).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setEditCoverUrl(dataUrl);
        onShowNotification('Đã tải ảnh bìa lên! Hãy bấm "Lưu ảnh bìa" để áp dụng.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');

    if (!editFullName.trim()) {
      setEditError('Họ và tên không được để trống.');
      return;
    }

    const saved = await onUpdateProfile({
      fullName: editFullName.trim(),
      avatarUrl: editAvatarUrl.trim(),
      coverUrl: editCoverUrl.trim(),
      bio: editBio.trim(),
      companyCode: editCompany,
      areaCode: editArea,
      departmentCode: editDepartment,
    });
    if (saved === false) return;

    setIsEditProfileModalOpen(false);
    onShowNotification('Đã cập nhật thông tin cá nhân thành công!');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
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

    const changed = await onUpdateProfile({
      fullName: currentUser.fullName,
      newPassword,
      companyCode: currentUser.companyCode,
      areaCode: currentUser.areaCode,
      departmentCode: currentUser.departmentCode,
    });
    if (changed === false) return;

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
      {/* ========================================================
          1. AUTHENTIC FACEBOOK-STYLE PROFILE HEADER
          ======================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        
        {/* Cover Photo Container */}
        <div className="relative w-full h-48 sm:h-64 md:h-80 bg-slate-950 overflow-hidden group">
          <img
            src={coverImage}
            alt="Ảnh bìa trang cá nhân"
            className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 ease-out"
            referrerPolicy="no-referrer"
          />
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

          {/* Quick Edit Cover Button (Facebook style camera button in corner) */}
          <button
            type="button"
            onClick={() => {
              setEditCoverUrl(currentUser.coverUrl || SPOTLIGHT_COVERS[0].url);
              setIsCoverModalOpen(true);
            }}
            className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-black/70 hover:bg-black/90 text-white rounded-xl text-xs font-semibold backdrop-blur-md transition flex items-center gap-1.5 border border-white/20 cursor-pointer shadow-lg shrink-0 max-w-[calc(100%-1.5rem)]"
            title="Đổi ảnh bìa"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold whitespace-nowrap">Đổi ảnh bìa</span>
          </button>
        </div>

        {/* Profile Info Section (Avatar overlapping cover edge + name + actions) */}
        <div className="px-4 sm:px-8 pb-3 pt-0 relative">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-16 sm:-mt-20 md:-mt-24 pb-5 border-b border-slate-100 dark:border-slate-800">
            
            {/* Avatar & User Details */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 text-center sm:text-left">
              
              {/* Avatar with Camera badge */}
              <div className="relative group shrink-0 z-10">
                <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full bg-white dark:bg-slate-900 p-1.5 shadow-2xl ring-4 ring-amber-400/60 dark:ring-amber-500/40 relative overflow-hidden">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.fullName}
                      className="w-full h-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-700 via-indigo-700 to-amber-600 flex items-center justify-center text-white text-4xl sm:text-5xl font-black">
                      {currentUser.role === 'ADMIN' ? (
                        <Shield className="w-14 h-14 sm:w-16 sm:h-16 text-white" />
                      ) : (
                        currentUser.fullName.charAt(0)
                      )}
                    </div>
                  )}
                </div>

                {/* Facebook circular camera button at bottom-right of avatar */}
                <button
                  type="button"
                  onClick={() => {
                    setEditAvatarUrl(currentUser.avatarUrl || '');
                    setIsAvatarModalOpen(true);
                  }}
                  className="absolute bottom-1 right-1 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-md transition cursor-pointer hover:scale-105"
                  title="Cập nhật ảnh đại diện"
                >
                  <Camera className="w-4 h-4 text-amber-400" />
                </button>
              </div>

              {/* User Identity Stack */}
              <div className="pt-2 sm:pt-0 sm:pb-2 space-y-1.5">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1
                    className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight profile-name-gold"
                    style={{ WebkitTextFillColor: '#f9b93bbf' }}
                  >
                    {currentUser.fullName}
                  </h1>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      currentUser.role === 'ADMIN'
                        ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700'
                        : 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                    }`}
                  >
                    {currentUser.role === 'ADMIN' ? 'Ban Quản Trị' : 'Thành Viên Thi Đua'}
                  </span>
                </div>

                {/* Quick stats subtitle */}
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="font-mono text-slate-400">@{currentUser.username}</span>
                  <span>•</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{formatNumber(memberScore)} điểm</span>
                  <span>•</span>
                  <span>Hạng #{memberRank}</span>
                  <span>•</span>
                  <span>{targetsCount} đối tượng</span>
                </div>

                {/* Units Pills */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                    <Building2 className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                    Cty: <strong>{currentUser.companyCode}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                    <MapPin className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                    KV: <strong>{currentUser.areaCode}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                    <Users2 className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                    <strong>{currentUser.departmentCode}</strong>
                  </span>
                </div>

                {/* Bio / Life Verse */}
                <p className="text-xs text-slate-500 dark:text-slate-400 italic max-w-lg pt-0.5 leading-relaxed">
                  “{currentUser.bio || 'Nguyện làm muối của đất và ánh sáng cho trần gian.'}”
                </p>
              </div>

            </div>

            {/* Facebook Action Buttons */}
            <div className="flex items-center justify-center md:justify-end gap-2 flex-wrap pt-2 md:pt-0">
              <button
                onClick={() => setIsAddHuongKhiModalOpen(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Đăng Hương Khí</span>
              </button>

              <button
                onClick={() => setIsEditProfileModalOpen(true)}
                className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Sửa hồ sơ</span>
              </button>

              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs"
                title="Đổi mật khẩu"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">Mật khẩu</span>
              </button>

              <button
                onClick={onLogout}
                className="px-3 py-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-bold transition border border-rose-200 dark:border-rose-900 cursor-pointer flex items-center gap-1"
                title="Đăng xuất"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </div>

          </div>

          {/* Facebook Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pt-2 text-xs font-bold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setActiveProfileTab('POSTS')}
              className={`px-4 py-2.5 rounded-xl transition cursor-pointer relative shrink-0 ${
                activeProfileTab === 'POSTS'
                  ? 'text-blue-600 dark:text-blue-400 font-extrabold bg-blue-50/80 dark:bg-blue-950/60'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>Bài viết & Hương Khí ({myHuongKhiList.length})</span>
              {activeProfileTab === 'POSTS' && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveProfileTab('TARGETS')}
              className={`px-4 py-2.5 rounded-xl transition cursor-pointer relative shrink-0 ${
                activeProfileTab === 'TARGETS'
                  ? 'text-blue-600 dark:text-blue-400 font-extrabold bg-blue-50/80 dark:bg-blue-950/60'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>Nhật ký đối tượng ({targetsCount})</span>
              {activeProfileTab === 'TARGETS' && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveProfileTab('GOALS')}
              className={`px-4 py-2.5 rounded-xl transition cursor-pointer relative shrink-0 ${
                activeProfileTab === 'GOALS'
                  ? 'text-blue-600 dark:text-blue-400 font-extrabold bg-blue-50/80 dark:bg-blue-950/60'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>Tiến độ 6 bước</span>
              {activeProfileTab === 'GOALS' && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveProfileTab('ABOUT')}
              className={`px-4 py-2.5 rounded-xl transition cursor-pointer relative shrink-0 ${
                activeProfileTab === 'ABOUT'
                  ? 'text-blue-600 dark:text-blue-400 font-extrabold bg-blue-50/80 dark:bg-blue-950/60'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>Thống kê & Giới thiệu</span>
              {activeProfileTab === 'ABOUT' && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================
          2. AUTHENTIC FACEBOOK 2-COLUMN PROFILE CONTENT
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (Desktop 4 cols): Intro, Stats & Quick Actions */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Card: Giới thiệu (Facebook Intro Card) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>Giới thiệu</span>
            </h3>

            {/* Bio quote */}
            <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed text-center py-2 px-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
              “{currentUser.bio || 'Nguyện làm muối của đất và ánh sáng cho trần gian.'}”
            </p>

            <button
              onClick={() => setIsEditProfileModalOpen(true)}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Chỉnh sửa tiểu sử
            </button>

            {/* Metadata list with Facebook-style icons */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Thuộc công ty: <strong className="text-slate-900 dark:text-white">{currentUser.companyCode}</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Khu vực thi đua: <strong className="text-slate-900 dark:text-white">Khu vực {currentUser.areaCode}</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Users2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Ban ngành sinh hoạt: <strong className="text-slate-900 dark:text-white">{currentUser.departmentCode}</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Vị trí bảng xếp hạng: <strong className="text-amber-600 dark:text-amber-400 font-black">Hạng #{memberRank}</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Tổng điểm tích lũy: <strong className="text-blue-600 dark:text-blue-400 font-black">{formatNumber(memberScore)} điểm</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Target className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Đối tượng tiếp cận: <strong className="text-slate-900 dark:text-white font-bold">{targetsCount} người</strong></span>
              </div>
            </div>

            <button
              onClick={() => setIsEditProfileModalOpen(true)}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Chỉnh sửa chi tiết
            </button>
          </div>

          {/* Card: Thao Tác Nhanh */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-5 text-white shadow-md border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <span>⚡ Hoạt động thi đua</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có thể ghi nhận đối tượng mới, theo dõi tiến độ 6 bước và đóng góp câu chuyện hương khí để nâng hạng đội ngũ.
            </p>
            <div className="space-y-2 pt-1">
              <button
                onClick={onNavigateToEntry}
                className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Ghi nhận đối tượng mới</span>
              </button>
              <button
                onClick={onOpenRules}
                className="w-full py-2.5 px-3 bg-white/10 hover:bg-white/15 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-white/10"
              >
                <span>Xem thể lệ tính điểm 6 bước</span>
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (Desktop 8 cols): Tab Content Switcher */}
        <div className="lg:col-span-8 space-y-5 min-w-0">
          
          {/* TAB CONTENT 1: BÀI VIẾT & HƯƠNG KHÍ (POSTS) */}
          {activeProfileTab === 'POSTS' && (
            <div className="space-y-5 animate-in fade-in">
              {/* Facebook Post Composer */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-700 text-white font-bold flex items-center justify-center shrink-0 shadow-xs">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <button
                    onClick={() => setIsAddHuongKhiModalOpen(true)}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400 text-left transition cursor-pointer flex items-center justify-between"
                  >
                    <span>{currentUser.fullName} ơi, bạn có câu chuyện hương khí nào muốn chia sẻ?</span>
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  </button>
                </div>

                <div className="flex items-center justify-around pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <button
                    onClick={() => {
                      setQuickHkCategory('COM_YEU_THUONG');
                      setIsAddHuongKhiModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <span>🍲</span>
                    <span>Bữa cơm</span>
                  </button>
                  <button
                    onClick={() => {
                      setQuickHkCategory('THAM_VIENG');
                      setIsAddHuongKhiModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <span>🤝</span>
                    <span>Thăm viếng</span>
                  </button>
                  <button
                    onClick={() => {
                      setQuickHkCategory('LAM_CHUNG');
                      setIsAddHuongKhiModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <span>✨</span>
                    <span>Lời chứng</span>
                  </button>
                </div>
              </div>

              {/* Feed: My Huong Khi Stories */}
              {myHuongKhiList.length > 0 ? (
                <div className="space-y-4">
                  {myHuongKhiList.map((item) => {
                    const totalR = getTotalReactions(item);
                    const isCommentsOpen = expandedCommentsId === item.id;
                    const userCurrentReaction = item.userReaction
                      ? REACTION_CONFIG[item.userReaction]
                      : null;

                    return (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-3.5"
                      >
                        {/* Author & Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center shrink-0">
                              {currentUser.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                                {currentUser.fullName}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <span className="font-mono">{item.date}</span>
                                <span>•</span>
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                                  {item.category === 'COM_YEU_THUONG'
                                    ? '🍲 Bữa cơm yêu thương'
                                    : item.category === 'THAM_VIENG'
                                    ? '🤝 Thăm viếng'
                                    : '✨ Lời chứng'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Title & Body */}
                        <div>
                          <h4 className="font-extrabold text-base text-slate-900 dark:text-white mb-1">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                            {item.content}
                          </p>
                        </div>

                        {/* Stats line */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1 font-bold">
                            <span>❤️ 🙏 🔥</span>
                            <span>{totalR} lượt cảm xúc</span>
                          </div>
                          <span>{item.comments?.length || 0} bình luận</span>
                        </div>

                        {/* Facebook Reactions & Comments Bar */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between relative">
                          <div
                            className="relative"
                            onMouseEnter={() => setActiveReactionPickerId(item.id)}
                            onMouseLeave={() => setActiveReactionPickerId(null)}
                          >
                            {activeReactionPickerId === item.id && (
                              <div className="absolute -top-11 left-0 z-30 flex items-center gap-1 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-full shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in">
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
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                userCurrentReaction
                                  ? `${userCurrentReaction.bgColor} ${userCurrentReaction.color}`
                                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              <span>{userCurrentReaction ? userCurrentReaction.emoji : '👍'}</span>
                              <span>{userCurrentReaction ? userCurrentReaction.label : 'Thích'}</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedCommentsId(isCommentsOpen ? null : item.id)
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                            <span>Bình luận</span>
                          </button>
                        </div>

                        {/* Comments section */}
                        {isCommentsOpen && (
                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5 animate-in fade-in">
                            {item.comments && item.comments.length > 0 && (
                              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {item.comments.map((c) => (
                                  <div key={c.id} className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-2.5 text-xs">
                                    <div className="flex justify-between font-bold text-[11px] text-slate-900 dark:text-white">
                                      <span>{c.authorName}</span>
                                      <span className="text-slate-400 font-mono text-[10px]">{c.createdAt}</span>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 text-xs mt-1">{c.content}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex gap-2 pt-1">
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
                                placeholder="Viết bình luận khích lệ..."
                                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                              />
                              <button
                                type="button"
                                onClick={() => handleCommentSubmit(item.id)}
                                className="px-3 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                  Bạn chưa đăng bài viết nào. Hãy chia sẻ hương thơm Đấng Christ qua nút "Đăng Hương Khí" ở trên!
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT 2: NHẬT KÝ ĐỐI TƯỢNG (TARGETS) */}
          {activeProfileTab === 'TARGETS' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span>Danh Sách Đối Tượng Đã Ghi ({targetsCount})</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Bạn có thể chỉnh sửa lại tên và ngày thực hiện các bước nếu lỡ nhập sai.
                  </p>
                </div>

                <button
                  onClick={onNavigateToEntry}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ghi thêm</span>
                </button>
              </div>

              {memberData?.targets && memberData.targets.length > 0 ? (
                <div className="space-y-3">
                  {memberData.targets.map((tgt) => (
                    <div
                      key={tgt.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm text-slate-900 dark:text-white">{tgt.targetName}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              tgt.status === 'FULL_COMPLETED'
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                                : tgt.status === 'SEQUENTIAL_PROGRESS'
                                ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300'
                                : tgt.status === 'ELIMINATED'
                                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                                : tgt.status === 'PENALIZED_MISSING'
                                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {tgt.score > 0 ? `+${tgt.score}` : tgt.score} điểm
                          </span>
                        </div>

                        {/* Action buttons: Edit & Delete */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Ghi: {tgt.recordedAt}
                          </span>
                          <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-700">
                            <button
                              type="button"
                              onClick={() => handleOpenEditTarget(tgt)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition cursor-pointer"
                              title="Sửa thông tin đối tượng & ngày"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {onDeleteTarget && (
                              <button
                                type="button"
                                onClick={() =>
                                  onDeleteTarget(
                                    memberData?.id || currentUser.memberId || currentUser.id,
                                    tgt.id
                                  )
                                }
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 transition cursor-pointer"
                                title="Xóa đối tượng này"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">{tgt.explanation}</div>

                      {/* Step dates tags */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        {STEP_DEFINITIONS.map((s) => {
                          const isDone = tgt.steps[`s${s.id}` as keyof TargetSteps];
                          const dateStr = tgt.stepDates?.[`s${s.id}` as keyof typeof tgt.stepDates];

                          return (
                            <div
                              key={s.id}
                              className={`p-2 rounded-xl text-[10px] ${
                                isDone
                                  ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-200 font-semibold'
                                  : 'bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-400 line-through'
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
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  Bạn chưa ghi nhận đối tượng nào. Hãy nhấn nút "Ghi thêm" để ghi nhận và cập nhật ngày cho từng bước!
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT 3: TIẾN ĐỘ 6 BƯỚC (GOALS) */}
          {activeProfileTab === 'GOALS' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-600" />
                    <span>Tiến Độ Mục Tiêu 6 Bước Thi Đua</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    So sánh kết quả thực hiện với chỉ tiêu mục tiêu đã đăng ký ban đầu.
                  </p>
                </div>

                <button
                  onClick={onNavigateToEntry}
                  className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Chỉnh sửa chỉ tiêu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {STEP_DEFINITIONS.map((step) => {
                  const stepKey = `s${step.id}` as keyof import('../types/edulms').MemberGoals;
                  const goalVal = memberData?.goals?.[stepKey] || 1;
                  const resVal = memberData?.results?.[stepKey] || 0;
                  const percent = goalVal > 0 ? Math.min(100, Math.round((resVal / goalVal) * 100)) : 0;

                  return (
                    <div
                      key={step.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-[10px] font-black inline-flex items-center justify-center">
                            B{step.id}
                          </span>
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white">{step.name}</span>
                        </div>
                        <span className="text-xs font-black text-blue-700 dark:text-blue-400">{percent}%</span>
                      </div>

                      <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        <span>Kết quả: <strong className="text-slate-800 dark:text-slate-100">{resVal}</strong></span>
                        <span>Mục tiêu: <strong className="text-slate-800 dark:text-slate-100">{goalVal}</strong></span>
                      </div>

                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
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
          )}

          {/* TAB CONTENT 4: THỐNG KÊ & GIỚI THIỆU (ABOUT) */}
          {activeProfileTab === 'ABOUT' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-5 animate-in fade-in">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Thông Tin Tài Khoản & Cơ Cấu Đơn Vị
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Dữ liệu định danh thành viên trong hệ thống Lễ hội Truyền Đạo EduLMS
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Họ và Tên</div>
                  <div className="font-black text-sm text-slate-900 dark:text-white">{currentUser.fullName}</div>
                  <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">@{currentUser.username}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Vai trò hệ thống</div>
                  <div className="font-black text-sm text-purple-700 dark:text-purple-300">
                    {currentUser.role === 'ADMIN' ? 'Ban Quản Trị Hệ Thống' : 'Thành Viên Thi Đua'}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">Mã thành viên: {currentUser.memberId || 'Chưa gắn'}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Công ty & Khu vực</div>
                  <div className="font-black text-sm text-blue-700 dark:text-blue-300">
                    {currentUser.companyCode} • Khu vực {currentUser.areaCode}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">Ban ngành: {currentUser.departmentCode}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Điểm số & Xếp hạng</div>
                  <div className="font-black text-sm text-amber-600 dark:text-amber-400">
                    {formatNumber(memberScore)} điểm • Hạng #{memberRank}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">{targetsCount} đối tượng tiếp cận</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Đổi mật khẩu</span>
                </button>
                <button
                  onClick={() => setIsEditProfileModalOpen(true)}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Sửa thông tin</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ========================================================
          MODAL 1: CHỈNH SỬA THÔNG TIN CÁ NHÂN, AVATAR, ẢNH BÌA
          ======================================================== */}
      {isEditProfileModalOpen && (
        <div
          onClick={() => setIsEditProfileModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-7 relative cursor-default"
          >
            <button
              onClick={() => setIsEditProfileModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
              Chỉnh Sửa Thông Tin Cá Nhân
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Cập nhật tên hiển thị, châm ngôn sống và đơn vị công tác của bạn.
            </p>

            {editError && (
              <div className="mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Tên hiển thị */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên hiển thị *
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              {/* Tiểu sử / Châm ngôn */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Châm ngôn sống / Lời chứng ngắn
                </label>
                <input
                  type="text"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Ví dụ: Nguyện làm muối của đất và ánh sáng cho trần gian."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Units */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Công ty</label>
                  <select
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
                  >
                    {companies.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Khu vực</label>
                  <input
                    type="text"
                    value={editArea}
                    onChange={(e) => setEditArea(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Ban ngành</label>
                  <select
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
                  >
                    {departments.map((d) => (
                      <option key={d.code} value={d.code}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
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
          MODAL 1B: CẬP NHẬT ẢNH ĐẠI DIỆN (AVATAR) RIÊNG BIỆT
          - Chỉ có phần chọn avatar có sẵn hoặc tải lên từ máy
          ======================================================== */}
      {isAvatarModalOpen && (
        <div
          onClick={() => setIsAvatarModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-7 relative cursor-default"
          >
            <button
              onClick={() => setIsAvatarModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Cập Nhật Ảnh Đại Diện
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Chọn từ bộ hình có sẵn hoặc tải ảnh mới từ máy tính / điện thoại.
            </p>

            {/* Current Avatar Preview */}
            <div className="flex flex-col items-center justify-center pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="w-24 h-24 rounded-full p-1 ring-4 ring-amber-400 shadow-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2">
                <img
                  src={editAvatarUrl || currentUser.avatarUrl || presetAvatars[0]}
                  alt="Xem trước Avatar"
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Hình đại diện đang chọn
              </span>
            </div>

            {/* Hidden file input for Avatar */}
            <input
              type="file"
              ref={avatarFileInputRef}
              onChange={handleAvatarFileUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="mt-4 space-y-4">
              {/* Device Upload Button */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  1. Tải ảnh lên từ máy tính / điện thoại
                </label>
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Upload className="w-4 h-4" />
                  <span>Chọn tệp ảnh từ thiết bị</span>
                </button>
              </div>

              {/* Preset Avatars Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  2. Hoặc chọn nhanh từ bộ avatar có sẵn
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {presetAvatars.map((url, i) => (
                    <div
                      key={i}
                      onClick={() => setEditAvatarUrl(url)}
                      className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition hover:scale-105 ${
                        editAvatarUrl === url
                          ? 'border-blue-600 ring-2 ring-blue-400 shadow-md scale-105'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Avatar ${i + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {editAvatarUrl === url && (
                        <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Image URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  3. Hoặc dán đường dẫn (URL) ảnh
                </label>
                <input
                  type="text"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveAvatarOnly}
                className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu ảnh đại diện</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 1C: CẬP NHẬT ẢNH BÌA (COVER) RIÊNG BIỆT
          - Chỉ có phần chọn ảnh bìa spotlight hoặc tải lên từ máy
          ======================================================== */}
      {isCoverModalOpen && (
        <div
          onClick={() => setIsCoverModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-7 relative cursor-default"
          >
            <button
              onClick={() => setIsCoverModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Cập Nhật Ảnh Bìa Trang Cá Nhân
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Chọn từ các ảnh bìa Spotlight hoặc tải lên hình ảnh riêng từ thiết bị.
            </p>

            {/* Current Cover Preview */}
            <div className="w-full h-36 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative shadow-inner mb-4">
              <img
                src={editCoverUrl || coverImage}
                alt="Xem trước ảnh bìa"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-3 text-white text-xs font-bold drop-shadow-md">
                Xem trước ảnh bìa hiện tại
              </div>
            </div>

            {/* Hidden file input for Cover */}
            <input
              type="file"
              ref={coverFileInputRef}
              onChange={handleCoverFileUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="space-y-4">
              {/* Device Upload Button */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  1. Tải ảnh bìa lên từ máy tính / điện thoại
                </label>
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Upload className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Chọn ảnh bìa từ thiết bị</span>
                </button>
              </div>

              {/* Preset Covers Grid */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  2. Hoặc chọn từ bộ sưu tập ảnh bìa Spotlight
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SPOTLIGHT_COVERS.map((cover) => (
                    <div
                      key={cover.id}
                      onClick={() => setEditCoverUrl(cover.url)}
                      className={`h-20 rounded-xl overflow-hidden cursor-pointer border-2 relative transition hover:opacity-90 ${
                        editCoverUrl === cover.url
                          ? 'border-amber-500 ring-2 ring-amber-400 shadow-md scale-102'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <img
                        src={cover.url}
                        alt={cover.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {editCoverUrl === cover.url && (
                        <div className="absolute top-1 right-1 bg-amber-500 text-white rounded-full p-0.5 shadow-sm">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1.5 py-0.5 text-[9px] text-white font-medium truncate">
                        {cover.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Image URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  3. Hoặc dán đường dẫn (URL) ảnh bìa riêng
                </label>
                <input
                  type="text"
                  value={editCoverUrl}
                  onChange={(e) => setEditCoverUrl(e.target.value)}
                  placeholder="https://example.com/cover.jpg"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCoverModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveCoverOnly}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu ảnh bìa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: ĐỔI MẬT KHẨU
          ======================================================== */}
      {isPasswordModalOpen && (
        <div
          onClick={() => setIsPasswordModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 sm:p-7 relative cursor-default"
          >
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
        <div
          onClick={() => setIsAddHuongKhiModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-7 relative cursor-default"
          >
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

      {/* ========================================================
          MODAL 4: CHỈNH SỬA ĐỐI TƯỢNG & NGÀY THỰC HIỆN CÁC BƯỚC
          ======================================================== */}
      {editingTarget && (
        <div
          onClick={() => setEditingTarget(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-7 relative cursor-default"
          >
            <button
              onClick={() => setEditingTarget(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Đóng modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                <Pencil className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Sửa Thông Tin & Ngày Đối Tượng
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Cập nhật lại tên đối tượng, trạng thái hoàn thành và ngày thực tế của từng bước nếu bạn lỡ nhập sai.
            </p>

            <form onSubmit={handleSaveEditTarget} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên người thân / Bạn hữu mục tiêu *
                </label>
                <input
                  type="text"
                  value={editTargetName}
                  onChange={(e) => setEditTargetName(e.target.value)}
                  placeholder="Nhập tên đối tượng..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Các bước đã thực hiện & Ngày ghi nhận:
                </label>
                <div className="space-y-2">
                  {STEP_DEFINITIONS.map((s) => {
                    const stepKey = `s${s.id}` as keyof TargetSteps;
                    const isChecked = editTargetSteps[stepKey];
                    const currentDateVal = editTargetDates[stepKey] || new Date().toISOString().split('T')[0];

                    return (
                      <div
                        key={s.id}
                        className={`p-3 rounded-2xl border transition-all duration-200 ${
                          isChecked
                            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-80'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const nextVal = !isChecked;
                                setEditTargetSteps((prev) => ({ ...prev, [stepKey]: nextVal }));
                                if (nextVal && !editTargetDates[stepKey]) {
                                  setEditTargetDates((prev) => ({
                                    ...prev,
                                    [stepKey]: new Date().toISOString().split('T')[0],
                                  }));
                                }
                              }}
                              className="w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                              B{s.id}: {s.name}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              ({s.points}đ)
                            </span>
                          </label>

                          {isChecked && (
                            <div className="flex items-center gap-2 pl-6 sm:pl-0">
                              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                Ngày:
                              </span>
                              <input
                                type="date"
                                value={currentDateVal}
                                onChange={(e) =>
                                  setEditTargetDates((prev) => ({
                                    ...prev,
                                    [stepKey]: e.target.value,
                                  }))
                                }
                                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setEditTargetDates((prev) => ({
                                    ...prev,
                                    [stepKey]: new Date().toISOString().split('T')[0],
                                  }))
                                }
                                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline px-1 py-0.5"
                              >
                                Hôm nay
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Preview Score for Edit */}
              {liveScoreCalc && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
                  <div className="text-xs text-amber-900 dark:text-amber-200">
                    <span className="font-extrabold">Điểm sau cập nhật: </span>
                    <span className="font-black text-amber-700 dark:text-amber-400">
                      {liveScoreCalc.score > 0 ? `+${liveScoreCalc.score}` : liveScoreCalc.score} điểm
                    </span>
                    <div className="text-[10px] text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                      {liveScoreCalc.explanation}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-200/80 dark:bg-amber-800/80 text-amber-900 dark:text-amber-100">
                    {liveScoreCalc.status}
                  </span>
                </div>
              )}

              <div className="mt-5 flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
