"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import { addReview } from "@/app/buyers/[id]/actions";
import Notice from "@/components/Notice";

// 확인 기록 입력 칸 — 검사는 서버(addReview)가 한다. 그래서 maxLength · required를 두지 않는다.
// <form action>으로 보내면 React가 결과와 상관없이 칸을 처음 값으로 되돌리므로 onSubmit으로 보낸다.

type ReviewState = { ok: boolean; message: string };

const INITIAL: ReviewState = { ok: false, message: "" };
const STATUSES = ["확인 필요", "확인 완료", "보류"] as const;
const MEMO_MAX = 200;

const STATUS_STYLE: Record<string, string> = {
  "확인 필요": "border-warn text-warn",
  "확인 완료": "border-accent text-accent",
  보류: "border-line text-muted",
};

/** 확인 기록 상태 배지: 색 + 글자(색만으로 구분하지 않는다) */
export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLE[status] ?? "border-line text-muted";
  return (
    <span className={`inline-flex items-center rounded border px-1.5 text-sm font-semibold whitespace-nowrap ${style}`}>
      {status}
    </span>
  );
}

export default function ReviewForm({ buyerId }: { buyerId: string }) {
  const [state, formAction, pending] = useActionState(addReview, INITIAL);
  const [memo, setMemo] = useState("");

  // 저장되면 메모 칸만 비운다(상태 · 별명은 남긴다)
  const [seen, setSeen] = useState(state);
  if (state !== seen) {
    setSeen(state);
    if (state.ok) setMemo("");
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-line p-4">
      <input type="hidden" name="buyerId" value={buyerId} />

      <fieldset className="space-y-2">
        <legend className="text-sm text-muted">상태</legend>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <label
              key={s}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-line px-3 text-ink has-[:checked]:border-accent"
            >
              <input type="radio" name="status" value={s} defaultChecked={s === "확인 필요"} />
              {s}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-1">
        <label htmlFor="review-memo" className="text-sm text-muted">
          메모
        </label>
        <textarea
          id="review-memo"
          name="memo"
          rows={3}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="예: 다음 주 입금 약속 — 전화로 확인"
          className="block w-full rounded-md border border-line bg-bg p-3 text-ink"
        />
        <p className={`num text-right text-sm ${memo.trim().length > MEMO_MAX ? "text-warn" : "text-muted"}`}>
          {memo.trim().length}/{MEMO_MAX}
        </p>
      </div>

      <div className="space-y-1">
        <label htmlFor="review-reviewer" className="text-sm text-muted">
          확인한 사람(별명)
        </label>
        <input
          id="review-reviewer"
          name="reviewer"
          type="text"
          placeholder="실명 대신 별명"
          className="block min-h-11 w-full rounded-md border border-line bg-bg px-3 text-ink"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center rounded-md bg-accent px-4 font-semibold text-white disabled:opacity-60"
      >
        {pending ? "저장 중…" : "기록 남기기"}
      </button>

      {state.message ? <Notice tone={state.ok ? "ok" : "warn"} title={state.message} /> : null}
    </form>
  );
}
