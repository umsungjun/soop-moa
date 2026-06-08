import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";

/** 글이 하나도 없을 때의 빈 상태 + 글쓰기 CTA. */
export default function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <div className="bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-2xl">
        <MessageSquareText className="size-7" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">아직 글이 없습니다</p>
        <p className="text-muted-foreground text-sm">첫 글을 남겨보세요.</p>
      </div>
      <Button
        size="sm"
        nativeButton={false}
        render={<Link href="/community/write" />}
      >
        글쓰기
      </Button>
    </div>
  );
}
