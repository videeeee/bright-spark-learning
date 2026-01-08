import React from 'react';
import { Brain, TrendingUp, Calendar, Clock, Target } from 'lucide-react';
import { CompanionAvatar } from '@/components/companions/CompanionAvatar';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, ResponsiveContainer, Legend
} from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

const subjectProgress = [
  { name: 'Math', value: 30, color: '#f59e0b' },
  { name: 'Science', value: 22, color: '#10b981' },
  { name: 'Biology', value: 20, color: '#34d399' },
  { name: 'History', value: 15, color: '#6366f1' },
  { name: 'English', value: 13, color: '#ec4899' },
];

const topSubject = subjectProgress.reduce((a, b) => (a.value > b.value ? a : b));

const weeklyActivity = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 1.8 },
  { day: 'Wed', hours: 3.2 },
  { day: 'Thu', hours: 2.1 },
  { day: 'Fri', hours: 1.5 },
  { day: 'Sat', hours: 4.0 },
  { day: 'Sun', hours: 3.5 },
];

const streakData = [
  { week: 'W1', streak: 5 },
  { week: 'W2', streak: 7 },
  { week: 'W3', streak: 4 },
  { week: 'W4', streak: 7 },
  { week: 'W5', streak: 6 },
  { week: 'W6', streak: 7 },
];

const calendarData = [
  [1, 1, 1, 0, 1, 1, 1],
  [1, 1, 0, 0, 1, 1, 1],
  [1, 1, 1, 1, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1],
];

const insights = [
  { icon: Clock, text: 'You study best between 7-9 PM', color: 'text-primary' },
  { icon: Calendar, text: 'Most consistent on Saturdays', color: 'text-secondary' },
  { icon: Target, text: `${topSubject.name} is your strongest subject!`, color: 'text-success' },
  { icon: TrendingUp, text: '23% improvement this month', color: 'text-accent' },
];

export function StatsAnalytics() {
  const { companion, getCompanionMeta } = useTheme();
  const meta = getCompanionMeta(companion)!;
  const primaryColor = meta?.colors?.[1] ?? '#0ea5e9';
  const secondaryColor = meta?.colors?.[0] ?? '#06b6d4';

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Your Learning Stats 📊</h1>
        <p className="text-muted-foreground text-lg">See how awesome you're doing!</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total XP', value: '2,450', emoji: '⚡' },
          { label: 'Levels Done', value: '47', emoji: '🎯' },
          { label: 'Hours Learned', value: '18.6', emoji: '⏱️' },
          { label: 'Best Streak', value: '12 days', emoji: '🔥' },
        ].map((stat) => (
          <div key={stat.label} className="cartoon-card text-center">
            <span className="text-3xl">{stat.emoji}</span>
            <div className="text-2xl font-bold text-foreground mt-2">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Progress Pie */}
        <div className="cartoon-card">
          <h2 className="text-xl font-bold text-foreground mb-4">Subject Progress</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={subjectProgress}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {subjectProgress.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '2px solid #e5e7eb',
                  boxShadow: '0 4px 0 #e5e7eb'
                }} 
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Activity Bar */}
        <div className="cartoon-card">
          <h2 className="text-xl font-bold text-foreground mb-4">Weekly Activity</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '2px solid #e5e7eb',
                  boxShadow: '0 4px 0 #e5e7eb'
                }}
              />
              <Bar dataKey="hours" fill={primaryColor} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Streak Line Chart */}
      <div className="cartoon-card">
        <h2 className="text-xl font-bold text-foreground mb-4">Streak History</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={streakData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="week" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: '2px solid #e5e7eb',
                boxShadow: '0 4px 0 #e5e7eb'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="streak" 
              stroke={primaryColor} 
              strokeWidth={3}
              dot={{ fill: primaryColor, strokeWidth: 2, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Activity Calendar */}
      <div className="cartoon-card">
        <h2 className="text-xl font-bold text-foreground mb-4">Activity Calendar</h2>
        <div className="flex gap-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="flex-1 text-center text-sm text-muted-foreground font-medium">
              {day}
            </div>
          ))}
        </div>
        <div className="space-y-1 mt-2">
          {calendarData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-1">
              {week.map((active, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`flex-1 h-8 rounded-md ${
                    active ? '' : 'bg-muted'
                  }`}
                  style={active ? { background: `linear-gradient(135deg, ${meta.colors[0]}, ${meta.colors[1]})` } : undefined}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 mt-4 text-sm text-muted-foreground">
          <div className="w-4 h-4 bg-muted rounded" /> Inactive
          <div className="w-4 h-4 rounded" style={{ background: `linear-gradient(135deg, ${meta.colors[0]}, ${meta.colors[1]})` }} /> Active
        </div>
      </div>

      {/* AI Insights */}
      <div className="cartoon-card">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-7 h-7" style={{ color: primaryColor }} />
          <h2 className="text-xl font-bold text-foreground">AI Insights</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div key={index} className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
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
