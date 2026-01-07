import React from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

const leaderboardData = [
  { rank: 1, name: 'Alex K.', avatar: '🦊', xp: 12450, isUser: false },
  { rank: 2, name: 'Sarah M.', avatar: '🐱', xp: 11200, isUser: false },
  { rank: 4, name: 'Mike R.', avatar: '🐻', xp: 8900, isUser: false },
  { rank: 5, name: 'Emma L.', avatar: '🐰', xp: 7650, isUser: false },
  { rank: 6, name: 'Jake T.', avatar: '🦁', xp: 6800, isUser: false },
  { rank: 7, name: 'Lily C.', avatar: '🐼', xp: 5400, isUser: false },
  { rank: 8, name: 'Noah B.', avatar: '🐨', xp: 4900, isUser: false },
];

const PodiumCard = ({ user, rank }) => {
  const styles = {
    1: { bg: 'bg-yellow-400/20', text: 'text-yellow-400', shadow: 'shadow-yellow-400/50', height: 'h-32', icon: <Trophy className="w-10 h-10 text-yellow-400 mb-2 drop-shadow-lg" /> },
    2: { bg: 'bg-slate-400/20', text: 'text-slate-400', shadow: 'shadow-slate-400/50', height: 'h-24', icon: <Medal className="w-8 h-8 text-slate-400 mb-2" /> },
    3: { bg: 'bg-amber-500/20', text: 'text-amber-500', shadow: 'shadow-amber-500/50', height: 'h-20', icon: <Medal className="w-8 h-8 text-amber-500 mb-2" /> },
  }[rank];

  return (
      <div className="text-center flex flex-col items-center">
          {styles.icon}
          <div className={cn("w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-2 border-4 shadow-lg transform transition-transform hover:scale-110", user.isUser ? 'border-primary' : 'border-border', styles.shadow)}>
              {user.isUser ? <img src={user.avatar} alt="Your avatar" className="w-full h-full object-cover rounded-full" /> : user.avatar}
          </div>
          <div className="font-bold text-lg text-foreground">{user.name}</div>
          <div className="text-md text-muted-foreground font-semibold">{user.xp.toLocaleString()} XP</div>
          <div className={cn("w-24 rounded-t-xl mt-2 flex items-center justify-center", styles.bg, styles.height)}>
              <span className={cn("text-4xl font-extrabold", styles.text)}>{rank}</span>
          </div>
      </div>
    );
};

export function Leaderboard() {
  const { companion } = useTheme();

  const currentUser = {
    rank: 3,
    name: 'You',
    avatar: companion.image,
    xp: 9850,
    isUser: true,
  };

  const finalLeaderboardData = [...leaderboardData, currentUser].sort((a, b) => a.rank - b.rank);
  const topThree = finalLeaderboardData.slice(0, 3);
  const restOfBoard = finalLeaderboardData.slice(3);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="cartoon-card p-6 md:p-8 mb-8 text-center">
        <Trophy className="w-16 h-16 mx-auto text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">Leaderboard</h1>
        <p className="text-lg text-muted-foreground mt-2">See how you stack up against other learners!</p>
      </div>

      <div className="flex justify-center items-end gap-4 md:gap-8 mb-12">
        {topThree.find(u => u.rank === 2) && <PodiumCard user={topThree.find(u => u.rank === 2)} rank={2} />}
        {topThree.find(u => u.rank === 1) && <PodiumCard user={topThree.find(u => u.rank === 1)} rank={1} />}
        {topThree.find(u => u.rank === 3) && <PodiumCard user={topThree.find(u => u.rank === 3)} rank={3} />}
      </div>

      <div className="cartoon-card p-6 md:p-8">
        <h2 className="text-3xl font-bold text-foreground mb-6 text-center">Top Performers</h2>
        <div className="space-y-4">
          {restOfBoard.map((user) => {
            const getRankIcon = () => {
              if (user.rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
              if (user.rank <= 3) return <Medal className={cn("w-6 h-6", user.rank === 2 ? 'text-slate-500' : 'text-amber-600')} />;
              return <span className="font-bold text-xl text-muted-foreground w-6 text-center">{user.rank}</span>;
            };

            return (
              <div 
                key={user.rank} 
                className={cn(
                  'flex items-center gap-4 p-4 rounded-2xl border-2',
                  user.isUser 
                    ? 'bg-primary/10 border-primary/40' 
                    : 'bg-muted/30 border-border'
                )}
              >
                <div className="flex-shrink-0 w-10 text-center">{getRankIcon()}</div>
                 <div className={cn("w-14 h-14 text-3xl rounded-full bg-background flex items-center justify-center border-2 border-border", user.isUser && "p-1")}>
                  {user.isUser ? <img src={user.avatar} alt="Your avatar" className="w-full h-full object-cover rounded-full"/> : user.avatar}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg text-foreground">{user.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-xl text-foreground">{user.xp.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground font-semibold">XP</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}