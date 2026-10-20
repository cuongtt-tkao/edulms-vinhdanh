import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  BookOpen,
  Sun,
  Flame,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import heroSpotlightImage from '../assets/images/hero_spotlight_1792173345769.jpg';
import { getDailyVerse, getNextVerse } from '../utils/dailyScripture';
import { DailyVerse } from '../types/edulms';

interface HeroBannerProps {
  festivalName?: string;
  onOpenRules?: () => void;
}

// 4 Majestic Spotlight covers without any crucifix or cross symbol
export const SPOTLIGHT_COVERS = [
  {
    id: 1,
    title: 'Kinh Thánh Mở & Ánh Sáng Vinh Quang',
    subtitle: 'Lời Chúa là ngọn đèn soi cho chân tôi, là ánh sáng cho đường lối tôi. (Thi Thiên 119:105)',
    url: heroSpotlightImage,
  },
  {
    id: 2,
    title: 'Bình Minh Rạng Đông Trên Núi Thánh',
    subtitle: 'Đẹp thay những bàn chân của kẻ rao truyền Tin Lành bình an! (Rô-ma 10:15)',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    title: 'Ánh Sáng Chiếu Rọi Cánh Đồng Mùa Gặt',
    subtitle: 'Mùa gặt thật trúng, song con gặt thì ít. Hãy cầu xin Chủ mùa gặt sai con gặt đến. (Lu-ca 10:2)',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    title: 'Ngọn Đèn Thiêng Soi Lời Sự Sống',
    subtitle: 'Các con là sự sáng của thế gian. Hãy để sự sáng các con soi trước mặt người ta! (Ma-thi-ơ 5:14-16)',
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&auto=format&fit=crop&q=80',
  },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  festivalName = 'TRUYỀN ĐẠO',
  onOpenRules,
}) => {
  const [dailyVerse, setDailyVerse] = useState<DailyVerse>(() => getDailyVerse());
  const [isRotatingVerse, setIsRotatingVerse] = useState(false);
  const [currentCoverIndex, setCurrentCoverIndex] = useState(0);

  // Auto rotate daily verse based on today's date
  useEffect(() => {
    setDailyVerse(getDailyVerse());
  }, []);

  // Auto rotate Spotlight cover every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCoverIndex((prev) => (prev + 1) % SPOTLIGHT_COVERS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const handleNextVerse = () => {
    setIsRotatingVerse(true);
    setDailyVerse((prev) => getNextVerse(prev.reference));
    setTimeout(() => setIsRotatingVerse(false), 400);
  };

  const handlePrevCover = () => {
    setCurrentCoverIndex((prev) =>
      prev === 0 ? SPOTLIGHT_COVERS.length - 1 : prev - 1
    );
  };

  const handleNextCover = () => {
    setCurrentCoverIndex((prev) => (prev + 1) % SPOTLIGHT_COVERS.length);
  };

  const currentCover = SPOTLIGHT_COVERS[currentCoverIndex];

  return (
    <div className="relative w-full overflow-hidden bg-slate-950 min-h-[380px] sm:min-h-[440px] md:min-h-[480px] flex items-center shadow-xl select-none">
      {/* Background Slides with Crossfade */}
      {SPOTLIGHT_COVERS.map((cover, idx) => (
        <div
          key={cover.id}
          className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentCoverIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <img
            src={cover.url}
            alt={cover.title}
            className={`w-full h-full object-cover object-center transform transition-transform duration-7000 ease-linear ${
              idx === currentCoverIndex ? 'scale-105' : 'scale-100'
            }`}
            referrerPolicy="no-referrer"
          />

          {/* Layered cinematic gradients to guarantee both rich background visibility and crisp text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/55 to-slate-950/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
          <div className="absolute inset-0 bg-radial from-amber-400/25 via-transparent to-black/50 pointer-events-none" />
        </div>
      ))}

      {/* Dynamic Animated Spotlight Cones / Light Sweeps */}
      <div className="absolute -top-32 left-1/4 w-[420px] h-[700px] bg-gradient-to-b from-amber-300/25 via-amber-200/10 to-transparent blur-3xl transform -rotate-12 pointer-events-none animate-pulse duration-1000" />
      <div className="absolute top-0 right-1/4 w-96 h-[600px] bg-gradient-to-b from-yellow-100/15 via-amber-300/5 to-transparent blur-2xl pointer-events-none" />

      {/* Manual Spotlight Slider Controls (Prev / Next Buttons) */}
      <button
        onClick={handlePrevCover}
        aria-label="Ảnh trước"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-amber-200 hover:text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition opacity-60 hover:opacity-100"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={handleNextCover}
        aria-label="Ảnh tiếp theo"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-amber-200 hover:text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition opacity-60 hover:opacity-100"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
          
          {/* Left Column: Script Calligraphy, Golden Title & Daily Scripture Box */}
          <div className="max-w-2xl text-left">
            {/* Elegant Calligraphy & Spotlight Status Indicator */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-script text-3xl sm:text-4xl md:text-5xl text-amber-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] tracking-wide select-none">
                Lễ hội thi đua
              </span>
              <div className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-[10px] font-extrabold uppercase tracking-wider border border-amber-300/30 backdrop-blur-xs flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                <span>Spotlight Tự Động ({currentCoverIndex + 1}/{SPOTLIGHT_COVERS.length})</span>
              </div>
            </div>

            {/* Main Title: TRUYỀN ĐẠO with luxurious hover ripple and zoom effect */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-wider uppercase font-cinzel my-1 md:my-2 leading-none group cursor-pointer inline-block transition-transform duration-500 ease-out hover:scale-105 active:scale-98">
              <span className="gold-gradient-title select-none inline-block drop-shadow-[0_4px_16px_rgba(245,158,11,0.4)] transition-all duration-500 group-hover:drop-shadow-[0_8px_32px_rgba(251,191,36,0.9)] group-hover:brightness-110 relative">
                {festivalName}
                {/* Subtle golden shimmer ripple underline */}
                <span className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 rounded-full transition-all duration-500 group-hover:w-full opacity-80" />
              </span>
            </h1>

            {/* Daily Scripture Box (Tự động câu Kinh Thánh mỗi ngày) */}
            <div className="mt-3 md:mt-4 p-4 rounded-2xl bg-slate-900/75 backdrop-blur-md border border-amber-400/30 shadow-2xl relative group">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold uppercase tracking-wider text-[11px]">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lời Chúa Hôm Nay • {dailyVerse.theme}</span>
                </div>

                <button
                  onClick={handleNextVerse}
                  className="flex items-center gap-1 text-[11px] font-semibold text-amber-200 hover:text-white transition px-2 py-0.5 rounded-md hover:bg-white/10 cursor-pointer"
                  title="Xem câu Kinh Thánh tiếp theo"
                >
                  <RefreshCw className={`w-3 h-3 ${isRotatingVerse ? 'animate-spin' : ''}`} />
                  <span>Đổi câu</span>
                </button>
              </div>

              <blockquote className="text-amber-50 text-sm sm:text-base md:text-lg font-normal italic leading-relaxed">
                “{dailyVerse.verse}”
              </blockquote>

              <div className="mt-2 text-amber-300 font-extrabold text-xs sm:text-sm tracking-wide flex items-center justify-between">
                <span>{dailyVerse.reference}</span>
                {dailyVerse.reflection && (
                  <span className="text-slate-300 font-normal italic text-[11px] hidden sm:inline truncate max-w-xs">
                    {dailyVerse.reflection}
                  </span>
                )}
              </div>
            </div>

            {/* Indicator Dots for Spotlight Slides */}
            <div className="flex items-center gap-1.5 mt-3">
              {SPOTLIGHT_COVERS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentCoverIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === currentCoverIndex
                      ? 'w-6 bg-amber-400'
                      : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Chuyển tới ảnh bìa ${i + 1}`}
                />
              ))}
              <span className="text-[10px] text-amber-200/60 ml-2 font-medium">
                {currentCover.title}
              </span>
            </div>
          </div>

          {/* Right Column: Slogan & Spotlight Callout Block */}
          <div className="hidden md:flex flex-col items-end text-right max-w-xs lg:max-w-sm space-y-3">
            <div className="bg-slate-900/75 backdrop-blur-md p-5 rounded-3xl border border-amber-300/25 shadow-2xl">
              <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Lan tỏa hương thơm</span>
              </div>
              <p className="text-base lg:text-lg text-amber-50 font-medium leading-snug">
                “Đẹp thay những bàn chân của kẻ rao truyền <br />
                <span className="font-extrabold text-amber-300">Tin Lành bình an!</span>”
              </p>
              
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-amber-200/90">
                <span className="text-[11px] text-slate-400">Rô-ma 10:15</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Trực tuyến 24/7</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
