export type KudosPerson = {
  id: string;
  name: string;
  departmentSlug: string | null;
  departmentName: string | null;
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
  content: string;
  createdAt: string;
  hashtags: KudosHashtag[];
  likes: KudosLike[];
};

export type KudosBoardData = {
  kudos: KudosPost[];
  hashtags: KudosHashtag[];
  departments: { slug: string; name: string }[];
  totalKudos: number;
  receiverNames: string[];
};

export type KudosUserStats = {
  received: number;
  sent: number;
  hearts: number;
  boxesOpened: number;
  boxesUnopened: number;
};
