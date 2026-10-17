import React from 'react';
import { Trophy, Users, Target, Star, TrendingUp } from 'lucide-react';
import { KpiSummary } from '../types/edulms';

interface KpiCardsProps {
  kpi: KpiSummary;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ kpi }) => {
  const formatNumber = (num: number) => {
    return (num || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const cards = [
    {
      title: 'Tổng số đội tham gia',
      value: kpi.totalTeams,
      unit: 'đội',
      icon: Trophy,
      bgColor: 'bg-amber-50',
      iconBg: 'bg-amber-500',
      textColor: 'text-amber-600',
      ringColor: 'ring-amber-200',
      badge: '100% chỉ tiêu',
    },
    {
      title: 'Tổng số thành viên',
      value: kpi.totalMembers,
      unit: 'người',
      icon: Users,
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-500',
      textColor: 'text-blue-600',
      ringColor: 'ring-blue-200',
      badge: '+18 tuần này',
    },
    {
      title: 'Tổng số mục tiêu',
      value: formatNumber(kpi.totalTargets),
      unit: 'mục tiêu',
      icon: Target,
      bgColor: 'bg-emerald-50',
      iconBg: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      ringColor: 'ring-emerald-200',
      badge: 'Đã giao kết',
    },
    {
      title: 'Tổng điểm toàn chương trình',
      value: formatNumber(kpi.totalPoints),
      unit: 'điểm',
      icon: Star,
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-600',
      textColor: 'text-purple-600',
      ringColor: 'ring-purple-200',
      badge: 'Tích lũy thực',
    },
  ];

  return (
    <div className="relative -mt-8 sm:-mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-5 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100 flex items-center gap-4 group"
            >
              {/* Circular Icon badge */}
              <div
                className={`w-13 h-13 rounded-2xl ${card.iconBg} text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300`}
              >
                <Icon className="w-6 h-6 stroke-[2.2]" />
              </div>

              {/* Stat Info */}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-500 truncate mb-1">
                  {card.title}
                </div>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {card.value}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {card.unit}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
