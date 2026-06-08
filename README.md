# SOOP 모아

SOOP(아프리카TV) 라이브 방송 여러 개를 한 화면에서 동시에 보는 **멀티뷰** 도구. 공식 SOOP 임베드 플레이어 + Open API 기반의 비공식 팬 메이드 서비스입니다.

## 주요 기능

- **멀티뷰** — 최대 4개 라이브를 한 화면에서 동시 시청, 마우스로 크기 조절, URL 하나로 레이아웃 공유
- **라이브 둘러보기** — 카테고리·시청자 수별 실시간 방송 목록, 클릭 한 번으로 멀티뷰에 추가
- **SOOP 로그인** — OAuth + iron-session(암호화 쿠키), 토큰은 클라이언트로 전송하지 않음
- **커뮤니티 게시판** — 텍스트 전용 글/댓글/대댓글 + 좋아요·싫어요 (Supabase)

## 시작하기

```bash
pnpm install
cp .env.local.example .env.local   # 값 채우기 (아래 환경 변수 참고)
pnpm dev                           # http://localhost:3000
```

검증: `npx tsc --noEmit` + `pnpm lint` (별도 test 러너 없음).

## 환경 변수

`.env.local.example` 참고. 필수:

| 변수                            | 설명                                  |
| ------------------------------- | ------------------------------------- |
| `SOOP_CLIENT_SECRET`            | SOOP OAuth 시크릿 (★서버 only)        |
| `IRON_SESSION_PASSWORD`         | 세션 쿠키 암호화 키 (32자 이상)       |
| `NEXT_PUBLIC_SOOP_CLIENT_ID`    | SOOP OAuth Client ID                  |
| `NEXT_PUBLIC_SOOP_REDIRECT_URI` | OAuth 콜백 URL                        |
| `NEXT_PUBLIC_SITE_URL`          | 사이트 절대 URL                       |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase 프로젝트 URL                 |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service_role 키 (★서버 only) |

선택: `NEXT_PUBLIC_SUPABASE_ANON_KEY`(MVP 미사용), `CRON_SECRET`(heartbeat).

## 커뮤니티(Supabase) 설정

1. Supabase 프로젝트를 만든다.
2. SQL 에디터에서 [`supabase/migrations/0001_community.sql`](supabase/migrations/0001_community.sql)을 실행한다 (테이블·트리거·RLS).
3. Project Settings → API에서 URL과 service_role 키를 `.env.local`에 넣는다.
4. (배포) Vercel에 같은 env를 등록하면 `vercel.json`의 Cron이 매일 heartbeat를 호출해 무료 티어 7일 자동 일시정지를 막는다.

인증은 앱의 SOOP OAuth + iron-session이 담당하고 Supabase Auth는 쓰지 않는다. 모든 DB 접근은 서버 라우트 핸들러가 service_role 키로 수행하며, 테이블은 RLS 활성 + 정책 0개로 잠가 둔다.

### Supabase 테이블

- `profiles` — 작성자 식별 정보(SOOP BJ id 기준), 글/댓글/반응 작성 시 upsert
- `posts` — 글(제목·본문, 텍스트 전용), 좋아요/싫어요/댓글 카운트는 트리거로 동기화, soft delete
- `comments` — 댓글 + 1단계 대댓글(self-FK `parent_id`, 트리거로 깊이 제한), soft delete
- `reactions` — 좋아요/싫어요(다형성 `target_type`/`target_id`, 사용자당 1표)

## 프로젝트 구조

```
src/
├─ app/
│  ├─ (public)/            # Header/Footer 포함 페이지
│  │  ├─ live/             # 라이브 목록
│  │  ├─ me/               # 내 프로필
│  │  └─ community/        # 커뮤니티 게시판 (목록 / [postId] / write)
│  ├─ multiview/           # 멀티뷰 (전용 레이아웃)
│  └─ api/
│     ├─ auth/             # OAuth (login/callback/refresh/logout/session)
│     ├─ soop/             # SOOP API 프록시
│     └─ community/        # 게시판 CRUD + reaction + heartbeat
├─ domains/{auth,community,live,multiview}/   # 도메인별 components/hooks/utils/types
├─ lib/
│  ├─ soop/                # SOOP API 클라이언트 (server-only)
│  ├─ supabase/            # Supabase 클라이언트·쿼리 (server-only)
│  ├─ session/             # iron-session
│  └─ env.ts               # zod 환경변수 검증
└─ components/{layout,ui,providers}/
supabase/migrations/        # DB 스키마 SQL
```

## 기술 스택

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · shadcn on Base UI · SWR · TanStack Query · iron-session · Supabase · zod · sonner.
