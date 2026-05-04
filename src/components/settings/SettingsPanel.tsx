import React from 'react';
import { Palette, Users, Bell, Clock, Check, LogOut } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';
import { CompanionAvatar } from '@/components/companions/CompanionAvatar';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';

export function SettingsPanel() {
  const { companion, setCompanion, companions: companionsList, getCompanionMeta } = useTheme();
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const companionMeta = getCompanionMeta(companion);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings ⚙️</h1>
        <p className="text-muted-foreground text-lg">Customize your learning experience!</p>
      </div>

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

      <div className="cartoon-card">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Your Learning Profile</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
            <span className="text-muted-foreground">Full Name</span>
            <span className="font-semibold text-foreground">{user.name}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
            <span className="text-muted-foreground">Email</span>
            <span className="font-semibold text-foreground break-all">{user.email}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
            <span className="text-muted-foreground">Class Level</span>
            <span className="font-semibold text-foreground">{user.classLevel || 'Not set'}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
            <span className="text-muted-foreground">Curriculum</span>
            <span className="font-semibold text-foreground">{user.curriculum || 'Not set'}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
            <span className="text-muted-foreground">Subjects</span>
            <span className="font-semibold text-foreground">{user.subjects?.length ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={() => navigate('/dashboard')}>Dashboard</Button>
        <Button variant="destructive" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>

      <div className="flex justify-center mt-6">
        <CompanionAvatar size="md" showBubble message="Settings saved! Let's learn! 🎉" />
      </div>
    </div>
  );
}
