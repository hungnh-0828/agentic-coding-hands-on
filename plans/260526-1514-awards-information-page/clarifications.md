# Clarifications — Awards Information page (Hệ thống giải)

Source: `https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD`
Screen: `Hệ thống giải` (zFYDgyj_pD)

## Session 2026-05-26

- Q: Auth gating cho /awards-information? → A: Client-side redirect — page có client guard component dùng MockAuthContext.isAuthenticated. Unauthed → router.replace('/login').
- Q: Schema cho prize data? → A: Migration 0003 thêm 3 columns `prize_count INT`, `unit_label TEXT`, `prize_value TEXT` vào `awards`. Update seed.
- Q: Nav menu behavior? → A: Scroll-spy + hash sync. Click → smooth scroll + update URL #slug. Scroll observer cập nhật active state.
- Q: Award images? → A: Placeholder gradient 336x336 — không cần asset.

## Derived decisions

- Q: Sun* Kudos block ở cuối page → reuse `components/sun-kudos-section.tsx` đã có (design tương tự)? → A: CÓ, reuse. Cùng label/title/cta.
- Q: Description text cho 6 awards — current seed có ngắn (1-2 câu). Detail blocks cần đoạn dài hơn? → A: Mở rộng `description` field trong seed thành đoạn 2-3 câu. Không thêm `long_description` column (YAGNI).
- Q: Prize value cho Signature 2025 có 2 dòng (5M cá nhân / 8M tập thể) → A: Lưu dạng TEXT đa dòng (separator `\n` hoặc HTML break). Render với `whitespace-pre-line`.
- Q: Unit label values? → A: `Đơn vị` (Top Talent), `Tập thể` (Top Project), `Cá nhân` (Leader, Best Manager), null (Signature 2025 dùng prize_value text), null (MVP — chỉ có giá trị).
- Q: Redirect-to-login khi unauthed → A: `router.replace('/login')` ngay khi MockAuthContext.isAuthenticated = false. Show "Đang chuyển hướng..." placeholder.
- Q: Hash link từ homepage (e.g. /awards-information#top-talent) → A: Layout dùng `id={slug}` trên từng section + `scroll-margin-top` để bù sticky header.
- Q: Banner image → A: Placeholder gradient + "ROOT FURTHER" + "Sun* Annual Award 2025" text (giống hero homepage).
