import { describe, it, expect, vi } from "vitest";

// Mock next-intl/server so getRequestConfig is an identity function that returns
// the callback it is given. This exposes the callback as the module default export,
// letting tests invoke it directly with controlled params.
vi.mock("next-intl/server", () => ({
  getRequestConfig: (cb: unknown) => cb,
}));

// Import AFTER mock is registered so the module resolves with the identity mock.
import getConfig from "../request";

describe("i18n request resolution", () => {
  describe("valid locale: 'en'", () => {
    it("returns locale 'en'", async () => {
      const result = await (
        getConfig as (p: {
          requestLocale: Promise<string | undefined>;
        }) => Promise<{ locale: string; messages: Record<string, unknown> }>
      )({ requestLocale: Promise.resolve("en") });
      expect(result.locale).toBe("en");
    });

    it("returns en messages", async () => {
      const result = await (
        getConfig as (p: {
          requestLocale: Promise<string | undefined>;
        }) => Promise<{ locale: string; messages: Record<string, unknown> }>
      )({ requestLocale: Promise.resolve("en") });
      const expected = (await import("@/messages/en.json")).default;
      expect(result.messages).toEqual(expected);
    });

    it("messages.nav exists", async () => {
      const result = await (
        getConfig as (p: {
          requestLocale: Promise<string | undefined>;
        }) => Promise<{ locale: string; messages: Record<string, unknown> }>
      )({ requestLocale: Promise.resolve("en") });
      expect(result.messages).toHaveProperty("nav");
    });
  });

  describe("valid locale: 'vi'", () => {
    it("returns locale 'vi'", async () => {
      const result = await (
        getConfig as (p: {
          requestLocale: Promise<string | undefined>;
        }) => Promise<{ locale: string; messages: Record<string, unknown> }>
      )({ requestLocale: Promise.resolve("vi") });
      expect(result.locale).toBe("vi");
    });

    it("returns vi messages", async () => {
      const result = await (
        getConfig as (p: {
          requestLocale: Promise<string | undefined>;
        }) => Promise<{ locale: string; messages: Record<string, unknown> }>
      )({ requestLocale: Promise.resolve("vi") });
      const expected = (await import("@/messages/vi.json")).default;
      expect(result.messages).toEqual(expected);
    });
  });

  describe("invalid locale: 'fr' (unknown)", () => {
    it("falls back to default locale 'vi'", async () => {
      const result = await (
        getConfig as (p: {
          requestLocale: Promise<string | undefined>;
        }) => Promise<{ locale: string; messages: Record<string, unknown> }>
      )({ requestLocale: Promise.resolve("fr") });
      expect(result.locale).toBe("vi");
    });

    it("returns vi messages when locale is unknown", async () => {
      const result = await (
        getConfig as (p: {
          requestLocale: Promise<string | undefined>;
        }) => Promise<{ locale: string; messages: Record<string, unknown> }>
      )({ requestLocale: Promise.resolve("fr") });
      const viMessages = (await import("@/messages/vi.json")).default;
      expect(result.messages).toEqual(viMessages);
    });
  });

  describe("undefined requestLocale", () => {
    it("falls back to default locale 'vi'", async () => {
      const result = await (
        getConfig as (p: {
          requestLocale: Promise<string | undefined>;
        }) => Promise<{ locale: string; messages: Record<string, unknown> }>
      )({ requestLocale: Promise.resolve(undefined) });
      expect(result.locale).toBe("vi");
    });

    it("returns vi messages when requestLocale is undefined", async () => {
      const result = await (
        getConfig as (p: {
          requestLocale: Promise<string | undefined>;
        }) => Promise<{ locale: string; messages: Record<string, unknown> }>
      )({ requestLocale: Promise.resolve(undefined) });
      const viMessages = (await import("@/messages/vi.json")).default;
      expect(result.messages).toEqual(viMessages);
    });
  });

  describe("result shape invariants", () => {
    const cases = [
      { label: "en", requestLocale: "en" },
      { label: "vi", requestLocale: "vi" },
      { label: "fr (invalid → vi)", requestLocale: "fr" },
      { label: "undefined → vi", requestLocale: undefined },
    ] as const;

    for (const { label, requestLocale } of cases) {
      it(`result has both 'locale' and 'messages' for input: ${label}`, async () => {
        const result = await (
          getConfig as (p: {
            requestLocale: Promise<string | undefined>;
          }) => Promise<{ locale: string; messages: Record<string, unknown> }>
        )({ requestLocale: Promise.resolve(requestLocale) });
        expect(result).toHaveProperty("locale");
        expect(result).toHaveProperty("messages");
        expect(result.messages).not.toBeNull();
        expect(typeof result.messages).toBe("object");
      });
    }
  });
});
