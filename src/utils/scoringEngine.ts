import {
  TargetSteps,
  TargetScoreStatus,
  TargetRecord,
  Member,
  Company,
  Area,
  CompanyRankItem,
  AreaRankItem,
  STEP_DEFINITIONS,
} from '../types/edulms';

/**
 * Calculates score for a single target according to the 6-step festival rules:
 * 1. Chưa làm bước nào: 0 điểm
 * 2. Điểm liệt (đã làm bước 6 mà chưa làm bước 3): ±5 ± 2 - 750
 * 3. Thiếu từ 3 bước (hoàn thành <= 3 bước mà không dính điểm liệt): 0 điểm
 * 4. Thiếu 1-2 bước:
 *    - Thực hiện tuần tự từ Bước 1 (B1..B4 hoặc B1..B5): Không trừ điểm, tính trọn vẹn điểm đã làm
 *    - Không tuần tự (nhảy cóc, bỏ bước ở giữa): Tổng điểm đã làm trừ điểm các bước thiếu
 * 5. Không thiếu (làm đủ cả 6 bước): 757 điểm
 */
export function calculateTargetScore(steps: TargetSteps): {
  score: number;
  status: TargetScoreStatus;
  explanation: string;
} {
  const s1 = !!steps.s1; // Kết bạn (5)
  const s2 = !!steps.s2; // Tương tác (2)
  const s3 = !!steps.s3; // Gặp (50)
  const s4 = !!steps.s4; // Thăm (100)
  const s5 = !!steps.s5; // Cơm (100)
  const s6 = !!steps.s6; // Gợi mở (500)

  const completedCount = (s1 ? 1 : 0) + (s2 ? 1 : 0) + (s3 ? 1 : 0) + (s4 ? 1 : 0) + (s5 ? 1 : 0) + (s6 ? 1 : 0);

  // 1. Chưa làm bước nào: 0 điểm
  if (completedCount === 0) {
    return {
      score: 0,
      status: 'NOT_STARTED',
      explanation: 'Chưa làm bước nào (0 điểm)',
    };
  }

  // 2. Điểm liệt (đã làm bước 6 mà chưa làm bước 3)
  // Các bước 3, 4, 5, 6 đều tính âm dù đã làm hay chưa (-50 -100 -100 -500 = -750).
  // Bước 1, 2 đã làm thì cộng, chưa làm thì trừ.
  // Công thức: ±5 ± 2 − 750
  if (s6 && !s3) {
    const p1 = s1 ? 5 : -5;
    const p2 = s2 ? 2 : -2;
    const score = p1 + p2 - 750;
    return {
      score,
      status: 'ELIMINATED',
      explanation: `Điểm liệt: Làm Gợi mở (B6) nhưng chưa làm Gặp (B3) [${p1 > 0 ? '+5' : '-5'} ${p2 > 0 ? '+2' : '-2'} - 750 = ${score} điểm]`,
    };
  }

  const missingCount = 6 - completedCount;

  // 3. Thiếu từ 3 bước: hủy, 0 điểm
  if (missingCount >= 3) {
    return {
      score: 0,
      status: 'CANCELLED_LACK_STEPS',
      explanation: `Hủy: Thiếu ${missingCount} bước (thiếu từ 3 bước trở lên = 0 điểm)`,
    };
  }

  // 4. Thiếu 1–2 bước:
  // - Thực hiện tuần tự từ Bước 1: Không trừ điểm, tính trọn vẹn điểm các bước đã làm.
  // - Không tuần tự (bỏ bước / nhảy cóc): Tổng điểm các bước đã làm trừ điểm các bước thiếu.
  if (missingCount === 1 || missingCount === 2) {
    const stepItems = [
      { name: 'Kết bạn', done: s1, val: 5 },
      { name: 'Tương tác', done: s2, val: 2 },
      { name: 'Gặp', done: s3, val: 50 },
      { name: 'Thăm', done: s4, val: 100 },
      { name: 'Cơm', done: s5, val: 100 },
      { name: 'Gợi mở', done: s6, val: 500 },
    ];
    const sumDone = stepItems.filter((i) => i.done).reduce((acc, i) => acc + i.val, 0);
    const sumMissing = stepItems.filter((i) => !i.done).reduce((acc, i) => acc + i.val, 0);

    // Tuần tự liên tục từ Bước 1: B1->B2->B3->B4 (thiếu 2 bước) hoặc B1->B2->B3->B4->B5 (thiếu 1 bước)
    const isSequential = s1 && s2 && s3 && s4 && (missingCount === 1 ? s5 && !s6 : !s5 && !s6);

    if (isSequential) {
      return {
        score: sumDone,
        status: 'SEQUENTIAL_PROGRESS',
        explanation: `Thiếu ${missingCount} bước nhưng thực hiện tuần tự từ Bước 1: Không trừ điểm, đạt trọn vẹn +${sumDone} điểm`,
      };
    }

    const score = sumDone - sumMissing;
    return {
      score,
      status: 'PENALIZED_MISSING',
      explanation: `Thiếu ${missingCount} bước không tuần tự (bỏ bước): Đã làm (+${sumDone}) trừ các bước thiếu (-${sumMissing}) = ${score} điểm`,
    };
  }

  // 5. Không thiếu (làm đủ cả 6 bước): 5 + 2 + 50 + 100 + 100 + 500 = 757
  const fullScore = 5 + 2 + 50 + 100 + 100 + 500;
  return {
    score: fullScore,
    status: 'FULL_COMPLETED',
    explanation: 'Hoàn thành đủ cả 6 bước (+757 điểm)',
  };
}

