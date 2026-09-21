"use client";

import { Plus, X } from "lucide-react";

interface PanelEmptyStateProps {
  onAdd: () => void;
  onRemove?: () => void;
  canRemove?: boolean;
}

export function PanelEmptyState({
  onAdd,
  onRemove,
  canRemove,
}: PanelEmptyStateProps) {
  return (
    <div className="group/empty bg-card relative flex size-full items-center justify-center p-4">
      {canRemove && onRemove ? (
        <button
          type="button"
          aria-label="패널 닫기"
          onClick={onRemove}
          className="text-muted-foreground hover:bg-muted absolute top-2 right-2 flex size-7 items-center justify-center rounded-md transition-colors"
        >
          <X className="size-4" />
        </button>
      ) : null}

      <button
        type="button"
        onClick={onAdd}
        className="border-border text-muted-foreground hover:border-primary/60 hover:text-primary flex w-full max-w-[220px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-colors"
      >
        <span className="bg-muted group-hover/empty:bg-primary/10 flex size-12 items-center justify-center rounded-full transition-colors">
          <Plus className="size-6" />
        </span>
        <span className="text-sm font-medium">방송 추가하기</span>
      </button>

      {/* 첫 방문(유일한 빈 패널)에만 가이드 링크를 보여준다. 4분할의 작은 패널에서는 버튼과 겹칠 수 있어 숨긴다. /multiview에는 Footer가 없어 이 링크가 가이드로 가는 유일한 보이는 경로다. */}
      {!canRemove ? (
        <a
          href="/guide"
          className="text-muted-foreground hover:text-primary absolute inset-x-0 bottom-3 text-center text-xs underline-offset-4 hover:underline"
        >
          처음이신가요? 사용 가이드 보기
        </a>
      ) : null}
    </div>
  );
}
