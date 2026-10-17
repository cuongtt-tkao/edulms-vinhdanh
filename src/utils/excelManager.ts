import * as XLSX from 'xlsx';
import { Company, Area, Department, Member, TargetRecord, TargetSteps } from '../types/edulms';
import { calculateTargetScore, computeMemberScore } from './scoringEngine';

/**
 * 1. Xuất file Cấu hình Danh mục Hệ thống (.xlsx)
 * Bao gồm 3 Sheets: Công ty, Khu vực, Ban ngành
 */
export function exportSystemConfigExcel(
  companies: Company[],
  areas: Area[],
  departments: Department[]
): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Công ty
  const compRows = companies.map((c, i) => ({
    'STT': i + 1,
    'Mã Công Ty': c.code,
    'Tên Công Ty': c.name,
    'Mô Tả': c.description || '',
    'Trạng Thái': c.active ? 'Hoạt động' : 'Tạm ngưng',
  }));
  const wsComp = XLSX.utils.json_to_sheet(compRows);
  XLSX.utils.book_append_sheet(wb, wsComp, 'Công Ty');

  // Sheet 2: Khu vực
  const areaRows = areas.map((a, i) => ({
    'STT': i + 1,
    'Mã Khu Vực': a.code,
    'Tên Khu Vực': a.name,
    'Mã Công Ty Trực Thuộc': a.companyCode,
    'Trạng Thái': a.active ? 'Hoạt động' : 'Tạm ngưng',
  }));
  const wsArea = XLSX.utils.json_to_sheet(areaRows);
  XLSX.utils.book_append_sheet(wb, wsArea, 'Khu Vực');

  // Sheet 3: Ban ngành
  const deptRows = departments.map((d, i) => ({
    'STT': i + 1,
    'Mã Ban Ngành': d.code,
    'Tên Ban Ngành': d.name,
    'Trạng Thái': d.active ? 'Hoạt động' : 'Tạm ngưng',
  }));
  const wsDept = XLSX.utils.json_to_sheet(deptRows);
  XLSX.utils.book_append_sheet(wb, wsDept, 'Ban Ngành');

  const now = new Date();
  const dateStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
  XLSX.writeFile(wb, `EduLMS_DanhMuc_HeThong_${dateStr}.xlsx`);
}

/**
 * 2. Xuất file Dữ liệu Nhân sự & Đối tượng (.xlsx)
 * Bao gồm 2 Sheets: Thành viên và Chi tiết đối tượng
 */
export function exportMembersAndTargetsExcel(members: Member[]): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Thành viên
  const memberRows = members.map((m, i) => ({
    'STT': i + 1,
    'Mã TV': m.code,
    'Họ và Tên': m.fullName,
    'Công Ty': m.companyCode,
    'Khu Vực': m.areaCode,
    'Ban Ngành': m.departmentCode,
    'Tổng Điểm': m.score,
    'Số Đối Tượng': m.targets?.length || 0,
    'B1 (Kết bạn)': m.results?.s1 || 0,
    'B2 (Tương tác)': m.results?.s2 || 0,
    'B3 (Gặp)': m.results?.s3 || 0,
    'B4 (Thăm)': m.results?.s4 || 0,
    'B5 (Cơm)': m.results?.s5 || 0,
    'B6 (Gợi mở)': m.results?.s6 || 0,
    'Trạng Thái': m.active ? 'Hoạt động' : 'Tạm ngưng',
  }));
  const wsMembers = XLSX.utils.json_to_sheet(memberRows);
  XLSX.utils.book_append_sheet(wb, wsMembers, 'Thành Viên');

  // Sheet 2: Đối tượng chi tiết
  const targetRows: any[] = [];
  members.forEach((m) => {
    (m.targets || []).forEach((t, tIdx) => {
      targetRows.push({
        'Mã TV': m.code,
        'Họ Tên TV': m.fullName,
        'Công Ty': m.companyCode,
        'Khu Vực': m.areaCode,
        'Tên Đối Tượng': t.targetName,
        'B1_KetBan': t.steps?.s1 ? 'X' : '',
        'B2_TuongTac': t.steps?.s2 ? 'X' : '',
        'B3_Gap': t.steps?.s3 ? 'X' : '',
        'B4_Tham': t.steps?.s4 ? 'X' : '',
        'B5_Com': t.steps?.s5 ? 'X' : '',
        'B6_GoiMo': t.steps?.s6 ? 'X' : '',
        'Điểm Đạt': t.score,
        'Trạng Thái': t.status,
        'Giải Trình': t.explanation,
        'Ngày Ghi': t.recordedAt || '',
      });
    });
  });
  const wsTargets = XLSX.utils.json_to_sheet(targetRows);
  XLSX.utils.book_append_sheet(wb, wsTargets, 'Nhật Ký Đối Tượng');

  const now = new Date();
  const dateStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
  XLSX.writeFile(wb, `EduLMS_NhanSu_DiemThiDua_${dateStr}.xlsx`);
}

