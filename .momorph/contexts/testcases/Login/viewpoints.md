# Login — Viewpoints (filtered to explicit source)

Source: packaged `data/viewpoints_description/Login.json`. Kept only branches consistent
with this design (Google-OAuth-only, no email/password/mobile/Facebook/remember-me inputs).

## Design of Login screen
- Check display of screen: Header, Footer, layout of items, state of each item, position/format of message (error) area.

## Login by Google account (only branches matching this design)
- Successful Google login → user is logged in and redirected (to Homepage SAA).
- Failed Google login → display corresponding error message.

## Discarded (not present in design — do NOT generate)
- Email / username / mobile-number login, password masking, copy-paste password.
- Facebook login, multi-account/multi-device, token-expiry/auto-login flows.
- "Remember me" checkbox behavior.
