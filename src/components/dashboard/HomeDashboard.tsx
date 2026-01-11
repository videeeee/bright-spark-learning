import React from 'react';
import { Flame, Target, Star, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CompanionAvatar, getCompanionMessage } from '@/components/companions/CompanionAvatar';
import { getContrastColor } from '@/lib/color';
import { useTheme } from '@/contexts/ThemeContext';

/* ===========================
   TEMP DUMMY DATA
=========================== */

const fakeUserStats = {
  username: 'V',
  xp: 1280,
  streak: 12,
  levelsCompleted: 18,
  xpToday: 120,
};

const todaysGoals = [
  { id: 1, title: 'Photosynthesis', subject: 'Biology', chapter: 1, completed: true },
  { id: 2, title: 'Algebra Basics', subject: 'Mathematics', chapter: 1, completed: true },
  { id: 3, title: 'Ancient Civilizations', subject: 'History', chapter: 1, completed: false },
  { id: 4, title: 'Grammar Basics', subject: 'English', chapter: 1, completed: false },
  { id: 5, title: 'States of Matter', subject: 'Science', chapter: 1, completed: false },
];

const weeklyProgress = [
  { subject: 'Mathematics', percent: 72 },
  { subject: 'Science', percent: 58 },
  { subject: 'Biology', percent: 64 },
  { subject: 'History', percent: 40 },
  { subject: 'English', percent: 51 },
];

const quickStats = [
  { label: 'Day Streak', value: fakeUserStats.streak, icon: Flame, color: 'text-streak' },
  { label: 'XP Today', value: fakeUserStats.xpToday, icon: Zap, color: 'text-xp' },
  { label: 'Levels Done', value: fakeUserStats.levelsCompleted, icon: Star, color: 'text-primary' },
];

type Props = {
  onStartLearning: () => void;
};

