"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePost } from "../hooks/use-create-post";
import { validatePostBody, validatePostTitle } from "../utils/validators";

/** 글 작성 폼 — 수동 검증(direct-id-tab.tsx 패턴), 제목 Input + 본문 Textarea. */
export default function PostForm() {
  const { createPost, isSubmitting } = useCreatePost();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const titleError = validatePostTitle(title);
    const bodyError = validatePostBody(body);
    if (titleError || bodyError) {
      setError(titleError ?? bodyError);
      return;
    }
    setError(null);
    createPost({ title: title.trim(), body: body.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="post-title" className="text-sm font-medium">
          제목
        </label>
        <Input
          id="post-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          maxLength={200}
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="post-body" className="text-sm font-medium">
            내용
          </label>
          <span className="text-muted-foreground text-xs tabular-nums">
            {body.length.toLocaleString("ko-KR")}/10,000
          </span>
        </div>
        <Textarea
          id="post-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="내용을 입력하세요"
          maxLength={10000}
          className="min-h-60"
        />
      </div>

      {error ? <p className="text-destructive text-xs">{error}</p> : null}

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/community" />}
        >
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "등록 중…" : "등록"}
        </Button>
      </div>
    </form>
  );
}
