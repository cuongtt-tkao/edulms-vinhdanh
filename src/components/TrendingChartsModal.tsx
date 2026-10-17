import React, { useState } from 'react';
import { X, TrendingUp, BarChart3, Building2, Sparkles, Award, ArrowUpRight } from 'lucide-react';
import { CompanyRankItem } from '../types/edulms';

interface TrendingChartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyRankings: CompanyRankItem[];
}

export const TrendingChartsModal: React.FC<TrendingChartsModalProps> = ({
  isOpen,
  onClose,
  companyRankings,
}) => {
  const [activeCompany, setActiveCompany] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 7-day timeline simulation
  const days = ['10/10', '11/10', '12/10', '13/10', '14/10', '15/10', '16/10'];

  // Company color mapping
  const companyColors: Record<string, { stroke: string; fill: string; bg: string }> = {
    Th1: { stroke: '#2563eb', fill: '#3b82f6', bg: 'bg-blue-100 text-blue-800' },
    Th2: { stroke: '#d97706', fill: '#f59e0b', bg: 'bg-amber-100 text-amber-800' },
    Th3: { stroke: '#059669', fill: '#10b981', bg: 'bg-emerald-100 text-emerald-800' },
    HT: { stroke: '#7c3aed', fill: '#8b5cf6', bg: 'bg-purple-100 text-purple-800' },
    NC: { stroke: '#dc2626', fill: '#ef4444', bg: 'bg-rose-100 text-rose-800' },
    QN: { stroke: '#0891b2', fill: '#06b6d4', bg: 'bg-cyan-100 text-cyan-800' },
  };

  // Trajectory points per company over 7 days
  const trendsData = companyRankings.map((c) => {
    const finalScore = c.averageScore || 100;
    const dayScores = [
      Math.round(finalScore * 0.2),
      Math.round(finalScore * 0.35),
      Math.round(finalScore * 0.48),
      Math.round(finalScore * 0.62),
      Math.round(finalScore * 0.78),
      Math.round(finalScore * 0.91),
      finalScore,
    ];
    return {
      ...c,
      dayScores,
      colors: companyColors[c.companyCode] || { stroke: '#475569', fill: '#64748b', bg: 'bg-slate-100 text-slate-800' },
    };
  });

  const maxVal = Math.max(...trendsData.flatMap((d) => d.dayScores), 500);

  // SVG Chart Dimensions
  const svgWidth = 640;
  const svgHeight = 240;
  const paddingX = 45;
  const paddingY = 30;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  const getX = (index: number) => paddingX + (index / (days.length - 1)) * chartW;
  const getY = (val: number) => paddingY + chartH - (val / (maxVal || 1)) * chartH;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-7 relative cursor-default"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Biểu Đồ Xu Hướng Tăng Trưởng Điểm Số
            </h3>
            <p className="text-xs text-slate-500">
              Tốc độ bứt phá điểm trung bình mỗi thành viên của các Công ty (Th1, Th2, Th3, HT, NC, QN) theo từng ngày
            </p>
          </div>
        </div>

        {/* Interactive SVG Chart */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-900 text-white shadow-inner relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tiến trình 7 ngày gần nhất</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Đơn vị: điểm / người</span>
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-56 min-w-[500px]"
            >
              {/* Horizontal Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = paddingY + chartH * (1 - ratio);
                const scoreLabel = Math.round(maxVal * ratio);
                return (
                  <g key={i}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="#334155"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 4}
                      fill="#94a3b8"
                      fontSize="9"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {scoreLabel}
                    </text>
                  </g>
                );
              })}

              {/* Day Labels */}
              {days.map((day, idx) => (
                <text
                  key={day}
                  x={getX(idx)}
                  y={svgHeight - 8}
                  fill="#94a3b8"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {day}
                </text>
              ))}

              {/* Company Curves */}
              {trendsData.map((c) => {
                const points = c.dayScores.map((score, idx) => `${getX(idx)},${getY(score)}`).join(' ');
                const isSelected = activeCompany === null || activeCompany === c.companyCode;
                const opacity = isSelected ? 1 : 0.2;

                return (
                  <g key={c.companyCode} opacity={opacity} className="transition-opacity duration-200">
                    <polyline
                      fill="none"
                      stroke={c.colors.stroke}
                      strokeWidth={isSelected && activeCompany === c.companyCode ? '3.5' : '2.5'}
                      points={points}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Dots on points */}
                    {c.dayScores.map((score, idx) => (
                      <circle
                        key={idx}
                        cx={getX(idx)}
                        cy={getY(score)}
                        r={isSelected && activeCompany === c.companyCode ? '4.5' : '3'}
                        fill={c.colors.fill}
                        stroke="#0f172a"
                        strokeWidth="1.5"
                      />
                    ))}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Interactive Legend Filters */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-3 border-t border-slate-800">
            <button
              onClick={() => setActiveCompany(null)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                activeCompany === null ? 'bg-white text-slate-900 shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Tất cả công ty
            </button>
            {trendsData.map((c) => (
              <button
                key={c.companyCode}
                onClick={() => setActiveCompany(c.companyCode === activeCompany ? null : c.companyCode)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeCompany === c.companyCode
                    ? 'ring-2 ring-white text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
                style={{ backgroundColor: activeCompany === c.companyCode ? c.colors.stroke : '#1e293b' }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.colors.fill }} />
                <span>{c.companyName} ({c.companyCode})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Company Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {companyRankings.map((c) => (
            <div
              key={c.companyCode}
              onClick={() => setActiveCompany(activeCompany === c.companyCode ? null : c.companyCode)}
              className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                activeCompany === c.companyCode
                  ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                  : 'border-slate-200 bg-slate-50 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-extrabold text-slate-900">{c.companyName}</span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800">
                  Hạng #{c.rank}
                </span>
              </div>
              <div className="text-lg font-black text-slate-900">
                {c.averageScore} <span className="text-[11px] font-semibold text-slate-500">đ/người</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>{c.activeMembersCount} thành viên</span>
                <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> Tăng trưởng tốt
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold transition hover:bg-slate-800 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
