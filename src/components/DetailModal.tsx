import React from 'react';
import {
  X,
  Trophy,
  User,
  CheckCircle2,
  AlertTriangle,
  Building2,
  MapPin,
  Users2,
  Clock,
  Target,
} from 'lucide-react';
import { Member, STEP_DEFINITIONS, TargetSteps } from '../types/edulms';

interface DetailModalProps {
  member: Member | null;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ member, onClose }) => {
  React.useEffect(() => {
    if (!member) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [member, onClose]);

  if (!member) return null;

  const formatNumber = (num: number) => {
    return (num || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-7 relative cursor-default"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Profile */}
        <div className="flex items-start gap-4 pb-5 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white text-2xl font-black shadow-md shrink-0">
            <User className="w-7 h-7" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                Thành viên thi đua
              </span>
              <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Hạng #{member.rank || 1}
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 mt-1 truncate">
              {member.fullName}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Cty: {member.companyCode}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Khu vực: {member.areaCode}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users2 className="w-3.5 h-3.5 text-slate-400" />
                {member.departmentCode}
              </span>
            </div>
          </div>
        </div>

        {/* Score Highlight Box */}
        <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-500/10 border border-amber-200/80 flex items-center justify-between">
          <div>
            <div className="text-xs text-amber-900 font-semibold uppercase tracking-wider">
              Tổng điểm thành viên (Cộng từ đối tượng)
            </div>
            <div className="text-3xl font-black text-amber-950 mt-0.5">
              {formatNumber(member.score)} <span className="text-sm font-semibold text-amber-700">điểm</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-500 font-medium">Số đối tượng tiếp cận</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">
              {member.targets?.length || 0} đối tượng
            </div>
          </div>
        </div>

        {/* Goals & Progress (6 steps) */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-emerald-600" />
            <span>Mục tiêu và Tiến độ hoàn thành (6 Bước)</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {STEP_DEFINITIONS.map((s) => {
              const stepKey = `s${s.id}` as keyof typeof member.goals;
              const goalVal = member.goals?.[stepKey] || 1;
              const resVal = member.results?.[stepKey] || 0;
              const percent = goalVal > 0 ? Math.min(100, Math.round((resVal / goalVal) * 100)) : 0;

              return (
                <div key={s.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex justify-between font-bold text-slate-800 mb-1">
                    <span>B{s.id}: {s.name}</span>
                    <span className="text-blue-700">{percent}%</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1.5">
                    <span>Đạt: {resVal}</span>
                    <span>Mục tiêu: {goalVal}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Target Records List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mt-5 mb-2.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Danh sách đối tượng tiếp cận chi tiết</span>
            </h4>

            {member.targets && member.targets.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {member.targets.map((tgt) => (
                  <div
                    key={tgt.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{tgt.targetName}</span>
                      <span className={`px-2 py-0.5 rounded-full font-black text-[11px] ${
                        tgt.score > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {tgt.score > 0 ? `+${tgt.score}` : tgt.score} điểm
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500">{tgt.explanation}</div>

                    <div className="flex flex-wrap gap-1 text-[10px]">
                      {STEP_DEFINITIONS.map((s) => {
                        const done = tgt.steps[`s${s.id}` as keyof TargetSteps];
                        return (
                          <span
                            key={s.id}
                            className={`px-1.5 py-0.5 rounded ${
                              done
                                ? 'bg-blue-100 text-blue-800 font-bold'
                                : 'bg-slate-200/60 text-slate-400 line-through'
                            }`}
                          >
                            B{s.id}: {s.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                Chưa có đối tượng nào được ghi nhận.
              </div>
            )}
          </div>
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
