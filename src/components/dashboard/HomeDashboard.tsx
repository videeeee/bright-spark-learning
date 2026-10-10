import React, { useState, useEffect } from 'react';
import { Flame, Target, Star, BookOpen, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompanionAvatar, getCompanionMessage } from '@/components/companions/CompanionAvatar';
import { getContrastColor } from '@/lib/color';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useProgressSummary } from '@/hooks/useProgress';
import { api } from '@/lib/api';

interface Note {
  _id: string;
  title?: string;
  topic?: string;
  createdAt: string;
}

interface StatsResponse {
  totalNotes: number;
  recentNotes: Note[];
}

type Props = {
  onStartLearning: () => void;
};

export function HomeDashboard({ onStartLearning }: Props) {
  const { companion, getCompanionMeta } = useTheme();
  const { user } = useUser();
  const { data: summary, isLoading: isSummaryLoading } = useProgressSummary();
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [isNotesLoading, setIsNotesLoading] = useState(true);
  const companionMeta = getCompanionMeta(companion)!;

  useEffect(() => {
    async function loadRecentNotes() {
      try {
        setIsNotesLoading(true);
        const data = await api.get<StatsResponse>('/api/stats');
        setRecentNotes(data?.recentNotes || []);
      } catch (err) {
        console.error('Failed to fetch recent notes:', err);
      } finally {
        setIsNotesLoading(false);
      }
    }

    loadRecentNotes();
  }, []);

  const greeting = getCompanionMessage(companion, 'greeting');
  const userName = summary?.user?.displayName || user?.name || 'Learner';
  const totalNotes = summary?.stats?.totalNotes ?? 0;
  const currentStreak = summary?.streak?.currentStreak ?? (user?.currentStreak ?? 0);
  const totalXp = summary?.xp?.totalXp ?? (user?.totalXp ?? 0);
  const levelsCompleted = summary?.stats?.levelsCompleted ?? 0;

  const isLoading = isSummaryLoading && isNotesLoading;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="cartoon-card flex flex-col lg:flex-row items-center gap-6">
        <CompanionAvatar size="xl" showBubble message={greeting} />

        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {userName}! 🎉
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            {currentStreak > 0
              ? `You are on a ${currentStreak}-day learning streak! Let's conquer new levels today! 🚀`
              : "Start learning today and spark your daily learning streak! 🚀"}
          </p>

          <Button
            onClick={onStartLearning}
            className="cartoon-button px-8 py-6 text-lg font-bold"
            style={{
              background: `linear-gradient(135deg, ${companionMeta.colors[0]}, ${companionMeta.colors[1]})`,
              color: getContrastColor(companionMeta.colors[1]),
            }}
          >
            Start Learning <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid with Real Metrics */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="cartoon-card text-center">
            <Flame className="w-6 h-6 mx-auto text-streak mb-2 streak-fire" />
            <div className="text-3xl font-bold text-foreground">{currentStreak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </div>
          <div className="cartoon-card text-center">
            <Star className="w-6 h-6 mx-auto text-primary mb-2" />
            <div className="text-3xl font-bold text-foreground">{totalXp.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total XP</div>
          </div>
          <div className="cartoon-card text-center">
            <Target className="w-6 h-6 mx-auto text-success mb-2" />
            <div className="text-3xl font-bold text-foreground">{levelsCompleted}</div>
            <div className="text-sm text-muted-foreground">Levels Done</div>
          </div>
          <div className="cartoon-card text-center">
            <BookOpen className="w-6 h-6 mx-auto text-accent mb-2" />
            <div className="text-3xl font-bold text-foreground">{totalNotes}</div>
            <div className="text-sm text-muted-foreground">Notes Saved</div>
          </div>
        </div>
      )}

      {/* Recent Notes Preview */}
      {recentNotes && recentNotes.length > 0 && (
        <div className="cartoon-card">
          <h2 className="text-xl font-bold text-foreground mb-4">📚 Recent Notes</h2>
          <div className="space-y-2">
            {recentNotes.slice(0, 3).map((note: Note) => (
              <div key={note._id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                <div className="text-2xl">📝</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{note.title || note.topic}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