/**
 * Assigns competition ranks where items with identical scores share the same rank.
 */
export function assignCompetitionRanks<T extends { score: number; rank?: number }>(
  items: T[]
): (T & { rank: number })[] {
  const sorted = [...items].sort((a, b) => b.score - a.score);
  let currentRank = 1;

  return sorted.map((item, index) => {
    if (index > 0 && item.score === sorted[index - 1].score) {
      return {
        ...item,
        rank: sorted[index - 1].rank ?? currentRank,
      };
    } else {
      currentRank = index + 1;
      return {
        ...item,
        rank: currentRank,
      };
    }
  });
}

/**
 * Recomputes member's total score from their targets list.
 */
export function computeMemberScore(targets: TargetRecord[]): number {
  return targets.reduce((sum, t) => sum + (t.score || 0), 0);
}

/**
 * Computes individual rankings for members (cùng điểm cùng hạng).
 */
export function rankMembers(members: Member[]): Member[] {
  const ranked = assignCompetitionRanks(members);
  return ranked;
}

/**
 * Computes Company rankings:
 * Average score = (Total score of active members in company) / (Count of active members in company).
 * Members who have not recorded anything count as 0 score.
 * Equal average score = Equal rank.
 */
export function computeCompanyRankings(
  companies: Company[],
  members: Member[]
): CompanyRankItem[] {
  const items: {
    companyCode: string;
    companyName: string;
    activeMembersCount: number;
    totalScore: number;
    score: number; // for ranking sort
    averageScore: number;
    rankDelta: number;
  }[] = [];

  companies.forEach((comp) => {
    // Only count active members in this company
    const compMembers = members.filter(
      (m) => m.companyCode === comp.code && m.active
    );
    const count = compMembers.length;
    const totalScore = compMembers.reduce((acc, m) => acc + m.score, 0);
    const avg = count > 0 ? Math.round((totalScore / count) * 10) / 10 : 0;

    items.push({
      companyCode: comp.code,
      companyName: comp.name,
      activeMembersCount: count,
      totalScore,
      score: avg,
      averageScore: avg,
      rankDelta: 0,
    });
  });

  const ranked = assignCompetitionRanks(items);
  return ranked.map((r) => ({
    companyCode: r.companyCode,
    companyName: r.companyName,
    activeMembersCount: r.activeMembersCount,
    totalScore: r.totalScore,
    averageScore: r.averageScore,
    rank: r.rank,
    rankDelta: r.rankDelta,
  }));
}

/**
 * Computes Area rankings:
 * Average score = (Total score of active members in area) / (Count of active members in area).
 * Members who have not recorded anything count as 0 score.
 * Equal average score = Equal rank.
 */
export function computeAreaRankings(areas: Area[], members: Member[]): AreaRankItem[] {
  const colorPalette = [
    '#0284c7', // Sky Blue 600
    '#38bdf8', // Light Sky Blue 400
    '#f59e0b', // Amber 500
    '#10b981', // Emerald 500
    '#8b5cf6', // Violet 500
    '#ec4899', // Pink 500
    '#6366f1', // Indigo 500
    '#14b8a6', // Teal 500
    '#f97316', // Orange 500
  ];

  const items: {
    areaCode: string;
    areaName: string;
    companyCode: string;
    activeMembersCount: number;
    totalScore: number;
    score: number;
    averageScore: number;
    rankDelta: number;
    color: string;
  }[] = [];

  areas.forEach((area, index) => {
    const areaMembers = members.filter(
      (m) => m.areaCode === area.code && m.active
    );
    const count = areaMembers.length;
    const totalScore = areaMembers.reduce((acc, m) => acc + m.score, 0);
    const avg = count > 0 ? Math.round((totalScore / count) * 10) / 10 : 0;

    items.push({
      areaCode: area.code,
      areaName: area.name,
      companyCode: area.companyCode,
      activeMembersCount: count,
      totalScore,
      score: avg,
      averageScore: avg,
      rankDelta: 0,
      color: colorPalette[index % colorPalette.length],
    });
  });

  const ranked = assignCompetitionRanks(items);
  return ranked.map((r) => ({
    areaCode: r.areaCode,
    areaName: r.areaName,
    companyCode: r.companyCode,
    activeMembersCount: r.activeMembersCount,
    totalScore: r.totalScore,
    averageScore: r.averageScore,
    rank: r.rank,
    rankDelta: r.rankDelta,
    color: r.color,
  }));
}
