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
    </div>
  );
}
