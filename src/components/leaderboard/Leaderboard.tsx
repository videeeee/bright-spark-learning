import React, { useEffect, useState } from 'react';
import { Flame, Star, Trophy, Medal, Crown, TrendingUp, Loader2 } from 'lucide-react';
import { CompanionAvatar } from '@/components/companions/CompanionAvatar';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';

type CompanionId = 'solin' | 'pyro' | 'aqua' | 'lumi' | 'verdi';

interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  levels: number;
  streak: number;
  companionId: CompanionId | 'current';
  isUser?: boolean;
}

const placeholderLeaderboardData: LeaderboardEntry[] = [
  { rank: 1, name: 'Alex K.', xp: 12450, levels: 156, streak: 45, companionId: 'solin' },
  { rank: 2, name: 'Sarah M.', xp: 11200, levels: 142, streak: 38, companionId: 'pyro' },
  { rank: 3, name: 'You', xp: 2450, levels: 47, streak: 12, companionId: 'current', isUser: true },
  { rank: 4, name: 'Mike R.', xp: 8900, levels: 98, streak: 28, companionId: 'aqua' },
  { rank: 5, name: 'Emma L.', xp: 7650, levels: 89, streak: 21, companionId: 'lumi' },
  { rank: 6, name: 'Jake T.', xp: 6800, levels: 76, streak: 19, companionId: 'verdi' },
  { rank: 7, name: 'Lily C.', xp: 5400, levels: 65, streak: 15, companionId: 'solin' },
  { rank: 8, name: 'Noah B.', xp: 4900, levels: 58, streak: 14, companionId: 'pyro' },
  { rank: 9, name: 'Mia W.', xp: 4200, levels: 52, streak: 11, companionId: 'aqua' },
  { rank: 10, name: 'Ethan D.', xp: 3800, levels: 45, streak: 9, companionId: 'lumi' },
];

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
  if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
  return <span className="font-bold text-muted-foreground">{rank}</span>;
};

const getRankStyle = (rank: number, isUser?: boolean) => {
  if (isUser) return 'gradient-primary text-primary-foreground';
  if (rank === 1) return 'bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-300';
  if (rank === 2) return 'bg-gradient-to-r from-gray-100 to-slate-100 border-gray-300';
  if (rank === 3) return 'bg-gradient-to-r from-orange-100 to-amber-100 border-orange-300';
  return 'bg-card';
};

