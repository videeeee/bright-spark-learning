import React, { useState, useEffect } from 'react';
import { Brain, Flame, Star, Target, BookOpen, Clock, Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useProgressSummary } from '@/hooks/useProgress';
import { api } from '@/lib/api';
import { toast } from 'sonner';

type RecentNote = {
  _id: string;
  title?: string;
  topic?: string;
  createdAt: string;
};

interface StatsApiResponse {
  totalNotes: number;
  notesThisWeek: number;
  recentNotes: RecentNote[];
  currentStreak: number;
  totalXp: number;
  levelsCompleted: number;
  subjectProgress: Record<string, number>;
}

export function StatsAnalytics() {
  const { companion } = useTheme();
  const { data: summary, isLoading: isSummaryLoading } = useProgressSummary();
  const [statsData, setStatsData] = useState<StatsApiResponse | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoadingStats(true);
        const data = await api.get<StatsApiResponse>('/api/stats');
        setStatsData(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        toast.error('Could not refresh recent stats');
      } finally {
        setIsLoadingStats(false);
      }
    }

    fetchStats();
  }, []);

  const isLoading = isSummaryLoading && isLoadingStats;

  // Single source of truth values
  const totalNotes = summary?.stats?.totalNotes ?? (statsData?.totalNotes || 0);
  const notesThisWeek = summary?.stats?.notesThisWeek ?? (statsData?.notesThisWeek || 0);
  const currentStreak = summary?.streak?.currentStreak ?? (statsData?.currentStreak || 0);
  const totalXp = summary?.xp?.totalXp ?? (statsData?.totalXp || 0);
  const levelsCompleted = summary?.stats?.levelsCompleted ?? (statsData?.levelsCompleted || 0);
  const subjectProgress = summary?.stats?.subjectProgress ?? (statsData?.subjectProgress || {});
  const recentNotes = statsData?.recentNotes || [];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Your Learning Stats 📊
        </h1>
        <p className="text-muted-foreground text-lg">
          Live analytics tracked directly from your lessons and activities!
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Main Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="cartoon-card text-center">
              <Flame className="w-6 h-6 mx-auto text-streak mb-2 streak-fire" />
              <div className="text-2xl font-bold text-foreground mt-1">
                {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
              </div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
            </div>

            <div className="cartoon-card text-center">
              <Star className="w-6 h-6 mx-auto text-primary mb-2" />
              <div className="text-2xl font-bold text-foreground mt-1">
                {totalXp.toLocaleString()} XP
              </div>
              <div className="text-sm text-muted-foreground">Total XP Earned</div>
            </div>

            <div className="cartoon-card text-center">
              <Target className="w-6 h-6 mx-auto text-success mb-2" />
              <div className="text-2xl font-bold text-foreground mt-1">
                {levelsCompleted}
              </div>
              <div className="text-sm text-muted-foreground">Levels Completed</div>
            </div>

            <div className="cartoon-card text-center">
              <BookOpen className="w-6 h-6 mx-auto text-accent mb-2" />
              <div className="text-2xl font-bold text-foreground mt-1">
                {totalNotes}
              </div>
              <div className="text-sm text-muted-foreground">Total Notes ({notesThisWeek} this week)</div>
            </div>
          </div>

          {/* Subject-Wise Progress */}
          <div className="cartoon-card">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" /> Subject Progress
            </h2>

            {Object.keys(subjectProgress).length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No levels completed yet. Start learning a subject to see your subject-wise mastery!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(subjectProgress).map(([subject, count]) => {
                  // Assuming standard ICSE Class 9 subject has 3 chapters x 5 levels = 15 levels
                  const maxLevels = 15;
                  const percentage = Math.min(100, Math.round((count / maxLevels) * 100));

                  return (
                    <div key={subject} className="space-y-1">
                      <div className="flex justify-between text-sm font-semibold text-foreground">
                        <span>{subject}</span>
                        <span className="text-muted-foreground">
                          {count} levels completed ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, percentage)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Notes Activity */}
          {recentNotes && recentNotes.length > 0 && (
            <div className="cartoon-card">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" /> Recent Notes Activity
              </h2>
              <div className="space-y-3">
                {recentNotes.map((note, idx) => (
                  <div key={note._id || idx} className="border-l-4 border-primary pl-4 py-2">
                    <h3 className="font-semibold text-foreground">{note.title || note.topic}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(note.createdAt).toLocaleDateString()} at{' '}
                      {new Date(note.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {(!recentNotes || recentNotes.length === 0) && (
            <div className="cartoon-card text-center py-12">
              <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-lg text-muted-foreground">
                No notes generated yet — start creating some to level up your study game! 📝✨
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
