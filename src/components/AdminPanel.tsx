import React, { useState, useRef } from 'react';
import {
  Building2,
  MapPin,
  Users2,
  User,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Shield,
  Search,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  FileSpreadsheet,
  Download,
  Upload,
  FileUp,
  FileDown,
  AlertCircle,
  Info,
  Crown,
} from 'lucide-react';
import { Company, Area, Department, Member, UserAccount, UserRole, RoleAssignment } from '../types/edulms';
import {
  exportSystemConfigExcel,
  exportMembersAndTargetsExcel,
  downloadConfigTemplateExcel,
  downloadMembersTemplateExcel,
  parseConfigExcel,
  parseMembersExcel,
} from '../utils/excelManager';
import { RoleManagementTab } from './RoleManagementTab';

interface AdminPanelProps {
  companies: Company[];
  areas: Area[];
  departments: Department[];
  members: Member[];
  onAddCompany: (company: Omit<Company, 'id'>) => void;
  onUpdateCompany: (company: Company) => void;
  onDeleteCompany: (id: string) => void;
  onAddArea: (area: Omit<Area, 'id'>) => void;
  onUpdateArea: (area: Area) => void;
  onDeleteArea: (id: string) => void;
  onAddDepartment: (department: Omit<Department, 'id'>) => void;
  onUpdateDepartment: (department: Department) => void;
  onDeleteDepartment: (id: string) => void;
  onAddMember: (member: Omit<Member, 'id' | 'code' | 'score' | 'targets' | 'createdAt'>) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onBatchUpdateCompanies?: (companies: Company[], mode?: 'MERGE' | 'REPLACE') => void;
  onBatchUpdateAreas?: (areas: Area[], mode?: 'MERGE' | 'REPLACE') => void;
  onBatchUpdateDepartments?: (departments: Department[], mode?: 'MERGE' | 'REPLACE') => void;
  onBatchUpdateMembers?: (members: Member[], mode?: 'MERGE' | 'REPLACE') => void;
  onResetData: () => void;
  onShowNotification: (msg: string) => void;
  currentUser?: UserAccount | null;
  usersList?: UserAccount[];
  onUpdateUserRole?: (targetUserId: string, newRole: UserRole, targetName: string) => Promise<void>;
  preAssignedRoles?: RoleAssignment[];
  onPreAssignRole?: (email: string, role: UserRole, note?: string) => Promise<void>;
  onDeletePreAssignedRole?: (email: string) => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  companies,
  areas,
  departments,
  members,
  onAddCompany,
  onUpdateCompany,
  onDeleteCompany,
  onAddArea,
  onUpdateArea,
  onDeleteArea,
  onAddDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onBatchUpdateCompanies,
  onBatchUpdateAreas,
  onBatchUpdateDepartments,
  onBatchUpdateMembers,
  onResetData,
  onShowNotification,
  currentUser,
  usersList,
  onUpdateUserRole,
  preAssignedRoles,
  onPreAssignRole,
  onDeletePreAssignedRole,
}) => {
  const [activeTab, setActiveTab] = useState<'COMPANIES' | 'AREAS' | 'DEPARTMENTS' | 'MEMBERS' | 'EXCEL_SYNC' | 'ROLES'>('COMPANIES');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // File input refs
  const configFileRef = useRef<HTMLInputElement>(null);
  const memberFileRef = useRef<HTMLInputElement>(null);

  // Excel preview states
  const [configPreview, setConfigPreview] = useState<{
    companies: Company[];
    areas: Area[];
    departments: Department[];
    errors: string[];
    fileName: string;
  } | null>(null);

  const [membersPreview, setMembersPreview] = useState<{
    members: Member[];
    errors: string[];
    fileName: string;
  } | null>(null);

  const [importMode, setImportMode] = useState<'MERGE' | 'REPLACE'>('MERGE');

  // Modals / Editing state
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [newCompanyCode, setNewCompanyCode] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');

  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [isAddAreaOpen, setIsAddAreaOpen] = useState(false);
  const [newAreaCode, setNewAreaCode] = useState('');
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaCompany, setNewAreaCompany] = useState(companies[0]?.code || 'Th1');

  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptName, setNewDeptName] = useState('');

  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberCompany, setNewMemberCompany] = useState(companies[0]?.code || 'Th1');
  const [newMemberArea, setNewMemberArea] = useState('1.1');
  const [newMemberDept, setNewMemberDept] = useState(departments[0]?.code || 'Thanh Niên Nam');

  // Handlers for Company
  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyCode.trim() || !newCompanyName.trim()) {
      onShowNotification('Vui lòng điền đủ mã và tên công ty.');
      return;
    }
    onAddCompany({
      code: newCompanyCode.trim(),
      name: newCompanyName.trim(),
      active: true,
    });
    setNewCompanyCode('');
    setNewCompanyName('');
    setIsAddCompanyOpen(false);
    onShowNotification('Đã thêm công ty mới thành công!');
  };

  const handleUpdateCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;
    onUpdateCompany(editingCompany);
    setEditingCompany(null);
    onShowNotification('Đã cập nhật công ty thành công!');
  };

  // Handlers for Area
  const handleSaveArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaCode.trim() || !newAreaName.trim()) {
      onShowNotification('Vui lòng điền đủ mã và tên khu vực.');
      return;
    }
    onAddArea({
      code: newAreaCode.trim(),
      name: newAreaName.trim(),
      companyCode: newAreaCompany,
      active: true,
    });
    setNewAreaCode('');
    setNewAreaName('');
    setIsAddAreaOpen(false);
    onShowNotification('Đã thêm khu vực mới thành công!');
  };

  const handleUpdateAreaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArea) return;
    onUpdateArea(editingArea);
    setEditingArea(null);
    onShowNotification('Đã cập nhật khu vực thành công!');
  };

  // Handlers for Department
  const handleSaveDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) {
      onShowNotification('Vui lòng điền tên ban ngành.');
      return;
    }
    onAddDepartment({
      code: newDeptCode.trim() || newDeptName.trim(),
      name: newDeptName.trim(),
      active: true,
    });
    setNewDeptCode('');
    setNewDeptName('');
    setIsAddDepartmentOpen(false);
    onShowNotification('Đã thêm ban ngành mới thành công!');
  };

  const handleUpdateDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepartment) return;
    onUpdateDepartment(editingDepartment);
    setEditingDepartment(null);
    onShowNotification('Đã cập nhật ban ngành thành công!');
  };

  // Handlers for Member
  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) {
      onShowNotification('Vui lòng điền họ tên cá nhân.');
      return;
    }
    onAddMember({
      fullName: newMemberName.trim(),
      companyCode: newMemberCompany,
      areaCode: newMemberArea,
      departmentCode: newMemberDept,
      active: true,
      goals: { s1: 10, s2: 8, s3: 5, s4: 4, s5: 4, s6: 2 },
      results: { s1: 0, s2: 0, s3: 0, s4: 0, s5: 0, s6: 0 },
    });
    setNewMemberName('');
    setIsAddMemberOpen(false);
    onShowNotification('Đã thêm thành viên mới thành công!');
  };

  const handleUpdateMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    onUpdateMember(editingMember);
    setEditingMember(null);
    onShowNotification('Đã cập nhật thông tin thành viên thành công!');
  };

  // Excel Import Handlers
  const handleConfigFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await parseConfigExcel(file);
      setConfigPreview({
        ...res,
        fileName: file.name,
      });
    } catch (err: any) {
      onShowNotification(`Lỗi đọc file Excel: ${err?.message || 'Định dạng không hợp lệ'}`);
    } finally {
      if (configFileRef.current) configFileRef.current.value = '';
    }
  };

  const handleMemberFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await parseMembersExcel(file);
      setMembersPreview({
        ...res,
        fileName: file.name,
      });
    } catch (err: any) {
      onShowNotification(`Lỗi đọc file Excel: ${err?.message || 'Định dạng không hợp lệ'}`);
    } finally {
      if (memberFileRef.current) memberFileRef.current.value = '';
    }
  };

  const handleConfirmConfigImport = () => {
    if (!configPreview) return;
    if (configPreview.companies.length > 0 && onBatchUpdateCompanies) {
      onBatchUpdateCompanies(configPreview.companies, importMode);
    }
    if (configPreview.areas.length > 0 && onBatchUpdateAreas) {
      onBatchUpdateAreas(configPreview.areas, importMode);
    }
    if (configPreview.departments.length > 0 && onBatchUpdateDepartments) {
      onBatchUpdateDepartments(configPreview.departments, importMode);
    }
    onShowNotification(`Đã nhập thành công cấu hình hệ thống từ file ${configPreview.fileName}!`);
    setConfigPreview(null);
  };

  const handleConfirmMembersImport = () => {
    if (!membersPreview) return;
    if (membersPreview.members.length > 0 && onBatchUpdateMembers) {
      onBatchUpdateMembers(membersPreview.members, importMode);
    }
    onShowNotification(`Đã nhập thành công ${membersPreview.members.length} thành viên từ file ${membersPreview.fileName}!`);
    setMembersPreview(null);
  };

  return (
    <section id="admin-section" className="scroll-mt-20 my-10">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={configFileRef}
        onChange={handleConfigFileChange}
        accept=".xlsx,.xls"
        className="hidden"
      />
      <input
        type="file"
        ref={memberFileRef}
        onChange={handleMemberFileChange}
        accept=".xlsx,.xls"
        className="hidden"
      />

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full w-fit mb-2">
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span>Hệ thống Quản trị EduLMS</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Quản Lý Công Ty, Khu Vực, Ban Ngành & Cá Nhân</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Thêm, sửa, xóa các đơn vị tổ chức, dữ liệu thành viên và đồng bộ Excel qua tab chuyên dụng bên dưới.
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-slate-100 text-xs font-bold">
          <button
            onClick={() => setActiveTab('COMPANIES')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition shrink-0 cursor-pointer ${
              activeTab === 'COMPANIES'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Công ty ({companies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('AREAS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition shrink-0 cursor-pointer ${
              activeTab === 'AREAS'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Khu vực ({areas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('DEPARTMENTS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition shrink-0 cursor-pointer ${
              activeTab === 'DEPARTMENTS'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users2 className="w-4 h-4" />
            <span>Ban ngành ({departments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('MEMBERS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition shrink-0 cursor-pointer ${
              activeTab === 'MEMBERS'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Thành viên ({members.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('EXCEL_SYNC')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition shrink-0 cursor-pointer ${
              activeTab === 'EXCEL_SYNC'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Nhập / Xuất Excel</span>
          </button>

          <button
            onClick={() => setActiveTab('ROLES')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition shrink-0 cursor-pointer ${
              activeTab === 'ROLES'
                ? 'bg-purple-900 text-white shadow-xs'
                : 'text-purple-700 dark:text-purple-300 hover:text-purple-950 hover:bg-purple-50 dark:hover:bg-purple-950/40'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Phân quyền Quản trị {usersList ? `(${usersList.length})` : ''}</span>
            {currentUser?.role === 'SUPER_ADMIN' && (
              <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[10px] font-black rounded-md">
                VIP
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: COMPANIES */}
        {activeTab === 'COMPANIES' && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-800">Danh sách các Công ty (Th1, Th2, Th3, HT, NC, QN...)</h3>
              <button
                onClick={() => setIsAddCompanyOpen(true)}
                className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Công ty</span>
              </button>
            </div>

            {/* Add Company Form */}
            {isAddCompanyOpen && (
              <form onSubmit={handleSaveCompany} className="mb-6 p-4 rounded-2xl bg-blue-50/50 border border-blue-200 animate-in fade-in">
                <div className="font-bold text-xs text-blue-950 mb-3">Thêm Công ty mới</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Mã Cty (ví dụ: Th4, HN, ĐN...)</label>
                    <input
                      type="text"
                      value={newCompanyCode}
                      onChange={(e) => setNewCompanyCode(e.target.value)}
                      placeholder="Th4"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Tên đầy đủ của Công ty</label>
                    <input
                      type="text"
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                      placeholder="Thương Hội 4 (Th4)"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddCompanyOpen(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition"
                  >
                    Lưu Công ty
                  </button>
                </div>
              </form>
            )}

            {/* Companies Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Mã Cty</th>
                    <th className="py-3 px-4">Tên Công ty</th>
                    <th className="py-3 px-4 text-center">Số khu vực</th>
                    <th className="py-3 px-4 text-center">Số thành viên</th>
                    <th className="py-3 px-4 text-center">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {companies.map((comp) => {
                    const compAreas = areas.filter((a) => a.companyCode === comp.code);
                    const compMembers = members.filter((m) => m.companyCode === comp.code);

                    return (
                      <tr key={comp.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-black text-blue-700 text-sm">{comp.code}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{comp.name}</td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-600">{compAreas.length} KV</td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-600">{compMembers.length} người</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${
                            comp.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {comp.active ? 'Hoạt động' : 'Tạm dừng'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setEditingCompany(comp)}
                            className="p-1.5 text-slate-400 hover:text-blue-700 rounded-lg hover:bg-blue-50 mr-1 transition"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Xóa công ty ${comp.name}?`)) {
                                onDeleteCompany(comp.id);
                                onShowNotification(`Đã xóa công ty ${comp.name}.`);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                            title="Xóa công ty"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Edit Company Modal */}
            {editingCompany && (
              <div
                onClick={() => setEditingCompany(null)}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
              >
                <form
                  onClick={(e) => e.stopPropagation()}
                  onSubmit={handleUpdateCompanySubmit}
                  className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 cursor-default"
                >
                  <h4 className="font-bold text-base text-slate-900 mb-4">Chỉnh sửa Công ty</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Mã Công ty</label>
                      <input
                        type="text"
                        value={editingCompany.code}
                        onChange={(e) => setEditingCompany({ ...editingCompany, code: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Tên Công ty</label>
                      <input
                        type="text"
                        value={editingCompany.name}
                        onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>
                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingCompany(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold"
                    >
                      Cập nhật
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AREAS */}
        {activeTab === 'AREAS' && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-800">Danh sách Khu vực (1.1, 1.2, 2.1, 2.2...)</h3>
              <button
                onClick={() => setIsAddAreaOpen(true)}
                className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Khu vực</span>
              </button>
            </div>

            {/* Add Area Form */}
            {isAddAreaOpen && (
              <form onSubmit={handleSaveArea} className="mb-6 p-4 rounded-2xl bg-blue-50/50 border border-blue-200 animate-in fade-in">
                <div className="font-bold text-xs text-blue-950 mb-3">Thêm Khu vực mới</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Thuộc Công ty</label>
                    <select
                      value={newAreaCompany}
                      onChange={(e) => setNewAreaCompany(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                    >
                      {companies.map((c) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Mã KV (ví dụ: 1.3, 2.3...)</label>
                    <input
                      type="text"
                      value={newAreaCode}
                      onChange={(e) => setNewAreaCode(e.target.value)}
                      placeholder="1.3"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Tên Khu vực</label>
                    <input
                      type="text"
                      value={newAreaName}
                      onChange={(e) => setNewAreaName(e.target.value)}
                      placeholder="Khu vực 1.3"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddAreaOpen(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition"
                  >
                    Lưu Khu vực
                  </button>
                </div>
              </form>
            )}

            {/* Areas Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Mã Khu vực</th>
                    <th className="py-3 px-4">Tên Khu vực</th>
                    <th className="py-3 px-4">Trực thuộc Cty</th>
                    <th className="py-3 px-4 text-center">Số thành viên</th>
                    <th className="py-3 px-4 text-center">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {areas.map((area) => {
                    const areaMembers = members.filter((m) => m.areaCode === area.code);

                    return (
                      <tr key={area.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-black text-blue-700">{area.code}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{area.name}</td>
                        <td className="py-3 px-4 text-slate-600 font-semibold">{area.companyCode}</td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-600">{areaMembers.length} người</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full font-extrabold text-[10px] bg-emerald-100 text-emerald-800">
                            Hoạt động
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setEditingArea(area)}
                            className="p-1.5 text-slate-400 hover:text-blue-700 rounded-lg hover:bg-blue-50 mr-1 transition"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Xóa khu vực ${area.name}?`)) {
                                onDeleteArea(area.id);
                                onShowNotification(`Đã xóa khu vực ${area.name}.`);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                            title="Xóa khu vực"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Edit Area Modal */}
            {editingArea && (
              <div
                onClick={() => setEditingArea(null)}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
              >
                <form
                  onClick={(e) => e.stopPropagation()}
                  onSubmit={handleUpdateAreaSubmit}
                  className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 cursor-default"
                >
                  <h4 className="font-bold text-base text-slate-900 mb-4">Chỉnh sửa Khu vực</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Trực thuộc Công ty</label>
                      <select
                        value={editingArea.companyCode}
                        onChange={(e) => setEditingArea({ ...editingArea, companyCode: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                      >
                        {companies.map((c) => (
                          <option key={c.code} value={c.code}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Mã Khu vực</label>
                      <input
                        type="text"
                        value={editingArea.code}
                        onChange={(e) => setEditingArea({ ...editingArea, code: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Tên Khu vực</label>
                      <input
                        type="text"
                        value={editingArea.name}
                        onChange={(e) => setEditingArea({ ...editingArea, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>
                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingArea(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold"
                    >
                      Cập nhật
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DEPARTMENTS */}
        {activeTab === 'DEPARTMENTS' && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-800">Danh sách Ban ngành (Tráng Niên, Phụ Nữ, Thanh Niên Nam, Thanh Niên Nữ)</h3>
              <button
                onClick={() => setIsAddDepartmentOpen(true)}
                className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Ban ngành</span>
              </button>
            </div>

            {/* Add Department Form */}
            {isAddDepartmentOpen && (
              <form onSubmit={handleSaveDepartment} className="mb-6 p-4 rounded-2xl bg-blue-50/50 border border-blue-200 animate-in fade-in">
                <div className="font-bold text-xs text-blue-950 mb-3">Thêm Ban ngành mới</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Mã Ban ngành</label>
                    <input
                      type="text"
                      value={newDeptCode}
                      onChange={(e) => setNewDeptCode(e.target.value)}
                      placeholder="Ví dụ: Thiếu Nhi, Trung Niên..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Tên Ban ngành</label>
                    <input
                      type="text"
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      placeholder="Ban Thiếu Nhi"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddDepartmentOpen(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition"
                  >
                    Lưu Ban ngành
                  </button>
                </div>
              </form>
            )}

            {/* Departments Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Tên Ban ngành</th>
                    <th className="py-3 px-4 text-center">Số thành viên</th>
                    <th className="py-3 px-4 text-center">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departments.map((dept) => {
                    const deptMembers = members.filter((m) => m.departmentCode === dept.code);

                    return (
                      <tr key={dept.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-bold text-slate-900 text-sm">{dept.name}</td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-600">{deptMembers.length} người</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full font-extrabold text-[10px] bg-emerald-100 text-emerald-800">
                            Hoạt động
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setEditingDepartment(dept)}
                            className="p-1.5 text-slate-400 hover:text-blue-700 rounded-lg hover:bg-blue-50 mr-1 transition"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Xóa ban ngành ${dept.name}?`)) {
                                onDeleteDepartment(dept.id);
                                onShowNotification(`Đã xóa ban ngành ${dept.name}.`);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                            title="Xóa ban ngành"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Edit Department Modal */}
            {editingDepartment && (
              <div
                onClick={() => setEditingDepartment(null)}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
              >
                <form
                  onClick={(e) => e.stopPropagation()}
                  onSubmit={handleUpdateDeptSubmit}
                  className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 cursor-default"
                >
                  <h4 className="font-bold text-base text-slate-900 mb-4">Chỉnh sửa Ban ngành</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Tên Ban ngành</label>
                      <input
                        type="text"
                        value={editingDepartment.name}
                        onChange={(e) => setEditingDepartment({ ...editingDepartment, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>
                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingDepartment(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold"
                    >
                      Cập nhật
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MEMBERS */}
        {activeTab === 'MEMBERS' && (
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm họ tên, công ty, khu vực..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                onClick={() => setIsAddMemberOpen(true)}
                className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Cá nhân / Thành viên</span>
              </button>
            </div>

            {/* Add Member Form */}
            {isAddMemberOpen && (
              <form onSubmit={handleSaveMember} className="mb-6 p-4 rounded-2xl bg-blue-50/50 border border-blue-200 animate-in fade-in">
                <div className="font-bold text-xs text-blue-950 mb-3">Thêm Thành viên mới</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Họ và tên *</label>
                    <input
                      type="text"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="Nguyễn Văn B"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Công ty *</label>
                    <select
                      value={newMemberCompany}
                      onChange={(e) => setNewMemberCompany(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                    >
                      {companies.map((c) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Khu vực *</label>
                    <input
                      type="text"
                      value={newMemberArea}
                      onChange={(e) => setNewMemberArea(e.target.value)}
                      placeholder="1.1, 1.2..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Ban ngành *</label>
                    <select
                      value={newMemberDept}
                      onChange={(e) => setNewMemberDept(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                    >
                      {departments.map((d) => (
                        <option key={d.code} value={d.code}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddMemberOpen(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition"
                  >
                    Lưu Thành viên
                  </button>
                </div>
              </form>
            )}

            {/* Members Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Họ và tên</th>
                    <th className="py-3 px-4">Công ty</th>
                    <th className="py-3 px-4">Khu vực</th>
                    <th className="py-3 px-4">Ban ngành</th>
                    <th className="py-3 px-4 text-center">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Tổng điểm</th>
                    <th className="py-3 px-4 text-center">Đối tượng</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members
                    .filter((m) => {
                      if (!searchQuery.trim()) return true;
                      const q = searchQuery.toLowerCase();
                      return (
                        m.fullName.toLowerCase().includes(q) ||
                        m.companyCode.toLowerCase().includes(q) ||
                        m.areaCode.toLowerCase().includes(q) ||
                        m.departmentCode.toLowerCase().includes(q)
                      );
                    })
                    .map((mem) => (
                      <tr key={mem.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-sm">{mem.fullName}</div>
                          <div className="text-[10px] text-slate-400">{mem.code}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{mem.companyCode}</td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{mem.areaCode}</td>
                        <td className="py-3 px-4 text-slate-600">{mem.departmentCode}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              onUpdateMember({ ...mem, active: !mem.active });
                              onShowNotification(
                                mem.active
                                  ? `Đã tạm dừng tính điểm cho ${mem.fullName}.`
                                  : `Đã kích hoạt hoạt động cho ${mem.fullName}.`
                              );
                            }}
                            className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] inline-flex items-center gap-1 transition ${
                              mem.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                            }`}
                            title="Bấm để bật/tắt tính điểm vào mẫu số trung bình"
                          >
                            <span>{mem.active ? 'Đang hoạt động' : 'Tạm dừng'}</span>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                          {mem.score.toLocaleString('vi-VN')}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-600">
                          {mem.targets?.length || 0}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setEditingMember(mem)}
                            className="p-1.5 text-slate-400 hover:text-blue-700 rounded-lg hover:bg-blue-50 mr-1 transition"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Xóa thành viên ${mem.fullName}?`)) {
                                onDeleteMember(mem.id);
                                onShowNotification(`Đã xóa thành viên ${mem.fullName}.`);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                            title="Xóa thành viên"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Edit Member Modal */}
            {editingMember && (
              <div
                onClick={() => setEditingMember(null)}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
              >
                <form
                  onClick={(e) => e.stopPropagation()}
                  onSubmit={handleUpdateMemberSubmit}
                  className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 cursor-default"
                >
                  <h4 className="font-bold text-base text-slate-900 mb-4">Chỉnh sửa Thành viên</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Họ và tên</label>
                      <input
                        type="text"
                        value={editingMember.fullName}
                        onChange={(e) => setEditingMember({ ...editingMember, fullName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Công ty</label>
                        <select
                          value={editingMember.companyCode}
                          onChange={(e) => setEditingMember({ ...editingMember, companyCode: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800"
                        >
                          {companies.map((c) => (
                            <option key={c.code} value={c.code}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Khu vực</label>
                        <input
                          type="text"
                          value={editingMember.areaCode}
                          onChange={(e) => setEditingMember({ ...editingMember, areaCode: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Ban ngành</label>
                      <select
                        value={editingMember.departmentCode}
                        onChange={(e) => setEditingMember({ ...editingMember, departmentCode: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                      >
                        {departments.map((d) => (
                          <option key={d.code} value={d.code}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingMember(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold"
                    >
                      Cập nhật
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: EXCEL IMPORT / EXPORT */}
        {activeTab === 'EXCEL_SYNC' && (
          <div className="mt-6 space-y-6 animate-in fade-in">
            {/* Intro Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-emerald-950">
                    Trung Tâm Nhập & Xuất Dữ Liệu Excel
                  </h3>
                  <p className="text-xs text-emerald-800/80 mt-0.5">
                    Hỗ trợ quản trị viên nhập/xuất danh mục cấu hình các mục dropdown và dữ liệu nhân sự thi đua theo từng Sheet.
                  </p>
                </div>
              </div>

              <div className="text-[11px] font-semibold text-emerald-800 bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200/60 shadow-2xs">
                Định dạng hỗ trợ: <strong>.xlsx, .xls</strong>
              </div>
            </div>

            {/* Grid 2 Blocks: Cấu hình hệ thống & Nhân sự */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* BLOCK 1: CẤU HÌNH DANH MỤC HỆ THỐNG */}
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <Building2 className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        1. Cấu Hình Danh Mục Dropdown
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Quản lý Công ty, Khu vực và Ban ngành
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    3 Sheets
                  </span>
                </div>

                {/* Current Stats */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Công ty</div>
                    <div className="text-base font-black text-slate-900 mt-0.5">{companies.length}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Khu vực</div>
                    <div className="text-base font-black text-slate-900 mt-0.5">{areas.length}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Ban ngành</div>
                    <div className="text-base font-black text-slate-900 mt-0.5">{departments.length}</div>
                  </div>
                </div>

                {/* Guide */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>Cấu trúc các Sheet trong file Cấu hình:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-500">
                    <li><strong>Sheet 1 (Công Ty):</strong> Mã Công Ty, Tên Công Ty, Mô Tả, Trạng Thái.</li>
                    <li><strong>Sheet 2 (Khu Vực):</strong> Mã Khu Vực, Tên Khu Vực, Mã Công Ty Trực Thuộc.</li>
                    <li><strong>Sheet 3 (Ban Ngành):</strong> Mã Ban Ngành, Tên Ban Ngành, Trạng Thái.</li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => downloadConfigTemplateExcel()}
                    className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tải mẫu Cấu hình</span>
                  </button>

                  <button
                    onClick={() => exportSystemConfigExcel(companies, areas, departments)}
                    className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <FileDown className="w-3.5 h-3.5 text-blue-600" />
                    <span>Xuất dữ liệu Cấu hình</span>
                  </button>

                  <button
                    onClick={() => configFileRef.current?.click()}
                    className="flex-1 py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    <span>Nhập từ Excel</span>
                  </button>
                </div>
              </div>

              {/* BLOCK 2: DỮ LIỆU NHÂN SỰ & BẢNG ĐIỂM */}
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <User className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        2. Dữ Liệu Nhân Sự & Điểm Thi Đua
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Quản lý danh sách thành viên và đối tượng tiếp cận
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    2 Sheets
                  </span>
                </div>

                {/* Current Stats */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Thành viên</div>
                    <div className="text-base font-black text-slate-900 mt-0.5">{members.length} người</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Tổng đối tượng</div>
                    <div className="text-base font-black text-slate-900 mt-0.5">
                      {members.reduce((acc, m) => acc + (m.targets?.length || 0), 0)} đối tượng
                    </div>
                  </div>
                </div>

                {/* Guide */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cấu trúc các Sheet trong file Nhân sự:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-500">
                    <li><strong>Sheet 1 (Thành Viên):</strong> Mã TV, Họ và Tên, Công Ty, Khu Vực, Ban Ngành, Mục Tiêu B1..B6.</li>
                    <li><strong>Sheet 2 (Nhật Ký Đối Tượng):</strong> Danh sách đối tượng, điểm số và các bước thực hiện.</li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => downloadMembersTemplateExcel()}
                    className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tải mẫu Nhân sự</span>
                  </button>

                  <button
                    onClick={() => exportMembersAndTargetsExcel(members)}
                    className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Xuất dữ liệu Nhân sự</span>
                  </button>

                  <button
                    onClick={() => memberFileRef.current?.click()}
                    className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    <span>Nhập từ Excel</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* MODAL PREVIEW CONFIG EXCEL */}
        {configPreview && (
          <div
            onClick={() => setConfigPreview(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-800 p-6 relative cursor-default space-y-4"
            >
              <button
                onClick={() => setConfigPreview(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-900 dark:text-white">
                    Xem Trước Dữ Liệu Cấu Hình Hệ Thống
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Tệp: {configPreview.fileName}
                  </p>
                </div>
              </div>

              {/* Status summary */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800">
                  <div className="text-[10px] text-blue-800 dark:text-blue-300 font-bold uppercase">Công ty</div>
                  <div className="text-xl font-black text-blue-950 dark:text-blue-100 mt-0.5">{configPreview.companies.length}</div>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold uppercase">Khu vực</div>
                  <div className="text-xl font-black text-emerald-950 dark:text-emerald-100 mt-0.5">{configPreview.areas.length}</div>
                </div>
                <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800">
                  <div className="text-[10px] text-purple-800 dark:text-purple-300 font-bold uppercase">Ban ngành</div>
                  <div className="text-xl font-black text-purple-950 dark:text-purple-100 mt-0.5">{configPreview.departments.length}</div>
                </div>
              </div>

              {/* Errors if any */}
              {configPreview.errors.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1 text-amber-800 dark:text-amber-300">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Lưu ý ({configPreview.errors.length} cảnh báo):</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 max-h-24 overflow-y-auto font-mono text-[11px]">
                    {configPreview.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Import mode options */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="font-bold text-slate-800 dark:text-slate-200">Phương thức cập nhật:</div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="cfgMode"
                      checked={importMode === 'MERGE'}
                      onChange={() => setImportMode('MERGE')}
                      className="text-blue-600"
                    />
                    <span>Thêm mới & Cập nhật (Khuyến nghị)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="cfgMode"
                      checked={importMode === 'REPLACE'}
                      onChange={() => setImportMode('REPLACE')}
                      className="text-blue-600"
                    />
                    <span>Ghi đè hoàn toàn danh mục</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfigPreview(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmConfigImport}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Xác nhận Nhập vào Hệ thống
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL PREVIEW MEMBERS EXCEL */}
        {membersPreview && (
          <div
            onClick={() => setMembersPreview(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-800 p-6 relative cursor-default space-y-4"
            >
              <button
                onClick={() => setMembersPreview(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-900 dark:text-white">
                    Xem Trước Danh Sách Thành Viên Tải Lên
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Tệp: {membersPreview.fileName}
                  </p>
                </div>
              </div>

              {/* Stat */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center">
                <div className="text-xs text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider">
                  Số lượng thành viên hợp lệ tìm thấy
                </div>
                <div className="text-3xl font-black text-emerald-950 dark:text-emerald-100 mt-1">
                  {membersPreview.members.length} <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">thành viên</span>
                </div>
              </div>

              {/* Sample list preview */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-48 overflow-y-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[11px]">
                    <tr>
                      <th className="p-2">Mã TV</th>
                      <th className="p-2">Họ và Tên</th>
                      <th className="p-2">Công ty</th>
                      <th className="p-2">Khu vực</th>
                      <th className="p-2">Ban ngành</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {membersPreview.members.slice(0, 10).map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2 font-mono font-bold text-blue-700 dark:text-blue-400">{m.code}</td>
                        <td className="p-2 font-bold text-slate-900 dark:text-white">{m.fullName}</td>
                        <td className="p-2 text-slate-700 dark:text-slate-300">{m.companyCode}</td>
                        <td className="p-2 text-slate-700 dark:text-slate-300">{m.areaCode}</td>
                        <td className="p-2 text-slate-700 dark:text-slate-300">{m.departmentCode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {membersPreview.members.length > 10 && (
                <p className="text-[11px] text-slate-400 italic text-center">
                  Và còn {membersPreview.members.length - 10} thành viên khác...
                </p>
              )}

              {/* Errors if any */}
              {membersPreview.errors.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1 text-amber-800 dark:text-amber-300">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Lưu ý ({membersPreview.errors.length} cảnh báo):</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 max-h-24 overflow-y-auto font-mono text-[11px]">
                    {membersPreview.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Import mode options */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="font-bold text-slate-800 dark:text-slate-200">Phương thức cập nhật:</div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="memMode"
                      checked={importMode === 'MERGE'}
                      onChange={() => setImportMode('MERGE')}
                      className="text-emerald-600"
                    />
                    <span>Thêm mới & Cập nhật theo Mã TV (Khuyến nghị)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="memMode"
                      checked={importMode === 'REPLACE'}
                      onChange={() => setImportMode('REPLACE')}
                      className="text-emerald-600"
                    />
                    <span>Ghi đè danh sách thành viên</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMembersPreview(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmMembersImport}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Xác nhận Nhập {membersPreview.members.length} Thành viên
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PHÂN QUYỀN QUẢN TRỊ VIÊN TỔNG (ROLES) */}
        {activeTab === 'ROLES' && (
          <div className="mt-6">
            <RoleManagementTab
              currentUser={currentUser || null}
              usersList={usersList || []}
              companies={companies}
              areas={areas}
              departments={departments}
              onUpdateUserRole={onUpdateUserRole || (async () => {})}
              preAssignedRoles={preAssignedRoles}
              onPreAssignRole={onPreAssignRole}
              onDeletePreAssignedRole={onDeletePreAssignedRole}
              onShowNotification={onShowNotification}
            />
          </div>
        )}

      </div>
    </section>
  );
};
