import { vi, describe, it, expect, beforeEach } from "vitest";

// vi.hoisted ensures the mock factory variable is available when vi.mock() is
// hoisted to the top of the file by Vitest's transform.
const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient }));

import { fetchKudosBoard, fetchKudosStats } from "../queries";

// ---------------------------------------------------------------------------
// Board helpers
// ---------------------------------------------------------------------------

type TableRowMap = Record<string, { data?: unknown; error?: unknown } | null>;

/** Build a fake Supabase client for fetchKudosBoard.
 *  Each table name maps to the { data, error } response its .select() yields. */
function boardClient(rows: TableRowMap) {
  return {
    from: (table: string) => ({
      select: () => Promise.resolve(rows[table] ?? { data: [] }),
    }),
  };
}

// Minimal valid row sets used across multiple tests
const DEFAULT_USERS = [
  { id: "u1", display_name: "Alice", department_id: "d1", avatar_url: null },
  { id: "u2", display_name: "Bob", department_id: null, avatar_url: null },
];
const DEFAULT_DEPARTMENTS = [{ id: "d1", slug: "engineering", name: "Engineering" }];
const DEFAULT_HASHTAGS = [
  { id: "h1", slug: "teamwork", label: "Teamwork" },
  { id: "h2", slug: "innovation", label: "Innovation" },
];
const DEFAULT_KUDOS = [
  {
    id: "k1",
    sender_id: "u1",
    receiver_id: "u2",
    title: "Great work",
    content: "Really impressed",
    created_at: "2025-06-01T00:00:00Z",
    is_anonymous: false,
    anonymous_name: null,
    image_urls: null,
  },
  {
    id: "k2",
    sender_id: "u2",
    receiver_id: "u1",
    title: "Thanks",
    content: "Appreciate the help",
    created_at: "2025-01-01T00:00:00Z",
    is_anonymous: false,
    anonymous_name: null,
    image_urls: null,
  },
];

function defaultBoardData(): TableRowMap {
  return {
    users: { data: DEFAULT_USERS },
    departments: { data: DEFAULT_DEPARTMENTS },
    hashtags: { data: DEFAULT_HASHTAGS },
    kudos: { data: DEFAULT_KUDOS },
    kudos_hashtags: { data: [] },
    kudos_likes: { data: [] },
  };
}

// ---------------------------------------------------------------------------
// Stats helpers
// ---------------------------------------------------------------------------

/** Build a fake Supabase client for fetchKudosStats.
 *  from("kudos") is called twice: first for receiver count, then for sender count.
 *  An index counter routes each call to the correct result. */
function statsClient(opts: {
  recvCount: number | null;
  sentCount: number | null;
  heartRows: { weight: number | null | undefined }[];
  errorOnKudos?: boolean;
  errorOnLikes?: boolean;
}) {
  let kudosCallIndex = 0;

  return {
    from: (table: string) => {
      if (table === "kudos") {
        const callIdx = kudosCallIndex++;
        const count = callIdx === 0 ? opts.recvCount : opts.sentCount;
        const err = opts.errorOnKudos ? new Error("DB error") : null;
        return {
          select: () => ({
            eq: () => Promise.resolve({ count, error: err }),
          }),
        };
      }
      // kudos_likes
      const err = opts.errorOnLikes ? new Error("DB error") : null;
      return {
        select: () => ({
          eq: () => Promise.resolve({ data: opts.heartRows, error: err }),
        }),
      };
    },
  };
}

// ---------------------------------------------------------------------------
// fetchKudosBoard — test suite
// ---------------------------------------------------------------------------

