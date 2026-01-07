import React from 'react';
import { Brain, TrendingUp, Calendar, Clock, Target } from 'lucide-react';
import { CompanionAvatar } from '@/components/companions/CompanionAvatar';
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, CartesianGrid } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const subjectProgress = [
  { name: 'Math', value: 35 },
  { name: 'Science', value: 28 },
  { name: 'History', value: 20 },
  { name: 'English', value: 17 },
];
const weeklyActivity = [
  { day: 'M', hours: 2.5 }, { day: 'T', hours: 1.8 }, { day: 'W', hours: 3.2 }, 
  { day: 'T', hours: 2.1 }, { day: 'F', hours: 1.5 }, { day: 'S', hours: 4.0 }, { day: 'S', hours: 3.5 },
];
const calendarData = Array.from({ length: 35 }, (_, i) => ({ day: i, activity: Math.random() * (i / 5) }));

const insights = [
  { icon: Clock, text: 'You study best between 7-9 PM.' },
  { icon: Calendar, text: 'You are most consistent on Saturdays.' },
  { icon: Target, text: 'Math is currently your strongest subject!' },
  { icon: TrendingUp, text: 'You have shown a 23% improvement this month.' },
];

const quickStats = [
  { label: 'Total XP', value: '2,450', emoji: '⚡' },
  { label: 'Levels Done', value: '47', emoji: '🎯' },
  { label: 'Hours Learned', value: '18.6', emoji: '⏱️' },
  { label: 'Best Streak', value: '12 days', emoji: '🔥' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="cartoon-card p-3 border-2">
        <p className="font-bold text-foreground">{`${label} : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export function StatsAnalytics() {
  const { theme } = useTheme();
  const colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#fb923c'];

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground tracking-tighter">Your Learning Stats</h1>
        <p className="text-lg text-muted-foreground mt-2 font-semibold">An overview of your epic progress! 📊</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {quickStats.map((stat) => (
          <div key={stat.label} className="cartoon-card text-center p-6 transform transition-transform hover:-translate-y-2">
            <div className="text-5xl mb-3">{stat.emoji}</div>
            <div className="text-3xl font-extrabold text-foreground">{stat.value}</div>
            <div className="text-md font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 cartoon-card p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Weekly Activity (Hours)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyActivity} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--primary) / 0.1)' }} />
              <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 cartoon-card p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Subject Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={subjectProgress} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} labelLine={false}>
                {subjectProgress.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={12} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="cartoon-card p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">35-Day Activity</h2>
        <div className="grid grid-cols-7 gap-2">
          {calendarData.map(({ day, activity }) => (
            <div key={day} className="w-full aspect-square rounded-lg border border-border/50"
                 style={{ opacity: 0.2 + activity * 0.8, backgroundColor: activity > 0 ? 'hsl(var(--primary))' : 'transparent' }} />
          ))}
        </div>
      </div>

      <div className="cartoon-card p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Brain className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-bold text-foreground">AI Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div key={index} className="flex items-start gap-4 p-4 bg-background/50 rounded-xl border-2 border-border">
                <Icon className="w-7 h-7 text-secondary flex-shrink-0 mt-1" />
                <span className="font-semibold text-lg text-foreground/90">{insight.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <CompanionAvatar size="xl" showBubble message="Your progress is inspiring! 🚀" />
      </div>
    </div>
  );
}
