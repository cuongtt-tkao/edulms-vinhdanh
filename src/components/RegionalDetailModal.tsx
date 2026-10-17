import React from 'react';
import { X, BarChart3, MapPin, Users, Trophy } from 'lucide-react';
import { AreaRankItem } from '../types/edulms';

interface RegionalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  areaRankings: AreaRankItem[];
  onSelectAreaCode: (areaCode: string) => void;
}

export const RegionalDetailModal: React.FC<RegionalDetailModalProps> = ({
  isOpen,
  onClose,
  areaRankings,
  onSelectAreaCode,
}) => {
  if (!isOpen) return null;

  const formatNumber = (num: number) => {
    return (num || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-7 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Chi Tiết Xếp Hạng Điểm Theo Khu Vực
            </h3>
            <p className="text-xs text-slate-500">
              Xếp hạng theo điểm trung bình trên tổng số thành viên hoạt động
            </p>
          </div>
        </div>

        {/* Areas Breakdown Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 uppercase tracking-wider font-bold">
                <th className="py-2.5 px-3">Hạng</th>
                <th className="py-2.5 px-3">Khu vực</th>
                <th className="py-2.5 px-3">Công ty</th>
                <th className="py-2.5 px-3 text-center">Thành viên</th>
                <th className="py-2.5 px-3 text-right">Tổng điểm</th>
                <th className="py-2.5 px-3 text-right font-black text-blue-900">Điểm TB/Người</th>
                <th className="py-2.5 px-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {areaRankings.map((area) => (
                <tr key={area.areaCode} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-bold text-slate-900">#{area.rank}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: area.color || '#3b82f6' }}
                      />
                      <span className="font-bold text-slate-900">{area.areaName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700">{area.companyCode}</td>
                  <td className="py-3 px-3 text-center font-semibold text-slate-600">
                    {area.activeMembersCount} người
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-600">
                    {formatNumber(area.totalScore)} đ
                  </td>
                  <td className="py-3 px-3 text-right font-black text-blue-800 text-sm">
                    {formatNumber(area.averageScore)} đ
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => {
                        onSelectAreaCode(area.areaCode);
                        onClose();
                      }}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-[11px] transition"
                    >
                      Lọc bảng
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Action */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
