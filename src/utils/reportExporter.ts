import * as XLSX from 'xlsx';
import { Member, CompanyRankItem, AreaRankItem } from '../types/edulms';

/**
 * Export full competition rankings and 6-step breakdown to Excel (.xlsx)
 */
export function exportCompetitionToExcel(
  members: Member[],
  companyRankings: CompanyRankItem[],
  areaRankings: AreaRankItem[]
): void {
  const wb = XLSX.utils.book_new();

  // 1. Sheet Cá Nhân
  const memberRows = members.map((m, idx) => ({
    'Thứ Hạng': m.rank || idx + 1,
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
    'Trạng Thái': m.active ? 'Đang hoạt động' : 'Tạm ngưng',
  }));
  const wsMembers = XLSX.utils.json_to_sheet(memberRows);
  XLSX.utils.book_append_sheet(wb, wsMembers, 'Bảng Cá Nhân');

  // 2. Sheet Công Ty
  const companyRows = companyRankings.map((c) => ({
    'Hạng': c.rank,
    'Mã Cty': c.companyCode,
    'Tên Công Ty': c.companyName,
    'Số Thành Viên': c.activeMembersCount,
    'Điểm Trung Bình / TV': c.averageScore,
    'Tổng Điểm Cty': c.totalScore,
  }));
  const wsCompanies = XLSX.utils.json_to_sheet(companyRows);
  XLSX.utils.book_append_sheet(wb, wsCompanies, 'Xếp Hạng Công Ty');

  // 3. Sheet Khu Vực
  const areaRows = areaRankings.map((a) => ({
    'Hạng': a.rank,
    'Mã Khu Vực': a.areaCode,
    'Tên Khu Vực': a.areaName,
    'Trực Thuộc Cty': a.companyCode,
    'Số Thành Viên': a.activeMembersCount,
    'Điểm Trung Bình / TV': a.averageScore,
    'Tổng Điểm KV': a.totalScore,
  }));
  const wsAreas = XLSX.utils.json_to_sheet(areaRows);
  XLSX.utils.book_append_sheet(wb, wsAreas, 'Xếp Hạng Khu Vực');

  const now = new Date();
  const dateStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
  XLSX.writeFile(wb, `EduLMS_Bao_Cao_Thi_Dua_${dateStr}.xlsx`);
}

/**
 * Trigger clean browser printing (Save as PDF)
 */
export function printCompetitionReport(): void {
  window.print();
}
