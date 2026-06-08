"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { ReactionResponse, ReactionValue } from "../types";

interface ReactionState {
  likeCount: number;
  dislikeCount: number;
  myReaction: ReactionValue | null;
}

/** 서버에서 받은 다음 상태를 동기적으로 계산(낙관적 갱신용). */
const computeOptimistic = (
  prev: ReactionState,
  value: ReactionValue,
): ReactionState => {
  const next = { ...prev };
  // 기존 반응 제거
  if (prev.myReaction === "like") next.likeCount -= 1;
  if (prev.myReaction === "dislike") next.dislikeCount -= 1;

  if (prev.myReaction === value) {
    next.myReaction = null; // 같은 값 재클릭 → 해제
  } else {
    next.myReaction = value; // 새로 누르거나 전환
    if (value === "like") next.likeCount += 1;
    else next.dislikeCount += 1;
  }
  return next;
};

/** 좋아요/싫어요 토글 — 낙관적 갱신 후 실패 시 롤백. */
export const useReaction = (postId: string, initial: ReactionState) => {
  const [state, setState] = useState<ReactionState>(initial);
  const [isPending, setIsPending] = useState(false);

  const react = async (value: ReactionValue) => {
    const previous = state;
    setState(computeOptimistic(previous, value));
    setIsPending(true);
    try {
      const res = await fetch(`/api/community/posts/${postId}/reaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? "반응 처리에 실패했습니다.");
      }
      // 서버가 돌려준 정확한 카운트로 동기화
      const data = (await res.json()) as ReactionResponse;
      setState({
        likeCount: data.likeCount,
        dislikeCount: data.dislikeCount,
        myReaction: data.myReaction,
      });
    } catch (err) {
      setState(previous); // 롤백
      toast.error(
        err instanceof Error ? err.message : "반응 처리에 실패했습니다.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return { ...state, react, isPending };
};
