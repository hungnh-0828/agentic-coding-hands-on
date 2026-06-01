# Countdown - Prelaunch page — Normalized Specs

## Screen Overview
Standalone prelaunch page showing a countdown to the event start. Full-screen decorative
dark background, a title, and three countdown units (Days / Hours / Minutes) using
LED-style 2-digit boxes. Purely presentational; auto-updates over time.

## UI Elements
- Background Image (0.1): full-viewport decorative dark image with overlay. Static, cover, no repeat.
- Title Text (0.2): "Sự kiện sẽ bắt đầu sau", white, centered, above the countdown. Static.
- Days unit (1): two LED-style digit boxes + label "DAYS".
- Hours unit (2): two LED-style digit boxes + label "HOURS".
- Minutes unit (3): two LED-style digit boxes + label "MINUTES".

## Validation Rules
(None — screen has no input fields.)

## User Interactions
(None — no interactive controls; page is display-only.)

## Functional / Business Rules
- Countdown auto-updates to show remaining time to the event start.
- Each unit always shows 2 digits.
- Days shows "00" when less than 1 day remains.
- Hours value range is 00–23; Minutes value range is 00–59.

## Security Considerations
(None stated.)