/**
 * 3. Tải file Mẫu Cấu hình Danh mục (.xlsx)
 */
export function downloadConfigTemplateExcel(): void {
  const wb = XLSX.utils.book_new();

  const compSample = [
    { 'Mã Công Ty': 'Th1', 'Tên Công Ty': 'Thành phố 1', 'Mô Tả': 'Đơn vị KV phía Đông', 'Trạng Thái': 'Hoạt động' },
    { 'Mã Công Ty': 'Th2', 'Tên Công Ty': 'Thành phố 2', 'Mô Tả': 'Đơn vị KV trung tâm', 'Trạng Thái': 'Hoạt động' },
    { 'Mã Công Ty': 'HT', 'Tên Công Ty': 'Hà Tĩnh', 'Mô Tả': 'Đơn vị chi nhánh tỉnh', 'Trạng Thái': 'Hoạt động' },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(compSample), 'Công Ty');

  const areaSample = [
    { 'Mã Khu Vực': '1.1', 'Tên Khu Vực': 'Khu vực 1.1', 'Mã Công Ty Trực Thuộc': 'Th1', 'Trạng Thái': 'Hoạt động' },
    { 'Mã Khu Vực': '1.2', 'Tên Khu Vực': 'Khu vực 1.2', 'Mã Công Ty Trực Thuộc': 'Th1', 'Trạng Thái': 'Hoạt động' },
    { 'Mã Khu Vực': '2.1', 'Tên Khu Vực': 'Khu vực 2.1', 'Mã Công Ty Trực Thuộc': 'Th2', 'Trạng Thái': 'Hoạt động' },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(areaSample), 'Khu Vực');

  const deptSample = [
    { 'Mã Ban Ngành': 'Tráng Niên', 'Tên Ban Ngành': 'Tráng Niên', 'Trạng Thái': 'Hoạt động' },
    { 'Mã Ban Ngành': 'Phụ Nữ', 'Tên Ban Ngành': 'Phụ Nữ', 'Trạng Thái': 'Hoạt động' },
    { 'Mã Ban Ngành': 'Thanh Niên Nam', 'Tên Ban Ngành': 'Thanh Niên Nam', 'Trạng Thái': 'Hoạt động' },
    { 'Mã Ban Ngành': 'Thanh Niên Nữ', 'Tên Ban Ngành': 'Thanh Niên Nữ', 'Trạng Thái': 'Hoạt động' },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(deptSample), 'Ban Ngành');

  XLSX.writeFile(wb, 'EduLMS_Mau_DanhMuc_HeThong.xlsx');
}

/**
 * 4. Tải file Mẫu Danh sách Thành viên (.xlsx)
 */
