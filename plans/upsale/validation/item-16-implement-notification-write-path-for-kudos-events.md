---
item_index: 16
item_slug: implement-notification-write-path-for-kudos-events
track: technical
decision: KEEP
---

# Audits

- **Clause:** `notifications` table (id, user_id, title, body, read_at, created_at) with unread index exists in migration 0001
  - **Evidence:** `supabase/migrations/0001_initial_schema.sql:24-34` — `create table if not exists public.notifications` with columns id, user_id, title, body, read_at, created_at confirmed; `create index if not exists notifications_user_unread_idx on public.notifications (user_id) where read_at is null` at line 33-34.
  - **Verdict:** correct
- **Clause:** unread count surfaced in header bell (`components/header/site-header.tsx:14-26`)
  - **Evidence:** `components/header/site-header.tsx:14-26` — `async function getUnreadCount()` queries `notifications` table filtered by `MOCK_USER_ID` and `read_at is null`, result passed as `unreadCount` prop to `<NotificationBell>`. Lines 14-26 confirmed.
  - **Verdict:** correct
- **Clause:** no `insertNotification` / `markRead` action found across `lib/` or `app/`
  - **Evidence:** ripgrep on `insertNotification|markRead|mark_read|insert.*notification|notifications.*insert` across `lib/` and `app/` returned 0 hits. `lib/kudos/actions.ts` — `createKudos` function ends after inserting `kudos` + `kudos_hashtags` rows and calling `revalidateBoard()` with no notification insert.
  - **Verdict:** correct
- **Clause:** `components/header/notification-bell.tsx:8` (prop-driven, no write path)
  - **Evidence:** `components/header/notification-bell.tsx:8` — component signature `export function NotificationBell({ unreadCount }: { unreadCount: number })` at line 8; component opens a dropdown panel showing unread count text but contains no server action call, no Supabase client call, no `markRead` invocation. Panel close does not trigger any write.
  - **Verdict:** correct

# Reason

Check 1 (holistic gate) — all Need citations resolve against the repo: the `notifications` table exists in migration 0001 exactly as cited, `site-header.tsx:14-26` reads the unread count via `MOCK_USER_ID`, `notification-bell.tsx:8` is prop-driven with no write path, and `createKudos` in `lib/kudos/actions.ts` has no notification insert. No fabrication detected. Proposed solution (server action triggered by `createKudos` + Supabase Realtime channel) is stack-native and directly addresses the gap. Value `high` is defensible (functional breakage visible to all authenticated employees). Checks 2-6 pass without issue.