export function Leaderboard() {
  const { companion: currentCompanion, companions, getCompanionMeta } = useTheme();
  const { user } = useUser();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(placeholderLeaderboardData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserName = user?.name || 'You';
  const defaultCompanionMeta = companions[0];
  const currentCompanionMeta = getCompanionMeta(currentCompanion) ?? defaultCompanionMeta;

  const resolveMetaFor = (companionId: string | 'current', fallbackIndex: number) => {
    if (companionId === 'current') {
      return currentCompanionMeta;
    }

    const meta = getCompanionMeta(companionId as any);
    if (meta) return meta;

    return companions[fallbackIndex % companions.length] ?? defaultCompanionMeta;
  };

  useEffect(() => {
    const normalizeApiData = (apiData: Array<{ name: string; xp: number }>) => {
      return apiData.map((entry, index) => {
        const isUser = entry.name === user?.name;
        return {
          rank: index + 1,
          name: isUser ? currentUserName : entry.name,
          xp: entry.xp,
          levels: Math.max(1, Math.round(entry.xp / 140)),
          streak: Math.max(1, 20 - index * 2),
          companionId: isUser ? 'current' : companions[index % companions.length].id,
          isUser,
        };
      });
    };

    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 8000);

      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/leaderboard`, {
          headers: { Authorization: token },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error('Leaderboard could not be loaded');
        }

        const data = await res.json();
        setLeaderboardData(normalizeApiData(data));
      } catch (err) {
        console.error('Leaderboard fetch failed:', err);
        const message = err instanceof Error ? err.message : 'Failed to load leaderboard';
        setError(message === 'The user aborted a request.' ? 'Leaderboard request timed out' : message);
        setLeaderboardData(placeholderLeaderboardData);
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user?.name, companions, currentUserName]);

  const curriculumLabel = user?.curriculum ? `${user.curriculum} learners` : 'all learners';

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-2">
          <Trophy className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Leaderboard for {curriculumLabel}. See how you stack up against other learners!
        </p>
      </div>

      {isLoading ? (
        <div className="cartoon-card flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      ) : (
        <>
          <div className="flex justify-center items-end gap-4 mb-8">
            {[1, 0, 2].map((dataIndex, position) => {
              const entry = leaderboardData[dataIndex];
              if (!entry) return null;
              const meta = resolveMetaFor(entry.companionId, entry.rank - 1);
              if (!meta) return null;
              const isFirst = position === 1;
              const isSecond = position === 0;
              const isThird = position === 2;

              return (
                <div key={entry.rank} className="text-center">
                  {isFirst && <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-1" />}
                  <div
                    className={`rounded-full flex items-center justify-center mx-auto mb-2 ${
                      isFirst ? 'w-24 h-24 text-5xl float shadow-cartoon' : 'w-20 h-20 text-4xl shadow-cartoon'
                    }`}
                    style={{ background: `linear-gradient(135deg, ${meta.colors[0]}, ${meta.colors[1]})` }}
                  >
                    {meta.image ? <img src={meta.image} alt={meta.name} className="w-full h-full object-cover rounded-full" /> : <span>{meta.emoji}</span>}
                  </div>
                  <div className={`font-bold ${entry.isUser ? 'text-primary' : 'text-foreground'}`}>{entry.name}</div>
                  <div className="text-sm text-muted-foreground">{(entry.xp ?? 0).toLocaleString()} XP</div>
                  <div className={`mt-2 rounded-t-xl flex items-center justify-center ${
                    isFirst ? 'w-24 h-28 gradient-primary' : isSecond ? 'w-20 h-20 bg-gray-200' : 'w-20 h-16 bg-amber-200'
                  }`}>
                    <span className={`${isFirst ? 'text-3xl font-bold text-primary-foreground' : isSecond ? 'text-2xl font-bold text-gray-500' : 'text-2xl font-bold text-amber-700'}`}>
                      {entry.rank}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="cartoon-card text-center">
              <Flame className="w-6 h-6 mx-auto mb-2 text-streak" />
              <div className="text-sm text-muted-foreground">Your Streak</div>
              <div className="text-2xl font-bold text-foreground">{leaderboardData.find((entry) => entry.isUser)?.streak ?? 12} days</div>
            </div>
            <div className="cartoon-card text-center">
              <Star className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-sm text-muted-foreground">Levels This Week</div>
              <div className="text-2xl font-bold text-foreground">{leaderboardData.find((entry) => entry.isUser)?.levels ?? 8}</div>
            </div>
            <div className="cartoon-card text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-success" />
              <div className="text-sm text-muted-foreground">Rank Change</div>
              <div className="text-2xl font-bold text-success">+2 ↑</div>
            </div>
          </div>

          <div className="cartoon-card">
            <h2 className="text-xl font-bold text-foreground mb-4">This Week's Rankings</h2>

            <div className="space-y-3">
              {leaderboardData.map((entry) => {
                const meta = resolveMetaFor(entry.companionId, entry.rank - 1);
                if (!meta || !entry.xp) return null;
                return (
                  <div
                    key={entry.rank}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${getRankStyle(entry.rank, entry.isUser)}`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center">{getRankIcon(entry.rank)}</div>

                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: `linear-gradient(135deg, ${meta.colors[0]}, ${meta.colors[1]})` }}>
                      {meta.image ? <img src={meta.image} alt={meta.name} className="w-full h-full object-cover rounded-full" /> : <span className="text-2xl">{meta.emoji}</span>}
                    </div>

                    <div className="flex-1">
                      <div className={`font-bold ${entry.isUser ? 'text-primary-foreground' : 'text-foreground'}`}>
                        {entry.name} {entry.isUser ? '(You!)' : ''}
                      </div>
                      <div className={`text-sm ${entry.isUser ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {entry.levels ?? 0} levels completed
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`flex items-center gap-1 ${entry.isUser ? 'text-primary-foreground' : 'text-streak'}`}>
                        <Flame className="w-4 h-4" />
                        <span className="font-bold">{entry.streak ?? 0}</span>
                      </div>
                      <div className={`text-sm ${entry.isUser ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {(entry.xp ?? 0).toLocaleString()} XP
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {error && (
        <div className="mt-6 cartoon-card text-center text-destructive">
          <p>{error}</p>
        </div>
      )}

      <div className="flex justify-center mt-6">
        <CompanionAvatar size="md" showBubble message="Keep going! You can reach the top! 🏆" />
      </div>
    </div>
  );
}