export function downloadMembersTemplateExcel(): void {
  const wb = XLSX.utils.book_new();

  const membersSample = [
    {
      'Mã TV': 'MEM-001',
      'Họ và Tên': 'Nguyễn Văn An',
      'Công Ty': 'Th1',
      'Khu Vực': '1.1',
      'Ban Ngành': 'Thanh Niên Nam',
      'Mục Tiêu B1': 10,
      'Mục Tiêu B2': 8,
      'Mục Tiêu B3': 5,
      'Mục Tiêu B4': 3,
      'Mục Tiêu B5': 3,
      'Mục Tiêu B6': 2,
      'Trạng Thái': 'Hoạt động',
    },
    {
      'Mã TV': 'MEM-002',
      'Họ và Tên': 'Trần Thị Bình',
      'Công Ty': 'Th1',
      'Khu Vực': '1.2',
      'Ban Ngành': 'Phụ Nữ',
      'Mục Tiêu B1': 12,
      'Mục Tiêu B2': 10,
      'Mục Tiêu B3': 6,
      'Mục Tiêu B4': 4,
      'Mục Tiêu B5': 4,
      'Mục Tiêu B6': 3,
      'Trạng Thái': 'Hoạt động',
    },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(membersSample), 'Thành Viên');

  XLSX.writeFile(wb, 'EduLMS_Mau_Danh_Sach_Thanh_Vien.xlsx');
}

/**
 * 5. Đọc & Kiểm tra file Cấu hình Hệ thống tải lên
 */
export async function parseConfigExcel(file: File): Promise<{
  companies: Company[];
  areas: Area[];
  departments: Department[];
  errors: string[];
}> {
  const errors: string[] = [];
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  const parsedCompanies: Company[] = [];
  const parsedAreas: Area[] = [];
  const parsedDepartments: Department[] = [];

  // 1. Sheet Công ty (tìm theo tên sheet 'Công Ty' hoặc 'Companies' hoặc sheet 0)
  const compSheetName = wb.SheetNames.find((s) => /công ty|companies|cty/i.test(s)) || wb.SheetNames[0];
  if (compSheetName && wb.Sheets[compSheetName]) {
    const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[compSheetName]);
    rows.forEach((r, idx) => {
      const code = String(r['Mã Công Ty'] || r['Ma Cong Ty'] || r['code'] || r['Code'] || '').trim();
      const name = String(r['Tên Công Ty'] || r['Ten Cong Ty'] || r['name'] || r['Name'] || '').trim();
      const desc = String(r['Mô Tả'] || r['Mo Ta'] || r['description'] || '').trim();
      const statusStr = String(r['Trạng Thái'] || r['Trang Thai'] || r['active'] || 'Hoạt động').toLowerCase();
      const active = !statusStr.includes('tạm') && !statusStr.includes('ngưng') && !statusStr.includes('false');

      if (!code || !name) {
        errors.push(`[Sheet Công Ty - Hàng ${idx + 2}]: Thiếu mã hoặc tên công ty.`);
      } else {
        parsedCompanies.push({
          id: code.toLowerCase(),
          code,
          name,
          description: desc,
          active,
        });
      }
    });
  }

  // 2. Sheet Khu vực
  const areaSheetName = wb.SheetNames.find((s) => /khu vực|areas|kv/i.test(s));
  if (areaSheetName && wb.Sheets[areaSheetName]) {
    const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[areaSheetName]);
    rows.forEach((r, idx) => {
      const code = String(r['Mã Khu Vực'] || r['Ma Khu Vuc'] || r['code'] || r['Code'] || '').trim();
      const name = String(r['Tên Khu Vực'] || r['Ten Khu Vuc'] || r['name'] || r['Name'] || `Khu vực ${code}`).trim();
      const compCode = String(r['Mã Công Ty Trực Thuộc'] || r['Công Ty'] || r['companyCode'] || '').trim();
      const statusStr = String(r['Trạng Thái'] || r['Trang Thai'] || 'Hoạt động').toLowerCase();
      const active = !statusStr.includes('tạm') && !statusStr.includes('ngưng') && !statusStr.includes('false');

      if (!code) {
        errors.push(`[Sheet Khu Vực - Hàng ${idx + 2}]: Thiếu mã khu vực.`);
      } else {
        parsedAreas.push({
          id: `area-${code.replace(/\./g, '-')}`,
          code,
          name: name || `Khu vực ${code}`,
          companyCode: compCode || 'Th1',
          active,
        });
      }
    });
  }

  // 3. Sheet Ban ngành
  const deptSheetName = wb.SheetNames.find((s) => /ban ngành|departments|ngành/i.test(s));
  if (deptSheetName && wb.Sheets[deptSheetName]) {
    const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[deptSheetName]);
    rows.forEach((r, idx) => {
      const code = String(r['Mã Ban Ngành'] || r['Ma Ban Nganh'] || r['code'] || '').trim();
      const name = String(r['Tên Ban Ngành'] || r['Ten Ban Nganh'] || r['name'] || code).trim();
      const statusStr = String(r['Trạng Thái'] || 'Hoạt động').toLowerCase();
      const active = !statusStr.includes('tạm') && !statusStr.includes('ngưng') && !statusStr.includes('false');

      if (!code && !name) {
        errors.push(`[Sheet Ban Ngành - Hàng ${idx + 2}]: Thiếu mã/tên ban ngành.`);
      } else {
        const finalCode = code || name;
        parsedDepartments.push({
          id: `dept-${finalCode.toLowerCase().replace(/\s+/g, '-')}`,
          code: finalCode,
          name: name || finalCode,
          active,
        });
      }
    });
  }

  return {
    companies: parsedCompanies,
    areas: parsedAreas,
    departments: parsedDepartments,
    errors,
  };
}

