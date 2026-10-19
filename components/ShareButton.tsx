"use client";

import { useState } from "react";

// 이 쪽 보내기: 휴대폰은 공유 창(navigator.share), 공유 창이 없으면 주소 복사(navigator.clipboard).
// 앱이 직접 보내지 않는다 — 받을 사람은 사람이 공유 창에서 고른다. 값은 서버에서 만든 글자만 props로 받는다.
export default function ShareButton({ title, text, path }: { title: string; text: string; path: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function share() {
    const url = new URL(path, window.location.origin).toString();
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        setStatus("idle");
        return;
      } catch (e) {
        // 사람이 공유 창을 닫은 것 — 안내 없이 끝낸다.
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={share}
        className="inline-flex min-h-11 items-center rounded-md bg-accent px-4 font-semibold text-white"
      >
        이 바이어 보내기
      </button>
      <p className="text-sm text-muted" aria-live="polite">
        {status === "copied" ? "주소를 복사했습니다. 메신저에 붙여 넣어 보내세요." : null}
        {status === "failed" ? "복사하지 못했습니다. 주소창의 주소를 직접 복사해 주세요." : null}
      </p>
    </div>
  );
}
