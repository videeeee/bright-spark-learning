import React from 'react';
import { Trophy, Flame, Star, Medal, Crown, TrendingUp } from 'lucide-react';
import { CompanionAvatar } from '@/components/companions/CompanionAvatar';
import { useTheme } from '@/contexts/ThemeContext';

// Leaderboard entries now map to companions (solin, pyro, aqua, lumi, verdi). Use 'current' to indicate the user's selected companion.
const leaderboardData = [
  { rank: 1, name: 'Alex K.', companionId: 'solin', streak: 45, levels: 156, xp: 12450, isUser: false },
  { rank: 2, name: 'Sarah M.', companionId: 'pyro', streak: 38, levels: 142, xp: 11200, isUser: false },
  { rank: 3, name: 'You', companionId: 'current', streak: 12, levels: 47, xp: 2450, isUser: true },
  { rank: 4, name: 'Mike R.', companionId: 'aqua', streak: 28, levels: 98, xp: 8900, isUser: false },
  { rank: 5, name: 'Emma L.', companionId: 'lumi', streak: 21, levels: 89, xp: 7650, isUser: false },
  { rank: 6, name: 'Jake T.', companionId: 'verdi', streak: 19, levels: 76, xp: 6800, isUser: false },
  { rank: 7, name: 'Lily C.', companionId: 'solin', streak: 15, levels: 65, xp: 5400, isUser: false },
  { rank: 8, name: 'Noah B.', companionId: 'pyro', streak: 14, levels: 58, xp: 4900, isUser: false },
  { rank: 9, name: 'Mia W.', companionId: 'aqua', streak: 11, levels: 52, xp: 4200, isUser: false },
  { rank: 10, name: 'Ethan D.', companionId: 'lumi', streak: 9, levels: 45, xp: 3800, isUser: false },
];

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
  if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
  return <span className="font-bold text-muted-foreground">{rank}</span>;
};

const gradientFromMeta = (meta: any) => `linear-gradient(135deg, ${meta.colors[0]}, ${meta.colors[1]})`;

const getRankStyle = (rank: number, isUser: boolean) => {
  if (isUser) return 'gradient-primary text-primary-foreground';
  if (rank === 1) return 'bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-300';
  if (rank === 2) return 'bg-gradient-to-r from-gray-100 to-slate-100 border-gray-300';
  if (rank === 3) return 'bg-gradient-to-r from-orange-100 to-amber-100 border-orange-300';
  return 'bg-card';
};