/**
 * 6. Đọc & Kiểm tra file Danh sách Thành viên tải lên
 */
export async function parseMembersExcel(file: File): Promise<{
  members: Member[];
  errors: string[];
}> {
  const errors: string[] = [];
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  const parsedMembers: Member[] = [];
  const memSheetName = wb.SheetNames.find((s) => /thành viên|members|nhân sự/i.test(s)) || wb.SheetNames[0];

  if (memSheetName && wb.Sheets[memSheetName]) {
    const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[memSheetName]);
    rows.forEach((r, idx) => {
      const fullName = String(r['Họ và Tên'] || r['Họ Tên'] || r['fullName'] || r['Name'] || '').trim();
      const code = String(r['Mã TV'] || r['Ma TV'] || r['code'] || `MEM-${(idx + 1).toString().padStart(3, '0')}`).trim();
      const companyCode = String(r['Công Ty'] || r['Cong Ty'] || r['companyCode'] || 'Th1').trim();
      const areaCode = String(r['Khu Vực'] || r['Khu Vuc'] || r['areaCode'] || '1.1').trim();
      const departmentCode = String(r['Ban Ngành'] || r['Ban Nganh'] || r['departmentCode'] || 'Thanh Niên Nam').trim();
      const statusStr = String(r['Trạng Thái'] || 'Hoạt động').toLowerCase();
      const active = !statusStr.includes('tạm') && !statusStr.includes('ngưng') && !statusStr.includes('false');

      if (!fullName) {
        errors.push(`[Hàng ${idx + 2}]: Thiếu họ và tên thành viên.`);
      } else {
        const goals = {
          s1: Number(r['Mục Tiêu B1'] || r['B1'] || 10),
          s2: Number(r['Mục Tiêu B2'] || r['B2'] || 8),
          s3: Number(r['Mục Tiêu B3'] || r['B3'] || 5),
          s4: Number(r['Mục Tiêu B4'] || r['B4'] || 3),
          s5: Number(r['Mục Tiêu B5'] || r['B5'] || 3),
          s6: Number(r['Mục Tiêu B6'] || r['B6'] || 2),
        };

        parsedMembers.push({
          id: code.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
          code,
          fullName,
          companyCode,
          areaCode,
          departmentCode,
          active,
          score: 0,
          rank: idx + 1,
          goals,
          results: { s1: 0, s2: 0, s3: 0, s4: 0, s5: 0, s6: 0 },
          targets: [],
          createdAt: new Date().toISOString().split('T')[0],
        });
      }
    });
  } else {
    errors.push('Không tìm thấy sheet danh sách thành viên trong file Excel.');
  }

  return {
    members: parsedMembers,
    errors,
  };
}
