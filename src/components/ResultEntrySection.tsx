import React, { useState, useMemo, useEffect } from 'react';
import {
  Send,
  Target,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Plus,
  Trash2,
  User,
  Building2,
  MapPin,
  Users2,
  Sparkles,
  BarChart,
  HelpCircle,
  Clock,
  Calendar,
  Lock,
  Pencil,
  X,
  Save,
} from 'lucide-react';
import {
  Company,
  Area,
  Department,
  Member,
  TargetRecord,
  TargetSteps,
  StepDates,
  STEP_DEFINITIONS,
  MemberGoals,
  MemberResults,
  UserAccount,
} from '../types/edulms';
import { calculateTargetScore } from '../utils/scoringEngine';

interface ResultEntrySectionProps {
  companies: Company[];
  areas: Area[];
  departments: Department[];
  members: Member[];
  currentUser?: UserAccount | null;
  onAddOrUpdateTarget: (
    memberId: string,
    targetName: string,
    steps: TargetSteps,
    stepDates?: StepDates
  ) => void;
  onEditTarget?: (
    memberId: string,
    targetId: string,
    targetName: string,
    steps: TargetSteps,
    stepDates?: StepDates
  ) => void;
  onDeleteTarget: (memberId: string, targetId: string) => void;
  onUpdateGoals: (memberId: string, goals: MemberGoals, results: MemberResults) => void;
  onCreateQuickMember: (memberData: {
    fullName: string;
    companyCode: string;
    areaCode: string;
    departmentCode: string;
  }) => Member;
  onShowNotification: (msg: string) => void;
  onOpenRules: () => void;
}

