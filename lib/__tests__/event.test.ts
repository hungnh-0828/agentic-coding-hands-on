import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { FALLBACK_EVENT_ISO, getEventISO } from "../event";

describe("event", () => {
  describe("FALLBACK_EVENT_ISO", () => {
    it("equals the exact fallback datetime string", () => {
      expect(FALLBACK_EVENT_ISO).toBe("2025-12-31T18:30:00+07:00");
    });

    it("is a parseable ISO date (Date.parse returns a finite number)", () => {
      expect(Number.isNaN(Date.parse(FALLBACK_EVENT_ISO))).toBe(false);
    });
  });

  describe("getEventISO()", () => {
    let original: string | undefined;

    beforeEach(() => {
      original = process.env.NEXT_PUBLIC_EVENT_DATETIME;
    });

    afterEach(() => {
      if (original === undefined) {
        delete process.env.NEXT_PUBLIC_EVENT_DATETIME;
      } else {
        process.env.NEXT_PUBLIC_EVENT_DATETIME = original;
      }
    });

    it("returns FALLBACK_EVENT_ISO when env var is not set", () => {
      delete process.env.NEXT_PUBLIC_EVENT_DATETIME;
      expect(getEventISO()).toBe(FALLBACK_EVENT_ISO);
    });

    it("returns the env var value when set to a non-empty ISO string", () => {
      process.env.NEXT_PUBLIC_EVENT_DATETIME = "2026-01-01T00:00:00+07:00";
      expect(getEventISO()).toBe("2026-01-01T00:00:00+07:00");
    });

    it("returns empty string when env var is set to empty string (??  does not fall back for empty string)", () => {
      // ?? only catches null/undefined; an empty string is a defined value
      // and passes through unchanged — this distinguishes ?? from ||.
      process.env.NEXT_PUBLIC_EVENT_DATETIME = "";
      expect(getEventISO()).toBe("");
    });
  });
});
