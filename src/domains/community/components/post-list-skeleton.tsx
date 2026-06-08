import { Skeleton } from "@/components/ui/skeleton";

/** 글 목록 로딩 스켈레톤. */
export default function PostListSkeleton() {
  return (
    <ul className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <li
          key={i}
          className="ring-foreground/10 flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-sm ring-1"
        >
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </li>
      ))}
    </ul>
  );
}
