import { vi, describe, it, expect, beforeEach } from "vitest";

// vi.mock factories are hoisted before variable declarations, so the mock
// implementations must be created inside each factory (not captured from outer
// let/const). We retrieve typed references to them via the mocked module import.
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { type Mock } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { toggleKudosLike, createKudos } from "../actions";

// Typed mock references — vi.mocked() exposes mockClear/mockReset/mockResolvedValue etc.
const mockedCreateClient = vi.mocked(createClient) as Mock;
const mockedRevalidatePath = vi.mocked(revalidatePath) as Mock;

// ── Chainable builder ─────────────────────────────────────────────────────────
// Each table call returns a fresh builder that tracks the chain and resolves
// the queued terminal value on `maybeSingle`, `single`, or plain `await`.
// Because Supabase chains are thenable (`.then` is on the builder), we make
// the builder itself a thenable so `await builder.delete().eq(...)` resolves.

type ChainResult = { data?: unknown; error?: unknown };

function makeChain(result: ChainResult) {
  // The builder is both chainable (returns `this`) AND thenable (for bare `await`).
  const builder: Record<string, unknown> & PromiseLike<ChainResult> = {
    // Chainable methods — return `this`
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),

    // Terminal resolvers
    maybeSingle: vi.fn().mockResolvedValue(result),
    single: vi.fn().mockResolvedValue(result),

    // Thenability — allows `await chain` and `await chain.delete().eq(...)`
    // Vitest/Node resolves the first `.then` it finds on an awaited object.
    then<TResult1 = ChainResult, TResult2 = never>(
      onFulfilled?: ((value: ChainResult) => TResult1 | PromiseLike<TResult1>) | null,
      onRejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ): PromiseLike<TResult1 | TResult2> {
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
  };

  // Make every chainable method return `this` so the chain is fluent.
  (builder.select as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  (builder.eq as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  (builder.in as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  (builder.insert as ReturnType<typeof vi.fn>).mockReturnValue(builder);
  (builder.delete as ReturnType<typeof vi.fn>).mockReturnValue(builder);

  return builder;
}

// Build a fake supabase where `from(table)` pops the next result from the queue
// for that table. Throws if a table is called more times than configured.
function makeFakeClient(
  tableResponses: Record<string, ChainResult[]>,
): { from: ReturnType<typeof vi.fn>; _builders: Record<string, ReturnType<typeof makeChain>[]> } {
  const builders: Record<string, ReturnType<typeof makeChain>[]> = {};
  for (const [table, results] of Object.entries(tableResponses)) {
    builders[table] = results.map((r) => makeChain(r));
  }

  const callCounts: Record<string, number> = {};
  const fromMock = vi.fn((table: string) => {
    callCounts[table] = (callCounts[table] ?? 0) + 1;
    const idx = callCounts[table] - 1;
    if (!builders[table] || idx >= builders[table].length) {
      throw new Error(
        `Unexpected from("${table}") call #${callCounts[table]} — no result queued`,
      );
    }
    return builders[table][idx];
  });

  return { from: fromMock, _builders: builders };
}

// ── Constants mirrored from source ────────────────────────────────────────────
const SENDER_ID = "00000000-0000-0000-0000-000000000001";
const OTHER_USER_ID = "00000000-0000-0000-0000-000000000002";
const KUDOS_ID = "kudos-abc-123";

// ── Base valid createKudos input ──────────────────────────────────────────────
const baseCreateInput = {
  receiverId: OTHER_USER_ID,
  title: "  Great job!  ",
  content: "  You nailed it.  ",
  hashtagSlugs: ["teamwork"],
  imageUrls: [],
  isAnonymous: false,
  anonymousName: null,
};

// ── Setup ─────────────────────────────────────────────────────────────────────
beforeEach(() => {
  mockedRevalidatePath.mockClear();
  mockedCreateClient.mockReset();
});

// =============================================================================
// toggleKudosLike
// =============================================================================
describe("toggleKudosLike", () => {
  describe("self-like rejection", () => {
    it("throws 'Sender cannot like own kudos' when sender_id === userId", async () => {
      const client = makeFakeClient({
        kudos: [{ data: { sender_id: OTHER_USER_ID }, error: null }],
      });
      mockedCreateClient.mockResolvedValue(client);

      await expect(toggleKudosLike(KUDOS_ID, OTHER_USER_ID)).rejects.toThrow(
        "Sender cannot like own kudos",
      );
      // No cache invalidation when self-like is rejected
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("does not throw when sender_id differs from userId", async () => {
      // kudos owned by SENDER_ID; liker is OTHER_USER_ID
      const client = makeFakeClient({
        kudos: [{ data: { sender_id: SENDER_ID }, error: null }],
        kudos_likes: [
          { data: null, error: null }, // no existing like
          { data: null, error: null }, // insert ok (thenabled)
        ],
      });
      mockedCreateClient.mockResolvedValue(client);

      const result = await toggleKudosLike(KUDOS_ID, OTHER_USER_ID);
      expect(result).toEqual({ liked: true });
    });
  });

  describe("create like (no existing like)", () => {
    it("returns { liked: true } and calls revalidatePath twice", async () => {
      const client = makeFakeClient({
        kudos: [{ data: { sender_id: SENDER_ID }, error: null }],
        kudos_likes: [
          { data: null, error: null }, // maybeSingle → no existing
          { data: null, error: null }, // insert ok
        ],
      });
      mockedCreateClient.mockResolvedValue(client);

      const result = await toggleKudosLike(KUDOS_ID, OTHER_USER_ID);

      expect(result).toEqual({ liked: true });
      expect(revalidatePath).toHaveBeenCalledTimes(2);
      expect(revalidatePath).toHaveBeenCalledWith("/vi/sun-kudos");
      expect(revalidatePath).toHaveBeenCalledWith("/en/sun-kudos");
    });

    it("calls insert with correct row { kudos_id, user_id, weight: 1 }", async () => {
      const client = makeFakeClient({
        kudos: [{ data: { sender_id: SENDER_ID }, error: null }],
        kudos_likes: [
          { data: null, error: null }, // no existing
          { data: null, error: null }, // insert
        ],
      });
      mockedCreateClient.mockResolvedValue(client);

      await toggleKudosLike(KUDOS_ID, OTHER_USER_ID);

      // The second kudos_likes chain is the insert chain
      const insertBuilder = client._builders["kudos_likes"][1];
      expect(insertBuilder.insert).toHaveBeenCalledWith({
        kudos_id: KUDOS_ID,
        user_id: OTHER_USER_ID,
        weight: 1,
      });
    });
  });

  describe("delete like (existing like present)", () => {
    it("returns { liked: false } and calls revalidatePath twice", async () => {
      const client = makeFakeClient({
        kudos: [{ data: { sender_id: SENDER_ID }, error: null }],
        kudos_likes: [
          { data: { kudos_id: KUDOS_ID }, error: null }, // existing like found
          { data: null, error: null }, // delete ok
        ],
      });
      mockedCreateClient.mockResolvedValue(client);

      const result = await toggleKudosLike(KUDOS_ID, OTHER_USER_ID);

      expect(result).toEqual({ liked: false });
      expect(revalidatePath).toHaveBeenCalledTimes(2);
      expect(revalidatePath).toHaveBeenCalledWith("/vi/sun-kudos");
      expect(revalidatePath).toHaveBeenCalledWith("/en/sun-kudos");
    });
  });

  describe("insert error", () => {
    it("throws with the insert error message; revalidatePath NOT called", async () => {
      const client = makeFakeClient({
        kudos: [{ data: { sender_id: SENDER_ID }, error: null }],
        kudos_likes: [
          { data: null, error: null }, // no existing
          { data: null, error: { message: "insert constraint violation" } }, // insert error
        ],
      });
      mockedCreateClient.mockResolvedValue(client);

      await expect(toggleKudosLike(KUDOS_ID, OTHER_USER_ID)).rejects.toThrow(
        "insert constraint violation",
      );
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe("delete error", () => {
    it("throws with the delete error message; revalidatePath NOT called", async () => {
      const client = makeFakeClient({
        kudos: [{ data: { sender_id: SENDER_ID }, error: null }],
        kudos_likes: [
          { data: { kudos_id: KUDOS_ID }, error: null }, // existing like
          { data: null, error: { message: "delete RLS violation" } }, // delete error
        ],
      });
      mockedCreateClient.mockResolvedValue(client);

      await expect(toggleKudosLike(KUDOS_ID, OTHER_USER_ID)).rejects.toThrow(
        "delete RLS violation",
      );
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });
});

// =============================================================================
// createKudos
// =============================================================================
describe("createKudos", () => {
  describe("validation short-circuit", () => {
    it("throws 'Invalid receiver' when receiverId equals SENDER_ID; createClient NOT called", async () => {
      await expect(
        createKudos({ ...baseCreateInput, receiverId: SENDER_ID }),
      ).rejects.toThrow("Invalid receiver: must be a different user");

      expect(createClient).not.toHaveBeenCalled();
    });

    it("throws when receiverId is empty string; createClient NOT called", async () => {
      await expect(
        createKudos({ ...baseCreateInput, receiverId: "" }),
      ).rejects.toThrow("Invalid receiver: must be a different user");

      expect(createClient).not.toHaveBeenCalled();
    });

    it("throws when title is blank; createClient NOT called", async () => {
      await expect(
        createKudos({ ...baseCreateInput, title: "   " }),
      ).rejects.toThrow("Title must not be empty");

      expect(createClient).not.toHaveBeenCalled();
    });

    it("throws when no hashtags; createClient NOT called", async () => {
      await expect(
        createKudos({ ...baseCreateInput, hashtagSlugs: [] }),
      ).rejects.toThrow("Select between 1 and 5 hashtags");

      expect(createClient).not.toHaveBeenCalled();
    });
  });

  describe("hashtag resolution errors", () => {
    it("throws tagError.message when hashtags DB query fails", async () => {
      const client = makeFakeClient({
        hashtags: [{ data: null, error: { message: "hashtags table unavailable" } }],
      });
      mockedCreateClient.mockResolvedValue(client);

      await expect(createKudos(baseCreateInput)).rejects.toThrow(
        "hashtags table unavailable",
      );
    });

    it("throws 'One or more hashtags are invalid' when returned rows count differs from requested", async () => {
      const input = { ...baseCreateInput, hashtagSlugs: ["tag-a", "tag-b"] };
      const client = makeFakeClient({
        // Only 1 row returned for 2 slugs → partial match
        hashtags: [{ data: [{ id: "ht-1", slug: "tag-a" }], error: null }],
      });
      mockedCreateClient.mockResolvedValue(client);

      await expect(createKudos(input)).rejects.toThrow(
        "One or more hashtags are invalid",
      );
    });

    it("throws 'One or more hashtags are invalid' when tagRows is null", async () => {
      const client = makeFakeClient({
        hashtags: [{ data: null, error: null }],
      });
      mockedCreateClient.mockResolvedValue(client);

      await expect(createKudos(baseCreateInput)).rejects.toThrow(
        "One or more hashtags are invalid",
      );
    });

    it("throws 'One or more hashtags are invalid' when tagRows is empty array for non-empty slugs", async () => {
      const client = makeFakeClient({
        hashtags: [{ data: [], error: null }],
      });
      mockedCreateClient.mockResolvedValue(client);

      await expect(createKudos(baseCreateInput)).rejects.toThrow(
        "One or more hashtags are invalid",
      );
    });
  });

  describe("kudos insert error", () => {
    it("throws kudosError.message; no compensating delete (never got an id)", async () => {
      const client = makeFakeClient({
        hashtags: [{ data: [{ id: "ht-1", slug: "teamwork" }], error: null }],
        kudos: [{ data: null, error: { message: "kudos insert failed" } }],
      });
      mockedCreateClient.mockResolvedValue(client);

      await expect(createKudos(baseCreateInput)).rejects.toThrow("kudos insert failed");

      // `from("kudos")` called once (for insert) — NOT a second time for compensating delete
      expect(client.from).toHaveBeenCalledTimes(2); // hashtags + kudos
      const kudosCalls = (client.from as ReturnType<typeof vi.fn>).mock.calls.filter(
        (args: unknown[]) => args[0] === "kudos",
      );
      expect(kudosCalls).toHaveLength(1);
    });
  });

  describe("compensating delete on link-row insert failure", () => {
    it("calls delete on kudos and throws linkError.message; revalidatePath NOT called", async () => {
      const CREATED_ID = "new-kudos-id-xyz";
      const client = makeFakeClient({
        hashtags: [{ data: [{ id: "ht-1", slug: "teamwork" }], error: null }],
        kudos: [
          { data: { id: CREATED_ID }, error: null }, // kudos insert ok
          { data: null, error: null }, // compensating delete
        ],
        kudos_hashtags: [
          { data: null, error: { message: "link insert constraint" } }, // link fails
        ],
      });
      mockedCreateClient.mockResolvedValue(client);

      await expect(createKudos(baseCreateInput)).rejects.toThrow("link insert constraint");

      // Compensating delete: from("kudos") called twice
      const kudosCalls = (client.from as ReturnType<typeof vi.fn>).mock.calls.filter(
        (args: unknown[]) => args[0] === "kudos",
      );
      expect(kudosCalls).toHaveLength(2);

      // The second kudos chain was the delete chain — eq("id", CREATED_ID) called
      const deleteBuilder = client._builders["kudos"][1];
      expect(deleteBuilder.delete).toHaveBeenCalled();
      expect(deleteBuilder.eq).toHaveBeenCalledWith("id", CREATED_ID);

      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe("happy path", () => {
    it("returns { id } and calls revalidatePath exactly twice on success", async () => {
      const CREATED_ID = "happy-kudos-id";
      const client = makeFakeClient({
        hashtags: [{ data: [{ id: "ht-1", slug: "teamwork" }], error: null }],
        kudos: [{ data: { id: CREATED_ID }, error: null }],
        kudos_hashtags: [{ data: null, error: null }],
      });
      mockedCreateClient.mockResolvedValue(client);

      const result = await createKudos(baseCreateInput);

      expect(result).toEqual({ id: CREATED_ID });
      expect(revalidatePath).toHaveBeenCalledTimes(2);
      expect(revalidatePath).toHaveBeenCalledWith("/vi/sun-kudos");
      expect(revalidatePath).toHaveBeenCalledWith("/en/sun-kudos");
    });

    it("calls link insert with correct rows [{ kudos_id, hashtag_id }]", async () => {
      const CREATED_ID = "link-check-id";
      const TAG_ID = "ht-99";
      const client = makeFakeClient({
        hashtags: [{ data: [{ id: TAG_ID, slug: "teamwork" }], error: null }],
        kudos: [{ data: { id: CREATED_ID }, error: null }],
        kudos_hashtags: [{ data: null, error: null }],
      });
      mockedCreateClient.mockResolvedValue(client);

      await createKudos(baseCreateInput);

      const linkBuilder = client._builders["kudos_hashtags"][0];
      expect(linkBuilder.insert).toHaveBeenCalledWith([
        { kudos_id: CREATED_ID, hashtag_id: TAG_ID },
      ]);
    });
  });

  describe("title/content trimming and anonymous_name nulling", () => {
    it("passes trimmed title and content to kudos insert", async () => {
      const CREATED_ID = "trim-check-id";
      const client = makeFakeClient({
        hashtags: [{ data: [{ id: "ht-1", slug: "teamwork" }], error: null }],
        kudos: [{ data: { id: CREATED_ID }, error: null }],
        kudos_hashtags: [{ data: null, error: null }],
      });
      mockedCreateClient.mockResolvedValue(client);

      await createKudos({
        ...baseCreateInput,
        title: "  Spaced Title  ",
        content: "  Spaced Content  ",
      });

      const kudosBuilder = client._builders["kudos"][0];
      const insertPayload = (kudosBuilder.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(insertPayload.title).toBe("Spaced Title");
      expect(insertPayload.content).toBe("Spaced Content");
    });

    it("sets anonymous_name to null when isAnonymous is false, even if anonymousName is provided", async () => {
      const CREATED_ID = "anon-false-id";
      const client = makeFakeClient({
        hashtags: [{ data: [{ id: "ht-1", slug: "teamwork" }], error: null }],
        kudos: [{ data: { id: CREATED_ID }, error: null }],
        kudos_hashtags: [{ data: null, error: null }],
      });
      mockedCreateClient.mockResolvedValue(client);

      await createKudos({
        ...baseCreateInput,
        isAnonymous: false,
        anonymousName: "My Name",
      });

      const kudosBuilder = client._builders["kudos"][0];
      const insertPayload = (kudosBuilder.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(insertPayload.is_anonymous).toBe(false);
      expect(insertPayload.anonymous_name).toBeNull();
    });

    it("preserves anonymous_name when isAnonymous is true", async () => {
      const CREATED_ID = "anon-true-id";
      const client = makeFakeClient({
        hashtags: [{ data: [{ id: "ht-1", slug: "teamwork" }], error: null }],
        kudos: [{ data: { id: CREATED_ID }, error: null }],
        kudos_hashtags: [{ data: null, error: null }],
      });
      mockedCreateClient.mockResolvedValue(client);

      await createKudos({
        ...baseCreateInput,
        isAnonymous: true,
        anonymousName: "Anonymous Hero",
      });

      const kudosBuilder = client._builders["kudos"][0];
      const insertPayload = (kudosBuilder.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(insertPayload.is_anonymous).toBe(true);
      expect(insertPayload.anonymous_name).toBe("Anonymous Hero");
    });

    it("sets anonymous_name to null when isAnonymous is true but anonymousName is null", async () => {
      const CREATED_ID = "anon-null-id";
      const client = makeFakeClient({
        hashtags: [{ data: [{ id: "ht-1", slug: "teamwork" }], error: null }],
        kudos: [{ data: { id: CREATED_ID }, error: null }],
        kudos_hashtags: [{ data: null, error: null }],
      });
      mockedCreateClient.mockResolvedValue(client);

      await createKudos({
        ...baseCreateInput,
        isAnonymous: true,
        anonymousName: null,
      });

      const kudosBuilder = client._builders["kudos"][0];
      const insertPayload = (kudosBuilder.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(insertPayload.is_anonymous).toBe(true);
      expect(insertPayload.anonymous_name).toBeNull();
    });

    it("sets sender_id to SENDER_ID constant in kudos insert", async () => {
      const CREATED_ID = "sender-check-id";
      const client = makeFakeClient({
        hashtags: [{ data: [{ id: "ht-1", slug: "teamwork" }], error: null }],
        kudos: [{ data: { id: CREATED_ID }, error: null }],
        kudos_hashtags: [{ data: null, error: null }],
      });
      mockedCreateClient.mockResolvedValue(client);

      await createKudos(baseCreateInput);

      const kudosBuilder = client._builders["kudos"][0];
      const insertPayload = (kudosBuilder.insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(insertPayload.sender_id).toBe(SENDER_ID);
    });
  });
});
