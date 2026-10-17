import React from 'react';
import { BarChart3, ChevronRight, MapPin } from 'lucide-react';
import { AreaRankItem } from '../types/edulms';

interface RegionalStatsProps {
  areaRankings: AreaRankItem[];
  selectedAreaCode?: string | null;
  onSelectAreaCode: (areaCode: string | null) => void;
  onOpenDetailsModal: () => void;
}

export const RegionalStats: React.FC<RegionalStatsProps> = ({
  areaRankings,
  selectedAreaCode,
  onSelectAreaCode,
  onOpenDetailsModal,
}) => {
  const formatNumber = (num: number) => {
    return (num || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const maxAvgScore = Math.max(...areaRankings.map((a) => a.averageScore), 1);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100" id="stats-section">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Thống kê Khu vực (Điểm TB)</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Điểm trung bình chia đều cho thành viên hoạt động
          </p>
        </div>
        <button
          onClick={onOpenDetailsModal}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 group transition"
        >
          <span>Chi tiết</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {selectedAreaCode && (
        <div className="mb-3 flex items-center justify-between px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
          <span>
            Đang lọc: <strong>Khu vực {selectedAreaCode}</strong>
          </span>
          <button
            onClick={() => onSelectAreaCode(null)}
            className="text-blue-600 hover:text-blue-900 font-bold underline ml-2"
          >
            Bỏ lọc
          </button>
        </div>
      )}

      {/* Progress Bars List */}
      <div className="space-y-3">
        {areaRankings.map((area) => {
          const percentage = Math.min(100, Math.round((area.averageScore / maxAvgScore) * 100));
          const isSelected = selectedAreaCode === area.areaCode;

          return (
            <div
              key={area.areaCode}
              onClick={() => onSelectAreaCode(isSelected ? null : area.areaCode)}
              className={`p-2 rounded-xl cursor-pointer transition-colors ${
                isSelected ? 'bg-blue-50/80 ring-1 ring-blue-300' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: area.color || '#3b82f6' }}
                  />
                  <span className="font-bold text-slate-800">
                    {area.areaName} ({area.areaCode})
                  </span>
                  <span className="text-[10px] text-slate-400">({area.companyCode})</span>
                </span>
                <span className="font-black text-slate-900 tabular-nums">
                  {formatNumber(area.averageScore)} đ/người
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out shadow-xs"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: area.color || '#3b82f6',
                  }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>{area.activeMembersCount} thành viên</span>
                <span>Tổng: {formatNumber(area.totalScore)} đ</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Nhấn vào khu vực để lọc bảng</span>
        <span>{areaRankings.length} khu vực</span>
      </div>
    </div>
  );
};
