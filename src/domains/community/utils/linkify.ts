export type TextSegment =
  | { type: "text"; value: string }
  | { type: "link"; value: string };

// URL에 쓰이는 ASCII 문자만 잡는다. 한글은 넣지 않아야 "https://youtu.be/abc에서"처럼 붙여 쓴 조사가 주소에 섞이지 않는다
const URL_RE = /https?:\/\/[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=%]+/g;
// 문장 끝 마침표·쉼표나 주소를 감싼 괄호가 주소 끝에 붙어 잡히는 경우를 떼어 낸다
const TRAILING_RE = /[.,!?;:'"\]]+$/;

const trimTrailing = (url: string): string => {
  let out = url.replace(TRAILING_RE, "");
  // 여는 괄호 없이 닫는 괄호로 끝나면 "(https://...)"의 닫는 괄호로 본다
  while (out.endsWith(")") && !out.includes("(")) {
    out = out.slice(0, -1).replace(TRAILING_RE, "");
  }
  return out;
};

/** 본문을 텍스트와 http(s) 링크 조각으로 나눈다. HTML을 만들지 않으니 렌더 쪽에서 React가 그대로 이스케이프한다. */
export const splitLinks = (text: string): TextSegment[] => {
  const segments: TextSegment[] = [];
  let last = 0;
  for (const match of text.matchAll(URL_RE)) {
    const url = trimTrailing(match[0]);
    const start = match.index;
    if (start > last)
      segments.push({ type: "text", value: text.slice(last, start) });
    segments.push({ type: "link", value: url });
    last = start + url.length;
  }
  if (last < text.length)
    segments.push({ type: "text", value: text.slice(last) });
  return segments;
};