export const ResultEntrySection: React.FC<ResultEntrySectionProps> = ({
  companies,
  areas,
  departments,
  members,
  currentUser,
  onAddOrUpdateTarget,
  onEditTarget,
  onDeleteTarget,
  onUpdateGoals,
  onCreateQuickMember,
  onShowNotification,
  onOpenRules,
}) => {
  const getTodayDateString = () => new Date().toISOString().split('T')[0];

  // Selection State
  const [selectedCompany, setSelectedCompany] = useState<string>(
    currentUser?.companyCode || companies[0]?.code || 'Th1'
  );
  const [selectedArea, setSelectedArea] = useState<string>(
    currentUser?.areaCode || '1.1'
  );
  const [isCustomArea, setIsCustomArea] = useState<boolean>(false);
  const [customAreaInput, setCustomAreaInput] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    currentUser?.departmentCode || 'Thanh Niên Nam'
  );
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    currentUser?.memberId || ''
  );

  // Sync with currentUser when currentUser changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.companyCode) setSelectedCompany(currentUser.companyCode);
      if (currentUser.areaCode) setSelectedArea(currentUser.areaCode);
      if (currentUser.departmentCode) setSelectedDepartment(currentUser.departmentCode);
      if (currentUser.memberId) {
        setSelectedMemberId(currentUser.memberId);
      } else {
        // find matching member by name
        const match = members.find(
          (m) =>
            m.fullName.toLowerCase() === currentUser.fullName.toLowerCase() ||
            (m.companyCode === currentUser.companyCode && m.areaCode === currentUser.areaCode)
        );
        if (match) setSelectedMemberId(match.id);
      }
    }
  }, [currentUser, members]);

  // Quick New Member State (if creating on the fly)
  const [isCreatingNewMember, setIsCreatingNewMember] = useState<boolean>(false);
  const [newMemberName, setNewMemberName] = useState<string>('');

  // Form for New Target Log
  const [targetName, setTargetName] = useState<string>('');
  const [targetSteps, setTargetSteps] = useState<TargetSteps>({
    s1: false,
    s2: false,
    s3: false,
    s4: false,
    s5: false,
    s6: false,
  });

  // Step Dates with real-time defaults
  const [stepDates, setStepDates] = useState<StepDates>({
    s1: getTodayDateString(),
    s2: getTodayDateString(),
    s3: getTodayDateString(),
    s4: getTodayDateString(),
    s5: getTodayDateString(),
    s6: getTodayDateString(),
  });

  // Effective Area
  const effectiveArea = isCustomArea ? customAreaInput.trim() || '1.1' : selectedArea;

  // Filtered Areas based on company
  const companyAreas = useMemo(() => {
    return areas.filter((a) => a.companyCode === selectedCompany);
  }, [areas, selectedCompany]);

  // Filtered Members based on selection
  const filteredMembers = useMemo(() => {
    return members.filter(
      (m) =>
        m.companyCode === selectedCompany &&
        (isCustomArea ? true : m.areaCode === effectiveArea) &&
        m.departmentCode === selectedDepartment
    );
  }, [members, selectedCompany, effectiveArea, isCustomArea, selectedDepartment]);

  // Active Member
  const activeMember = useMemo(() => {
    if (selectedMemberId) {
      return members.find((m) => m.id === selectedMemberId) || null;
    }
    return filteredMembers[0] || null;
  }, [selectedMemberId, members, filteredMembers]);

  // Goals & Results State for Active Member
  const [memberGoals, setMemberGoals] = useState<MemberGoals>({
    s1: 10,
    s2: 8,
    s3: 5,
    s4: 4,
    s5: 4,
    s6: 2,
  });

  const [memberResults, setMemberResults] = useState<MemberResults>({
    s1: 0,
    s2: 0,
    s3: 0,
    s4: 0,
    s5: 0,
    s6: 0,
  });

  // Keep local goals synced when active member changes
  useEffect(() => {
    if (activeMember) {
      setMemberGoals(activeMember.goals || { s1: 10, s2: 8, s3: 5, s4: 4, s5: 4, s6: 2 });
      setMemberResults(activeMember.results || { s1: 0, s2: 0, s3: 0, s4: 0, s5: 0, s6: 0 });
    }
  }, [activeMember]);

  // Real-time Preview Calculation of current Target steps
  const previewCalculation = useMemo(() => {
    return calculateTargetScore(targetSteps);
  }, [targetSteps]);

  // Edit Target Modal State & Handlers
  const [editingTarget, setEditingTarget] = useState<TargetRecord | null>(null);
  const [editTargetName, setEditTargetName] = useState<string>('');
  const [editTargetSteps, setEditTargetSteps] = useState<TargetSteps>({
    s1: false,
    s2: false,
    s3: false,
    s4: false,
    s5: false,
    s6: false,
  });
  const [editTargetDates, setEditTargetDates] = useState<StepDates>({});

  const handleOpenEditTarget = (tgt: TargetRecord) => {
    setEditingTarget(tgt);
    setEditTargetName(tgt.targetName);
    setEditTargetSteps({ ...tgt.steps });
    setEditTargetDates({ ...(tgt.stepDates || {}) });
  };

  const handleToggleEditStep = (stepKey: keyof TargetSteps) => {
    setEditTargetSteps((prev) => {
      const nextVal = !prev[stepKey];
      const nextSteps = { ...prev, [stepKey]: nextVal };
      if (nextVal && !editTargetDates[stepKey]) {
        setEditTargetDates((dPrev) => ({
          ...dPrev,
          [stepKey]: getTodayDateString(),
        }));
      }
      return nextSteps;
    });
  };

  const liveEditScoreCalc = useMemo(() => {
    if (!editingTarget) return null;
    return calculateTargetScore(editTargetSteps);
  }, [editingTarget, editTargetSteps]);

  const handleSaveEditTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget || !activeMember) return;
    if (!editTargetName.trim()) {
      onShowNotification('Vui lòng nhập tên đối tượng.');
      return;
    }
    if (onEditTarget) {
      onEditTarget(
        activeMember.id,
        editingTarget.id,
        editTargetName.trim(),
        editTargetSteps,
        editTargetDates
      );
    }
    onShowNotification(`Đã cập nhật thông tin đối tượng "${editTargetName.trim()}"!`);
    setEditingTarget(null);
  };

  // Handle Step Checkbox Toggle
  const toggleStep = (stepKey: keyof TargetSteps) => {
    setTargetSteps((prev) => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }));
  };

  // Submit New Target
  const handleRecordTarget = (e: React.FormEvent) => {
    e.preventDefault();

    let targetMember = activeMember;

    if (!targetMember) {
      if (newMemberName.trim()) {
        targetMember = onCreateQuickMember({
          fullName: newMemberName.trim(),
          companyCode: selectedCompany,
          areaCode: effectiveArea,
          departmentCode: selectedDepartment,
        });
        setSelectedMemberId(targetMember.id);
        setIsCreatingNewMember(false);
        setNewMemberName('');
      } else {
        onShowNotification('Vui lòng chọn hoặc nhập tên thành viên ghi nhận!');
        return;
      }
    }

    const tName = targetName.trim() || `Đối tượng #${(targetMember.targets?.length || 0) + 1}`;
    onAddOrUpdateTarget(targetMember.id, tName, targetSteps, stepDates);

    // Reset target form
    setTargetName('');
    setTargetSteps({
      s1: false,
      s2: false,
      s3: false,
      s4: false,
      s5: false,
      s6: false,
    });
    setStepDates({
      s1: getTodayDateString(),
      s2: getTodayDateString(),
      s3: getTodayDateString(),
      s4: getTodayDateString(),
      s5: getTodayDateString(),
      s6: getTodayDateString(),
    });

    onShowNotification(`Đã ghi nhận đối tượng "${tName}". Điểm tính ngay không cần duyệt!`);
  };

  // Save Goals change
  const handleSaveGoals = () => {
    if (!activeMember) {
      onShowNotification('Vui lòng chọn thành viên để lưu mục tiêu.');
      return;
    }
    onUpdateGoals(activeMember.id, memberGoals, memberResults);
    onShowNotification('Đã cập nhật mục tiêu & kết quả thành công!');
  };

  return (
    <section id="entry-section" className="scroll-mt-20 my-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full w-fit mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Ghi nhận thi đua • Tùy chọn ngày thực hiện</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Nhập Mục Tiêu & Kết Quả Thi Đua</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Thành viên tự do chọn đơn vị, cá nhân ghi nhận kết quả 6 bước. Hệ thống tính điểm tức thì và cập nhật thời gian thực.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenRules}
              className="px-3.5 py-2 text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Xem thể lệ tính điểm</span>
            </button>
          </div>
        </div>

        {/* Helpful Info Pill for Logged-in User */}
        {currentUser && (
          <div className="mt-5 p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs text-blue-900 dark:text-blue-200">
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                Tài khoản đang đăng nhập: <strong>{currentUser.fullName}</strong> ({currentUser.companyCode} - KV {currentUser.areaCode} - {currentUser.departmentCode}).
                <span className="text-blue-700 dark:text-blue-300 ml-1">Bạn có thể chọn bất kỳ đơn vị hoặc thành viên nào bên dưới để ghi nhận.</span>
              </span>
            </div>
            {activeMember?.id !== currentUser.memberId && (
              <button
                type="button"
                onClick={() => {
                  if (currentUser.companyCode) setSelectedCompany(currentUser.companyCode);
                  if (currentUser.areaCode) setSelectedArea(currentUser.areaCode);
                  if (currentUser.departmentCode) setSelectedDepartment(currentUser.departmentCode);
                  if (currentUser.memberId) setSelectedMemberId(currentUser.memberId);
                }}
                className="text-xs font-bold text-blue-700 dark:text-blue-300 hover:underline cursor-pointer"
              >
                ↺ Trở về ghi nhận cho tài khoản của tôi
              </button>
            )}
          </div>
        )}

        {/* Step 1: Select Units (Cty, Khu vực, Ban ngành, Thành viên) */}
        <div className="mt-6 p-5 sm:p-6 bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-700 text-white font-black text-[11px] inline-flex items-center justify-center">1</span>
              <span>Chọn đơn vị & Thành viên ghi nhận (Cho phép chọn tự do)</span>
            </div>
            <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 normal-case">
              Nhấp vào các ô bên dưới để chọn từ danh sách
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Chọn Cty (Dropdown Th1, Th2, Th3, HT, NC, QN...) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>1. Chọn Công ty (Cty) *</span>
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => {
                  setSelectedCompany(e.target.value);
                  setSelectedMemberId('');
                }}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 hover:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-2xs cursor-pointer"
              >
                {companies.map((comp) => (
                  <option key={comp.code} value={comp.code}>
                    {comp.name} ({comp.code})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Chọn Khu vực (Dropdown hoặc nhập tay 1.1, 1.2...) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>2. Chọn Khu vực *</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomArea(!isCustomArea)}
                  className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {isCustomArea ? 'Chọn từ DS' : 'Nhập tay'}
                </button>
              </div>

              {isCustomArea ? (
                <input
                  type="text"
                  value={customAreaInput}
                  onChange={(e) => setCustomAreaInput(e.target.value)}
                  placeholder="Ví dụ: 1.1, 1.2, 2.3..."
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-2xs"
                />
              ) : (
                <select
                  value={selectedArea}
                  onChange={(e) => {
                    setSelectedArea(e.target.value);
                    setSelectedMemberId('');
                  }}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 hover:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-2xs cursor-pointer"
                >
                  {companyAreas.length > 0 ? (
                    companyAreas.map((area) => (
                      <option key={area.code} value={area.code}>
                        {area.name} ({area.code})
                      </option>
                    ))
                  ) : (
                    areas.map((area) => (
                      <option key={area.code} value={area.code}>
                        {area.name} ({area.code})
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>

            {/* 3. Chọn Ban ngành (Dropdown Tráng Niên, Phụ Nữ, Thanh Niên Nam, Thanh Niên Nữ) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Users2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>3. Chọn Ban ngành *</span>
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setSelectedMemberId('');
                }}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 hover:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-2xs cursor-pointer"
              >
                {departments.map((dept) => (
                  <option key={dept.code} value={dept.code}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Chọn hoặc Thêm mới Thành viên */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>4. Cá nhân / Thành viên *</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreatingNewMember(!isCreatingNewMember)}
                  className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  {isCreatingNewMember ? 'Chọn từ DS' : '+ Thêm mới'}
                </button>
              </div>

              {isCreatingNewMember ? (
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  className="w-full bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-600 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-2xs"
                />
              ) : (
                <select
                  value={activeMember?.id || ''}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 hover:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-2xs cursor-pointer"
                >
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName} ({m.score}đ - #{m.rank || '?'})
                      </option>
                    ))
                  ) : (
                    <option value="">Chưa có thành viên (Bấm + Thêm mới)</option>
                  )}
                </select>
              )}
            </div>

          </div>

          {/* Active Member Status Bar */}
          {activeMember && (
            <div className="mt-4 pt-3.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900">{activeMember.fullName}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600">{activeMember.companyCode} / KV {activeMember.areaCode} / {activeMember.departmentCode}</span>
                <span className="text-slate-400">•</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold">
                  Hạng #{activeMember.rank || 1} ({activeMember.score} điểm)
                </span>
              </div>
              <div className="text-slate-500 text-[11px]">
                Tổng số đối tượng đã ghi: <strong>{activeMember.targets?.length || 0}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Set Goals and Results with % Progress Bars for 6 items */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[11px] inline-flex items-center justify-center">2</span>
              <span>Đặt mục tiêu & Kết quả tương ứng kèm thanh tiến độ % (6 Hạng mục)</span>
            </div>

            <button
              onClick={handleSaveGoals}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <span>Lưu mục tiêu & kết quả</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STEP_DEFINITIONS.map((step) => {
              const stepKey = `s${step.id}` as keyof MemberGoals;
              const goalVal = memberGoals[stepKey] || 1;
              const resultVal = memberResults[stepKey] || 0;
              const percent = goalVal > 0 ? Math.min(100, Math.round((resultVal / goalVal) * 100)) : 0;

              // Color theme for each step
              const stepColors = [
                { bg: 'from-blue-500 to-indigo-600', badge: 'bg-blue-100 text-blue-800' },
                { bg: 'from-sky-500 to-blue-600', badge: 'bg-sky-100 text-sky-800' },
                { bg: 'from-amber-500 to-orange-600', badge: 'bg-amber-100 text-amber-800' },
                { bg: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-100 text-emerald-800' },
                { bg: 'from-purple-500 to-indigo-600', badge: 'bg-purple-100 text-purple-800' },
                { bg: 'from-rose-500 to-pink-600', badge: 'bg-rose-100 text-rose-800' },
              ][step.id - 1];

              return (
                <div
                  key={step.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-800 font-extrabold text-xs inline-flex items-center justify-center">
                        B{step.id}
                      </span>
                      <span className="font-extrabold text-sm text-slate-900">{step.name}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stepColors.badge}`}>
                      +{step.points} điểm/lượt
                    </span>
                  </div>

                  {/* Goal and Result Inputs */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1">Mục tiêu</span>
                      <input
                        type="number"
                        min="0"
                        value={goalVal}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          setMemberGoals((prev) => ({ ...prev, [stepKey]: val }));
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1">Kết quả đạt</span>
                      <input
                        type="number"
                        min="0"
                        value={resultVal}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          setMemberResults((prev) => ({ ...prev, [stepKey]: val }));
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* Progress Bar & Percentage */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                      <span className="text-slate-500">Tiến độ hoàn thành:</span>
                      <span className="font-bold text-slate-800">{percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${stepColors.bg} transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Record Individual Target with STEP DATES */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-black text-[11px] inline-flex items-center justify-center">3</span>
            <span>Ghi nhận đối tượng tiếp cận & Tùy chọn ngày cho từng bước</span>
          </div>

          <form onSubmit={handleRecordTarget} className="p-5 sm:p-6 bg-gradient-to-br from-amber-50/50 via-slate-50 to-blue-50/40 rounded-2xl border border-amber-200/80 shadow-xs space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tên hoặc mã đối tượng tiếp cận *
                </label>
                <input
                  type="text"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  placeholder="Ví dụ: Anh Tuấn (Hàng xóm), Chị Hà (Đồng nghiệp)..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Ghi nhận & Tính điểm ngay</span>
                </button>
              </div>
            </div>

            {/* 6 Step Cards with Checkbox and DATE PICKER (Default: Real-time date) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700">
                  Chọn các bước đã thực hiện và ngày tương ứng (Mặc định: ngày hiện tại theo thời gian thực):
                </label>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Hôm nay: {getTodayDateString()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {STEP_DEFINITIONS.map((step) => {
                  const stepKey = `s${step.id}` as keyof TargetSteps;
                  const dateKey = `s${step.id}` as keyof StepDates;
                  const isChecked = !!targetSteps[stepKey];
                  const stepDate = stepDates[dateKey] || getTodayDateString();

                  return (
                    <div
                      key={step.id}
                      className={`p-3.5 rounded-2xl border transition ${
                        isChecked
                          ? 'bg-blue-50/90 border-blue-400 ring-1 ring-blue-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Toggle button */}
                      <div
                        onClick={() => toggleStep(stepKey)}
                        className="cursor-pointer flex items-center justify-between pb-2 border-b border-slate-100 select-none"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by parent div
                            className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">Bước {step.id}</div>
                            <div className="font-extrabold text-xs text-slate-900">{step.name}</div>
                          </div>
                        </div>

                        <span className={`text-xs font-black ${isChecked ? 'text-blue-700' : 'text-slate-400'}`}>
                          +{step.points} đ
                        </span>
                      </div>

                      {/* Date Picker for this step */}
                      <div className="mt-2.5 flex items-center justify-between gap-2 text-xs">
                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Ngày làm:</span>
                        </span>

                        <input
                          type="date"
                          value={stepDate}
                          onChange={(e) => {
                            setStepDates((prev) => ({
                              ...prev,
                              [dateKey]: e.target.value,
                            }));
                          }}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Score Preview according to User's Formula */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
              previewCalculation.status === 'FULL_COMPLETED'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : previewCalculation.status === 'ELIMINATED'
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : previewCalculation.status === 'PENALIZED_MISSING'
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              <div className="flex items-start sm:items-center gap-2.5">
                {previewCalculation.status === 'FULL_COMPLETED' && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {previewCalculation.status === 'ELIMINATED' && (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                {previewCalculation.status === 'PENALIZED_MISSING' && (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                )}
                <div>
                  <div className="font-extrabold text-sm flex items-center gap-2">
                    <span>Kết quả tính trước:</span>
                    <span className="font-black text-base tabular-nums">
                      {previewCalculation.score > 0 ? `+${previewCalculation.score}` : previewCalculation.score} điểm
                    </span>
                  </div>
                  <div className="text-[11px] mt-0.5 opacity-90">{previewCalculation.explanation}</div>
                </div>
              </div>

              <div className="text-right text-[11px] font-semibold opacity-75 shrink-0">
                Cơ chế 6 bước • Ngày thực tế
              </div>
            </div>

          </form>

          {/* List of Existing Recorded Targets for Active Member */}
          {activeMember && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Danh sách đối tượng đã ghi của {activeMember.fullName} ({activeMember.targets?.length || 0})
                </h4>
                <span className="text-xs font-bold text-blue-700">
                  Tổng điểm đối tượng: {activeMember.score} điểm
                </span>
              </div>

              {activeMember.targets && activeMember.targets.length > 0 ? (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {activeMember.targets.map((tgt) => (
                    <div
                      key={tgt.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 truncate">{tgt.targetName}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                            tgt.status === 'FULL_COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tgt.status === 'ELIMINATED'
                              ? 'bg-rose-100 text-rose-800'
                              : tgt.status === 'PENALIZED_MISSING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {tgt.score > 0 ? `+${tgt.score}` : tgt.score} điểm
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px] text-slate-500">
                          {STEP_DEFINITIONS.map((s) => {
                            const done = tgt.steps[`s${s.id}` as keyof TargetSteps];
                            const sDate = tgt.stepDates?.[`s${s.id}` as keyof StepDates];
                            return (
                              <span
                                key={s.id}
                                className={`px-2 py-0.5 rounded text-[10px] ${
                                  done
                                    ? 'bg-blue-100 text-blue-800 font-bold'
                                    : 'bg-slate-200/60 text-slate-400 line-through'
                                }`}
                              >
                                B{s.id}: {s.name} {done && sDate ? `(${sDate})` : ''}
                              </span>
                            );
                          })}
                          <span className="text-slate-400">• Ghi: {tgt.recordedAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditTarget(tgt)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                          title="Sửa thông tin đối tượng & ngày"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTarget(activeMember.id, tgt.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                          title="Xóa đối tượng này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Thành viên này chưa ghi nhận đối tượng nào. Hãy chọn các bước và nhấn "Ghi nhận & Tính điểm ngay" ở trên!
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* MODAL: CHỈNH SỬA ĐỐI TƯỢNG VÀ NGÀY THỰC HIỆN CÁC BƯỚC */}
      {editingTarget && (
        <div
          onClick={() => setEditingTarget(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-7 relative cursor-default"
          >
            <button
              onClick={() => setEditingTarget(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Đóng modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                <Pencil className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Sửa Thông Tin & Ngày Đối Tượng
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Cập nhật lại tên đối tượng, trạng thái hoàn thành và ngày thực tế của từng bước nếu bạn lỡ nhập sai.
            </p>

            <form onSubmit={handleSaveEditTarget} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên người thân / Bạn hữu mục tiêu *
                </label>
                <input
                  type="text"
                  value={editTargetName}
                  onChange={(e) => setEditTargetName(e.target.value)}
                  placeholder="Nhập tên đối tượng..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Các bước đã thực hiện & Ngày ghi nhận:
                </label>
                <div className="space-y-2">
                  {STEP_DEFINITIONS.map((s) => {
                    const stepKey = `s${s.id}` as keyof TargetSteps;
                    const isChecked = editTargetSteps[stepKey];
                    const currentDateVal = editTargetDates[stepKey] || getTodayDateString();

                    return (
                      <div
                        key={s.id}
                        className={`p-3 rounded-2xl border transition-all duration-200 ${
                          isChecked
                            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-80'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleEditStep(stepKey)}
                              className="w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                              B{s.id}: {s.name}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              ({s.points}đ)
                            </span>
                          </label>

                          {isChecked && (
                            <div className="flex items-center gap-2 pl-6 sm:pl-0">
                              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                Ngày:
                              </span>
                              <input
                                type="date"
                                value={currentDateVal}
                                onChange={(e) =>
                                  setEditTargetDates((prev) => ({
                                    ...prev,
                                    [stepKey]: e.target.value,
                                  }))
                                }
                                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setEditTargetDates((prev) => ({
                                    ...prev,
                                    [stepKey]: getTodayDateString(),
                                  }))
                                }
                                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline px-1 py-0.5"
                              >
                                Hôm nay
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Preview Score for Edit */}
              {liveEditScoreCalc && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
                  <div className="text-xs text-amber-900 dark:text-amber-200">
                    <span className="font-extrabold">Điểm sau cập nhật: </span>
                    <span className="font-black text-amber-700 dark:text-amber-400">
                      {liveEditScoreCalc.score > 0 ? `+${liveEditScoreCalc.score}` : liveEditScoreCalc.score} điểm
                    </span>
                    <div className="text-[10px] text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                      {liveEditScoreCalc.explanation}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-200/80 dark:bg-amber-800/80 text-amber-900 dark:text-amber-100">
                    {liveEditScoreCalc.status}
                  </span>
                </div>
              )}

              <div className="mt-5 flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};
