# Login — Normalized Specs

## Screen Overview
Login page for SAA 2025. Full-screen decorative background key visual with a dark
semi-transparent overlay for readability. Fixed top header (SAA logo left, language
switcher right). Centered main content: "ROOT FURTHER" key visual, welcome text, and a
Google sign-in button. Footer shows copyright. This screen is the application entry point;
authentication is performed via Google OAuth.

## UI Elements
- Background Key Visual (C): full-viewport decorative image, dark overlay, no repeat. Static.
- Header (A): fixed top, transparent/dark overlay.
  - Logo (A.1): SAA brand logo, left-aligned, alt "Sun* Annual Awards 2025".
  - Language Switcher (A.2): VN flag + label "VN" + down chevron, ~110x40px.
- Main Content (B): vertically/horizontally centered, stacks on small screens.
  - Key Visual (B.1): "ROOT FURTHER" stylized logo/graphic. Static.
  - Welcome Text (B.2): "Bắt đầu hành trình của bạn cùng SAA 2025.\nĐăng nhập để khám phá!". Static.
  - Login Button (B.3): Google icon + label "Đăng nhập bằng Google", ~280x48px.
- Footer (D): text "Bản quyền thuộc về Sun* © 2025". Static.

## Validation Rules
(None — screen has no input fields.)

## User Interactions
- Click Logo → navigate to homepage.
- Click Language Switcher → open language dropdown; options VN / EN; after selection update
  interface language and close dropdown.
- Click Login Button → initiate Google OAuth login flow.
  - On success → redirect to Homepage SAA.
  - On failure → display error message.
- Login Button states: hover (lighten), active (press effect), disabled (during loading),
  loading spinner shown during authentication.

## Functional / Business Rules
- Google OAuth is the only login method on this screen.
- Successful authentication redirects the user to Homepage SAA.
- Failed authentication displays an error message.
- Supported interface languages: VN, EN.

## Security Considerations
- Authentication is delegated to Google OAuth.
- This screen is the unauthenticated entry / authentication gate of the app.
