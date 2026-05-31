import { type FullConfig } from "@playwright/test";

// Next dev compiles routes on first request. With fullyParallel specs hitting a
// cold server at once, on-demand compilation can exceed per-test timeouts and
// cascade into failures. Pre-warm each route once (server + client bundles) so
// the suite runs against already-compiled pages.
const ROUTES = [
  "/",
  "/vi",
  "/en",
  "/vi/login",
  "/en/login",
  "/vi/sun-kudos",
  "/en/awards-information",
];

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL ?? "http://localhost:3000";
  for (const route of ROUTES) {
    try {
      const res = await fetch(new URL(route, baseURL), { redirect: "follow" });
      // Surface a misspelled/renamed route instead of silently relying on retries.
      if (!res.ok) console.warn(`[global-setup] warmup ${route} → ${res.status}`);
    } catch {
      // Server may still be starting; warming is best-effort, tests retry anyway.
    }
  }
}

export default globalSetup;
