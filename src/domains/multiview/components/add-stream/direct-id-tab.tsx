"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseBjId } from "@/domains/multiview/utils/validate-bj-id";

interface DirectIdTabProps {
  onSubmit: (bjId: string) => void;
  /** 사이드바처럼 상시 노출되는 곳에선 자동 포커스를 끈다. */
  autoFocus?: boolean;
}

export function DirectIdTab({ onSubmit, autoFocus = true }: DirectIdTabProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const bjId = parseBjId(value);
    if (!bjId) {
      setError("올바른 BJ 아이디 또는 방송 주소를 입력해 주세요.");
      return;
    }
    setError(null);
    onSubmit(bjId);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 py-2">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="bj-id" className="text-sm font-medium">
          BJ 아이디 또는 방송 주소
        </label>
        <Input
          id="bj-id"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="예: woowakgood 또는 play.sooplive.com/woowakgood"
          autoComplete="off"
          autoFocus={autoFocus}
        />
        {error ? (
          <p className="text-destructive text-xs">{error}</p>
        ) : (
          <p className="text-muted-foreground text-xs">
            방송 페이지 주소를 붙여넣어도 자동으로 인식됩니다.
          </p>
        )}
      </div>
      <Button type="submit" className="gap-1.5 self-end">
        <Plus className="size-4" />
        추가
      </Button>
    </form>
  );
}
