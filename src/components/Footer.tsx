import React from 'react';
import { Globe, Church, Heart, ShieldCheck, Trophy } from 'lucide-react';

interface FooterProps {
  onOpenRulesModal: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenRulesModal, onScrollToSection }) => {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800 pt-12 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center pb-8 border-b border-slate-800">
          
          {/* Left Brand */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v-3H9V9h2V6h2v3h2v2h-2v3h2v2h-2v2h-2v-2z" />
              </svg>
            </div>
            <div>
              <div className="font-black text-xl tracking-tight font-cinzel text-white">EduLMS</div>
              <div className="text-xs text-amber-200/80 font-medium">Lan tỏa yêu thương - Chia sẻ Tin Lành</div>
            </div>
          </div>

          {/* Center Info & Socials */}
          <div className="text-center space-y-2">
            <div className="font-bold text-sm text-slate-200 tracking-wide uppercase">
              Lễ hội thi đua Truyền Đạo
            </div>
            <div className="text-xs text-slate-400">
              Kết nối • Lan tỏa • Phục vụ
            </div>

            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={() => onScrollToSection('leaderboard-section')}
                className="text-xs text-slate-300 hover:text-white transition underline"
              >
                Bảng xếp hạng
              </button>
              <span className="text-slate-600">•</span>
              <button
                onClick={() => onScrollToSection('entry-section')}
                className="text-xs text-slate-300 hover:text-white transition underline"
              >
                Nhập kết quả
              </button>
              <span className="text-slate-600">•</span>
              <button
                onClick={() => onScrollToSection('admin-section')}
                className="text-xs text-slate-300 hover:text-white transition underline"
              >
                Trang quản trị
              </button>
            </div>
          </div>

          {/* Right Scripture Quote */}
          <div className="text-left md:text-right">
            <blockquote className="text-sm font-medium italic text-amber-100/90 leading-relaxed">
              “Ngài đã ban cho chúng ta sứ mạng này.”
            </blockquote>
            <div className="text-xs font-bold text-amber-400 mt-1">
              Ma-thi-ơ 28:19
            </div>
          </div>

        </div>

        {/* Bottom Credits & Read-Only guarantee */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>EduLMS — Nền tảng ghi nhận và vinh danh thi đua truyền đạo trực tiếp.</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenRulesModal}
              className="hover:text-amber-300 transition underline underline-offset-2"
            >
              Thể lệ & Cơ chế tính điểm 6 bước
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
