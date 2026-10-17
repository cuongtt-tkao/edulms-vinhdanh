import { DailyVerse } from '../types/edulms';

export const DAILY_SCRIPTURES: DailyVerse[] = [
  {
    verse: 'Vì thế, hãy đi và làm cho muôn dân trở thành môn đồ của Ta...',
    reference: 'Ma-thi-ơ 28:19',
    theme: 'Đại Mạng Lệnh',
    reflection: 'Bước đi với tinh thần yêu thương và sẵn sàng gieo rắc hạt giống Tin Lành vào lòng người nghe.',
  },
  {
    verse: 'Đẹp thay những bàn chân của kẻ rao truyền Tin Lành bình an!',
    reference: 'Rô-ma 10:15',
    theme: 'Sứ Giả Tin Lành',
    reflection: 'Mỗi bước chân bạn đến thăm hỏi, sẻ chia đều mang hương thơm hy vọng và phước lành của Chúa.',
  },
  {
    verse: 'Các con là ánh sáng của thế gian. Một thành xây trên núi không thể bị che khuất được.',
    reference: 'Ma-thi-ơ 5:14',
    theme: 'Tỏa Sáng Yêu Thương',
    reflection: 'Hãy để những việc lành của bạn chiếu rọi trước mặt người đời để họ ngợi khen Cha trên trời.',
  },
  {
    verse: 'Kẻ nào gieo trong nước mắt sẽ gặt hái cách vui mừng.',
    reference: 'Thi Thiên 126:5',
    theme: 'Mùa Gặt Linh Hồn',
    reflection: 'Kiên trì gieo lời yêu thương và cầu thay, bông trái ngọt ngào sẽ nảy mầm đúng kỳ.',
  },
  {
    verse: 'Hãy sốt sắng truyền giảng Lời Chúa, dù gặp thời hay không gặp thời.',
    reference: '2 Ti-mô-thê 4:2',
    theme: 'Tinh Thần Phụng Sự',
    reflection: 'Tận dụng mọi cơ hội gặp gỡ, trò chuyện để kết nối và chia sẻ niềm hy vọng chân thật.',
  },
  {
    verse: 'Người khôn ngoan biết chinh phục các linh hồn.',
    reference: 'Châm Ngôn 11:30',
    theme: 'Khôn Ngoan Kết Nối',
    reflection: 'Lắng nghe chân thành, cảm thông sâu sắc và đồng hành chân tình cùng từng đối tượng tiếp cận.',
  },
  {
    verse: 'Nầy Ta đứng ngoài cửa mà gõ; nếu ai nghe tiếng Ta mà mở cửa cho, thì Ta sẽ vào cùng người ấy, ăn bữa tối với người, và người với Ta.',
    reference: 'Khải Huyền 3:20',
    theme: 'Mở Cửa Tấm Lòng',
    reflection: 'Bữa cơm thân tình và sự thăm viếng chân thành là nhịp cầu mở lối mọi tấm lòng rộng mở.',
  },
  {
    verse: 'Hãy yêu thương nhau như Ta đã yêu thương các con.',
    reference: 'Giăng 13:34',
    theme: 'Hương Khí Tình Yêu',
    reflection: 'Tình yêu thương không chỉ bằng lời nói mà thể hiện qua từng hành động chăm sóc cụ thể.',
  },
  {
    verse: 'Ta có thể làm được mọi sự nhờ Đấng ban thêm sức cho ta.',
    reference: 'Phi-líp 4:13',
    theme: 'Sức Mạnh Đức Tin',
    reflection: 'Không nản lòng trước khó khăn hay từ chối, hãy vững tin Đấng đồng hành luôn tiếp thêm năng lực.',
  },
  {
    verse: 'Bởi điều này mà mọi người sẽ nhận biết các con là môn đồ Ta, nếu các con có tình yêu thương nhau.',
    reference: 'Giăng 13:35',
    theme: 'Dấu Hiệu Môn Đồ',
    reflection: 'Sự hiệp một và yêu thương giữa các đội ngũ chính là lời chứng sống động nhất cho cộng đồng.',
  },
];

/**
 * Returns daily scripture based on the day of the year (auto rotates every day).
 */
export function getDailyVerse(currentDate: Date = new Date()): DailyVerse {
  const start = new Date(currentDate.getFullYear(), 0, 0);
  const diff = currentDate.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const index = Math.abs(dayOfYear) % DAILY_SCRIPTURES.length;
  return DAILY_SCRIPTURES[index];
}

/**
 * Cycle to the next scripture verse.
 */
export function getNextVerse(currentRef: string): DailyVerse {
  const currentIndex = DAILY_SCRIPTURES.findIndex((s) => s.reference === currentRef);
  const nextIndex = (currentIndex + 1) % DAILY_SCRIPTURES.length;
  return DAILY_SCRIPTURES[nextIndex];
}
