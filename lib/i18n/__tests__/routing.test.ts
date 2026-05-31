import { describe, expect, it } from "vitest";

import { routing } from "../routing";

describe("routing config", () => {
  it("locales equals [\"vi\", \"en\"]", () => {
    expect(routing.locales).toEqual(["vi", "en"]);
  });

  it("defaultLocale is \"vi\"", () => {
    expect(routing.defaultLocale).toBe("vi");
  });

  it("localePrefix is \"always\"", () => {
    expect(routing.localePrefix).toBe("always");
  });
});
