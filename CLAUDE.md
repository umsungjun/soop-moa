# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 코드 주석은 한국어로

이 저장소의 코드 주석은 **한국어로** 작성합니다 — 파일 상단 설명, JSDoc, 인라인 주석 모두 해당합니다. 식별자(변수·함수·타입 이름)와 로그 메시지는 영어를 그대로 둡니다.

## Next.js 16 주의

This repo runs **Next.js 16** (App Router, React 19). APIs and conventions differ from older Next.js — read the relevant guide in `node_modules/next/dist/docs/` before reaching for framework APIs, and heed deprecation notices.

## Commands

```bash
pnpm dev              # 개발 서버 (localhost:3000)
pnpm build            # 프로덕션 빌드
pnpm start            # 빌드 결과 실행
pnpm lint             # ESLint (eslint-config-next)
pnpm format           # Prettier 포맷 + import 정렬
npx tsc --noEmit      # 타입 체크 (별도 test 러너 없음)
```

- Package manager is **pnpm** (`pnpm-lock.yaml`). No test runner is configured — use `tsc --noEmit` + `pnpm lint` to validate.
- Path alias: `@/*` → `src/*`.

## Architecture

**SOOP 모아** — SOOP(아프리카TV) 라이브 방송 여러 개를 한 화면에서 동시에 보는 멀티뷰 도구. 공식 SOOP 임베드 플레이어 + Open API 기반의 비공식 팬 메이드 서비스.

### Domain-based structure

Feature code lives under `src/domains/{auth,community,live,multiview}`, each self-contained with its own `components/ hooks/ utils/ types.ts`. Cross-cutting code lives in `src/lib` (server clients, session, env), `src/components` (`layout/` + shadcn `ui/` primitives), `src/config/site.ts`, `src/hooks`, `src/utils`. Keep feature logic inside its domain; promote to `lib`/`components` only once it is genuinely shared.

### Server boundary & SOOP API

- `src/lib/soop/client.ts` is the **only** place that talks to the SOOP API and is `import "server-only"`. It wraps OAuth (authorization_code + refresh), broadcast list, category list, and authenticated station info, normalizing raw SOOP fields (`SoopBroadcast` → `LiveBroadcast`). UI never calls SOOP directly — it goes through `src/app/api/soop/*` route handlers.
- `src/lib/env.ts` validates env with zod. `getServerEnv()` **throws if called on the client** — a guard against leaking `SOOP_CLIENT_SECRET` / `IRON_SESSION_PASSWORD` into the bundle. `NEXT_PUBLIC_*` vars are referenced statically so Next inlines them.
- Required env: `SOOP_CLIENT_SECRET`, `IRON_SESSION_PASSWORD` (≥32 chars), `NEXT_PUBLIC_SOOP_CLIENT_ID`, `NEXT_PUBLIC_SOOP_REDIRECT_URI`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server-only). Optional: `NEXT_PUBLIC_SUPABASE_ANON_KEY` (MVP 미사용), `CRON_SECRET` (heartbeat).

### Auth (iron-session, OAuth)

- Route handlers under `src/app/api/auth/{login,callback,refresh,logout,session}` drive the SOOP OAuth flow. Tokens are stored in an **encrypted iron-session cookie** (`src/lib/session/`) and never sent to the client.
- `getValidAccessToken()` (`session/helpers.ts`) returns a fresh token, auto-refreshing ~60s before expiry with in-flight dedup so concurrent requests share one refresh.
- The client learns auth state only via SWR: `useSession()` → `GET /api/auth/session` → `{ authenticated, user }`.

### Community board (Supabase)

