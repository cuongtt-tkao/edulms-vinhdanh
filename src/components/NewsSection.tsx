import React, { useState } from 'react';
import {
  Newspaper,
  Calendar,
  Sparkles,
  Heart,
  MessageCircle,
  Building2,
  MapPin,
  ArrowRight,
  Flame,
  X,
  User,
  Send,
  ThumbsUp,
  Star,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { HuongKhiItem, ReactionType, HuongKhiComment, UserAccount } from '../types/edulms';

interface NewsSectionProps {
  huongKhiList?: HuongKhiItem[];
  currentUser?: UserAccount | null;
  onReactHuongKhi?: (id: string, reaction: ReactionType) => void;
  onAddComment?: (huongKhiId: string, content: string) => void;
  onOpenRules: () => void;
}

export const REACTION_CONFIG: Record<
  ReactionType,
  { label: string; emoji: string; color: string; bgColor: string }
> = {
  heart: { label: 'Yêu thích', emoji: '❤️', color: 'text-rose-600', bgColor: 'bg-rose-50' },
  pray: { label: 'Amen / Cảm tạ', emoji: '🙏', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  fire: { label: 'Hào hứng', emoji: '🔥', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  praise: { label: 'Ngợi khen', emoji: '⭐', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  like: { label: 'Thích', emoji: '👍', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  blessing: { label: 'Phước lành', emoji: '🕊️', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
};

export const NewsSection: React.FC<NewsSectionProps> = ({
  huongKhiList = [],
  currentUser,
  onReactHuongKhi,
  onAddComment,
  onOpenRules,
}) => {
  const [activeTab, setActiveTab] = useState<'HUONG_KHI' | 'NEWS'>('HUONG_KHI');
  const [selectedStory, setSelectedStory] = useState<HuongKhiItem | null>(null);
  const [activeReactionPickerId, setActiveReactionPickerId] = useState<string | null>(null);
  const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const newsItems = [
    {
      id: 1,
      title: 'Đội Sứ Đồ 1 bứt phá vươn lên vị trí dẫn đầu bảng tổng sắp',
      category: 'Tiêu điểm tuần',
      date: '16/10/2026',
      summary:
        'Với thành tích tiếp cận 42 mục tiêu và hoàn thành xuất sắc 6 bước môn đồ hóa, Đội Sứ Đồ 1 đã giành thêm 3.450 điểm thưởng.',
      tagColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 2,
      title: 'Khu vực Miền Bắc cán mốc 82.450 điểm dẫn đầu toàn quốc',
      category: 'Khu vực',
      date: '15/10/2026',
      summary:
        'Các đội ngũ tại Miền Bắc ghi nhận tỷ lệ tham gia đạt 100%, đồng thời mở thêm nhiều điểm nhóm học Kinh Thánh mới.',
      tagColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 3,
      title: 'Nhắc nhở hoàn thành tối thiểu 3 bước để tránh điểm liệt',
      category: 'Quy chế',
      date: '14/10/2026',
      summary:
        'Ban tổ chức thông báo các đội cần khẩn trương hoàn thành tối thiểu 3 bước cơ bản trước hạn chót kiểm duyệt giai đoạn 1.',
      tagColor: 'bg-rose-100 text-rose-800',
      hasAction: true,
    },
  ];

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'COM_YEU_THUONG':
        return { label: 'Bữa cơm yêu thương', color: 'bg-amber-100 text-amber-800' };
      case 'THAM_VIENG':
        return { label: 'Thăm viếng nâng đỡ', color: 'bg-blue-100 text-blue-800' };
      case 'LAM_CHUNG':
        return { label: 'Lời chứng biến đổi', color: 'bg-purple-100 text-purple-800' };
      case 'GIUP_DO':
        return { label: 'Việc lành bác ái', color: 'bg-emerald-100 text-emerald-800' };
      default:
        return { label: 'Hương khí đức tin', color: 'bg-sky-100 text-sky-800' };
    }
  };

  const handleSelectReaction = (storyId: string, reaction: ReactionType) => {
    if (onReactHuongKhi) {
      onReactHuongKhi(storyId, reaction);
    }
    setActiveReactionPickerId(null);
  };

  const handleCommentSubmit = (storyId: string) => {
    const text = commentInputs[storyId]?.trim();
    if (!text) return;
    if (onAddComment) {
      onAddComment(storyId, text);
    }
    setCommentInputs((prev) => ({ ...prev, [storyId]: '' }));
  };

  // Helper to compute total reactions count
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

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mt-6" id="news-section">
      
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl text-xs font-bold gap-1">
            <button
              onClick={() => setActiveTab('HUONG_KHI')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                activeTab === 'HUONG_KHI'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Hương Khí Nổi Bật ({huongKhiList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('NEWS')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                activeTab === 'NEWS'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Bản tin Lễ hội</span>
            </button>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Cập nhật phản ứng & bình luận trực tiếp
        </span>
      </div>

      {/* TAB 1: HƯƠNG KHÍ NỔI BẬT (FEATURED TESTIMONIES WITH REACTIONS & COMMENTS) */}
      {activeTab === 'HUONG_KHI' && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {huongKhiList.map((story) => {
              const catBadge = getCategoryLabel(story.category);
              const totalReactions = getTotalReactions(story);
              const commentsCount = story.comments?.length || 0;
              const isCommentsOpen = expandedCommentsId === story.id;
              const userCurrentReaction = story.userReaction
                ? REACTION_CONFIG[story.userReaction]
                : null;

              return (
                <div
                  key={story.id}
                  className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-amber-50/20 border border-slate-200/90 shadow-2xs hover:shadow-md transition flex flex-col justify-between group relative"
                >
                  {/* Top Bar: Category & Date */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${catBadge.color}`}>
                        {catBadge.label}
                      </span>
                      <span className="text-slate-400 text-[11px] flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" /> {story.date}
                      </span>
                    </div>

                    {/* Title */}
                    <h4
                      onClick={() => setSelectedStory(story)}
                      className="font-extrabold text-sm text-slate-900 hover:text-blue-700 transition leading-snug cursor-pointer"
                    >
                      {story.title}
                    </h4>

                    {/* Content */}
                    <p
                      onClick={() => setSelectedStory(story)}
                      className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed cursor-pointer"
                    >
                      "{story.content}"
                    </p>
                  </div>

                  {/* Author Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                        {story.authorName.charAt(0)}
                      </div>
                      <span className="truncate max-w-[130px]">{story.authorName}</span>
                      <span className="text-slate-400 font-normal text-[11px]">
                        ({story.companyCode} - KV {story.areaCode})
                      </span>
                    </div>

                    {/* Total reactions icons summary */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
                      <div className="flex -space-x-1">
                        <span className="text-xs">❤️</span>
                        <span className="text-xs">🙏</span>
                        <span className="text-xs">🔥</span>
                      </div>
                      <span>{totalReactions}</span>
                    </div>
                  </div>

                  {/* FACEBOOK-STYLE ACTION BAR: REACTIONS & COMMENTS */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between relative">
                    
                    {/* Reaction Button with Floating Picker */}
                    <div
                      className="relative"
                      onMouseEnter={() => setActiveReactionPickerId(story.id)}
                      onMouseLeave={() => setActiveReactionPickerId(null)}
                    >
                      {/* Floating Facebook Reaction Bar on Hover / Click */}
                      {activeReactionPickerId === story.id && (
                        <div className="absolute -top-11 left-0 z-30 flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                          {(Object.keys(REACTION_CONFIG) as ReactionType[]).map((rType) => {
                            const cfg = REACTION_CONFIG[rType];
                            return (
                              <button
                                key={rType}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectReaction(story.id, rType);
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
                          const nextR = story.userReaction ? 'like' : 'heart';
                          handleSelectReaction(story.id, nextR);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                          userCurrentReaction
                            ? `${userCurrentReaction.bgColor} ${userCurrentReaction.color}`
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="text-sm">
                          {userCurrentReaction ? userCurrentReaction.emoji : '👍'}
                        </span>
                        <span>
                          {userCurrentReaction ? userCurrentReaction.label : 'Thả cảm xúc'}
                        </span>
                      </button>
                    </div>

                    {/* Toggle Comments Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedCommentsId(isCommentsOpen ? null : story.id)
                      }
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span>Bình luận ({commentsCount})</span>
                    </button>
                  </div>

                  {/* EXPANDABLE COMMENT SECTION */}
                  {isCommentsOpen && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2.5 animate-in fade-in duration-200">
                      {/* Comments Feed */}
                      {story.comments && story.comments.length > 0 ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {story.comments.map((comment) => (
                            <div
                              key={comment.id}
                              className="bg-slate-100/90 rounded-2xl p-2.5 text-xs text-slate-800"
                            >
                              <div className="flex items-center justify-between font-bold text-[11px] text-slate-900 mb-0.5">
                                <span className="flex items-center gap-1">
                                  <span>{comment.authorName}</span>
                                  {comment.companyCode && (
                                    <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.2 rounded-md">
                                      {comment.companyCode}
                                    </span>
                                  )}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono">
                                  {comment.createdAt}
                                </span>
                              </div>
                              <p className="text-slate-700 leading-relaxed font-normal">
                                {comment.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic text-center py-2">
                          Chưa có bình luận nào. Hãy là người đầu tiên khích lệ anh chị em!
                        </div>
                      )}

                      {/* Add Comment Input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={commentInputs[story.id] || ''}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({
                              ...prev,
                              [story.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleCommentSubmit(story.id);
                            }
                          }}
                          placeholder="Viết lời khích lệ hoặc bình luận..."
                          className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => handleCommentSubmit(story.id)}
                          className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                        >
                          <Send className="w-3 h-3" />
                          <span>Gửi</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: BẢN TIN LỄ HỘI */}
      {activeTab === 'NEWS' && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {newsItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${item.tagColor}`}>
                    {item.category}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3 h-3" /> {item.date}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition leading-snug">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              {item.hasAction ? (
                <button
                  onClick={onOpenRules}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800 transition cursor-pointer"
                >
                  <span>Xem quy định điểm liệt</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* Story Full Modal with Reaction & Comment Options */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-7 relative">
            <button
              onClick={() => setSelectedStory(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-md font-extrabold text-xs ${getCategoryLabel(selectedStory.category).color}`}>
                {getCategoryLabel(selectedStory.category).label}
              </span>
              <span className="text-xs text-slate-400">• {selectedStory.date}</span>
            </div>

            <h3 className="text-lg font-black text-slate-900 leading-snug">
              {selectedStory.title}
            </h3>

            <div className="mt-2 text-xs text-slate-500 pb-3 border-b border-slate-100">
              Chia sẻ bởi: <strong className="text-slate-800">{selectedStory.authorName}</strong> ({selectedStory.companyCode} - KV {selectedStory.areaCode})
            </div>

            <div className="mt-4 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {selectedStory.content}
            </div>

            {/* Reactions Picker Bar inside Modal */}
            <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
              <div className="text-xs font-bold text-slate-700">
                Thả cảm xúc cho câu chuyện này:
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(Object.keys(REACTION_CONFIG) as ReactionType[]).map((rType) => {
                  const cfg = REACTION_CONFIG[rType];
                  return (
                    <button
                      key={rType}
                      onClick={() => handleSelectReaction(selectedStory.id, rType)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>{cfg.emoji}</span>
                      <span>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedStory(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
