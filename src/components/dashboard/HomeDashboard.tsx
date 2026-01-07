import React from 'react';
import { Flame, Target, Star, Zap, ArrowRight, CheckCircle2, BookOpen, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CompanionAvatar } from '@/components/companions/CompanionAvatar';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface HomeDashboardProps {
  onStartLearning: () => void;
}

const todaysGoals = [
  { id: 1, title: 'Master Photosynthesis Basics', subject: 'Biology', icon: '🌿', completed: true },
  { id: 2, title: 'Solve 10 Algebra Problems', subject: 'Math', icon: '🧮', completed: false },
  { id: 3, title: 'Read Chapter 5: World War II', subject: 'History', icon: '📜', completed: false },
];

const quickStats = [
  { label: 'Day Streak', value: '12', icon: Flame, colorVar: '--streak-color' },
  { label: 'XP Gained', value: '150', icon: Zap, colorVar: '--xp-color' },
  { label: 'Levels Unlocked', value: '47', icon: Star, colorVar: '--level-color' },
];

export function HomeDashboard({ onStartLearning }: HomeDashboardProps) {
  const { companion } = useTheme();
  const companionName = companion.name;
  const welcomeMessage = companion.welcomeMessage;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="cartoon-card text-center p-8">
        {/* CORRECTED: Wrapped CompanionAvatar in a div to apply the margin class. */}
        <div className="-mb-4">
            <CompanionAvatar size="xl" showBubble={true} message={welcomeMessage} />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tighter mt-6">
          Hey there, Learner!
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mt-2 mb-6">
          {companionName} is ready to help you. {companion.quotes.encouragement[0]}
        </p>
        <Button 
          onClick={onStartLearning}
          size="lg"
          className="cartoon-button bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xl font-bold w-full sm:w-auto shadow-lg text-shadow-cute"
        >
          <BookOpen className="mr-3 w-7 h-7" /> Let's Start Learning!
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="stat-card" style={{ '--stat-color': `hsl(${getComputedStyle(document.documentElement).getPropertyValue(stat.colorVar).trim()})` } as React.CSSProperties}>
              <Icon className="w-16 h-16 mx-auto mb-2 text-[color:var(--stat-color)] drop-shadow-lg" />
              <div className="text-6xl font-extrabold text-foreground tracking-tighter drop-shadow-md">{stat.value}</div>
              <div className="text-md font-bold text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Today's Goals */}
      <div className="cartoon-card p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Target className="w-8 h-8 text-secondary" />
          <h2 className="text-3xl font-bold text-foreground">Today's Fun Goals</h2>
          <span className="ml-auto bg-primary/20 text-primary-foreground border-2 border-primary/30 px-4 py-1 rounded-full text-md font-bold">
            1/3 Done
          </span>
        </div>

        <div className="space-y-4">
          {todaysGoals.map((goal) => (
            <div
              key={goal.id}
              className={cn(
                `flex items-center gap-4 p-4 rounded-2xl border-4 transition-all`,
                goal.completed
                  ? 'border-green-500/30 bg-green-500/10'
                  : 'border-[var(--border-color)] bg-card/80 hover:border-primary/50 hover:bg-muted/60'
              )}
            >
              <div className={cn(`w-14 h-14 text-2xl rounded-lg flex items-center justify-center flex-shrink-0`,
                goal.completed ? 'bg-green-500/20' : 'bg-muted/80'
              )}>
                {goal.completed ? <CheckCircle2 className="w-8 h-8 text-green-500" /> : goal.icon}
              </div>
              
              <div className="flex-1">
                <h3 className={cn('font-bold text-lg', goal.completed ? 'line-through text-muted-foreground' : 'text-foreground')}>
                  {goal.title}
                </h3>
                <span className="text-md text-muted-foreground font-medium">{goal.subject}</span>
              </div>

              {!goal.completed && (
                <Button variant="outline" size="sm" className="font-bold cartoon-button border-4 self-start bg-secondary text-secondary-foreground">
                  Start <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="cartoon-card p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
           <BrainCircuit className="w-8 h-8 text-accent" />
          <h2 className="text-3xl font-bold text-foreground">Brain Power Growth</h2>
        </div>
        
        <div className="space-y-6">
          {[ 
            { subject: 'Math', progress: 75, colorClass: 'bg-primary' },
            { subject: 'Science', progress: 60, colorClass: 'bg-secondary' },
            { subject: 'History', progress: 40, colorClass: 'bg-accent' },
          ].map(item => (
             <div key={item.subject}>
              <div className="flex justify-between mb-2">
                <span className="font-bold text-foreground text-lg">{item.subject}</span>
                <span className="text-md font-bold text-muted-foreground">{item.progress}% Complete</span>
              </div>
              <Progress value={item.progress} className={cn("h-6 rounded-full border-4 border-[var(--border-color)] p-1", item.colorClass)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
