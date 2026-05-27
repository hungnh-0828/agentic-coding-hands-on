"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useMockAuth } from "@/lib/auth/mock-auth-context";
import { toggleKudosLike } from "@/lib/kudos/actions";

import type { KudosBoardData, KudosPost } from "@/lib/kudos/types";

// Maps mock auth roles to demo user UUIDs from the seed.
const REGULAR_USER_ID = "00000000-0000-0000-0000-000000000001";
const ADMIN_USER_ID   = "00000000-0000-0000-0000-000000000002";

type ContextValue = {
  hashtags: KudosBoardData["hashtags"];
  departments: KudosBoardData["departments"];
  totalKudos: number;
  receiverNames: string[];

  selectedHashtag: string | null;
  selectedDept: string | null;
  setSelectedHashtag: (slug: string | null) => void;
  setSelectedDept: (slug: string | null) => void;

  filteredKudos: KudosPost[];
  highlightKudos: KudosPost[];

  currentUserId: string | null;
  toggleLike: (kudosId: string) => void;
  isLikePendingForCard: (kudosId: string) => boolean;

  showToast: (message: string) => void;
  toast: string | null;
};

const KudosBoardContext = createContext<ContextValue | null>(null);

export function KudosBoardProvider({
  data,
  children,
}: {
  data: KudosBoardData;
  children: React.ReactNode;
}) {
  const { isAuthenticated, role } = useMockAuth();
  const currentUserId = isAuthenticated
    ? role === "admin"
      ? ADMIN_USER_ID
      : REGULAR_USER_ID
    : null;

  const [kudos, setKudos] = useState<KudosPost[]>(data.kudos);
  // Re-sync from the server after a revalidation (e.g. router.refresh() once a new
  // kudos is created). React's "adjust state while rendering" pattern — preferred
  // over an effect — so freshly inserted posts surface without cascading renders.
  const [syncedKudos, setSyncedKudos] = useState(data.kudos);
  if (syncedKudos !== data.kudos) {
    setSyncedKudos(data.kudos);
    setKudos(data.kudos);
  }
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  // Per-card pending set prevents one card's request from disabling another's button.
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());

  // Auto-dismiss toast after 2.5s.
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(id);
  }, [toast]);

  const showToast = useCallback((message: string) => setToast(message), []);

  const filteredKudos = useMemo(
    () =>
      kudos.filter((k) => {
        if (selectedHashtag && !k.hashtags.some((h) => h.slug === selectedHashtag)) return false;
        if (
          selectedDept &&
          k.sender.departmentSlug !== selectedDept &&
          k.receiver.departmentSlug !== selectedDept
        )
          return false;
        return true;
      }),
    [kudos, selectedHashtag, selectedDept],
  );

  const highlightKudos = useMemo(() => {
    const scored = filteredKudos.map((k) => ({
      kudos: k,
      score: k.likes.reduce((sum, l) => sum + l.weight, 0),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 5).map((s) => s.kudos);
  }, [filteredKudos]);

  const toggleLike = useCallback(
    (kudosId: string) => {
      if (!currentUserId) {
        showToast("Vui lòng đăng nhập để thả tim");
        return;
      }
      // Guard against rapid double-click on the same card.
      if (pendingIds.has(kudosId)) return;

      const target = kudos.find((k) => k.id === kudosId);
      if (!target) return;
      if (target.sender.id === currentUserId) {
        showToast("Bạn không thể thả tim cho kudos của mình");
        return;
      }

      const isLiked = target.likes.some((l) => l.userId === currentUserId);
      // Optimistic local update.
      setKudos((prev) =>
        prev.map((k) => {
          if (k.id !== kudosId) return k;
          return {
            ...k,
            likes: isLiked
              ? k.likes.filter((l) => l.userId !== currentUserId)
              : [...k.likes, { userId: currentUserId, weight: 1 }],
          };
        }),
      );
      setPendingIds((prev) => new Set(prev).add(kudosId));

      (async () => {
        try {
          await toggleKudosLike(kudosId, currentUserId);
        } catch {
          // Roll back on failure.
          setKudos((prev) =>
            prev.map((k) => {
              if (k.id !== kudosId) return k;
              return {
                ...k,
                likes: isLiked
                  ? [...k.likes, { userId: currentUserId, weight: 1 }]
                  : k.likes.filter((l) => l.userId !== currentUserId),
              };
            }),
          );
          showToast("Không thể lưu lượt thả tim, vui lòng thử lại");
        } finally {
          setPendingIds((prev) => {
            if (!prev.has(kudosId)) return prev;
            const next = new Set(prev);
            next.delete(kudosId);
            return next;
          });
        }
      })();
    },
    [currentUserId, kudos, pendingIds, showToast],
  );

  const isLikePendingForCard = useCallback(
    (kudosId: string) => pendingIds.has(kudosId),
    [pendingIds],
  );

  // Memoize so consumers don't re-render on parent re-renders unrelated to context state.
  const value = useMemo<ContextValue>(
    () => ({
      hashtags: data.hashtags,
      departments: data.departments,
      totalKudos: kudos.length,
      receiverNames: data.receiverNames,
      selectedHashtag,
      selectedDept,
      setSelectedHashtag,
      setSelectedDept,
      filteredKudos,
      highlightKudos,
      currentUserId,
      toggleLike,
      isLikePendingForCard,
      showToast,
      toast,
    }),
    [
      data.hashtags,
      data.departments,
      data.receiverNames,
      kudos.length,
      selectedHashtag,
      selectedDept,
      filteredKudos,
      highlightKudos,
      currentUserId,
      toggleLike,
      isLikePendingForCard,
      showToast,
      toast,
    ],
  );

  return <KudosBoardContext.Provider value={value}>{children}</KudosBoardContext.Provider>;
}

export function useKudosBoard() {
  const ctx = useContext(KudosBoardContext);
  if (!ctx) throw new Error("useKudosBoard must be used inside KudosBoardProvider");
  return ctx;
}
