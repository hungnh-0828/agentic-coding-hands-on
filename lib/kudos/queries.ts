import { createClient } from "@/lib/supabase/server";

import type {
  KudosBoardData,
  KudosHashtag,
  KudosLike,
  KudosPerson,
  KudosPost,
  KudosUserStats,
} from "./types";

type UserRow      = { id: string; display_name: string | null; department_id: string | null };
type DeptRow      = { id: string; slug: string; name: string };
type HashtagRow   = { id: string; slug: string; label: string };
type KudosRow     = { id: string; sender_id: string; receiver_id: string; title: string; content: string; created_at: string; is_anonymous: boolean; anonymous_name: string | null };
type KudosHashRow = { kudos_id: string; hashtag_id: string };
type LikeRow      = { kudos_id: string; user_id: string; weight: number };

const EMPTY: KudosBoardData = {
  kudos: [],
  hashtags: [],
  departments: [],
  totalKudos: 0,
  receiverNames: [],
  people: [],
};

// Fetches everything needed for the live board in one call.
// Returns an empty result on any DB error so the UI can render an explicit empty state.
export async function fetchKudosBoard(): Promise<KudosBoardData> {
  try {
    const supabase = await createClient();
    const [usersRes, deptRes, hashRes, kudosRes, linkRes, likeRes] = await Promise.all([
      supabase.from("users").select("id, display_name, department_id"),
      supabase.from("departments").select("id, slug, name"),
      supabase.from("hashtags").select("id, slug, label"),
      supabase.from("kudos").select("id, sender_id, receiver_id, title, content, created_at, is_anonymous, anonymous_name"),
      supabase.from("kudos_hashtags").select("kudos_id, hashtag_id"),
      supabase.from("kudos_likes").select("kudos_id, user_id, weight"),
    ]);

    if (kudosRes.error || !kudosRes.data) return EMPTY;

    // Supabase's generic inference loses some table types here; cast through the row shapes.
    const users      = (usersRes.data ?? []) as unknown as UserRow[];
    const departments = (deptRes.data ?? []) as unknown as DeptRow[];
    const hashtags   = (hashRes.data ?? []) as unknown as HashtagRow[];
    const kudosRows  = kudosRes.data as unknown as KudosRow[];
    const linkRows   = (linkRes.data ?? []) as unknown as KudosHashRow[];
    const likeRows   = (likeRes.data ?? []) as unknown as LikeRow[];

    const deptById = new Map(departments.map((d) => [d.id, d]));
    const userById = new Map(
      users.map((u): [string, KudosPerson] => {
        const dept = u.department_id ? deptById.get(u.department_id) : null;
        return [
          u.id,
          {
            id: u.id,
            name: u.display_name ?? "Sunner",
            departmentSlug: dept?.slug ?? null,
            departmentName: dept?.name ?? null,
          },
        ];
      }),
    );

    const hashtagById = new Map(hashtags.map((h): [string, KudosHashtag] => [h.id, { slug: h.slug, label: h.label }]));
    const hashByKudos = new Map<string, KudosHashtag[]>();
    for (const link of linkRows) {
      const tag = hashtagById.get(link.hashtag_id);
      if (!tag) continue;
      const list = hashByKudos.get(link.kudos_id) ?? [];
      list.push(tag);
      hashByKudos.set(link.kudos_id, list);
    }

    const likesByKudos = new Map<string, KudosLike[]>();
    for (const like of likeRows) {
      const list = likesByKudos.get(like.kudos_id) ?? [];
      list.push({ userId: like.user_id, weight: like.weight });
      likesByKudos.set(like.kudos_id, list);
    }

    const kudos: KudosPost[] = kudosRows
      .map((k) => {
        const sender = userById.get(k.sender_id);
        const receiver = userById.get(k.receiver_id);
        if (!sender || !receiver) return null;
        return {
          id: k.id,
          sender,
          receiver,
          title: k.title ?? "",
          content: k.content,
          createdAt: k.created_at,
          hashtags: hashByKudos.get(k.id) ?? [],
          likes: likesByKudos.get(k.id) ?? [],
          isAnonymous: k.is_anonymous ?? false,
          anonymousName: k.anonymous_name ?? null,
        };
      })
      .filter((k): k is KudosPost => k !== null)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

    return {
      kudos,
      hashtags: Array.from(hashtagById.values()),
      departments: departments.map((d) => ({ slug: d.slug, name: d.name })),
      totalKudos: kudos.length,
      receiverNames: Array.from(new Set(kudos.map((k) => k.receiver.name))),
      // All Sunners; UI excludes the sender when building the recipient picker.
      people: Array.from(userById.values()),
    };
  } catch {
    return EMPTY;
  }
}

// Computes "you" stats for the demo user. Boxes are mocked since we have no prize table.
export async function fetchKudosStats(userId: string): Promise<KudosUserStats> {
  try {
    const supabase = await createClient();
    const [recvRes, sentRes, heartRes] = await Promise.all([
      supabase.from("kudos").select("id", { count: "exact", head: true }).eq("receiver_id", userId),
      supabase.from("kudos").select("id", { count: "exact", head: true }).eq("sender_id", userId),
      supabase
        .from("kudos_likes")
        .select("weight, kudos!inner(receiver_id)")
        .eq("kudos.receiver_id", userId),
    ]);

    const heartRows = (heartRes.data ?? []) as unknown as { weight: number }[];
    const hearts = heartRows.reduce((sum, row) => sum + (row.weight ?? 1), 0);

    return {
      received: recvRes.count ?? 0,
      sent: sentRes.count ?? 0,
      hearts,
      boxesOpened: 3,    // mocked: no prize-box table in this iteration
      boxesUnopened: 2,
    };
  } catch {
    return { received: 0, sent: 0, hearts: 0, boxesOpened: 0, boxesUnopened: 0 };
  }
}
