# Clarifications — Homepage SAA + Supabase

Source: `https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM`
Screen: `Homepage SAA` (i87tDx10uM)

## Session 2026-05-26

- Q: Phạm vi Supabase local — dùng cho phần nào? → A: Setup-only (init + client) + Auth (login/logout + role) + Awards data từ DB + Notifications từ DB
- Q: Mức độ implement authentication trong session này? → A: UI only — auth giả lập (toggle isAuthenticated/isAdmin trong React, KHÔNG dùng Supabase Auth thật trong session này)
- Q: Các trang điều hướng (Awards Information, Sun* Kudos, About SAA 2025, Admin Dashboard) xử lý thế nào? → A: Placeholder routes trống ('Coming soon' content) để link không 404
- Q: i18n (VN/EN) implement thế nào? → A: next-intl với 2 ngôn ngữ (vi + en), route segment [locale]

## Derived decisions

- Q: Auth UI là giả lập state nhưng schema/tables Supabase cần khớp role admin/regular không? → A: Tables nên có `users` table với `role` column để sau này wire thật được; UI hiện đọc từ React context, KHÔNG query Supabase Auth
- Q: Countdown event datetime → A: `NEXT_PUBLIC_EVENT_DATETIME` env, fallback `2025-12-31T18:30:00+07:00`
- Q: Awards table schema → A: `id`, `slug`, `title`, `description`, `thumbnail_url`, `display_order`, `created_at`. Seed 6 rows từ design (Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 - Creator, MVP)
- Q: Notifications table schema → A: `id`, `user_id`, `title`, `body`, `read_at`, `created_at`. Badge count = unread per current user (UI giả lập, dùng mock data từ array tạm)
- Q: i18n routing pattern → A: `app/[locale]/page.tsx` — default `vi`, prefix `/en` cho English
- Q: Default language → A: VN
