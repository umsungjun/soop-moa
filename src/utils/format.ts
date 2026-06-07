/** 12345 → "1.2만", 980 → "980" */
export function formatViewerCount(count: number): string {
  if (count >= 10_000) {
    const man = count / 10_000;
    return `${man.toFixed(man >= 100 ? 0 : 1).replace(/\.0$/, "")}만`;
  }
  return count.toLocaleString("ko-KR");
}

/** ISO-ish date string → "3시간 전" style relative time. */
export function formatRelativeTime(input?: string): string {
  if (!input) return "";
  const date = new Date(input.replace(" ", "T"));
  const ts = date.getTime();
  if (Number.isNaN(ts)) return "";

  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 60) return "방금";
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  return `${day}일 전`;
}
