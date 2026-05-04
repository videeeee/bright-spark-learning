import React, { useState, useEffect } from 'react';
import { Flame, Target, Star, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompanionAvatar, getCompanionMessage } from '@/components/companions/CompanionAvatar';
import { getContrastColor } from '@/lib/color';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { Loader2 } from 'lucide-react';

interface Note {
  _id: string;
  title?: string;
  topic?: string;
  createdAt: string;
}

interface Stats {
  totalNotes: number;
  recentNotes: Note[];
}

type Props = {
  onStartLearning: () => void;
};

export function HomeDashboard({ onStartLearning }: Props) {
  const { companion, getCompanionMeta } = useTheme();
  const { user } = useUser();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const companionMeta = getCompanionMeta(companion)!;

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
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      setIsLoading(false);
    }
  };

  const greeting = getCompanionMessage(companion, 'greeting');
  const userName = user?.name || 'Learner';
  const totalNotes = stats?.totalNotes || 0;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">

      {/* Welcome */}
      <div className="cartoon-card flex flex-col lg:flex-row items-center gap-6">
        <CompanionAvatar size="xl" showBubble message={greeting} />

        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {userName}! 🎉
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Keep up the awesome learning streak — let's make progress today! 🚀
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

      {/* Quick Stats */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <div className="cartoon-card text-center">
            <Star className="w-6 h-6 mx-auto text-primary mb-2" />
            <div className="text-3xl font-bold text-foreground">{totalNotes}</div>
            <div className="text-sm text-muted-foreground">Notes Created</div>
          </div>
          <div className="cartoon-card text-center">
            <Target className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
            <div className="text-3xl font-bold text-foreground">{stats?.recentNotes?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Recent Notes</div>
          </div>
          <div className="cartoon-card text-center">
            <Zap className="w-6 h-6 mx-auto text-orange-500 mb-2" />
            <div className="text-3xl font-bold text-foreground">Ready!</div>
            <div className="text-sm text-muted-foreground">All Set</div>
          </div>
        </div>
      )}

      {/* Recent Notes Preview */}
      {stats?.recentNotes && stats.recentNotes.length > 0 && (
        <div className="cartoon-card">
          <h2 className="text-xl font-bold text-foreground mb-4">📚 Recent Notes</h2>
          <div className="space-y-2">
            {stats.recentNotes.slice(0, 3).map((note: Note) => (
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
