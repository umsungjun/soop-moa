import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { siteConfig } from "@/config/site";
import AuthorBadge from "@/domains/community/components/author-badge";
import CommentSection from "@/domains/community/components/comment-section";
import PostActions from "@/domains/community/components/post-actions";
import ReactionButtons from "@/domains/community/components/reaction-buttons";
import type { CommunityPost } from "@/domains/community/types";
import { JsonLd } from "@/lib/seo/json-ld";
import { breadcrumbList, SCHEMA_IDS } from "@/lib/seo/schema";
import { getSession, isAuthenticated } from "@/lib/session/helpers";
import { SOOP_STATION_BASE } from "@/lib/soop/endpoints";
import { bjIdFromProfileImage } from "@/lib/soop/profile";
import { getPost } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ postId: string }>;
}

/** 작성자의 SOOP 방송국 주소 — OGP article:author와 schema.org Person.url은 프로필 URL을 기대한다. */
function authorUrl(userId: string) {
  return `${SOOP_STATION_BASE}/${encodeURIComponent(userId)}`;
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
    // 줄바꿈·연속 공백을 정리해 스니펫이 한 줄로 읽히게 한다.
    const description = post.body.replace(/\s+/g, " ").trim().slice(0, 120);
    return {
      title: post.title,
      description,
      alternates: { canonical: `/community/${postId}` },
      // 페이지 openGraph는 루트를 통째로 덮어쓰므로 siteName·locale을 다시 명시한다. title·description은 위 값을 자동 상속한다.
      // 글 수정 기능이 없고 updated_at은 좋아요·댓글 카운터로도 갱신되므로 modifiedTime은 넣지 않는다.
      openGraph: {
        type: "article",
        siteName: siteConfig.name,
        locale: siteConfig.locale,
        url: `/community/${postId}`,
        publishedTime: post.createdAt,
        authors: [authorUrl(post.author.userId)],
      },
    };
  } catch {
    return { title: "커뮤니티" };
  }
}

/**
 * 글 상세 구조화 데이터 — Google이 포럼형 UGC에 쓰는 DiscussionForumPosting(필수: author.name, datePublished, text) + 빵부스러기.
 * 제목·본문이 사용자 입력이라 JsonLd 컴포넌트의 "<" 이스케이프가 여기서 실제로 의미를 가진다.
 */
function buildPostJsonLd(post: CommunityPost) {
  const postUrl = `${siteConfig.url}/community/${post.id}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DiscussionForumPosting",
        "@id": `${postUrl}#post`,
        url: postUrl,
        mainEntityOfPage: postUrl,
        headline: post.title,
        text: post.body,
        author: {
          "@type": "Person",
          name: post.author.nick,
          url: authorUrl(post.author.userId),
          ...(post.author.profileImage
            ? { image: post.author.profileImage }
            : {}),
        },
        datePublished: post.createdAt,
        inLanguage: "ko-KR",
        isPartOf: { "@id": SCHEMA_IDS.website },
        publisher: { "@id": SCHEMA_IDS.publisher },
        commentCount: post.commentCount,
        interactionStatistic: [
          {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/LikeAction",
            userInteractionCount: post.likeCount,
          },
          {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/DislikeAction",
            userInteractionCount: post.dislikeCount,
          },
          {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/CommentAction",
            userInteractionCount: post.commentCount,
          },
        ],
      },
      breadcrumbList([
        { name: "홈", url: `${siteConfig.url}/` },
        { name: "커뮤니티", url: `${siteConfig.url}/community` },
        { name: post.title, url: postUrl },
      ]),
    ],
  };
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
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* 삭제된 글은 noindex라 구조화 데이터를 내보내지 않는다. */}
      {!post.isDeleted ? <JsonLd data={buildPostJsonLd(post)} /> : null}

      <Link
        href="/community"
        className="text-muted-foreground hover:text-foreground bg-card ring-foreground/10 hover:ring-foreground/20 mb-6 inline-flex items-center gap-1 rounded-full py-1.5 pr-3.5 pl-2.5 text-sm shadow-sm ring-1 transition-all"
      >
        <ChevronLeft className="size-4" />
        목록
      </Link>

      {post.isDeleted ? (
        <div className="ring-foreground/10 rounded-2xl bg-card p-6 shadow-sm ring-1">
          <p className="text-muted-foreground italic">삭제된 글입니다.</p>
        </div>
      ) : (
        <article className="ring-foreground/10 rounded-2xl bg-card p-6 shadow-sm ring-1 sm:p-7">
          <header className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight break-words">
              {post.title}
            </h1>
            <PostActions postId={post.id} authorId={post.author.userId} />
          </header>
          <AuthorBadge
            author={post.author}
            createdAt={post.createdAt}
            className="mt-3"
          />
          <div className="border-border/60 mt-5 border-t pt-5 text-[0.95rem] leading-relaxed break-words whitespace-pre-wrap">
            {post.body}
          </div>
          <div className="mt-7 flex justify-center">
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