describe("fetchKudosBoard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("happy path: returns kudos, people, hashtags, departments, totalKudos", async () => {
    createClient.mockResolvedValue(boardClient(defaultBoardData()));

    const result = await fetchKudosBoard();

    expect(result.kudos).toHaveLength(2);
    expect(result.totalKudos).toBe(2);
    expect(result.people).toHaveLength(2);
    expect(result.departments).toEqual([{ slug: "engineering", name: "Engineering" }]);
    expect(result.hashtags).toHaveLength(2);
  });

  it("hero badge is wired: receiver with 10 kudos gets badge=rising, starCount=1", async () => {
    // u2 receives 10 kudos from u1 — all kudos point u1 → u2
    const manyKudos = Array.from({ length: 10 }, (_, i) => ({
      id: `k${i}`,
      sender_id: "u1",
      receiver_id: "u2",
      title: "Good job",
      content: "Well done",
      created_at: `2025-01-0${(i % 9) + 1}T00:00:00Z`,
      is_anonymous: false,
      anonymous_name: null,
      image_urls: null,
    }));

    createClient.mockResolvedValue(
      boardClient({
        ...defaultBoardData(),
        kudos: { data: manyKudos },
      }),
    );

    const result = await fetchKudosBoard();
    const bob = result.people.find((p) => p.id === "u2");
    expect(bob?.badge).toBe("rising");
    expect(bob?.starCount).toBe(1);
    expect(bob?.receivedCount).toBe(10);
  });

  it("sorts newest-first: kudos with June date comes before January date", async () => {
    createClient.mockResolvedValue(boardClient(defaultBoardData()));

    const result = await fetchKudosBoard();

    expect(result.kudos[0].createdAt).toBe("2025-06-01T00:00:00Z");
    expect(result.kudos[1].createdAt).toBe("2025-01-01T00:00:00Z");
  });

  it("drops kudos whose receiver_id is not in users", async () => {
    const kudosWithOrphan = [
      ...DEFAULT_KUDOS,
      {
        id: "k3",
        sender_id: "u1",
        receiver_id: "unknown-user",
        title: "Orphan",
        content: "Should be dropped",
        created_at: "2025-03-01T00:00:00Z",
        is_anonymous: false,
        anonymous_name: null,
        image_urls: null,
      },
    ];

    createClient.mockResolvedValue(
      boardClient({
        ...defaultBoardData(),
        kudos: { data: kudosWithOrphan },
      }),
    );

    const result = await fetchKudosBoard();

    expect(result.kudos).toHaveLength(2);
    expect(result.totalKudos).toBe(2);
    expect(result.kudos.find((k) => k.id === "k3")).toBeUndefined();
  });

  it("drops kudos whose sender_id is not in users", async () => {
    const kudosWithOrphanSender = [
      {
        id: "k-orphan",
        sender_id: "ghost-sender",
        receiver_id: "u2",
        title: "Ghost kudo",
        content: "No sender",
        created_at: "2025-05-01T00:00:00Z",
        is_anonymous: false,
        anonymous_name: null,
        image_urls: null,
      },
    ];

    createClient.mockResolvedValue(
      boardClient({
        ...defaultBoardData(),
        kudos: { data: kudosWithOrphanSender },
      }),
    );

    const result = await fetchKudosBoard();

    expect(result.kudos).toHaveLength(0);
    expect(result.totalKudos).toBe(0);
  });

  it("display_name null → person.name defaults to 'Sunner'", async () => {
    const usersWithNullName = [
      { id: "u1", display_name: null, department_id: null, avatar_url: null },
      { id: "u2", display_name: "Bob", department_id: null, avatar_url: null },
    ];

    createClient.mockResolvedValue(
      boardClient({
        ...defaultBoardData(),
        users: { data: usersWithNullName },
      }),
    );

    const result = await fetchKudosBoard();
    const alice = result.people.find((p) => p.id === "u1");
    expect(alice?.name).toBe("Sunner");
  });

  it("department null → departmentSlug and departmentName are null", async () => {
    // u2 has department_id: null in DEFAULT_USERS
    createClient.mockResolvedValue(boardClient(defaultBoardData()));

    const result = await fetchKudosBoard();
    const bob = result.people.find((p) => p.id === "u2");
    expect(bob?.departmentSlug).toBeNull();
    expect(bob?.departmentName).toBeNull();
  });

  it("department present → departmentSlug and departmentName populated", async () => {
    // u1 has department_id: "d1"
    createClient.mockResolvedValue(boardClient(defaultBoardData()));

    const result = await fetchKudosBoard();
    const alice = result.people.find((p) => p.id === "u1");
    expect(alice?.departmentSlug).toBe("engineering");
    expect(alice?.departmentName).toBe("Engineering");
  });

  it("image_urls null → imageUrls === []; title null → title === ''", async () => {
    const kudosNullFields = [
      {
        id: "k1",
        sender_id: "u1",
        receiver_id: "u2",
        title: null,
        content: "Content",
        created_at: "2025-06-01T00:00:00Z",
        is_anonymous: false,
        anonymous_name: null,
        image_urls: null,
      },
    ];

    createClient.mockResolvedValue(
      boardClient({
        ...defaultBoardData(),
        kudos: { data: kudosNullFields },
      }),
    );

    const result = await fetchKudosBoard();
    expect(result.kudos[0].imageUrls).toEqual([]);
    expect(result.kudos[0].title).toBe("");
  });

  it("is_anonymous true → isAnonymous true and anonymousName mapped through", async () => {
    const anonKudos = [
      {
        id: "k1",
        sender_id: "u1",
        receiver_id: "u2",
        title: "Secret praise",
        content: "From a quiet admirer",
        created_at: "2025-06-01T00:00:00Z",
        is_anonymous: true,
        anonymous_name: "A Grateful Sunner",
        image_urls: null,
      },
    ];

    createClient.mockResolvedValue(
      boardClient({
        ...defaultBoardData(),
        kudos: { data: anonKudos },
      }),
    );

    const result = await fetchKudosBoard();
    expect(result.kudos[0].isAnonymous).toBe(true);
    expect(result.kudos[0].anonymousName).toBe("A Grateful Sunner");
  });

  it("hashtags joined: kudo linked to hashtag resolves {slug,label}; unknown hashtag_id is skipped", async () => {
    const linkRows = [
      { kudos_id: "k1", hashtag_id: "h1" },
      { kudos_id: "k1", hashtag_id: "h2" },
      { kudos_id: "k1", hashtag_id: "unknown-hashtag" }, // should be skipped
    ];

    createClient.mockResolvedValue(
      boardClient({
        ...defaultBoardData(),
        kudos_hashtags: { data: linkRows },
      }),
    );

    const result = await fetchKudosBoard();
    const k1 = result.kudos.find((k) => k.id === "k1");
    expect(k1?.hashtags).toHaveLength(2);
    expect(k1?.hashtags).toContainEqual({ slug: "teamwork", label: "Teamwork" });
    expect(k1?.hashtags).toContainEqual({ slug: "innovation", label: "Innovation" });
  });

  it("likes joined: like rows grouped under correct kudos with {userId, weight}", async () => {
    const likeRows = [
      { kudos_id: "k1", user_id: "u2", weight: 2 },
      { kudos_id: "k1", user_id: "u1", weight: 1 },
      { kudos_id: "k2", user_id: "u1", weight: 3 },
    ];

    createClient.mockResolvedValue(
      boardClient({
        ...defaultBoardData(),
        kudos_likes: { data: likeRows },
      }),
    );

    const result = await fetchKudosBoard();
    const k1 = result.kudos.find((k) => k.id === "k1");
    const k2 = result.kudos.find((k) => k.id === "k2");

    expect(k1?.likes).toHaveLength(2);
    expect(k1?.likes).toContainEqual({ userId: "u2", weight: 2 });
    expect(k1?.likes).toContainEqual({ userId: "u1", weight: 1 });
    expect(k2?.likes).toHaveLength(1);
    expect(k2?.likes).toContainEqual({ userId: "u1", weight: 3 });
  });

  it("receiverNames is a de-duplicated set of receiver names", async () => {
    // Both kudos are sent to u2 (Bob) — receiverNames should have one entry
    const oneSidedKudos = [
      {
        id: "k1",
        sender_id: "u1",
        receiver_id: "u2",
        title: "First",
        content: "A",
        created_at: "2025-06-01T00:00:00Z",
        is_anonymous: false,
        anonymous_name: null,
        image_urls: null,
      },
      {
        id: "k2",
        sender_id: "u1",
        receiver_id: "u2",
        title: "Second",
        content: "B",
        created_at: "2025-05-01T00:00:00Z",
        is_anonymous: false,
        anonymous_name: null,
        image_urls: null,
      },
    ];

    createClient.mockResolvedValue(
      boardClient({
        ...defaultBoardData(),
        kudos: { data: oneSidedKudos },
      }),
    );

    const result = await fetchKudosBoard();

    expect(result.receiverNames).toHaveLength(1);
    expect(result.receiverNames).toContain("Bob");
  });

  it("kudosRes.error truthy → returns EMPTY", async () => {
    createClient.mockResolvedValue(
      boardClient({
        ...defaultBoardData(),
        kudos: { error: new Error("DB connection failed") },
      }),
    );

    const result = await fetchKudosBoard();

    expect(result).toEqual({
      kudos: [],
      hashtags: [],
      departments: [],
      totalKudos: 0,
      receiverNames: [],
      people: [],
    });
  });

  it("kudosRes.data null → returns EMPTY", async () => {
    createClient.mockResolvedValue(
      boardClient({
        ...defaultBoardData(),
        kudos: { data: null },
      }),
    );

    const result = await fetchKudosBoard();

    expect(result).toEqual({
      kudos: [],
      hashtags: [],
      departments: [],
      totalKudos: 0,
      receiverNames: [],
      people: [],
    });
  });

  it("createClient throws → catch returns EMPTY", async () => {
    createClient.mockRejectedValue(new Error("Supabase init failed"));

    const result = await fetchKudosBoard();

    expect(result).toEqual({
      kudos: [],
      hashtags: [],
      departments: [],
      totalKudos: 0,
      receiverNames: [],
      people: [],
    });
  });
});

