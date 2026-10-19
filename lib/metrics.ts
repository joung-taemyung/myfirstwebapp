import type { Buyer, Grade } from "@/lib/buyers";

// 화면 숫자 계산 — 순수 함수만(화면 글자는 만들지 않는다). 등급은 grade 칸 그대로 쓰고 다시 매기지 않는다.
// 비율은 0–1 값으로 돌려주고, 나눌 합이 0이면 null.

export const GRADES: Grade[] = ["S", "A", "B", "C"];

export function isGrade(v: unknown): v is Grade {
  return typeof v === "string" && (GRADES as string[]).includes(v);
}

function sum(buyers: Buyer[], pick: (b: Buyer) => number): number {
  return buyers.reduce((s, b) => s + pick(b), 0);
}

function ratio(part: number, whole: number): number | null {
  return whole > 0 ? part / whole : null;
}

/** 위험 순: pd30d 큰 순, 같으면 id 순 */
function byRisk(a: Buyer, b: Buyer): number {
  return b.pd30d - a.pd30d || a.id.localeCompare(b.id);
}

export function kpis(buyers: Buyer[]) {
  const gradeC = buyers.filter((b) => b.grade === "C");
  const overdue = buyers.filter((b) => b.overdueUsd > 0);
  const arAll = sum(buyers, (b) => b.openArUsd);
  const arC = sum(gradeC, (b) => b.openArUsd);
  return {
    countC: gradeC.length,
    arC,
    shareC: ratio(arC, arAll),
    arAll,
    countAll: buyers.length,
    overdueUsd: sum(buyers, (b) => b.overdueUsd),
    countOverdue: overdue.length,
  };
}

export function gradeCounts(buyers: Buyer[]): { grade: Grade; count: number }[] {
  return GRADES.map((grade) => ({ grade, count: buyers.filter((b) => b.grade === grade).length }));
}

export function topRisk(buyers: Buyer[], n = 10): Buyer[] {
  return [...buyers].sort(byRisk).slice(0, n);
}

export function byRegion(buyers: Buyer[]) {
  const regions = [...new Set(buyers.map((b) => b.region))];
  return regions
    .map((region) => {
      const inRegion = buyers.filter((b) => b.region === region);
      const arAll = sum(inRegion, (b) => b.openArUsd);
      const arC = sum(
        inRegion.filter((b) => b.grade === "C"),
        (b) => b.openArUsd,
      );
      return { region, count: inRegion.length, arAll, arC, shareC: ratio(arC, arAll) };
    })
    .sort((a, b) => b.arAll - a.arAll || a.region.localeCompare(b.region, "ko"));
}

/** grade가 S · A · B · C 중 하나면 그 등급만, 아니면 전부. 순서는 topRisk와 같다. */
export function filterByGrade(buyers: Buyer[], grade: unknown): Buyer[] {
  const picked = isGrade(grade) ? buyers.filter((b) => b.grade === grade) : buyers;
  return [...picked].sort(byRisk);
}
