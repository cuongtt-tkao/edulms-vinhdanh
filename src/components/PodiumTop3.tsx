import React, { useState } from 'react';
import { Crown, Sparkles, Award, User, MapPin, Building2 } from 'lucide-react';
import { Member, AreaRankItem, CompanyRankItem } from '../types/edulms';

interface PodiumTop3Props {
  members: Member[];
  areaRankings: AreaRankItem[];
  companyRankings: CompanyRankItem[];
  onSelectMember?: (m: Member) => void;
  onSelectArea?: (areaCode: string) => void;
}

export const PodiumTop3: React.FC<PodiumTop3Props> = ({
  members,
  areaRankings,
  companyRankings,
  onSelectMember,
  onSelectArea,
}) => {
  const [activePodiumTab, setActivePodiumTab] = useState<'PERSON' | 'AREA' | 'COMPANY'>('PERSON');

  const formatNumber = (num: number) => {
    return (num || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Prepare top 3 depending on tab
  const getPodiumData = () => {
    if (activePodiumTab === 'PERSON') {
      const top1 = members.find((m) => m.rank === 1) || members[0];
      const top2 = members.find((m) => m.rank === 2) || members[1];
      const top3 = members.find((m) => m.rank === 3) || members[2];
      return {
        unitLabel: 'điểm',
        top1: top1 ? { name: top1.fullName, sub: `${top1.companyCode} • KV ${top1.areaCode}`, score: top1.score, original: top1 } : null,
        top2: top2 ? { name: top2.fullName, sub: `${top2.companyCode} • KV ${top2.areaCode}`, score: top2.score, original: top2 } : null,
        top3: top3 ? { name: top3.fullName, sub: `${top3.companyCode} • KV ${top3.areaCode}`, score: top3.score, original: top3 } : null,
      };
    } else if (activePodiumTab === 'AREA') {
      const top1 = areaRankings[0];
      const top2 = areaRankings[1];
      const top3 = areaRankings[2];
      return {
        unitLabel: 'đ/người',
        top1: top1 ? { name: `${top1.areaName} (${top1.areaCode})`, sub: `${top1.companyCode} • ${top1.activeMembersCount} TV`, score: top1.averageScore, original: top1 } : null,
        top2: top2 ? { name: `${top2.areaName} (${top2.areaCode})`, sub: `${top2.companyCode} • ${top2.activeMembersCount} TV`, score: top2.averageScore, original: top2 } : null,
        top3: top3 ? { name: `${top3.areaName} (${top3.areaCode})`, sub: `${top3.companyCode} • ${top3.activeMembersCount} TV`, score: top3.averageScore, original: top3 } : null,
      };
    } else {
      const top1 = companyRankings[0];
      const top2 = companyRankings[1];
      const top3 = companyRankings[2];
      return {
        unitLabel: 'đ/người',
        top1: top1 ? { name: top1.companyName, sub: `Mã ${top1.companyCode} • ${top1.activeMembersCount} TV`, score: top1.averageScore, original: top1 } : null,
        top2: top2 ? { name: top2.companyName, sub: `Mã ${top2.companyCode} • ${top2.activeMembersCount} TV`, score: top2.averageScore, original: top2 } : null,
        top3: top3 ? { name: top3.companyName, sub: `Mã ${top3.companyCode} • ${top3.activeMembersCount} TV`, score: top3.averageScore, original: top3 } : null,
      };
    }
  };

  const { top1, top2, top3, unitLabel } = getPodiumData();

  if (!top1) return null;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
      
      {/* Header with Title and 3 Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
          <span>Vinh danh Top 3 Xuất Sắc</span>
        </h3>

        {/* 3 Tabs: Top 3 Cá nhân, Top 3 Khu vực, Top 3 Công ty */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl text-[11px] font-bold">
          <button
            onClick={() => setActivePodiumTab('PERSON')}
            className={`px-2.5 py-1 rounded-lg transition ${
              activePodiumTab === 'PERSON'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cá nhân
          </button>

          <button
            onClick={() => setActivePodiumTab('AREA')}
            className={`px-2.5 py-1 rounded-lg transition ${
              activePodiumTab === 'AREA'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Khu vực
          </button>

          <button
            onClick={() => setActivePodiumTab('COMPANY')}
            className={`px-2.5 py-1 rounded-lg transition ${
              activePodiumTab === 'COMPANY'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Công ty
          </button>
        </div>
      </div>

      {/* Subtitle note on calculation */}
      <div className="text-[11px] text-slate-400 mb-4">
        {activePodiumTab === 'PERSON' && 'Xếp hạng theo tổng điểm cá nhân tích lũy'}
        {activePodiumTab === 'AREA' && 'Xếp hạng theo điểm trung bình mỗi thành viên khu vực'}
        {activePodiumTab === 'COMPANY' && 'Xếp hạng theo điểm trung bình mỗi thành viên công ty'}
      </div>

      {/* Podium Layout */}
      <div className="flex items-end justify-center gap-2 sm:gap-3 pt-6 pb-2">
        {/* RANK 2 - SILVER */}
        {top2 && (
          <div
            onClick={() => {
              if (activePodiumTab === 'PERSON' && onSelectMember && top2.original) {
                onSelectMember(top2.original as Member);
              }
            }}
            className="flex-1 flex flex-col items-center cursor-pointer group transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="relative mb-2 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-slate-200 via-slate-100 to-white flex items-center justify-center p-1 shadow-md border-2 border-slate-300 relative">
                <div className="w-11 h-11 rounded-full bg-gradient-to-b from-slate-300 to-slate-400 flex items-center justify-center text-slate-900 font-extrabold text-lg shadow-inner">
                  2
                </div>
                <div className="absolute -top-3 text-slate-400">
                  <Crown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="w-full text-center">
              <div className="font-extrabold text-xs text-slate-900 truncate group-hover:text-blue-700 transition">
                {top2.name}
              </div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">
                {top2.sub}
              </div>
              <div className="mt-1.5 inline-block text-[11px] font-black text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {formatNumber(top2.score)} {unitLabel}
              </div>
            </div>
          </div>
        )}

        {/* RANK 1 - GOLD (Elevated Center) */}
        {top1 && (
          <div
            onClick={() => {
              if (activePodiumTab === 'PERSON' && onSelectMember && top1.original) {
                onSelectMember(top1.original as Member);
              }
            }}
            className="flex-1 flex flex-col items-center -mt-6 cursor-pointer group transition-transform duration-300 hover:-translate-y-1.5"
          >
            <div className="relative mb-2.5 flex flex-col items-center">
              <div className="absolute -inset-1 rounded-full bg-amber-400/30 blur-sm animate-pulse" />
              <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-amber-400 via-amber-200 to-yellow-100 flex items-center justify-center p-1.5 shadow-lg border-2 border-amber-400 relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center text-amber-950 font-black text-xl shadow-inner">
                  1
                </div>
                <div className="absolute -top-4 text-amber-500 animate-bounce">
                  <Crown className="w-6 h-6 fill-amber-400 stroke-amber-600 drop-shadow-sm" />
                </div>
              </div>
            </div>

            <div className="w-full text-center">
              <div className="font-black text-sm text-slate-900 truncate group-hover:text-amber-600 transition">
                {top1.name}
              </div>
              <div className="text-xs text-slate-500 truncate mt-0.5">
                {top1.sub}
              </div>
              <div className="mt-2 inline-block text-xs font-black text-amber-900 bg-gradient-to-r from-amber-100 to-amber-200 px-3 py-1 rounded-full border border-amber-300/80 shadow-xs">
                {formatNumber(top1.score)} {unitLabel}
              </div>
            </div>
          </div>
        )}

        {/* RANK 3 - BRONZE */}
        {top3 && (
          <div
            onClick={() => {
              if (activePodiumTab === 'PERSON' && onSelectMember && top3.original) {
                onSelectMember(top3.original as Member);
              }
            }}
            className="flex-1 flex flex-col items-center cursor-pointer group transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="relative mb-2 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-700/20 via-orange-100 to-white flex items-center justify-center p-1 shadow-md border-2 border-amber-700/40 relative">
                <div className="w-11 h-11 rounded-full bg-gradient-to-b from-amber-600 to-amber-800 flex items-center justify-center text-white font-extrabold text-lg shadow-inner">
                  3
                </div>
                <div className="absolute -top-3 text-amber-700">
                  <Crown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="w-full text-center">
              <div className="font-extrabold text-xs text-slate-900 truncate group-hover:text-orange-700 transition">
                {top3.name}
              </div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">
                {top3.sub}
              </div>
              <div className="mt-1.5 inline-block text-[11px] font-black text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/50">
                {formatNumber(top3.score)} {unitLabel}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
