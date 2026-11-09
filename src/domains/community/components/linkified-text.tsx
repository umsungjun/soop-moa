import { splitLinks } from "../utils/linkify";

interface LinkifiedTextProps {
  text: string;
}

/** 글·댓글 본문의 http(s) 주소를 새 탭 링크로 바꿔 그린다. 줄바꿈은 감싸는 요소의 whitespace-pre-wrap이 맡는다. */
export default function LinkifiedText({ text }: LinkifiedTextProps) {
  return splitLinks(text).map((seg, i) =>
    seg.type === "link" ? (
      <a
        key={i}
        href={seg.value}
        target="_blank"
        // 사용자가 쓴 링크라 검색엔진에 추천 신호를 주지 않는다(ugc·nofollow)
        rel="ugc nofollow noopener noreferrer"
        className="text-primary break-all underline underline-offset-2"
      >
        {seg.value}
      </a>
    ) : (
      seg.value
    ),
  );
}