- 텍스트 전용 게시판 (`/community`, `/community/[postId]`, `/community/write`). 로그인 사용자만 글·댓글·대댓글(1단계)·좋아요/싫어요가 가능하고 읽기는 공개. 본인 글·댓글은 soft delete.
- **첫 영속 저장소** — Supabase Postgres. `src/lib/supabase/client.ts`가 **service_role 키를 쥔 유일한 서버 전용(`import "server-only"`) 클라이언트**이고, 데이터 접근은 `src/lib/supabase/queries.ts`에 모은다. UI는 Supabase를 직접 호출하지 않고 `src/app/api/community/*` 라우트 핸들러를 거친다(SOOP API와 동일한 경계 패턴).
- **인증/권한** — 앱은 iron-session으로 인증하고 Supabase Auth는 쓰지 않는다. 라우트 핸들러가 `getSession()` + `isAuthenticated()`로 로그인·소유권을 강제한다(작성자 키 = `session.user.userId` = SOOP BJ id). service_role는 RLS를 우회하며, 모든 테이블은 **RLS 활성 + 정책 0개**로 잠가 anon 키를 무력화한다.
- **테이블** (`supabase/migrations/0001_community.sql`을 Supabase SQL 에디터에서 실행): `profiles`(작성자, 쓰기 시 upsert), `posts`(좋아요/싫어요/댓글 카운트는 트리거로 동기화), `comments`(self-FK `parent_id` + 트리거로 1단계 대댓글 제한), `reactions`(다형성 `target_type`/`target_id`, 사용자당 1표 unique·토글).
- **무료 티어 주의** — 7일 미활동 시 프로젝트 자동 일시정지. `vercel.json` Cron이 매일 `/api/community/heartbeat`(`CRON_SECRET` 보호)를 호출해 회피한다.
- 데이터 페칭: 목록은 TanStack Query 무한스크롤(keyset 커서, 서버에서 첫 페이지 프리페치), 상세 댓글·세션은 SWR. 새 UI 프리미티브 `src/components/ui/textarea.tsx` 추가.

### Multiview (the signature feature)

- All client state lives in `useMultiviewState()` (`domains/multiview/hooks`). State = `panels[]` (1..`MAX_PANELS` = 4) + per-group resize `sizes` + `focusedId` + `globalMuted`.
- **Persistence & sharing**: on mount, hydrate in priority order **URL (`?v=&o=`) → localStorage → default**; on change, persist debounced to both the URL (`history.replaceState`, 300ms) and localStorage (800ms).
- **URL codec** (`utils/url-codec.ts`): `v` = pipe-joined bjIds (`_` marks an empty slot), `o` = per-panel options `m{0|1}c{0|1}`. This is what makes a layout shareable by a single link.
- **Grid topology is fixed per panel count** (`components/grid/grid-layout.tsx`, distinct 1/2/3/4 layouts with custom drag-resize handles); only the drag ratios persist in `sizes`, and changing panel count resets them.
- Each panel renders a SOOP embed iframe built by `utils/embed-url.ts`.

### UI & styling

- Components are **shadcn** (`style: base-nova`) generated on top of **Base UI** (`@base-ui/react`) headless primitives in `src/components/ui/`. Base UI uses a polymorphic `render` prop; when a `Button` renders a non-`<button>` element (e.g. a navigation link), pass `nativeButton={false}` (Base UI defaults it to `true`, which warns otherwise).
- **Tailwind v4** — there is no `tailwind.config`. Theme tokens (the cool-blue "Cinema Grid" design system, light + dark) live in `@theme` / `:root` blocks in `src/app/globals.css`.
- Toasts via `sonner`, theming via `next-themes`, icons via `lucide-react`.

### Security headers

`next.config.ts` sets a strict CSP that only allows SOOP domains (`*.sooplive.com`, `*.sooplive.co.kr`, `*.afreecatv.com`) for `frame-src` / `img-src` / `media-src`, mirrored by `next/image` `remotePatterns`. New external origins must be whitelisted here or embeds/images break.

### Brand assets

Favicon / icon / logo / OG images are generated from `public/brand/source-hd.png` by `scripts/gen-brand.mjs` (`node scripts/gen-brand.mjs`, needs `sharp`). The HD master is produced once by `scripts/upscale-source.py` (EDSR super-resolution). Don't hand-edit the generated PNGs — regenerate them.
