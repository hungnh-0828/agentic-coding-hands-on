// Hero badge + star count ("hoa thị") derive from how many kudos a Sunner has received.
// Thresholds match the design spec: 10 received → 1★, 20 → 2★, 50 → 3★.

export type HeroBadge = "new" | "rising" | "super" | "legend";

export type HeroRank = {
  badge: HeroBadge;
  /** Number of gold stars (hoa thị): 0–3. */
  starCount: number;
};

export function heroRankFromReceived(receivedCount: number): HeroRank {
  if (receivedCount >= 50) return { badge: "legend", starCount: 3 };
  if (receivedCount >= 20) return { badge: "super", starCount: 2 };
  if (receivedCount >= 10) return { badge: "rising", starCount: 1 };
  return { badge: "new", starCount: 0 };
}
