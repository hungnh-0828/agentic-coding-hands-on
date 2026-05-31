import type { HeroBadge } from "./hero-badge";

export type KudosPerson = {
  id: string;
  name: string;
  departmentSlug: string | null;
  departmentName: string | null;
  avatarUrl: string | null;
  // Lifetime kudos received → drives the hero badge + star count shown on cards.
  receivedCount: number;
  starCount: number;
  badge: HeroBadge;
};

export type KudosHashtag = {
  slug: string;
  label: string;
};

export type KudosLike = {
  userId: string;
  weight: number;
};

export type KudosPost = {
  id: string;
  sender: KudosPerson;
  receiver: KudosPerson;
  title: string;
  content: string;
  createdAt: string;
  imageUrls: string[];
  hashtags: KudosHashtag[];
  likes: KudosLike[];
  // When true, the sender identity is hidden on the board in favour of anonymousName.
  isAnonymous: boolean;
  anonymousName: string | null;
};

export type KudosBoardData = {
  kudos: KudosPost[];
  hashtags: KudosHashtag[];
  departments: { slug: string; name: string }[];
  totalKudos: number;
  receiverNames: string[];
  // All Sunners — UI excludes the sender when building recipient picker.
  people: KudosPerson[];
};

export type CreateKudosInput = {
  receiverId: string;
  title: string;
  content: string;
  hashtagSlugs: string[];   // 1..5
  imageUrls: string[];      // 0..5 data URLs
  isAnonymous: boolean;
  anonymousName: string | null;
};

export type KudosUserStats = {
  received: number;
  sent: number;
  hearts: number;
  boxesOpened: number;
  boxesUnopened: number;
};
