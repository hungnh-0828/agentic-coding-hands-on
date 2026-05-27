"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { assertValidCreateKudosInput } from "./compose-validation";
import type { CreateKudosInput } from "./types";

type LikeInsert = { kudos_id: string; user_id: string; weight: number };
type KudosInsert = {
  sender_id: string;
  receiver_id: string;
  title: string;
  content: string;
  is_anonymous: boolean;
  anonymous_name: string | null;
  image_urls: string[];
};
type KudosHashtagInsert = { kudos_id: string; hashtag_id: string };

// TODO(auth): replace with session-derived user id when real Supabase Auth is in place.
const SENDER_ID = "00000000-0000-0000-0000-000000000001";

function revalidateBoard() {
  revalidatePath("/vi/sun-kudos");
  revalidatePath("/en/sun-kudos");
}

// Toggles a like for the given user on the given kudos.
// TODO(auth): once real Supabase Auth lands, take userId from session, not from caller.
// TODO(auth): tighten RLS to enforce auth.uid() == user_id on kudos_likes writes.
export async function toggleKudosLike(kudosId: string, userId: string): Promise<{ liked: boolean }> {
  const supabase = await createClient();

  const { data: kudos } = await supabase
    .from("kudos")
    .select("sender_id")
    .eq("id", kudosId)
    .maybeSingle<{ sender_id: string }>();

  if (kudos?.sender_id === userId) {
    throw new Error("Sender cannot like own kudos");
  }

  const { data: existing } = await supabase
    .from("kudos_likes")
    .select("kudos_id")
    .eq("kudos_id", kudosId)
    .eq("user_id", userId)
    .maybeSingle<{ kudos_id: string }>();

  if (existing) {
    const { error: delError } = await supabase
      .from("kudos_likes")
      .delete()
      .eq("kudos_id", kudosId)
      .eq("user_id", userId);
    if (delError) throw new Error(delError.message);
    revalidateBoard();
    return { liked: false };
  }

  const row: LikeInsert = { kudos_id: kudosId, user_id: userId, weight: 1 };
  // Supabase generic loses the table type here; cast through a typed row.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: insError } = await (supabase.from("kudos_likes") as any).insert(row);
  if (insError) throw new Error(insError.message);
  revalidateBoard();
  return { liked: true };
}

// Creates a new kudos post with hashtag links.
// Server-side validation mirrors the UI guard; both must agree.
export async function createKudos(input: CreateKudosInput): Promise<{ id: string }> {
  const { receiverId, title, content, hashtagSlugs, imageUrls, isAnonymous, anonymousName } = input;

  // Validation — throw before any DB write. Shared with the UI guard (DRY).
  assertValidCreateKudosInput(input, SENDER_ID);

  const supabase = await createClient();

  // Resolve hashtag ids — validate slugs exist before writing kudos.
  const { data: tagRows, error: tagError } = await supabase
    .from("hashtags")
    .select("id, slug")
    .in("slug", hashtagSlugs);
  if (tagError) throw new Error(tagError.message);
  // Every requested slug must resolve — reject partial matches so the "hashtags
  // required" invariant cannot be silently weakened by an unknown slug.
  if (!tagRows || tagRows.length !== hashtagSlugs.length) {
    throw new Error("One or more hashtags are invalid");
  }

  // Insert kudos row.
  const kudosRow: KudosInsert = {
    sender_id: SENDER_ID,
    receiver_id: receiverId,
    title: title.trim(),
    content: content.trim(),
    is_anonymous: isAnonymous,
    anonymous_name: isAnonymous ? (anonymousName ?? null) : null,
    image_urls: imageUrls,
  };
  // Supabase generic loses the table type here; cast through a typed row.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: kudosData, error: kudosError } = await (supabase.from("kudos") as any)
    .insert(kudosRow)
    .select("id")
    .single();
  if (kudosError) throw new Error(kudosError.message);
  const id: string = (kudosData as { id: string }).id;

  // Insert kudos_hashtags link rows.
  const linkRows: KudosHashtagInsert[] = (tagRows as { id: string }[]).map((t) => ({
    kudos_id: id,
    hashtag_id: t.id,
  }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: linkError } = await (supabase.from("kudos_hashtags") as any).insert(linkRows);
  if (linkError) {
    // Compensating delete: don't leave an orphaned kudos with no hashtags
    // (the row would otherwise appear on the board violating the required-tag rule).
    await supabase.from("kudos").delete().eq("id", id);
    throw new Error(linkError.message);
  }

  revalidateBoard();
  return { id };
}
