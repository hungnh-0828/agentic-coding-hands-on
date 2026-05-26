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
