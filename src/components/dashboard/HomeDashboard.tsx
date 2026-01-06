import React from 'react';
import { Flame, Target, Star, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CompanionAvatar, getCompanionMessage } from '@/components/companions/CompanionAvatar';
import { useTheme } from '@/contexts/ThemeContext';

interface HomeDashboardProps {
  onStartLearning: () => void;
}

const todaysGoals = [
  { id: 1, title: 'Complete Photosynthesis lesson', subject: 'Biology', completed: true },
  { id: 2, title: 'Practice 10 Math problems', subject: 'Math', completed: false },
  { id: 3, title: 'Read Chapter 5: World War II', subject: 'History', completed: false },
];

const quickStats = [
  { label: 'Day Streak', value: '12', icon: Flame, color: 'text-streak' },
  { label: 'XP Today', value: '150', icon: Zap, color: 'text-xp' },
  { label: 'Levels Done', value: '47', icon: Star, color: 'text-primary' },
];

export function HomeDashboard({ onStartLearning }: HomeDashboardProps) {
  const { companion } = useTheme();
  const greeting = getCompanionMessage(companion, 'greeting');

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="cartoon-card flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
        <CompanionAvatar size="xl" showBubble message={greeting} />
        
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Welcome back, Champion! 🎉
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            You're on a roll! Keep learning and growing every day.
          </p>
          
          <Button 
            onClick={onStartLearning}
            className="cartoon-button gradient-primary text-primary-foreground px-8 py-6 text-lg font-bold"
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
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Today's Goals */}
      <div className="cartoon-card">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-7 h-7 text-secondary" />
          <h2 className="text-2xl font-bold text-foreground">Today's Goals</h2>
          <span className="ml-auto bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-bold">
            1/3 Done
          </span>
        </div>

        <div className="space-y-4">
          {todaysGoals.map((goal) => (
            <div
              key={goal.id}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
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
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1">
                <h3 className={`font-semibold ${goal.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {goal.title}
                </h3>
                <span className="text-sm text-muted-foreground">{goal.subject}</span>
              </div>

              {!goal.completed && (
                <Button variant="outline" size="sm" className="font-semibold">
                  Start
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="cartoon-card">
        <h2 className="text-2xl font-bold text-foreground mb-4">This Week's Progress</h2>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium text-foreground">Math</span>
              <span className="text-muted-foreground font-semibold">75%</span>
            </div>
            <Progress value={75} className="h-3" />
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium text-foreground">Science</span>
              <span className="text-muted-foreground font-semibold">60%</span>
            </div>
            <Progress value={60} className="h-3" />
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium text-foreground">History</span>
              <span className="text-muted-foreground font-semibold">40%</span>
            </div>
            <Progress value={40} className="h-3" />
          </div>
        </div>
      </div>
    </div>
  );
}
