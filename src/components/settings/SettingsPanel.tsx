import React, { useState, useEffect } from 'react';
import { Palette, Bell, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useTheme, Companion } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function SettingsPanel() {
  // CORRECTED: Destructuring only the properties that actually exist in ThemeContext.
  const { companions, companion, setCompanion } = useTheme();

  // Local state for the selected companion, initialized from the context.
  const [selectedCompanionId, setSelectedCompanionId] = useState(companion.id);

  useEffect(() => {
    setSelectedCompanionId(companion.id);
  }, [companion]);

  const handleSelection = (id: string) => {
    setCompanion(id); // This calls the context function.
    setSelectedCompanionId(id); // This updates the local state for the UI.
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-4xl mx-auto space-y-10">
      <div className="text-center">
        <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground tracking-tighter">Settings</h1>
        <p className="text-muted-foreground text-lg lg:text-xl mt-2">Customize your learning experience.</p>
      </div>

      {/* Companion & Theme Selection */}
      <div className="cartoon-card p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Palette className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-bold text-foreground">Companion & Theme</h2>
        </div>

        {/* CORRECTED: Mapping over the actual companions list from the context. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {companions.map((c: Companion) => (
            <button
              key={c.id}
              // CORRECTED: Using the correct setter function from the context.
              onClick={() => handleSelection(c.id)}
              className={cn(
                `flex items-center gap-4 p-5 rounded-2xl border-4 text-left transition-all duration-300 transform hover:-translate-y-1`,
                // CORRECTED: Comparing against the local state, which is synced with the context.
                selectedCompanionId === c.id
                  ? 'border-primary/80 ring-4 ring-primary/20 bg-primary/10'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              )}
            >
              <div className={cn(
                `w-16 h-16 rounded-xl flex items-center justify-center text-4xl transition-transform duration-300 flex-shrink-0`,
                selectedCompanionId === c.id ? 'rotate-12 scale-110' : ''
              )}>
                {/* CORRECTED: Using <img> tag with the 'image' property instead of the non-existent 'emoji'. */}
                <img src={c.image} alt={c.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-xl text-foreground">
                  {c.name}
                </div>
                <div className={`text-sm text-muted-foreground font-semibold`}>
                  Theme: <span className="font-bold capitalize">{c.theme}</span>
                </div>
              </div>
              {/* CORRECTED: Checking against local state for the checkmark. */}
              {selectedCompanionId === c.id && (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg flex-shrink-0">
                  <Check className="w-6 h-6 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* REMOVED: The dialog for custom companions has been removed as it was based on non-existent context properties and caused multiple errors. */}
      </div>

      {/* Notifications */}
      <div className="cartoon-card p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Bell className="w-8 h-8 text-accent" />
          <h2 className="text-3xl font-bold text-foreground">Notifications</h2>
        </div>

        <div className="space-y-5">
          {[
            { label: 'Daily Reminders', description: 'A gentle nudge to keep learning.' },
            { label: 'Streak Alerts', description: 'Don\'t lose your momentum!' },
            { label: 'Weekly Reports', description: 'See your progress and shine.' },
          ].map((setting) => (
            <div key={setting.label} className="flex items-center justify-between p-5 bg-background/50 rounded-2xl border-2 border-border">
              <div>
                <div className="font-bold text-lg text-foreground">{setting.label}</div>
                <div className="text-md text-muted-foreground">{setting.description}</div>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
