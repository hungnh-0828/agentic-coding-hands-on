import { describe, expect, it } from "vitest";

import { heroRankFromReceived } from "../hero-badge";

// Thresholds come from the design spec (hoa thị): 10 → 1★, 20 → 2★, 50 → 3★.
describe("heroRankFromReceived", () => {
  it("returns New Hero (0★) below 10 received", () => {
    expect(heroRankFromReceived(0)).toEqual({ badge: "new", starCount: 0 });
    expect(heroRankFromReceived(9)).toEqual({ badge: "new", starCount: 0 });
  });

  it("returns Rising Hero (1★) at 10–19 received", () => {
    expect(heroRankFromReceived(10)).toEqual({ badge: "rising", starCount: 1 });
    expect(heroRankFromReceived(19)).toEqual({ badge: "rising", starCount: 1 });
  });

  it("returns Super Hero (2★) at 20–49 received", () => {
    expect(heroRankFromReceived(20)).toEqual({ badge: "super", starCount: 2 });
    expect(heroRankFromReceived(49)).toEqual({ badge: "super", starCount: 2 });
  });

  it("returns Legend Hero (3★) at 50+ received", () => {
    expect(heroRankFromReceived(50)).toEqual({ badge: "legend", starCount: 3 });
    expect(heroRankFromReceived(999)).toEqual({ badge: "legend", starCount: 3 });
  });
});
