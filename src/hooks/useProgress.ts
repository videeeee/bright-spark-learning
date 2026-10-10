import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface UserSummaryData {
  user: {
    id: string;
    name: string;
    displayName: string;
    email: string;
    companion: "solin" | "pyro" | "aqua" | "lumi" | "verdi";
    classLevel?: string;
    curriculum?: string;
    subjects?: string[];
    settings?: Record<string, boolean>;
  };
  streak: {
    currentStreak: number;
    activeToday: boolean;
    lastActiveDate: string | null;
  };
  xp: {
    totalXp: number;
    weeklyXp: number;
  };
  stats: {
    totalNotes: number;
    notesThisWeek: number;
    levelsCompleted: number;
    uniqueLevelsCompleted: number;
    subjectProgress: Record<string, number>;
  };
}

export interface LeaderboardUserEntry {
  rank: number;
  userId: string;
  name: string;
  weeklyXp: number;
  totalXp: number;
  streak: number;
  levelsCompleted: number;
  companion: string;
  isCurrentUser: boolean;
  rankChange?: number;
}

export interface LeaderboardResponse {
  success: boolean;
  weekStartDate: string;
  totalLearners: number;
  leaderboard: LeaderboardUserEntry[];
  currentUser: LeaderboardUserEntry | null;
}

export interface CompleteLevelPayload {
  subject: string;
  chapterNumber: number;
  levelNumber: number;
  score: number;
}

export interface CompleteLevelResponse {
  success: boolean;
  passed: boolean;
  score: number;
  stars: number;
  xpEarned: number;
  isFirstCompletion: boolean;
  totalXp: number;
  currentStreak: number;
  attemptId: string;
}

/**
 * Single source of truth hook for user streak, XP, stats, and profile
 */
export function useProgressSummary() {
  const token = localStorage.getItem("token");

  return useQuery<UserSummaryData>({
    queryKey: ["progress", "summary"],
    queryFn: async () => {
      const res = await api.get<{ success: boolean } & UserSummaryData>("/api/progress/summary");
      return res;
    },
    enabled: Boolean(token),
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for weekly leaderboard rankings with rank change
 */
export function useLeaderboard() {
  const token = localStorage.getItem("token");

  return useQuery<LeaderboardResponse>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const res = await api.get<LeaderboardResponse | LeaderboardUserEntry[]>("/api/leaderboard");
      // Handle both structured response and legacy array fallback
      if (res && "leaderboard" in res && Array.isArray(res.leaderboard)) {
        return res as LeaderboardResponse;
      }
      if (Array.isArray(res)) {
        return {
          success: true,
          weekStartDate: new Date().toISOString(),
          totalLearners: res.length,
          leaderboard: res,
          currentUser: res.find((r) => r.isCurrentUser) || null,
        };
      }
      return {
        success: true,
        weekStartDate: new Date().toISOString(),
        totalLearners: 0,
        leaderboard: [],
        currentUser: null,
      };
    },
    enabled: Boolean(token),
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Mutation hook for completing a level and automatically syncing all caches
 */
export function useCompleteLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CompleteLevelPayload) => {
      return api.post<CompleteLevelResponse>("/api/progress/complete-level", payload);
    },
    onSuccess: () => {
      // Invalidate and refetch all progress, stats, and leaderboard caches together
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}
