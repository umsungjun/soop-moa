const BJ_ID_RE = /^[A-Za-z0-9_]{3,20}$/;

export function isValidBjId(value: string): boolean {
  return BJ_ID_RE.test(value);
}

/** Extracts a BJ id from a raw input that may be a full SOOP URL. */
export function parseBjId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // play.sooplive.com/{bjId}[/{broadNo}]
  const urlMatch = trimmed.match(
    /sooplive\.(?:com|co\.kr)\/([A-Za-z0-9_]{3,20})/i,
  );
  const candidate = urlMatch ? urlMatch[1] : trimmed;
  return isValidBjId(candidate) ? candidate : null;
}
