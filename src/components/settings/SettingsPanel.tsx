import React from 'react';
import { Palette, Users, Bell, Clock, ChevronRight, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';
import { CompanionAvatar } from '@/components/companions/CompanionAvatar';

const companions = [
  { id: 'monkey' as const, name: 'Momo the Monkey', emoji: '🐵', description: 'Playful & encouraging' },
  { id: 'fox' as const, name: 'Felix the Fox', emoji: '🦊', description: 'Clever & supportive' },
  { id: 'doraemon' as const, name: 'Dora the Robot', emoji: '🤖', description: 'Helpful & structured' },
];

const themes = [
  { id: 'yellow' as const, name: 'Sunny Yellow', emoji: '☀️', colors: ['#fbbf24', '#f59e0b', '#ea580c'] },
  { id: 'blue' as const, name: 'Ocean Blue', emoji: '🌊', colors: ['#0ea5e9', '#06b6d4', '#14b8a6'] },
];

export function SettingsPanel() {
  const { theme, setTheme, companion, setCompanion } = useTheme();

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings ⚙️</h1>
        <p className="text-muted-foreground text-lg">Customize your learning experience!</p>
      </div>

      {/* Theme Selection */}
      <div className="cartoon-card">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Theme</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                theme === t.id
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{t.emoji}</span>
                {theme === t.id && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
              <div className="font-bold text-foreground mb-2">{t.name}</div>
              <div className="flex gap-2">
                {t.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Companion Selection */}
      <div className="cartoon-card">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-secondary" />
          <h2 className="text-xl font-bold text-foreground">AI Companion</h2>
        </div>

        <div className="space-y-3">
          {companions.map((c) => (
            <button
              key={c.id}
              onClick={() => setCompanion(c.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                companion === c.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-3xl">
                {c.emoji}
              </div>
              <div className="flex-1">
                <div className="font-bold text-foreground">{c.name}</div>
                <div className="text-sm text-muted-foreground">{c.description}</div>
              </div>
              {companion === c.id && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="cartoon-card">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-accent" />
          <h2 className="text-xl font-bold text-foreground">Notifications</h2>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Daily Reminders', description: 'Get reminded to study every day', defaultChecked: true },
            { label: 'Streak Alerts', description: 'Warning when streak is at risk', defaultChecked: true },
            { label: 'New Content', description: 'Notifications for new lessons', defaultChecked: false },
            { label: 'Weekly Report', description: 'Summary of your weekly progress', defaultChecked: true },
          ].map((setting) => (
            <div key={setting.label} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
              <div>
                <div className="font-semibold text-foreground">{setting.label}</div>
                <div className="text-sm text-muted-foreground">{setting.description}</div>
              </div>
              <Switch defaultChecked={setting.defaultChecked} />
            </div>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="cartoon-card">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Your Stats</h2>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Member Since', value: 'January 2024' },
            { label: 'Total Learning Time', value: '18.6 hours' },
            { label: 'Last Active', value: 'Today, 2:30 PM' },
            { label: 'Favorite Subject', value: 'Mathematics 📐' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
              <span className="text-muted-foreground">{stat.label}</span>
              <span className="font-semibold text-foreground">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <CompanionAvatar size="md" showBubble message="Settings saved! Let's learn! 🎉" />
      </div>
    </div>
  );
}