// ---------------------------------------------------------------------------
// fetchKudosStats — test suite
// ---------------------------------------------------------------------------

describe("fetchKudosStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("happy path: received and sent counts are correct", async () => {
    createClient.mockResolvedValue(
      statsClient({ recvCount: 5, sentCount: 3, heartRows: [] }),
    );

    const result = await fetchKudosStats("user-1");

    expect(result.received).toBe(5);
    expect(result.sent).toBe(3);
  });

  it("hearts: sum of weight values", async () => {
    createClient.mockResolvedValue(
      statsClient({
        recvCount: 0,
        sentCount: 0,
        heartRows: [{ weight: 2 }, { weight: 3 }],
      }),
    );

    const result = await fetchKudosStats("user-1");

    expect(result.hearts).toBe(5);
  });

  it("hearts weight fallback: null weight counts as 1", async () => {
    createClient.mockResolvedValue(
      statsClient({
        recvCount: 0,
        sentCount: 0,
        heartRows: [{ weight: null }, { weight: undefined }],
      }),
    );

    const result = await fetchKudosStats("user-1");

    expect(result.hearts).toBe(2);
  });

  it("count null → received and sent default to 0", async () => {
    createClient.mockResolvedValue(
      statsClient({ recvCount: null, sentCount: null, heartRows: [] }),
    );

    const result = await fetchKudosStats("user-1");

    expect(result.received).toBe(0);
    expect(result.sent).toBe(0);
  });

  it("boxesOpened is always 3 and boxesUnopened is always 2 on happy path", async () => {
    createClient.mockResolvedValue(
      statsClient({ recvCount: 10, sentCount: 7, heartRows: [{ weight: 1 }] }),
    );

    const result = await fetchKudosStats("user-1");

    expect(result.boxesOpened).toBe(3);
    expect(result.boxesUnopened).toBe(2);
  });

  it("from('kudos') is called twice with different eq args: recv then sent", async () => {
    // Verify call-order routing: recv=7, sent=2 are distinct values
    createClient.mockResolvedValue(
      statsClient({ recvCount: 7, sentCount: 2, heartRows: [] }),
    );

    const result = await fetchKudosStats("user-1");

    expect(result.received).toBe(7);
    expect(result.sent).toBe(2);
  });

  it("createClient throws → returns all-zero object including boxes 0/0", async () => {
    createClient.mockRejectedValue(new Error("Auth error"));

    const result = await fetchKudosStats("user-1");

    expect(result).toEqual({
      received: 0,
      sent: 0,
      hearts: 0,
      boxesOpened: 0,
      boxesUnopened: 0,
    });
  });
});
