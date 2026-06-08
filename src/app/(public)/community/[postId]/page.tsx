import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import AuthorBadge from "@/domains/community/components/author-badge";
import CommentSection from "@/domains/community/components/comment-section";
import PostActions from "@/domains/community/components/post-actions";
import ReactionButtons from "@/domains/community/components/reaction-buttons";
import { getSession, isAuthenticated } from "@/lib/session/helpers";
import { bjIdFromProfileImage } from "@/lib/soop/profile";
import { getPost } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ postId: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { postId } = await params;
  try {
    const post = await getPost(postId);
    if (!post || post.isDeleted) {
      return { title: "커뮤니티", robots: { index: false, follow: false } };
    }
    const description = post.body.slice(0, 120);
    return {
      title: post.title,
      description,
      alternates: { canonical: `/community/${postId}` },
      openGraph: {
        title: post.title,
        description,
        url: `/community/${postId}`,
      },
    };
  } catch {
    return { title: "커뮤니티" };
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  const { postId } = await params;
  const session = await getSession();
  const viewerId = isAuthenticated(session)
    ? (session.user?.userId ?? bjIdFromProfileImage(session.user?.profileImage))
    : undefined;
  const post = await getPost(postId, viewerId);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <Link
        href="/community"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" />
        목록
      </Link>

      {post.isDeleted ? (
        <div className="ring-foreground/10 rounded-xl bg-card p-6 ring-1">
          <p className="text-muted-foreground italic">삭제된 글입니다.</p>
        </div>
      ) : (
        <article className="ring-foreground/10 rounded-xl bg-card p-6 ring-1">
          <header className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-bold tracking-tight break-words">
              {post.title}
            </h1>
            <PostActions postId={post.id} authorId={post.author.userId} />
          </header>
          <AuthorBadge
            author={post.author}
            createdAt={post.createdAt}
            className="mt-2"
          />
          <div className="mt-5 text-sm leading-relaxed break-words whitespace-pre-wrap">
            {post.body}
          </div>
          <div className="mt-6 flex justify-center">
            <ReactionButtons
              postId={post.id}
              initialLikeCount={post.likeCount}
              initialDislikeCount={post.dislikeCount}
              initialMyReaction={post.myReaction}
            />
          </div>
        </article>
      )}

      <CommentSection postId={post.id} />
    </div>
  );
}
