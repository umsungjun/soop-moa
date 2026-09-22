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

/** Watch page (used as fallback link when embed is blocked/offline). */
export function buildWatchUrl(bjId: string): string {
  return `${SOOP_PLAY_BASE}/${encodeURIComponent(bjId)}`;
}