export function Leaderboard() {
  const { companion: currentCompanion, companions, getCompanionMeta } = useTheme();

  const resolveMetaFor = (companionId: string | 'current', fallbackIndex: number) => {
    if (companionId === 'current') return getCompanionMeta(currentCompanion)!;
    const meta = getCompanionMeta(companionId as any);
    if (meta) return meta;
    // fallback to a companion based on index
    return companions[fallbackIndex % companions.length];
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-2">
          <Trophy className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
        </div>
        <p className="text-muted-foreground text-lg">See how you stack up against other learners!</p>
      </div>

      {/* Top 3 Podium */}
      <div className="flex justify-center items-end gap-4 mb-8">
        {/* Second Place */}
        {(() => {
          const meta = resolveMetaFor(leaderboardData[1].companionId as any, 1);
          return (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-2 shadow-cartoon" style={{ background: `linear-gradient(135deg, ${meta.colors[0]}, ${meta.colors[1]})` }}>
                {meta.image ? <img src={meta.image} alt={meta.name} className="w-full h-full object-cover rounded-full" /> : <span className="text-3xl">{meta.emoji}</span>}
              </div>
              <div className="font-bold text-foreground">{leaderboardData[1].name}</div>
              <div className="text-sm text-muted-foreground">{leaderboardData[1].xp.toLocaleString()} XP</div>
              <div className="w-20 h-20 bg-gray-200 rounded-t-xl mt-2 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-500">2</span>
              </div>
            </div>
          );
        })()}

        {/* First Place */}
        {(() => {
          const meta = resolveMetaFor(leaderboardData[0].companionId as any, 0);
          return (
            <div className="text-center">
              <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-1" />
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-2 shadow-cartoon float" style={{ background: `linear-gradient(135deg, ${meta.colors[0]}, ${meta.colors[1]})` }}>
                {meta.image ? <img src={meta.image} alt={meta.name} className="w-full h-full object-cover rounded-full" /> : <span className="text-4xl">{meta.emoji}</span>}
              </div>
              <div className="font-bold text-foreground text-lg">{leaderboardData[0].name}</div>
              <div className="text-sm text-muted-foreground">{leaderboardData[0].xp.toLocaleString()} XP</div>
              <div className="w-24 h-28 gradient-primary rounded-t-xl mt-2 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary-foreground">1</span>
              </div>
            </div>
          );
        })()}

        {/* Third Place (You!) */}
        {(() => {
          const meta = resolveMetaFor(leaderboardData[2].companionId as any, 2);
          return (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-2 shadow-cartoon" style={{ background: `linear-gradient(135deg, ${meta.colors[0]}, ${meta.colors[1]})` }}>
                {meta.image ? <img src={meta.image} alt={meta.name} className="w-full h-full object-cover rounded-full" /> : <span className="text-3xl">{meta.emoji}</span>}
              </div>
              <div className="font-bold text-primary">{leaderboardData[2].name} ⭐</div>
              <div className="text-sm text-muted-foreground">{leaderboardData[2].xp.toLocaleString()} XP</div>
              <div className="w-20 h-16 bg-amber-200 rounded-t-xl mt-2 flex items-center justify-center">
                <span className="text-2xl font-bold text-amber-700">3</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="cartoon-card text-center">
          <Flame className="w-6 h-6 mx-auto mb-2 text-streak" />
          <div className="text-sm text-muted-foreground">Your Streak</div>
          <div className="text-2xl font-bold text-foreground">12 days</div>
        </div>
        <div className="cartoon-card text-center">
          <Star className="w-6 h-6 mx-auto mb-2 text-primary" />
          <div className="text-sm text-muted-foreground">Levels This Week</div>
          <div className="text-2xl font-bold text-foreground">8</div>
        </div>
        <div className="cartoon-card text-center">
          <TrendingUp className="w-6 h-6 mx-auto mb-2 text-success" />
          <div className="text-sm text-muted-foreground">Rank Change</div>
          <div className="text-2xl font-bold text-success">+2 ↑</div>
        </div>
      </div>

      {/* Full Leaderboard */}
      <div className="cartoon-card">
        <h2 className="text-xl font-bold text-foreground mb-4">This Week's Rankings</h2>
        
        <div className="space-y-3">
          {leaderboardData.map((user) => (
            <div
              key={user.rank}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${getRankStyle(user.rank, user.isUser)}`}
            >
              <div className="w-10 h-10 flex items-center justify-center">
                {getRankIcon(user.rank)}
              </div>

              {(() => {
                const meta = resolveMetaFor(user.companionId as any, user.rank - 1);
                return (
                  <>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: `linear-gradient(135deg, ${meta.colors[0]}, ${meta.colors[1]})` }}>
                      {meta.image ? <img src={meta.image} alt={meta.name} className="w-full h-full object-cover rounded-full" /> : <span className="text-2xl">{meta.emoji}</span>}
                    </div>

                    <div className="flex-1">
                      <div className={`font-bold ${user.isUser ? 'text-primary-foreground' : 'text-foreground'}`}>
                        {user.name} {user.isUser && '(You!)'}
                      </div>
                      <div className={`text-sm ${user.isUser ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {user.levels} levels completed
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`flex items-center gap-1 ${user.isUser ? 'text-primary-foreground' : 'text-streak'}`}>
                        <Flame className="w-4 h-4" />
                        <span className="font-bold">{user.streak}</span>
                      </div>
                      <div className={`text-sm ${user.isUser ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {user.xp.toLocaleString()} XP
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <CompanionAvatar size="md" showBubble message="Keep going! You can reach the top! 🏆" />
      </div>
    </div>
  );
}
