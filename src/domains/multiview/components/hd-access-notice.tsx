"use client";

import { useSyncExternalStore } from "react";
import { Info, X } from "lucide-react";

// 크롬/엣지의 로컬 네트워크 접근 정책 변경으로 고화질 시청이 막힐 때의 안내.
// SOOP 공지: https://sotong.sooplive.com/?board_type=servicenotice&work=view&b_no=9569
const LS_KEY = "soop-moa:multiview:hd-notice-dismissed";
const EVT = "soop-moa:hd-notice";
const NOTICE_URL =
  "https://sotong.sooplive.com/?board_type=servicenotice&work=view&b_no=9569";

function subscribe(onChange: () => void) {
  window.addEventListener(EVT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

// useSyncExternalStore로 localStorage를 읽어 effect 안 setState 없이 클라이언트 전용 값을 다룬다.
// 서버 스냅샷은 true(숨김)라 SSR/hydration 깜빡임이 없다.
function getSnapshot() {
  return localStorage.getItem(LS_KEY) === "1";
}
function getServerSnapshot() {
  return true;
}

export function HdAccessNotice() {
  const dismissed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  if (dismissed) return null;

  function dismiss() {
    localStorage.setItem(LS_KEY, "1");
    window.dispatchEvent(new Event(EVT));
  }

  return (
    <div className="border-border/60 bg-muted/40 text-muted-foreground flex items-start gap-2 border-b px-3 py-2 text-xs">
      <Info className="text-primary mt-0.5 size-3.5 shrink-0" />
      <p className="flex-1 text-pretty">
        크롬·엣지 업데이트 후 <strong className="font-medium">고화질 시청</strong>이
        막힌다면, 브라우저에서 <code>play.sooplive.com</code>의 &ldquo;기기에 있는
        앱(로컬 네트워크)&rdquo; 권한을 허용해 주세요.{" "}
        <a
          href={NOTICE_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="text-primary underline underline-offset-2"
        >
          해결 방법 보기
        </a>
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="안내 닫기"
        className="hover:text-foreground -mr-1 shrink-0 rounded p-0.5 transition-colors"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
