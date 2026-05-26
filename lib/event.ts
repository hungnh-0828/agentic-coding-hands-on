// Shared event datetime. Read from env so the value can be overridden per environment;
// fallback covers local dev / preview builds where the env is not yet wired.
export const FALLBACK_EVENT_ISO = "2025-12-31T18:30:00+07:00";

export function getEventISO(): string {
  return process.env.NEXT_PUBLIC_EVENT_DATETIME ?? FALLBACK_EVENT_ISO;
}
