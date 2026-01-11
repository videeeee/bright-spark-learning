import React from 'react';
import { Brain, TrendingUp, Calendar, Clock, Target } from 'lucide-react';
import { CompanionAvatar } from '@/components/companions/CompanionAvatar';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

/* ===============================
   TEMP DUMMY STATS (SAFE FAKE DATA)
   REMOVE WHEN BACKEND IS READY
================================ */

const dummyStats = {
  totalXP: 2450,
  completedLevels: 47,
  hoursLearned: 18.6,
  bestStreak: 12,

  subjectProgress: [
    { name: 'Math', value: 30, color: '#f59e0b' },
    { name: 'Science', value: 22, color: '#10b981' },
    { name: 'Biology', value: 20, color: '#34d399' },
    { name: 'History', value: 15, color: '#6366f1' },
    { name: 'English', value: 13, color: '#ec4899' },
  ],

  weeklyActivity: [
    { day: 'Mon', hours: 2.5 },
    { day: 'Tue', hours: 1.8 },
    { day: 'Wed', hours: 3.2 },
    { day: 'Thu', hours: 2.1 },
    { day: 'Fri', hours: 1.5 },
    { day: 'Sat', hours: 4.0 },
    { day: 'Sun', hours: 3.5 },
  ],

  streakHistory: [
    { week: 'W1', streak: 5 },
    { week: 'W2', streak: 7 },
    { week: 'W3', streak: 4 },
    { week: 'W4', streak: 7 },
    { week: 'W5', streak: 6 },
    { week: 'W6', streak: 7 },
  ],

  calendar: [
    [1, 1, 1, 0, 1, 1, 1],
    [1, 1, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ],
};

export function StatsAnalytics() {
  const { companion, getCompanionMeta } = useTheme();
  const meta = getCompanionMeta(companion)!;
  const primaryColor = meta.colors[1];
  const secondaryColor = meta.colors[0];

  const topSubject = dummyStats.subjectProgress.reduce((a, b) =>
    a.value > b.value ? a : b
  );

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Your Learning Stats 📊
        </h1>
        <p className="text-muted-foreground text-lg">
          See how awesome you're doing!
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total XP', value: dummyStats.totalXP, emoji: '⚡' },
          { label: 'Levels Done', value: dummyStats.completedLevels, emoji: '🎯' },
          { label: 'Hours Learned', value: dummyStats.hoursLearned, emoji: '⏱️' },
          { label: 'Best Streak', value: `${dummyStats.bestStreak} days`, emoji: '🔥' },
        ].map((stat) => (
          <div key={stat.label} className="cartoon-card text-center">
            <span className="text-3xl">{stat.emoji}</span>
            <div className="text-2xl font-bold text-foreground mt-2">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Progress */}
        <div className="cartoon-card">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Subject Progress
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dummyStats.subjectProgress}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
              >
                {dummyStats.subjectProgress.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Activity */}
        <div className="cartoon-card">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Weekly Activity
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dummyStats.weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill={primaryColor} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Streak History */}
      <div className="cartoon-card">
        <h2 className="text-xl font-bold text-foreground mb-4">
          Streak History
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dummyStats.streakHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="streak"
              stroke={primaryColor}
              strokeWidth={3}
              dot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Activity Calendar */}
      <div className="cartoon-card">
        <h2 className="text-xl font-bold text-foreground mb-4">
          Activity Calendar
        </h2>

        <div className="flex gap-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="flex-1 text-center text-sm text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="space-y-1 mt-2">
          {dummyStats.calendar.map((week, i) => (
            <div key={i} className="flex gap-1">
              {week.map((active, j) => (
                <div
                  key={j}
                  className="flex-1 h-8 rounded-md"
                  style={
                    active
                      ? { background: `linear-gradient(135deg, ${secondaryColor}, ${primaryColor})` }
                      : { background: 'var(--muted)' }
                  }
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="cartoon-card">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-7 h-7" style={{ color: primaryColor }} />
          <h2 className="text-xl font-bold text-foreground">AI Insights</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: Clock, text: 'You study best between 7–9 PM' },
            { icon: Calendar, text: 'Most consistent on Saturdays' },
            { icon: Target, text: `${topSubject.name} is your strongest subject!` },
            { icon: TrendingUp, text: '23% improvement this month' },
          ].map((insight, i) => {
            const Icon = insight.icon;
            return (
              <div key={i} className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                <Icon className="w-6 h-6" style={{ color: primaryColor }} />
                <span className="font-medium text-foreground">{insight.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center">
        <CompanionAvatar size="md" showBubble message="You're making amazing progress! 📈" />
      </div>
    </div>
  );
}