export function HomeDashboard({ onStartLearning }: Props) {
  const { companion, getCompanionMeta } = useTheme();
  const greeting = getCompanionMessage(companion, 'greeting');
  const companionMeta = getCompanionMeta(companion)!;

  const completedCount = todaysGoals.filter(g => g.completed).length;

  function handleGoalClick(goal: typeof todaysGoals[0]) {
    // 🔥 Save intent for Learn page
    localStorage.setItem(
      'learnIntent',
      JSON.stringify({
        subject: goal.subject,
        chapter: goal.chapter,
      })
    );

    onStartLearning();
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">

      {/* Welcome */}
      <div className="cartoon-card flex flex-col lg:flex-row items-center gap-6">
        <CompanionAvatar size="xl" showBubble message={greeting} />

        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {fakeUserStats.username}! 🎉
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Your goals are waiting — tap one and jump in 🚀
          </p>

          <Button
            onClick={onStartLearning}
            className="cartoon-button px-8 py-6 text-lg font-bold"
            style={{
              background: `linear-gradient(135deg, ${companionMeta.colors[0]}, ${companionMeta.colors[1]})`,
              color: getContrastColor(companionMeta.colors[1]),
            }}
          >
            Start Learning <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="cartoon-card text-center">
              <Icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Interactive Goals */}
      <div className="cartoon-card">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-7 h-7 text-secondary" />
          <h2 className="text-2xl font-bold">Today's Goals</h2>
          <span className="ml-auto bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-bold">
            {completedCount}/{todaysGoals.length} Done
          </span>
        </div>

        <div className="space-y-4">
          {todaysGoals.map(goal => (
            <button
              key={goal.id}
              onClick={() => handleGoalClick(goal)}
              className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                goal.completed
                  ? 'bg-success/10 border-success'
                  : 'bg-muted/50 border-border hover:border-primary'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                goal.completed ? 'bg-success' : 'bg-muted'
              }`}>
                {goal.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-success-foreground" />
                ) : (
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1">
                <h3 className={`font-semibold ${goal.completed && 'line-through text-muted-foreground'}`}>
                  {goal.title}
                </h3>
                <span className="text-sm text-muted-foreground">
                  {goal.subject} • Chapter {goal.chapter}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="cartoon-card">
        <h2 className="text-2xl font-bold mb-4">This Week’s Progress</h2>
        <div className="space-y-4">
          {weeklyProgress.map(p => (
            <div key={p.subject}>
              <div className="flex justify-between mb-1">
                <span className="font-medium">{p.subject}</span>
                <span className="text-muted-foreground">{p.percent}%</span>
              </div>
              <Progress value={p.percent} className="h-3" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}




// import React, { useEffect, useState } from 'react';
// import {
//   Flame,
//   Target,
//   Star,
//   Zap,
//   ArrowRight,
//   CheckCircle2,
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Progress } from '@/components/ui/progress';
// import {
//   CompanionAvatar,
//   getCompanionMessage,
// } from '@/components/companions/CompanionAvatar';
// import { getContrastColor } from '@/lib/color';
// import { useTheme } from '@/contexts/ThemeContext';

// export type HomeDashboardProps = {
//   onStartLearning: () => void;
//   user?: {
//     username: string;
//   } | null;
// };

// type StatsResponse = {
//   totalXP: number;
//   streak: number;
//   completedLevels: number;
//   subjectProgress: Record<string, number>;
// };

// export function HomeDashboard({ onStartLearning, user }: HomeDashboardProps) {
//   const { companion, getCompanionMeta } = useTheme();
//   const greeting = getCompanionMessage(companion, 'greeting');
//   const companionMeta = getCompanionMeta(companion)!;

//   const [stats, setStats] = useState<StatsResponse | null>(null);

//   /* =======================
//      FETCH REAL STATS
//   ======================= */
//   useEffect(() => {
//     fetch('http://localhost:5000/api/stats', {
//       headers: {
//         Authorization: localStorage.getItem('token') || '',
//       },
//     })
//       .then((res) => res.json())
//       .then(setStats)
//       .catch(() => setStats(null));
//   }, []);

//   const quickStats = [
//     {
//       label: 'Day Streak',
//       value: stats?.streak ?? 0,
//       icon: Flame,
//       color: 'text-streak',
//     },
//     {
//       label: 'XP Today',
//       value: stats?.totalXP ?? 0,
//       icon: Zap,
//       color: 'text-xp',
//     },
//     {
//       label: 'Levels Done',
//       value: stats?.completedLevels ?? 0,
//       icon: Star,
//       color: 'text-primary',
//     },
//   ];

//   const todaysGoals = Object.entries(stats?.subjectProgress || {}).map(
//     ([subject, percent], idx) => ({
//       id: idx,
//       title: `Improve ${subject}`,
//       subject,
//       completed: percent >= 100,
//     })
//   );

//   const completedCount = todaysGoals.filter((g) => g.completed).length;

//   return (
//     <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
//       {/* Welcome Header */}
//       <div className="cartoon-card flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
//         <CompanionAvatar size="xl" showBubble message={greeting} />

//         <div className="flex-1 text-center lg:text-left">
//           <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
//             Welcome back{user?.username ? `, ${user.username}` : ''}! 🎉
//           </h1>
//           <p className="text-lg text-muted-foreground mb-4">
//             You're on a roll! Keep learning and growing every day.
//           </p>

//           <Button
//             onClick={onStartLearning}
//             className="cartoon-button px-8 py-6 text-lg font-bold"
//             style={{
//               background: `linear-gradient(135deg, ${companionMeta.colors[0]}, ${companionMeta.colors[1]})`,
//               color: getContrastColor(companionMeta.colors[1]),
//             }}
//           >
//             Start Learning <ArrowRight className="ml-2 w-5 h-5" />
//           </Button>
//         </div>
//       </div>

//       {/* Quick Stats */}
//       <div className="grid grid-cols-3 gap-4">
//         {quickStats.map((stat) => {
//           const Icon = stat.icon;
//           return (
//             <div key={stat.label} className="cartoon-card text-center">
//               <Icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
//               <div className="text-3xl font-bold text-foreground">
//                 {stat.value}
//               </div>
//               <div className="text-sm text-muted-foreground font-medium">
//                 {stat.label}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Today's Goals */}
//       <div className="cartoon-card">
//         <div className="flex items-center gap-3 mb-6">
//           <Target className="w-7 h-7 text-secondary" />
//           <h2 className="text-2xl font-bold text-foreground">
//             Today's Goals
//           </h2>
//           <span className="ml-auto bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-bold">
//             {completedCount}/{todaysGoals.length} Done
//           </span>
//         </div>

//         <div className="space-y-4">
//           {todaysGoals.map((goal) => (
//             <div
//               key={goal.id}
//               className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
//                 goal.completed
//                   ? 'bg-success/10 border-success'
//                   : 'bg-muted/50 border-border hover:border-primary'
//               }`}
//             >
//               <div
//                 className={`w-10 h-10 rounded-full flex items-center justify-center ${
//                   goal.completed ? 'bg-success' : 'bg-muted'
//                 }`}
//               >
//                 {goal.completed ? (
//                   <CheckCircle2 className="w-6 h-6 text-success-foreground" />
//                 ) : (
//                   <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
//                 )}
//               </div>

//               <div className="flex-1">
//                 <h3
//                   className={`font-semibold ${
//                     goal.completed
//                       ? 'line-through text-muted-foreground'
//                       : 'text-foreground'
//                   }`}
//                 >
//                   {goal.title}
//                 </h3>
//                 <span className="text-sm text-muted-foreground">
//                   {goal.subject}
//                 </span>
//               </div>

//               {!goal.completed && (
//                 <Button variant="outline" size="sm" className="font-semibold">
//                   Start
//                 </Button>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Weekly Progress */}
//       <div className="cartoon-card">
//         <h2 className="text-2xl font-bold text-foreground mb-4">
//           This Week's Progress
//         </h2>

//         <div className="space-y-4">
//           {Object.entries(stats?.subjectProgress || {}).map(
//             ([subject, percent]) => (
//               <div key={subject}>
//                 <div className="flex justify-between mb-2">
//                   <span className="font-medium text-foreground">
//                     {subject}
//                   </span>
//                   <span className="text-muted-foreground font-semibold">
//                     {percent}%
//                   </span>
//                 </div>
//                 <Progress value={percent} className="h-3" />
//               </div>
//             )
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }