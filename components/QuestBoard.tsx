import Link from "next/link";
import BarRow from "@/components/BarRow";
import Notice from "@/components/Notice";
import { int } from "@/lib/format";

// C등급 확인 퀘스트 진행판 — 수는 쪽(서버)에서 DB로 센 값을 그대로 받는다. 여기서는 세지 않는다.
// 확인 완료 = 그 바이어의 가장 최근 기록이 '확인 완료'. 아직 안 봄 = 기록이 하나도 없음. 나머지는 진행 중.
export default function QuestBoard({
  total,
  done,
  inProgress,
  unseen,
}: {
  total: number;
  done: number;
  inProgress: number;
  unseen: { id: string; name: string }[];
}) {
  return (
    <section aria-labelledby="c-quest" className="space-y-3">
      <h2 id="c-quest" className="text-lg font-semibold text-ink">
        C등급 확인 퀘스트
      </h2>
      <div className="rounded-lg border border-line p-3">
        <BarRow label="확인 완료" value={done} max={total} display={`${int(done)}/${int(total)}곳`} />
        <p className="text-sm text-muted">
          진행 중 <span className="num">{int(inProgress)}곳</span> · 아직 아무도 안 봄{" "}
          <span className="num">{int(unseen.length)}곳</span>
        </p>
      </div>

      {total > 0 && done === total ? (
        <Notice tone="ok" title={`${int(total)}곳 모두 확인 완료`} />
      ) : null}

      {unseen.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-muted">아직 아무도 안 본 곳 — 위험 점수 큰 순</p>
          <ul className="flex flex-wrap gap-2">
            {unseen.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/buyers/${b.id}`}
                  className="inline-flex min-h-11 items-center rounded-md border border-line px-3 text-accent hover:bg-surface"
                >
                  {b.id} · {b.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
