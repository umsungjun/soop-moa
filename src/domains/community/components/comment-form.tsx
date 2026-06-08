"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { validateCommentBody } from "../utils/validators";

interface CommentFormProps {
  onSubmit: (body: string) => Promise<boolean>; // 성공 시 true → 입력 초기화
  submitLabel?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
}

/** 댓글/대댓글 공용 입력 폼 (로그인된 사용자에게만 렌더된다). */
export default function CommentForm({
  onSubmit,
  submitLabel = "등록",
  placeholder = "댓글을 입력하세요",
  autoFocus = false,
  onCancel,
}: CommentFormProps) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bodyError = validateCommentBody(body);
    if (bodyError) {
      setError(bodyError);
      return;
    }
    setError(null);
    setIsSubmitting(true);
    const ok = await onSubmit(body.trim());
    setIsSubmitting(false);
    if (ok) setBody("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        maxLength={2000}
        autoFocus={autoFocus}
        className="min-h-16"
      />
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
      <div className="flex items-center justify-end gap-2">
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            취소
          </Button>
        ) : null}
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "등록 중…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
