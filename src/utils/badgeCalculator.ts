import { Member, MilestoneBadge, HuongKhiItem } from '../types/edulms';

export function computeUserMilestoneBadges(
  member: Member | null,
  myStories: HuongKhiItem[] = []
): MilestoneBadge[] {
  const score = member?.score || 0;
  const rank = member?.rank || 999;
  const targets = member?.targets || [];
  const results = member?.results || { s1: 0, s2: 0, s3: 0, s4: 0, s5: 0, s6: 0 };

  const hasMealStep = results.s5 > 0 || myStories.some((s) => s.category === 'COM_YEU_THUONG');
  const hasVisitStep = results.s4 > 0 || myStories.some((s) => s.category === 'THAM_VIENG');
  const hasFullCompletedTarget = targets.some((t) => t.status === 'FULL_COMPLETED');
  const hasOver500Points = score >= 500;
  const isTop3 = rank <= 3 && score > 0;
  const has5Targets = targets.length >= 5;

  return [
    {
      id: 'b-com',
      title: 'Bữa Cơm Yêu Thương',
      description: 'Đã hoàn thành bước Cơm ấm áp hoặc chia sẻ bài viết bữa cơm thân mật.',
      icon: '🍲',
      color: 'from-amber-500 to-orange-500 text-amber-900 border-amber-300 bg-amber-50',
      unlocked: hasMealStep,
      progressText: hasMealStep ? 'Đã đạt' : 'Cần hoàn thành B5: Cơm',
    },
    {
      id: 'b-tham',
      title: 'Sứ Giả Thăm Viếng',
      description: 'Chân thành thăm hỏi, quan tâm nâng đỡ gia đình đối tượng.',
      icon: '🤝',
      color: 'from-blue-500 to-indigo-500 text-blue-900 border-blue-300 bg-blue-50',
      unlocked: hasVisitStep,
      progressText: hasVisitStep ? 'Đã đạt' : 'Cần hoàn thành B4: Thăm',
    },
    {
      id: 'b-mo-duong',
      title: 'Người Mở Đường',
      description: 'Hoàn thành trọn vẹn cả 6 bước kết nối và gợi mở cho đối tượng.',
      icon: '⚡',
      color: 'from-emerald-500 to-teal-500 text-emerald-900 border-emerald-300 bg-emerald-50',
      unlocked: hasFullCompletedTarget,
      progressText: hasFullCompletedTarget ? 'Đã đạt' : 'Cần đạt 6/6 bước 1 đối tượng',
    },
    {
      id: 'b-chien-binh',
      title: 'Chiến Binh Tiên Phong',
      description: 'Tích lũy từ 500 điểm thi đua trở lên trong chiến dịch.',
      icon: '🏆',
      color: 'from-yellow-500 to-amber-600 text-amber-950 border-amber-400 bg-amber-50',
      unlocked: hasOver500Points,
      progressText: hasOver500Points ? 'Đã đạt' : `${score}/500 điểm`,
    },
    {
      id: 'b-hai-dang',
      title: 'Ngọn Hải Đăng',
      description: 'Xuất sắc lọt vào Top 3 bảng vinh danh cá nhân toàn quốc.',
      icon: '👑',
      color: 'from-purple-500 to-pink-500 text-purple-900 border-purple-300 bg-purple-50',
      unlocked: isTop3,
      progressText: isTop3 ? `Hạng #${rank}` : `Đang ở hạng #${rank}`,
    },
    {
      id: 'b-muoi-dat',
      title: 'Muối Của Đất',
      description: 'Ghi nhận và đồng hành cùng từ 5 đối tượng tiếp cận trở lên.',
      icon: '🕊️',
      color: 'from-sky-500 to-blue-600 text-sky-900 border-sky-300 bg-sky-50',
      unlocked: has5Targets,
      progressText: `${targets.length}/5 đối tượng`,
    },
  ];
}
