"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type LikeInsert = { kudos_id: string; user_id: string; weight: number };

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
