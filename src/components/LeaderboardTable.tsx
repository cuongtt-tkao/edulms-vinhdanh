import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Search,
  Filter,
  User,
  Users,
  Building2,
  MapPin,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle2,
  Calendar,
  FileSpreadsheet,
  Printer,
  TrendingUp,
} from 'lucide-react';
import { Member, CompanyRankItem, AreaRankItem } from '../types/edulms';
import { exportCompetitionToExcel, printCompetitionReport } from '../utils/reportExporter';
import { TrendingChartsModal } from './TrendingChartsModal';

interface LeaderboardTableProps {
  members: Member[];
  companyRankings: CompanyRankItem[];
  areaRankings: AreaRankItem[];
  lastUpdated: string;
  selectedAreaCode: string | null;
  onSelectAreaCode: (code: string | null) => void;
  onSelectMember: (member: Member) => void;
  onOpenRules: () => void;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  members,
  companyRankings,
  areaRankings,
  lastUpdated,
  selectedAreaCode,
  onSelectAreaCode,
  onSelectMember,
  onOpenRules,
}) => {
  const [activeTab, setActiveTab] = useState<'PERSON' | 'AREA' | 'COMPANY'>('PERSON');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('ALL');
  const [displayCount, setDisplayCount] = useState<number>(10);

  const formatNumber = (num: number) => {
    return (num || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Filtered Members
  const filteredMembers = useMemo(() => {
    let list = members;
    if (selectedAreaCode) {
      list = list.filter((m) => m.areaCode === selectedAreaCode);
    }
    if (selectedCompanyFilter !== 'ALL') {
      list = list.filter((m) => m.companyCode === selectedCompanyFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.companyCode.toLowerCase().includes(q) ||
          m.areaCode.toLowerCase().includes(q) ||
          m.departmentCode.toLowerCase().includes(q)
      );
    }
    return list;
  }, [members, selectedAreaCode, selectedCompanyFilter, searchQuery]);

  // Filtered Areas
  const filteredAreas = useMemo(() => {
    let list = areaRankings;
    if (selectedCompanyFilter !== 'ALL') {
      list = list.filter((a) => a.companyCode === selectedCompanyFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.areaName.toLowerCase().includes(q) ||
          a.areaCode.toLowerCase().includes(q) ||
          a.companyCode.toLowerCase().includes(q)
      );
    }
    return list;
  }, [areaRankings, selectedCompanyFilter, searchQuery]);

  // Filtered Companies
  const filteredCompanies = useMemo(() => {
    let list = companyRankings;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.companyName.toLowerCase().includes(q) ||
          c.companyCode.toLowerCase().includes(q)
      );
    }
    return list;
  }, [companyRankings, searchQuery]);

  const visibleMembers = filteredMembers.slice(0, displayCount);

  // Render Rank Badge helper
  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-amber-950 font-black inline-flex items-center justify-center text-xs shadow-md shadow-amber-500/20">
          1
        </span>
      );
    } else if (rank === 2) {
      return (
        <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-800 font-black inline-flex items-center justify-center text-xs shadow-xs">
          2
        </span>
      );
    } else if (rank === 3) {
      return (
        <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 to-amber-700 text-white font-black inline-flex items-center justify-center text-xs shadow-xs">
          3
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold inline-flex items-center justify-center text-xs">
        {rank}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors" id="leaderboard-section">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>Bảng xếp hạng thi đua</span>
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400">Cập nhật tức thì:</span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {lastUpdated}
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* 3 Tab Vinh danh (Cá nhân, Khu vực, Công ty) */}
        <div className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-800/90 rounded-2xl text-xs font-bold self-start sm:self-auto gap-1">
          <button
            onClick={() => setActiveTab('PERSON')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'PERSON'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Vinh danh Cá nhân</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'PERSON' ? 'bg-blue-800 text-blue-200' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
              {members.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('AREA')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'AREA'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Vinh danh Khu vực</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'AREA' ? 'bg-blue-800 text-blue-200' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
              {areaRankings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('COMPANY')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'COMPANY'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Vinh danh Công ty</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'COMPANY' ? 'bg-blue-800 text-blue-200' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
              {companyRankings.length}
            </span>
          </button>
        </div>
      </div>

      {/* Explanatory banner for Ranking Rules */}
      <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-300 gap-2">
        <div>
          {activeTab === 'PERSON' && (
            <span>⭐ <strong>Xếp hạng Cá nhân:</strong> Tính theo tổng điểm các đối tượng đã ghi nhận. Cùng điểm thì đồng hạng.</span>
          )}
          {activeTab === 'AREA' && (
            <span>📍 <strong>Xếp hạng Khu vực:</strong> Tính theo <strong>điểm trung bình mỗi thành viên</strong> hoạt động trong KV (người chưa ghi tính 0đ).</span>
          )}
          {activeTab === 'COMPANY' && (
            <span>🏢 <strong>Xếp hạng Công ty:</strong> Tính theo <strong>điểm trung bình mỗi thành viên</strong> hoạt động trong Cty (người chưa ghi tính 0đ).</span>
          )}
        </div>
        <button
          onClick={onOpenRules}
          className="text-blue-700 hover:underline font-bold text-[11px]"
        >
          Chi tiết quy tắc →
        </button>
      </div>

      {/* Search & Filtering Bar */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm nhanh..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        {/* Company filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
          <Building2 className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCompanyFilter}
            onChange={(e) => setSelectedCompanyFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-semibold focus:outline-hidden"
          >
            <option value="ALL">Tất cả công ty</option>
            {companyRankings.map((c) => (
              <option key={c.companyCode} value={c.companyCode}>
                {c.companyName}
              </option>
            ))}
          </select>

          {selectedAreaCode && (
            <button
              onClick={() => onSelectAreaCode(null)}
              className="text-blue-700 underline font-semibold text-[11px] ml-1"
            >
              Bỏ lọc KV {selectedAreaCode}
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: CÁ NHÂN TABLE */}
      {activeTab === 'PERSON' && (
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="text-xs uppercase text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <th className="py-3 px-3 w-16 text-center">Hạng</th>
                <th className="py-3 px-3">Họ và tên</th>
                <th className="py-3 px-3">Công ty</th>
                <th className="py-3 px-3">Khu vực</th>
                <th className="py-3 px-3">Ban ngành</th>
                <th className="py-3 px-3 text-center">Số đối tượng</th>
                <th className="py-3 px-3 text-right">Tổng điểm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {visibleMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs">
                    Không tìm thấy thành viên nào phù hợp bộ lọc.
                  </td>
                </tr>
              ) : (
                visibleMembers.map((mem) => (
                  <tr
                    key={mem.id}
                    onClick={() => onSelectMember(mem)}
                    className="hover:bg-blue-50/80 dark:hover:bg-slate-800/90 transition-all duration-150 cursor-pointer group"
                  >
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      {renderRankBadge(mem.rank || 1)}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                            {mem.fullName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{mem.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">{mem.companyCode}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">{mem.areaCode}</td>
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400 text-xs">{mem.departmentCode}</td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                      {mem.targets?.length || 0}
                    </td>
                    <td className="py-3.5 px-3 text-right font-black text-slate-900 dark:text-white tabular-nums">
                      {formatNumber(mem.score)} đ
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {filteredMembers.length > displayCount && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => setDisplayCount((prev) => prev + 10)}
                className="font-bold text-blue-700 hover:underline"
              >
                Xem thêm 10 thành viên khác →
              </button>
              <span className="text-slate-400">
                Hiển thị {visibleMembers.length}/{filteredMembers.length}
              </span>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: KHU VỰC TABLE */}
      {activeTab === 'AREA' && (
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="text-xs uppercase text-slate-400 border-b border-slate-100">
                <th className="py-3 px-3 w-16 text-center">Hạng</th>
                <th className="py-3 px-3">Khu vực</th>
                <th className="py-3 px-3">Trực thuộc Cty</th>
                <th className="py-3 px-3 text-center">Số thành viên hoạt động</th>
                <th className="py-3 px-3 text-right">Tổng điểm khu vực</th>
                <th className="py-3 px-3 text-right font-bold text-blue-900">Điểm TB/Thành viên</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAreas.map((area) => (
                <tr
                  key={area.areaCode}
                  onClick={() => onSelectAreaCode(area.areaCode)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    {renderRankBadge(area.rank)}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: area.color || '#3b82f6' }}
                      />
                      <span className="font-bold text-slate-900 group-hover:text-blue-700 transition">
                        {area.areaName} ({area.areaCode})
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-700">{area.companyCode}</td>
                  <td className="py-3.5 px-3 text-center font-bold text-slate-700">
                    {area.activeMembersCount} người
                  </td>
                  <td className="py-3.5 px-3 text-right font-semibold text-slate-600 tabular-nums">
                    {formatNumber(area.totalScore)} đ
                  </td>
                  <td className="py-3.5 px-3 text-right font-black text-blue-800 text-base tabular-nums">
                    {formatNumber(area.averageScore)} đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 3: CÔNG TY TABLE */}
      {activeTab === 'COMPANY' && (
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="text-xs uppercase text-slate-400 border-b border-slate-100">
                <th className="py-3 px-3 w-16 text-center">Hạng</th>
                <th className="py-3 px-3">Mã Cty</th>
                <th className="py-3 px-3">Tên Công ty</th>
                <th className="py-3 px-3 text-center">Số thành viên hoạt động</th>
                <th className="py-3 px-3 text-right">Tổng điểm tích lũy</th>
                <th className="py-3 px-3 text-right font-bold text-blue-900">Điểm TB/Thành viên</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCompanies.map((comp) => (
                <tr key={comp.companyCode} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    {renderRankBadge(comp.rank)}
                  </td>
                  <td className="py-3.5 px-3 font-black text-blue-700">{comp.companyCode}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-900">{comp.companyName}</td>
                  <td className="py-3.5 px-3 text-center font-bold text-slate-700">
                    {comp.activeMembersCount} người
                  </td>
                  <td className="py-3.5 px-3 text-right font-semibold text-slate-600 tabular-nums">
                    {formatNumber(comp.totalScore)} đ
                  </td>
                  <td className="py-3.5 px-3 text-right font-black text-blue-800 text-base tabular-nums">
                    {formatNumber(comp.averageScore)} đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
