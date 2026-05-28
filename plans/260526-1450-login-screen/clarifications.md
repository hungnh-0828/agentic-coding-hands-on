# Clarifications — Login Screen

Source: `https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz`
Screen: `Login` (GzbNeVGJHz)

## Session 2026-05-26

- Q: Triển khai Google login như thế nào? → A: Mock Google OAuth — button hiển thị "Google" nhưng click toggle `MockAuthContext.signIn("regular")` + redirect home. Không cần Google credentials.
- Q: Logic khi authenticated user vào /login? → A: Client-side check — `useEffect` ngó `MockAuthContext.isAuthenticated`, true thì `router.replace("/")`.
- Q: Bilingual welcome + button? → A: Thêm vi+en cho cả 2. Welcome khác giữa 2 ngôn ngữ.

## Derived decisions

- Q: Loading delay khi mock auth? → A: ~800ms `setTimeout` để giả lập network/OAuth latency, đủ thấy disabled + spinner state per test ID-37.
- Q: Header trên trang login khác với trang chủ? → A: CÓ — login chỉ cần logo + language switcher (no nav, no notification, no account menu) per design spec A.
- Q: Layout dimensions? → A: full viewport, content centered vertically + horizontally. Background dark với root pattern motif (đã có sẵn từ globals.css).
- Q: Button label EN? → A: "Sign in with Google" (test cases hiển thị "LOGIN With Google" nhưng dùng phong cách câu đầy đủ).
- Q: Redirect target sau login → A: `/` (sẽ về `/vi` mặc định qua middleware).

## Session 2026-05-28 — Visual mismatch fix

- Q: Bg art có thể fetch riêng image fill từ MoMorph không? → A: Không — Figma fill hash bị mask. Dùng full frame image làm bg + linear-gradient overlay để mask left band, live components overlay đè baked-in elements ở vị trí trùng khít.
- Q: Logo header? → A: `public/login/sun-annual-awards-logo.png` (52×48), thay chip text "SAA".
- Q: Language switcher icon? → A: Flag SVG + locale label + chevron SVG. EN locale tạm dùng VN flag (chưa có EN flag asset).
- Q: ROOT FURTHER rendering? → A: PNG asset (`root-further.png` 451×200) thay text + gradient. Cùng cách design đã làm.
- Q: Google button style? → A: Bg `#FFEA9E`, text `#00101A`, icon G ở RIGHT, label "LOGIN With Google" cả vi+en (per design B.3).
- Q: Footer? → A: Single line copyright "Bản quyền thuộc về Sun* © 2025"/"Copyright © Sun* 2025" — KHÔNG dùng `SiteFooter` (no nav, no logo).
- Q: Welcome line vi? → A: "Bắt đầu hành trình của bạn cùng SAA 2025." / "Đăng nhập để khám phá!" (đã match).
- Q: Welcome line en? → A: "Start your journey with SAA 2025." / "Sign in to explore!" (chỉnh "Begin" → "Start").
