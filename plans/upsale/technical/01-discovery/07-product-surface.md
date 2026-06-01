# Product Surface — agentic-coding-hands-on
**Use context:** internal

- **Public entrypoints:**
  - HTTP routes: 8 web routes (Next.js App Router, no REST/GraphQL/RPC route handlers detected)
    - `app/[locale]/page.tsx` — home
    - `app/[locale]/login/page.tsx` — login
    - `app/[locale]/sun-kudos/page.tsx` — kudos board
    - `app/[locale]/admin-dashboard/page.tsx` — admin dashboard
    - `app/[locale]/awards-information/page.tsx` — awards information
    - `app/[locale]/about-saa-2025/page.tsx` — about SAA 2025
    - `app/[locale]/prelaunch/page.tsx` — pre-launch
    - `app/[locale]/layout.tsx` — root layout (not a page route; provides i18n + auth context)
  - No `app/**/route.ts` / `app/**/route.tsx` API route handlers found (confirmed: `find app -name "route.ts"` returned empty)
  - CLI commands: none — `package.json:4` `"private": true`; no `bin` field
  - Exported packages / SDK published: none — private package (`package.json:4`)
- **User-facing UI presence:** yes — framework: React 19 / Next.js App Router (`package.json:13` `"react": "^19.2.4"`, `package.json:11` `"next": "^16.2.6"`)
- **Vendor-category map:**
  - **BaaS / database:** Supabase (`lib/supabase/client.ts:1` `createBrowserClient`, `lib/supabase/server.ts:2` `createServerClient`) `single-vendor`
  - **i18n / localization:** next-intl (`package.json:17` `"next-intl": "^4.12.0"`, `lib/i18n/routing.ts:1`) `single-vendor`
  - **CSS framework:** Tailwind CSS v4 (`package.json:24` `"tailwindcss": "^4.1.4"`, `postcss.config.mjs`) `single-vendor`
  - **Auth:** mock only — `lib/auth/mock-auth-context.tsx` (no real IdP/SSO SDK detected)
  - **Object storage / media:** Supabase Storage (image upload via Supabase client; `components/kudos/compose/image-uploader.tsx`) — covered under Supabase BaaS entry above
  - **Analytics, payment, CRM, email, LLM, notification channel:** none detected
- **Host-platform map:**
  - `(none detected)` — no browser extension manifest, VS Code `contributes`, Slack/Teams app manifest, Shopify `extension.toml`, or Figma plugin manifest found in repo
- **Mutation surface (server actions, not HTTP routes):**
  - `lib/kudos/actions.ts:33` — `toggleKudosLike(kudosId, userId)`
  - `lib/kudos/actions.ts:75` — `createKudos(input)`
- **i18n surface:** 2 locales — `vi` (default), `en` (`lib/i18n/routing.ts:4-5`)
