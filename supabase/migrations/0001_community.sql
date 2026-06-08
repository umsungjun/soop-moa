-- ============================================================================
-- 커뮤니티 게시판 (텍스트 전용) — 초기 스키마
-- Supabase SQL 에디터에 그대로 붙여 실행한다.
--
-- 설계 요약:
--  - 인증은 앱(SOOP OAuth + iron-session)이 담당하고 Supabase Auth는 쓰지 않는다.
--    모든 접근은 서버 라우트 핸들러가 service_role 키로 수행한다.
--  - 그래서 RLS는 "전부 활성 + 정책 0개"로 잠가 anon/authenticated 키를 무력화한다.
--    (service_role 키는 RLS를 우회하므로 서버에서만 데이터에 접근 가능)
--  - 작성자 식별자(profiles.user_id)는 SOOP BJ id(text)다.
-- ============================================================================

create extension if not exists pgcrypto; -- gen_random_uuid()

-- ── 공통: updated_at 자동 갱신 ───────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ── profiles : 작성자의 현재 식별 정보 (쓰기 시 upsert로 최신 유지) ──────────
create table public.profiles (
  user_id       text primary key,            -- SOOP BJ id (session.user.userId)
  nick          text not null,
  profile_image text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ── posts ────────────────────────────────────────────────────────────────────
create table public.posts (
  id                   uuid primary key default gen_random_uuid(),
  author_id            text not null references public.profiles(user_id) on delete restrict,
  author_nick          text not null,          -- 작성 시점 스냅샷 (목록 JOIN 회피)
  author_profile_image text,                   -- 작성 시점 스냅샷
  title                text not null check (char_length(title) between 1 and 200),
  body                 text not null check (char_length(body)  between 1 and 10000),
  like_count           integer not null default 0,
  dislike_count        integer not null default 0,
  comment_count        integer not null default 0,
  deleted_at           timestamptz,            -- soft delete
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
-- 최신순 keyset 페이지네이션 인덱스
create index posts_created_at_idx on public.posts (created_at desc, id desc);
create index posts_author_id_idx  on public.posts (author_id);
create trigger trg_posts_touch
  before update on public.posts
  for each row execute function public.touch_updated_at();

-- ── comments : 최상위 댓글 + 1단계 대댓글 ────────────────────────────────────
create table public.comments (
  id                   uuid primary key default gen_random_uuid(),
  post_id              uuid not null references public.posts(id) on delete cascade,
  parent_id            uuid references public.comments(id) on delete cascade, -- null = 최상위
  author_id            text not null references public.profiles(user_id) on delete restrict,
  author_nick          text not null,
  author_profile_image text,
  body                 text not null check (char_length(body) between 1 and 2000),
  deleted_at           timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index comments_post_id_created_idx on public.comments (post_id, created_at asc, id asc);
create index comments_parent_id_idx       on public.comments (parent_id);
create trigger trg_comments_touch
  before update on public.comments
  for each row execute function public.touch_updated_at();

-- 대댓글은 1단계까지만 허용 + 답글의 post_id는 부모와 동일해야 한다.
create or replace function public.enforce_comment_depth()
returns trigger language plpgsql as $$
declare
  parent_parent uuid;
  parent_post   uuid;
begin
  if new.parent_id is not null then
    select parent_id, post_id into parent_parent, parent_post
      from public.comments where id = new.parent_id;
    if parent_parent is not null then
      raise exception 'Replies may only be one level deep';
    end if;
    if parent_post <> new.post_id then
      raise exception 'Reply post_id must match parent post_id';
    end if;
  end if;
  return new;
end $$;
create trigger trg_enforce_comment_depth
  before insert or update on public.comments
  for each row execute function public.enforce_comment_depth();

-- ── reactions : 좋아요/싫어요 (MVP는 글 대상, 추후 댓글 확장 가능) ────────────
create table public.reactions (
  id          uuid primary key default gen_random_uuid(),
  target_type text not null default 'post' check (target_type in ('post','comment')),
  target_id   uuid not null,                  -- posts.id (MVP) 또는 comments.id (future)
  user_id     text not null references public.profiles(user_id) on delete cascade,
  value       text not null check (value in ('like','dislike')),
  created_at  timestamptz not null default now(),
  unique (target_type, target_id, user_id)    -- 사용자당 대상 1표
);
create index reactions_target_idx on public.reactions (target_type, target_id);

-- ── 카운터 동기화 트리거 ─────────────────────────────────────────────────────
-- 좋아요/싫어요 수: 토글(insert/update/delete)마다 절대값 재계산 → 항상 정확.
create or replace function public.sync_post_reaction_counts()
returns trigger language plpgsql as $$
declare
  tid   uuid;
  ttype text;
begin
  ttype := coalesce(new.target_type, old.target_type);
  if ttype <> 'post' then
    return coalesce(new, old);
  end if;
  tid := coalesce(new.target_id, old.target_id);
  update public.posts p set
    like_count    = (select count(*) from public.reactions r
                       where r.target_type = 'post' and r.target_id = tid and r.value = 'like'),
    dislike_count = (select count(*) from public.reactions r
                       where r.target_type = 'post' and r.target_id = tid and r.value = 'dislike')
  where p.id = tid;
  return coalesce(new, old);
end $$;
create trigger trg_sync_post_reaction_counts
  after insert or update or delete on public.reactions
  for each row execute function public.sync_post_reaction_counts();

-- 댓글 수: 삭제되지 않은 댓글만 집계.
create or replace function public.sync_post_comment_count()
returns trigger language plpgsql as $$
declare
  pid uuid;
begin
  pid := coalesce(new.post_id, old.post_id);
  update public.posts p set comment_count =
    (select count(*) from public.comments c where c.post_id = pid and c.deleted_at is null)
  where p.id = pid;
  return coalesce(new, old);
end $$;
create trigger trg_sync_post_comment_count
  after insert or update or delete on public.comments
  for each row execute function public.sync_post_comment_count();

-- ── RLS 잠금: 전부 활성화하고 정책은 만들지 않는다 ───────────────────────────
-- service_role 키(서버)는 RLS를 우회한다. anon/authenticated 키는 어떤 행에도
-- 접근할 수 없어, 설령 클라이언트에 anon 키가 노출돼도 데이터가 보호된다.
alter table public.profiles  enable row level security;
alter table public.posts     enable row level security;
alter table public.comments  enable row level security;
alter table public.reactions enable row level security;
