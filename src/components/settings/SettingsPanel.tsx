import React from 'react';
import { Palette, Users, Bell, Clock, ChevronRight, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';
import { CompanionAvatar } from '@/components/companions/CompanionAvatar';



const studySubjects = [
  { id: 'biology', name: 'Biology', emoji: '🧬' },
  { id: 'math', name: 'Mathematics', emoji: '📐' },
  { id: 'history', name: 'History', emoji: '🏛️' },
  { id: 'english', name: 'English', emoji: '✍️' },
  { id: 'science', name: 'Science', emoji: '🔬' },
];

export function SettingsPanel() {
  const { theme, companion, setCompanion, companions: companionsList, getCompanionMeta } = useTheme();
  const [favorite, setFavorite] = React.useState<string>(studySubjects[1].id);

  const companionMeta = getCompanionMeta(companion);

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings ⚙️</h1>
        <p className="text-muted-foreground text-lg">Customize your learning experience!</p>
      </div>

      {/* Companion Theme (merged with Theme) */}
      <div className="cartoon-card">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Companion Theme</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl">
            {companionMeta?.emoji}
          </div>

          <div className="flex-1">
            <div className="font-bold text-foreground mb-1">{companionMeta?.name} — {companionMeta?.mood}</div>
            <div className="text-sm text-muted-foreground mb-3">Theme is automatically chosen based on your companion.</div>
            <div className="flex gap-2">
              {companionMeta?.colors.map((color, i) => (
                <div key={i} className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Companion Selection */}
      <div className="cartoon-card">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-secondary" />
          <h2 className="text-xl font-bold text-foreground">AI Companion</h2>
        </div>

        <div className="space-y-3">
          {companionsList.map((c) => (
            <button
              key={c.id}
              onClick={() => setCompanion(c.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                companion === c.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-3xl overflow-hidden">
                {c.image ? (
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{c.emoji}</span>
                )}
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
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
            <span className="text-muted-foreground">Member Since</span>
            <span className="font-semibold text-foreground">January 2024</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
            <span className="text-muted-foreground">Total Learning Time</span>
            <span className="font-semibold text-foreground">18.6 hours</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
            <span className="text-muted-foreground">Last Active</span>
            <span className="font-semibold text-foreground">Today, 2:30 PM</span>
          </div>

          <div className="p-3 bg-muted/50 rounded-xl">
            <div className="text-muted-foreground font-medium mb-2">Favorite Subject</div>
            <div className="flex gap-2 flex-wrap">
              {studySubjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setFavorite(s.id)}
                  className={`px-3 py-1 rounded-full border-2 text-sm font-medium transition-all ${
                    favorite === s.id ? 'bg-primary text-primary-foreground border-primary' : 'border-border'
                  }`}
                >
                  <span className="mr-2">{s.emoji}</span>
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <CompanionAvatar size="md" showBubble message="Settings saved! Let's learn! 🎉" />
      </div>
    </div>
  );
}
