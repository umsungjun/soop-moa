import { nanoid } from "nanoid";
import { MAX_PANELS, DEFAULT_PANEL_OPTIONS } from "../constants";
import type { Panel } from "../types";
import { isValidBjId } from "./validate-bj-id";

const EMPTY = "_";

/** Panels → { v, o } query params. */
export function encodePanels(panels: Panel[]): { v: string; o: string } {
  const v = panels.map((p) => (p.bjId ? p.bjId : EMPTY)).join("|");
  const o = panels
    .map((p) => `m${p.options.muted ? 1 : 0}c${p.options.chat ? 1 : 0}`)
    .join("|");
  return { v, o };
}

export function newPanel(bjId: string | null): Panel {
  return {
    id: nanoid(6),
    bjId,
    options: { ...DEFAULT_PANEL_OPTIONS },
  };
}

/** Query params → Panels. Returns null when there is nothing to restore. */
export function decodePanels(
  v: string | null,
  o: string | null,
): Panel[] | null {
  if (!v) return null;

  const ids = v.split("|").slice(0, MAX_PANELS);
  const opts = (o ?? "").split("|");

  const panels: Panel[] = ids.map((raw, i) => {
    const bjId = raw !== EMPTY && isValidBjId(raw) ? raw : null;
    const optRaw = opts[i] ?? "";
    const muted = optRaw.includes("m0") ? false : true;
    const chat = optRaw.includes("c1");
    return { id: nanoid(6), bjId, options: { muted, chat } };
  });

  return panels.length > 0 ? panels : null;
}
