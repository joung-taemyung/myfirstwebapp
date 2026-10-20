import { db } from "@/lib/db";

// 확인 기록 읽기 — 서버 코드(서버 컴포넌트)에서만 부른다. 최신이 위(같은 시각이면 나중에 넣은 것이 위).

const NEWEST_FIRST = [{ createdAt: "desc" as const }, { id: "desc" as const }];

export async function getReviews(buyerId: string, take = 20) {
  return db().review.findMany({ where: { buyerId }, orderBy: NEWEST_FIRST, take });
}

export async function getRecentReviews(take = 5) {
  return db().review.findMany({
    orderBy: NEWEST_FIRST,
    take,
    include: { buyer: { select: { name: true } } },
  });
}
