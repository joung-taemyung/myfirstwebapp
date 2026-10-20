import { db } from "@/lib/db";

// 확인 기록 읽기 — 서버 코드(서버 컴포넌트)에서만 부른다. 최신이 위(같은 시각이면 나중에 넣은 것이 위).

const NEWEST_FIRST = [{ createdAt: "desc" as const }, { id: "desc" as const }];

export async function getReviews(buyerId: string, take = 20) {
  return db().review.findMany({ where: { buyerId }, orderBy: NEWEST_FIRST, take });
}

/** 바이어마다 가장 최근 기록의 상태 — 기록이 없는 바이어는 Map에 없다 */
export async function getLatestStatuses(buyerIds: string[]): Promise<Map<string, string>> {
  const rows = await db().review.findMany({
    where: { buyerId: { in: buyerIds } },
    orderBy: NEWEST_FIRST,
    select: { buyerId: true, status: true },
  });
  const latest = new Map<string, string>();
  for (const r of rows) if (!latest.has(r.buyerId)) latest.set(r.buyerId, r.status);
  return latest;
}

export async function getRecentReviews(take = 5) {
  return db().review.findMany({
    orderBy: NEWEST_FIRST,
    take,
    include: { buyer: { select: { name: true } } },
  });
}
