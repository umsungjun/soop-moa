-- ============================================================================
-- 커뮤니티 알림 — 내 글에 댓글, 내 댓글에 답글이 달리면 알림을 쌓는다.
-- Supabase SQL 에디터에 그대로 붙여 실행한다. 0001_community.sql 이후에 실행.
--
-- 설계 요약:
--  - 알림은 comments INSERT 트리거가 만든다. 댓글 작성 경로가 여러 개가 되어도 누락이 없고,
--    앱 코드는 읽기·읽음 처리만 한다.
--  - 수신자 식별자는 profiles.user_id(SOOP BJ id)다. 자기 글·댓글에 단 댓글은 알리지 않는다.
--  - 댓글·글이 soft delete되면 그 알림도 지운다. 지워진 글로 가는 알림이 남지 않게 한다.
--  - RLS는 0001과 같이 "활성 + 정책 0개"로 잠근다(service_role만 접근).
-- ============================================================================

create table public.notifications (
  id                  uuid primary key default gen_random_uuid(),
  recipient_id        text not null references public.profiles(user_id) on delete cascade,
  type                text not null check (type in ('comment','reply')),
  post_id             uuid not null references public.posts(id) on delete cascade,
  comment_id          uuid not null references public.comments(id) on delete cascade,
  actor_id            text not null,
  actor_nick          text not null,          -- 작성 시점 스냅샷
  actor_profile_image text,
  preview             text not null,          -- 댓글 앞 100자 스냅샷
  read_at             timestamptz,
  created_at          timestamptz not null default now()
);
create index notifications_recipient_created_idx
  on public.notifications (recipient_id, created_at desc);
-- 헤더 배지의 안 읽은 수 집계용
create index notifications_recipient_unread_idx
  on public.notifications (recipient_id) where read_at is null;

-- ── 댓글 작성 → 알림 생성 ───────────────────────────────────────────────────
-- 답글이면 원댓글 작성자에게 'reply', 글 작성자에게 'comment'.
-- 글 작성자가 곧 원댓글 작성자면 'reply' 하나만 보낸다.
create or replace function public.notify_on_comment()
returns trigger language plpgsql as $$
declare
  post_author   text;
  parent_author text;
  snippet       text := left(regexp_replace(new.body, '\s+', ' ', 'g'), 100);
begin
  select author_id into post_author
    from public.posts where id = new.post_id and deleted_at is null;
  if new.parent_id is not null then
    select author_id into parent_author
      from public.comments where id = new.parent_id and deleted_at is null;
  end if;

  if parent_author is not null and parent_author <> new.author_id then
    insert into public.notifications
      (recipient_id, type, post_id, comment_id, actor_id, actor_nick, actor_profile_image, preview)
    values
      (parent_author, 'reply', new.post_id, new.id, new.author_id, new.author_nick, new.author_profile_image, snippet);
  end if;

  if post_author is not null
     and post_author <> new.author_id
     and post_author is distinct from parent_author then
    insert into public.notifications
      (recipient_id, type, post_id, comment_id, actor_id, actor_nick, actor_profile_image, preview)
    values
      (post_author, 'comment', new.post_id, new.id, new.author_id, new.author_nick, new.author_profile_image, snippet);
  end if;

  return new;
end $$;
create trigger trg_notify_on_comment
  after insert on public.comments
  for each row execute function public.notify_on_comment();

-- ── soft delete → 알림 정리 ─────────────────────────────────────────────────
create or replace function public.clear_comment_notifications()
returns trigger language plpgsql as $$
begin
  if new.deleted_at is not null and old.deleted_at is null then
    delete from public.notifications where comment_id = new.id;
  end if;
  return new;
end $$;
create trigger trg_clear_comment_notifications
  after update of deleted_at on public.comments
  for each row execute function public.clear_comment_notifications();

create or replace function public.clear_post_notifications()
returns trigger language plpgsql as $$
begin
  if new.deleted_at is not null and old.deleted_at is null then
    delete from public.notifications where post_id = new.id;
  end if;
  return new;
end $$;
create trigger trg_clear_post_notifications
  after update of deleted_at on public.posts
  for each row execute function public.clear_post_notifications();

alter table public.notifications enable row level security;
