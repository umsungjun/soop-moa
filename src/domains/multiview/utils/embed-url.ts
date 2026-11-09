import { SOOP_PLAY_BASE } from "@/lib/soop/endpoints";
import { DEFAULT_PANEL_OPTIONS } from "../constants";

interface EmbedParams {
  bjId: string;
  autoPlay?: boolean;
  muted?: boolean;
  chat?: boolean;
}

/**
 * Builds the SOOP live embed iframe src.
 *   https://play.sooplive.com/{bjId}/embed?autoPlay=&mutePlay=&showChat=
 */
export function buildEmbedSrc({
  bjId,
  autoPlay = true,
  muted = DEFAULT_PANEL_OPTIONS.muted,
  chat = DEFAULT_PANEL_OPTIONS.chat,
}: EmbedParams): string {
  const query = new URLSearchParams({
    autoPlay: String(autoPlay),
    mutePlay: String(muted),
    showChat: String(chat),
  });
  return `${SOOP_PLAY_BASE}/${encodeURIComponent(bjId)}/embed?${query.toString()}`;
}

// SOOP는 UA로 모바일 임베드를 골라 주고, 모바일 임베드엔 채팅이 없어 showChat이 무시된다.
// 실측: iPhone·iPad·Android 폰은 모바일, Android 태블릿(UA에 Mobile 없음)과 iPadOS 기본(Mac UA)은 PC 임베드
const SOOP_MOBILE_UA = /Mobi|iPhone|iPad|iPod/i;

export const isSoopMobileUA = (ua: string): boolean => SOOP_MOBILE_UA.test(ua);

/** Watch page (used as fallback link when embed is blocked/offline). */
export function buildWatchUrl(bjId: string): string {
  return `${SOOP_PLAY_BASE}/${encodeURIComponent(bjId)}`;
}
