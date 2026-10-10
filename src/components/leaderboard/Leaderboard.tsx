import React from 'react';
import { Flame, Star, Trophy, Medal, Crown, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { CompanionAvatar } from '@/components/companions/CompanionAvatar';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useLeaderboard, useProgressSummary, LeaderboardUserEntry } from '@/hooks/useProgress';

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
  if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
  return <span className="font-bold text-muted-foreground">{rank}</span>;
};

const getRankStyle = (rank: number, isUser?: boolean) => {
  if (isUser) return 'gradient-primary text-primary-foreground shadow-md';
  if (rank === 1) return 'bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-300 dark:from-yellow-950/30 dark:to-amber-950/30 dark:border-yellow-700/50';
  if (rank === 2) return 'bg-gradient-to-r from-gray-100 to-slate-100 border-gray-300 dark:from-slate-900/40 dark:to-slate-800/40 dark:border-slate-700/50';
  if (rank === 3) return 'bg-gradient-to-r from-orange-100 to-amber-100 border-orange-300 dark:from-orange-950/30 dark:to-amber-950/30 dark:border-orange-800/50';
  return 'bg-card border-border';
};

export function Leaderboard() {
  const { companion: currentCompanion, companions, getCompanionMeta } = useTheme();
  const { user } = useUser();
  const { data: leaderboardResponse, isLoading, error } = useLeaderboard();
  const { data: summary } = useProgressSummary();

  const entries: LeaderboardUserEntry[] = leaderboardResponse?.leaderboard || [];
  const currentUserEntry = leaderboardResponse?.currentUser;

  const currentCompanionMeta = getCompanionMeta(currentCompanion) ?? companions[0];

  const resolveMetaFor = (companionId?: string, fallbackIndex = 0) => {
    if (!companionId || companionId === 'current') return currentCompanionMeta;
    const meta = getCompanionMeta(companionId as 'solin' | 'pyro' | 'aqua' | 'lumi' | 'verdi');
    if (meta) return meta;
    return companions[fallbackIndex % companions.length] ?? companions[0];
  };

  const userStreak = summary?.streak?.currentStreak ?? (currentUserEntry?.streak || 0);
  const userWeeklyLevels = currentUserEntry?.levelsCompleted || 0;
  const userRankChange = currentUserEntry?.rankChange || 0;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-2">
          <Trophy className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Weekly Leaderboard</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Resets every Monday. Compete with your classmates and climb the ranks! 🏆
        </p>
      </div>

      {isLoading ? (
        <div className="cartoon-card flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Calculating weekly rankings...</p>
        </div>
      ) : error ? (
        <div className="cartoon-card text-center py-12 text-destructive">
          <p>Failed to load leaderboard. Please try refreshing.</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium (Only when at least 1 entry exists) */}
          {entries.length > 0 && (
            <div className="flex justify-center items-end gap-3 sm:gap-6 mb-8 pt-4">
              {[1, 0, 2].map((dataIndex, position) => {
                const entry = entries[dataIndex];
                if (!entry) return null;
                const meta = resolveMetaFor(entry.companion, entry.rank - 1);
                const isFirst = position === 1;
                const isSecond = position === 0;

                return (
                  <div key={entry.userId} className="text-center flex flex-col items-center">
                    {isFirst && <Crown className="w-8 h-8 text-yellow-500 mb-1 animate-bounce" />}
                    <div
                      className={`rounded-full flex items-center justify-center mb-2 overflow-hidden shadow-cartoon ${
                        isFirst ? 'w-20 h-20 sm:w-24 sm:h-24 text-4xl' : 'w-16 h-16 sm:w-20 sm:h-20 text-3xl'
                      }`}
                      style={{ background: `linear-gradient(135deg, ${meta.colors[0]}, ${meta.colors[1]})` }}
                    >
                      {meta.image ? (
                        <img src={meta.image} alt={meta.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{meta.emoji}</span>
                      )}
                    </div>
                    <div className={`font-bold text-sm sm:text-base ${entry.isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                      {entry.name}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground font-semibold">
                      {entry.weeklyXp.toLocaleString()} XP
                    </div>
                    <div
                      className={`mt-2 rounded-t-xl flex items-center justify-center ${
                        isFirst
                          ? 'w-20 sm:w-24 h-24 gradient-primary text-primary-foreground font-black text-2xl'
                          : isSecond
                          ? 'w-16 sm:w-20 h-16 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xl'
                          : 'w-16 sm:w-20 h-12 bg-amber-200 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-bold text-lg'
                      }`}
                    >
                      <span>#{entry.rank}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* User Quick Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="cartoon-card text-center">
              <Flame className="w-6 h-6 mx-auto mb-2 text-streak streak-fire" />
              <div className="text-sm text-muted-foreground">Your Streak</div>
              <div className="text-2xl font-bold text-foreground">{userStreak} days</div>
            </div>
            <div className="cartoon-card text-center">
              <Star className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-sm text-muted-foreground">Weekly Levels</div>
              <div className="text-2xl font-bold text-foreground">{userWeeklyLevels}</div>
            </div>
            <div className="cartoon-card text-center">
              {userRankChange > 0 ? (
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-success" />
              ) : userRankChange < 0 ? (
                <TrendingDown className="w-6 h-6 mx-auto mb-2 text-destructive" />
              ) : (
                <Minus className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              )}
              <div className="text-sm text-muted-foreground">Rank Change</div>
              <div
                className={`text-2xl font-bold ${
                  userRankChange > 0
                    ? 'text-success'
                    : userRankChange < 0
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                }`}
              >
                {userRankChange > 0 ? `+${userRankChange} ↑` : userRankChange < 0 ? `${userRankChange} ↓` : '—'}
              </div>
            </div>
          </div>

          {/* Rankings List */}
          <div className="cartoon-card">
            <h2 className="text-xl font-bold text-foreground mb-4">This Week's Rankings</h2>

            {entries.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-40" />
                <h3 className="text-lg font-bold text-foreground mb-1">No Weekly XP Yet</h3>
                <p className="text-muted-foreground">
                  Complete lessons in Learn mode to be the first champion on the leaderboard this week! 🚀
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => {
                  const meta = resolveMetaFor(entry.companion, entry.rank - 1);
                  return (
                    <div
                      key={entry.userId}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${getRankStyle(
                        entry.rank,
                        entry.isCurrentUser
                      )}`}
                    >
                      <div className="w-8 flex items-center justify-center font-bold text-lg">
                        {getRankIcon(entry.rank)}
                      </div>

                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl overflow-hidden shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${meta.colors[0]}, ${meta.colors[1]})` }}
                      >
                        {meta.image ? (
                          <img src={meta.image} alt={meta.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{meta.emoji}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate">
                          {entry.name} {entry.isCurrentUser ? '(You!)' : ''}
                        </div>
                        <div
                          className={`text-xs ${
                            entry.isCurrentUser ? 'text-primary-foreground/80' : 'text-muted-foreground'
                          }`}
                        >
                          {entry.levelsCompleted} {entry.levelsCompleted === 1 ? 'level' : 'levels'} completed this week
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-4">
                        <div className="flex items-center gap-1 font-semibold">
                          <Flame className="w-4 h-4 text-streak" />
                          <span>{entry.streak}</span>
                        </div>

                        <div className="min-w-[70px] text-right font-bold text-sm">
                          {entry.weeklyXp.toLocaleString()} XP
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Show Current User Outside Top 10 */}
                {currentUserEntry && !entries.some((e) => e.isCurrentUser) && (
                  <div className="mt-4 pt-4 border-t-2 border-dashed border-border">
                    <p className="text-xs font-semibold text-muted-foreground mb-2 text-center uppercase tracking-wider">
                      Your Standing
                    </p>
                    <div className="flex items-center gap-4 p-4 rounded-xl gradient-primary text-primary-foreground shadow-md">
                      <div className="w-8 flex items-center justify-center font-bold text-lg">
                        #{currentUserEntry.rank}
                      </div>
                      <div className="flex-1 font-bold truncate">
                        {currentUserEntry.name} (You!)
                      </div>
                      <div className="text-right font-bold text-sm">
                        {currentUserEntry.weeklyXp.toLocaleString()} XP
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Companion encouragement */}
      <div className="flex justify-center mt-6">
        <CompanionAvatar size="md" showBubble message="Keep practicing! Every level completed pushes you up! 🏆" />
      </div>
    </div>
  );
}
