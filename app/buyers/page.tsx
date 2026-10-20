import Link from "next/link";
import BarRow from "@/components/BarRow";
import DataTable, { type Column } from "@/components/DataTable";
import GradeBadge from "@/components/GradeBadge";
import KpiCard from "@/components/KpiCard";
import PageHeader from "@/components/PageHeader";
import { getBuyers, type Buyer } from "@/lib/buyers";
import { int, pct, usd } from "@/lib/format";
import { byRegion, filterByGrade, gradeCounts, isGrade, kpis, topRisk } from "@/lib/metrics";

export const dynamic = "force-dynamic";

export const metadata = { title: "바이어" };

// 바이어 목록 — KPI · 위험 상위 10 · 지역별은 언제나 전체 기준, 등급 칩(?grade=)은 '전체 목록'만 거른다.

function BuyerLink({ buyer, rank }: { buyer: Buyer; rank?: number }) {
  return (
    <div>
      <Link
        href={`/buyers/${buyer.id}`}
        className="inline-flex min-h-11 items-center text-accent underline-offset-2 hover:underline"
      >
        {rank ? `${rank}. ${buyer.name}` : buyer.name}
      </Link>
      <p className="num text-xs text-muted">{buyer.id}</p>
    </div>
  );
}

const TOP_COLUMNS: Column[] = [
  { key: "buyer", label: "바이어" },
  { key: "country", label: "나라" },
  { key: "grade", label: "등급" },
  { key: "pd", label: "위험 점수", align: "right" },
  { key: "ar", label: "채권", align: "right" },
  { key: "overdue", label: "연체", align: "right" },
  { key: "signal", label: "첫 신호" },
];

const LIST_COLUMNS: Column[] = TOP_COLUMNS.slice(0, 6);

function row(buyer: Buyer, rank?: number) {
  return {
    buyer: <BuyerLink buyer={buyer} rank={rank} />,
    country: buyer.countryKo,
    grade: <GradeBadge grade={buyer.grade} />,
    pd: pct(buyer.pd30d),
    ar: usd(buyer.openArUsd),
    overdue: usd(buyer.overdueUsd),
    signal: buyer.signals[0] ?? "—",
  };
}

export default async function Page({ searchParams }: { searchParams: Promise<{ grade?: string | string[] }> }) {
  const { grade: gradeParam } = await searchParams;
  const raw = Array.isArray(gradeParam) ? gradeParam[0] : gradeParam;
  const selected = isGrade(raw) ? raw : null;

  const buyers = await getBuyers();
  const k = kpis(buyers);
  const counts = gradeCounts(buyers);
  const top = topRisk(buyers, 10);
  const regions = byRegion(buyers);
  const maxRegionAr = Math.max(0, ...regions.map((r) => r.arAll));
  const strongRegion = regions.reduce<(typeof regions)[number] | null>(
    (best, r) => (r.shareC !== null && (best === null || (best.shareC ?? -1) < r.shareC) ? r : best),
    null,
  );
  const list = filterByGrade(buyers, selected);

  const chips = [
    { label: `전체 ${int(k.countAll)}`, href: "/buyers", active: selected === null },
    ...counts.map((c) => ({
      label: `${c.grade} ${int(c.count)}`,
      href: `/buyers?grade=${c.grade}`,
      active: selected === c.grade,
    })),
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`바이어 ${int(k.countAll)}곳`}
        asof="2026-09-30 · (가상) 합성 데이터"
        line="위험 점수는 판단을 돕는 값이고, 결정은 사람이 합니다."
      />

      <section aria-label="요약 숫자" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="위험 바이어(C등급)" value={`${int(k.countC)}곳`} />
        <KpiCard label="C등급 채권" value={usd(k.arC)} sub={`전체의 ${pct(k.shareC)}`} />
        <KpiCard label="전체 채권" value={usd(k.arAll)} sub={`${int(k.countAll)}곳`} />
        <KpiCard label="연체 금액" value={usd(k.overdueUsd)} sub={`${int(k.countOverdue)}곳`} />
      </section>

      <section aria-labelledby="top-risk" className="space-y-3">
        <h2 id="top-risk" className="text-lg font-semibold text-ink">
          위험 상위 10
        </h2>
        <DataTable columns={TOP_COLUMNS} rows={top.map((b, i) => row(b, i + 1))} caption="위험 점수 큰 순" />
      </section>

      <section aria-labelledby="by-region" className="space-y-3">
        <h2 id="by-region" className="text-lg font-semibold text-ink">
          지역별 채권
        </h2>
        <div className="divide-y divide-line rounded-lg border border-line p-3">
          {regions.map((r) => (
            <div key={r.region} className="py-1">
              <BarRow
                label={r.region}
                value={r.arAll}
                max={maxRegionAr}
                display={usd(r.arAll)}
                strong={r.region === strongRegion?.region}
              />
              <p className="text-xs text-muted">
                C등급 <span className="num">{usd(r.arC)}</span> · <span className="num">{pct(r.shareC)}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="all-list" className="space-y-3">
        <h2 id="all-list" className="text-lg font-semibold text-ink">
          전체 목록
        </h2>
        <ul className="flex flex-wrap gap-2" aria-label="등급으로 거르기">
          {chips.map((c) => (
            <li key={c.href}>
              <Link
                href={c.href}
                aria-current={c.active ? "page" : undefined}
                className={`num flex min-h-11 items-center rounded-md border px-4 text-sm ${
                  c.active ? "border-accent bg-accent text-white" : "border-line text-ink hover:bg-surface"
                }`}
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted">
          {selected ? `${selected}등급` : "전체"} <span className="num">{int(list.length)}곳</span>
        </p>
        <DataTable columns={LIST_COLUMNS} rows={list.map((b) => row(b))} />
      </section>
    </div>
  );
}
