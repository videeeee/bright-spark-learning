import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Calendar, Clock, Target, Loader2 } from 'lucide-react';
import { CompanionAvatar } from '@/components/companions/CompanionAvatar';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

type RecentNote = {
  _id?: string;
  title?: string;
  topic?: string;
  createdAt?: string | number;
};

type StatsData = {
  totalNotes?: number;
  currentStreak?: number;
  recentNotes?: RecentNote[];
};

export function StatsAnalytics() {
  const { companion, getCompanionMeta } = useTheme();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const meta = getCompanionMeta(companion)!;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stats`, {
        headers: {
          Authorization: localStorage.getItem("token") || "",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        toast.error("Failed to load stats");
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
      toast.error("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const notesToday = stats?.recentNotes?.filter((note) => {
    const noteDate = new Date(note.createdAt).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    return noteDate === today;
  }).length ?? 0;
  const currentStreak = stats?.currentStreak ?? (notesToday > 0 ? 1 : 0);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Your Learning Stats 📊
        </h1>
        <p className="text-muted-foreground text-lg">
          Track your amazing progress!
        </p>
      </div>

      {/* Quick Stats */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="cartoon-card text-center">
              <span className="text-3xl">📝</span>
              <div className="text-2xl font-bold text-foreground mt-2">
                {stats.totalNotes || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Notes</div>
            </div>
            <div className="cartoon-card text-center">
              <span className="text-3xl">⏰</span>
              <div className="text-2xl font-bold text-foreground mt-2">
                {notesToday}
              </div>
              <div className="text-sm text-muted-foreground">Notes Today</div>
            </div>
            <div className="cartoon-card text-center">
              <span className="text-3xl">🎯</span>
              <div className="text-2xl font-bold text-foreground mt-2">
                {stats.recentNotes?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Recent Notes</div>
            </div>
            <div className="cartoon-card text-center">
              <span className="text-3xl">🚀</span>
              <div className="text-2xl font-bold text-foreground mt-2">
                {currentStreak}
              </div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
            </div>
          </div>

          {/* Recent Notes */}
          {stats.recentNotes && stats.recentNotes.length > 0 && (
            <div className="cartoon-card">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Brain className="w-6 h-6" /> Recent Notes Activity
              </h2>
              <div className="space-y-3">
                {stats.recentNotes.map((note, idx) => (
                  <div key={note._id || idx} className="border-l-4 border-primary pl-4 py-2">
                    <h3 className="font-semibold text-foreground">{note.title || note.topic}</h3>
                    <p className="text-sm text-muted-foreground">
                      📅 {new Date(note.createdAt).toLocaleDateString()} at{' '}
                      {new Date(note.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {(!stats.recentNotes || stats.recentNotes.length=== 0) && (
            <div className="cartoon-card text-center py-12">
              <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-lg text-muted-foreground">
                No notes generated yet — start creating some! 📝✨
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="cartoon-card text-center py-12">
          <p className="text-muted-foreground">Unable to load stats</p>
        </div>
      )}
    </div>
  );
}
