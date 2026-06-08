import { MessageSquareText } from "lucide-react";

/** 글이 하나도 없을 때의 빈 상태 안내. */
export default function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <div className="from-primary/15 to-brand-accent/10 text-primary flex size-16 items-center justify-center rounded-2xl bg-linear-to-br">
        <MessageSquareText className="size-8" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">아직 글이 없습니다</p>
        <p className="text-muted-foreground text-sm">첫 글을 남겨보세요.</p>
      </div>
    </div>
  );
}
