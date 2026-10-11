import React, { useState, useEffect } from 'react';
import {
  Lock,
  Check,
  Star,
  ArrowLeft,
  BookOpen,
  Sparkles,
  ChevronRight,
  Flag,
  Lightbulb,
  Award,
  RotateCcw,
  Clock,
  Loader2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CompanionAvatar } from '@/components/companions/CompanionAvatar';
import { useUser } from '@/contexts/UserContext';
import { useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api';
import { toast } from 'sonner';
import { MathRenderer } from '@/components/ui/MathRenderer';

// --- Type Definitions ---

interface LevelData {
  id: string;
  levelNumber: number;
  title: string;
  description: string;
  subtopics: string[];
  isReviewLevel: boolean;
  isLocked: boolean;
  isCompleted: boolean;
  stars: number;
  bestScore: number;
  hasPublishedContent: boolean;
  questionCount: number;
}

interface ChapterData {
  id: string;
  chapterNumber: number;
  title: string;
  description: string;
  levels: LevelData[];
}

interface UnitData {
  unitNumber: number;
  title: string;
  chapters: ChapterData[];
}

interface RoadmapResponse {
  board: string;
  classLevel: string;
  subject: string;
  subjectName: string;
  officialSource: string;
  units: UnitData[];
  chapters?: ChapterData[];
  progressPercent: number;
  completedCount: number;
  totalLevels: number;
  isUnderPreparation: boolean;
}

interface QuizQuestion {
  id: string;
  type: string;
  prompt: string;
  options: string[];
  hint?: string;
  difficulty: string;
  topicTag: string;
}

interface ActiveLevelDetails {
  id: string;
  levelNumber: number;
  title: string;
  description: string;
  chapterTitle: string;
  subjectName: string;
  lesson?: {
    title?: string;
    intro?: string;
    keyConcepts?: Array<{ title: string; explanation: string }>;
    tips?: string[];
  } | null;
  examples?: Array<{ problem: string; solution: string; explanation?: string }>;
  isReviewLevel: boolean;
}

interface GradingResult {
  attemptId: string;
  score: number;
  passed: boolean;
  stars: number;
  xpAwarded: number;
  isFirstCompletion: boolean;
  correctCount: number;
  totalQuestions: number;
  results: Array<{
    questionId: string;
    prompt: string;
    userChoice: unknown;
    correctAnswer: unknown;
    isCorrect: boolean;
    explanation: string;
    hint: string;
  }>;
}

type ViewState = 'subjects' | 'roadmap' | 'lesson' | 'quiz' | 'result';

export function LevelRoadmap() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const [view, setView] = useState<ViewState>('subjects');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [isRoadmapLoading, setIsRoadmapLoading] = useState(false);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);

  // Active Level / Quiz Session State
  const [activeLevelDetails, setActiveLevelDetails] = useState<ActiveLevelDetails | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [isLevelLoading, setIsLevelLoading] = useState(false);
  const [emptyLevelSelected, setEmptyLevelSelected] = useState<LevelData | null>(null);

  // Quiz interactive state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [isGrading, setIsGrading] = useState(false);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);

  // Report Modal State
  const [reportingQuestionId, setReportingQuestionId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('incorrect_answer');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Load roadmap when a subject is selected
  const loadRoadmap = async (subjectSlug: string) => {
    try {
      setIsRoadmapLoading(true);
      setRoadmapError(null);
      setSelectedSubject(subjectSlug);

      const board = user?.curriculum || 'ICSE';
      const classLevel = user?.classLevel || '9';

      const data = await api.get<RoadmapResponse>(
        `/api/curriculum/roadmap?subject=${encodeURIComponent(subjectSlug)}&board=${encodeURIComponent(board)}&classLevel=${encodeURIComponent(classLevel)}`
      );

      setRoadmap(data);
      setView('roadmap');
    } catch (err) {
      console.error('Failed to load roadmap:', err);
      setRoadmapError(err instanceof Error ? err.message : 'Failed to load curriculum roadmap');
    } finally {
      setIsRoadmapLoading(false);
    }
  };

  // Start Level
  const handleSelectLevel = async (level: LevelData) => {
    if (level.isLocked) {
      toast.info('Complete previous levels with at least 70% to unlock this level!');
      return;
    }

    if (!level.hasPublishedContent) {
      setEmptyLevelSelected(level);
      return;
    }

    try {
      setIsLevelLoading(true);
      setEmptyLevelSelected(null);
      const data = await api.get<{ level: ActiveLevelDetails; questions: QuizQuestion[] }>(
        `/api/curriculum/level/${level.id}`
      );

      setActiveLevelDetails(data.level);
      setActiveQuestions(data.questions || []);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setRevealedHints({});
      setGradingResult(null);

      // If level has lesson content, show lesson first, else jump straight to quiz
      if (data.level?.lesson?.intro || (data.level?.examples && data.level.examples.length > 0)) {
        setView('lesson');
      } else {
        setView('quiz');
      }
    } catch (err) {
      console.error('Failed to load level:', err);
      toast.error('Failed to load lesson questions. Please try again.');
    } finally {
      setIsLevelLoading(false);
    }
  };

  // Submit Quiz Answers
  const handleSubmitQuiz = async () => {
    if (!activeLevelDetails) return;

    // Check if any question remains unanswered
    const unansweredCount = activeQuestions.filter((q) => !selectedAnswers[q.id]).length;
    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredCount} unanswered question(s). Submit quiz anyway?`
      );
      if (!confirmSubmit) return;
    }

    try {
      setIsGrading(true);
      const result = await api.post<GradingResult>(
        `/api/curriculum/level/${activeLevelDetails.id}/grade`,
        {
          answers: selectedAnswers,
          timeSpentSeconds: 90,
        }
      );

      setGradingResult(result);
      setView('result');

      // Invalidate relevant query caches
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });

      // Refresh roadmap data in background
      if (selectedSubject) {
        api.get<RoadmapResponse>(
          `/api/curriculum/roadmap?subject=${encodeURIComponent(selectedSubject)}&board=${encodeURIComponent(user?.curriculum || 'ICSE')}&classLevel=${encodeURIComponent(user?.classLevel || '9')}`
        ).then(setRoadmap).catch(() => {});
      }
    } catch (err) {
      console.error('Quiz grading failed:', err);
      toast.error(err instanceof Error ? err.message : 'Grading failed. Please check connection.');
    } finally {
      setIsGrading(false);
    }
  };

  // Submit Question Report
  const handleSubmitReport = async () => {
    if (!reportingQuestionId || !activeLevelDetails) return;

    try {
      setIsSubmittingReport(true);
      await api.post('/api/curriculum/report', {
        questionId: reportingQuestionId,
        levelId: activeLevelDetails.id,
        reason: reportReason,
        details: reportDetails,
      });

      toast.success('Thank you! Your feedback has been sent to our curriculum team.');
      setReportingQuestionId(null);
      setReportDetails('');
    } catch (err) {
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Helper icons and colors
  const userSubjects = user?.subjects || ['Mathematics', 'Science', 'English', 'Computer Applications'];

  // ================= RENDER VIEWS =================

  // 1. Subjects Grid View
  if (view === 'subjects') {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-2 font-semibold text-primary border-primary/30">
            {user?.curriculum || 'ICSE'} • Class {user?.classLevel || '9'} Syllabus
          </Badge>
          <h1 className="text-3xl font-bold text-foreground mb-2">Learn & Master 🚀</h1>
          <p className="text-muted-foreground text-lg">
            Choose a subject to follow the official syllabus chapter roadmap!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {userSubjects.map((subName) => {
            const slug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return (
              <Card
                key={subName}
                onClick={() => loadRoadmap(slug)}
                className="group relative cursor-pointer overflow-hidden border-2 border-border hover:border-primary/60 transition-all duration-200 hover:shadow-lg p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Official Syllabus
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {subName}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    Official units, chapters, concept lessons, and verified interactive practice.
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t flex items-center justify-between text-xs font-semibold text-primary">
                  <span>Explore Chapters</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. Syllabus Roadmap View
  if (view === 'roadmap') {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setView('subjects')} className="font-semibold text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Subjects
          </Button>
          <Badge className="bg-primary/10 text-primary border-primary/20">
            {roadmap?.board} Class {roadmap?.classLevel}
          </Badge>
        </div>

        {isRoadmapLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading official syllabus roadmap...</p>
          </div>
        ) : roadmapError ? (
          <Card className="p-8 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
            <p className="text-foreground font-semibold">{roadmapError}</p>
            <Button onClick={() => loadRoadmap(selectedSubject)} variant="outline">
              Retry Loading
            </Button>
          </Card>
        ) : (
          <>
            {/* Header banner */}
            <div className="cartoon-card">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-2xl font-bold text-foreground">{roadmap?.subjectName}</h1>
                <span className="text-sm font-semibold text-primary">
                  {roadmap?.progressPercent || 0}% Complete
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${roadmap?.progressPercent || 0}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Source: {roadmap?.officialSource}
              </p>
            </div>

            {/* Units & Chapters List */}
            <div className="space-y-6">
              {(roadmap?.units || []).map((unit) => (
                <div key={unit.unitNumber} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-wider">
                      Unit {unit.unitNumber}
                    </span>
                    <h2 className="text-base font-bold text-foreground">{unit.title}</h2>
                  </div>

                  <div className="space-y-3">
                    {unit.chapters.map((chapter) => (
                      <Card key={chapter.id} className="p-5 border-2 shadow-sm">
                        <div className="mb-4">
                          <h3 className="font-bold text-foreground text-lg">
                            Chapter {chapter.chapterNumber}: {chapter.title}
                          </h3>
                          {chapter.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{chapter.description}</p>
                          )}
                        </div>

                        {/* Level nodes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {chapter.levels.map((lvl) => {
                            const isClickable = !lvl.isLocked;
                            return (
                              <button
                                key={lvl.id}
                                disabled={!isClickable || isLevelLoading}
                                onClick={() => handleSelectLevel(lvl)}
                                className={`text-left p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between ${
                                  lvl.isCompleted
                                    ? 'border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50'
                                    : !lvl.isLocked
                                    ? 'border-primary bg-primary/5 hover:border-primary shadow-sm hover:scale-[1.01]'
                                    : 'border-border/60 bg-muted/40 opacity-60 cursor-not-allowed'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-muted-foreground">
                                      Lvl {lvl.levelNumber}
                                    </span>
                                    {lvl.isReviewLevel && (
                                      <Badge variant="outline" className="text-[10px] py-0 px-1 border-primary/40 text-primary">
                                        Review
                                      </Badge>
                                    )}
                                  </div>

                                  {lvl.isCompleted ? (
                                    <div className="flex items-center gap-0.5">
                                      {[1, 2, 3].map((s) => (
                                        <Star
                                          key={s}
                                          className={`w-3.5 h-3.5 ${
                                            s <= lvl.stars ? 'fill-amber-400 text-amber-400' : 'text-muted'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  ) : lvl.isLocked ? (
                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                  ) : (
                                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                  )}
                                </div>

                                <div className="font-semibold text-sm text-foreground mb-1 line-clamp-1">
                                  {lvl.title}
                                </div>

                                <div className="flex items-center justify-between gap-1 mt-1">
                                  {lvl.subtopics && lvl.subtopics.length > 0 && (
                                    <p className="text-[11px] text-muted-foreground line-clamp-1 truncate">
                                      {lvl.subtopics.join(' • ')}
                                    </p>
                                  )}
                                  <span
                                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                                      lvl.hasPublishedContent
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {lvl.hasPublishedContent ? 'Playable' : 'Coming Soon'}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* "Lessons Being Prepared" Friendly Dialog */}
            {emptyLevelSelected && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-6 text-center space-y-4 shadow-xl border-2">
                  <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-2xl">
                    ⏳
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    Lesson in Quality Gate
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    <strong>{emptyLevelSelected.title}</strong> is currently being verified against official ICSE standards. New questions go live level-by-level without downtime!
                  </p>
                  {emptyLevelSelected.subtopics?.length > 0 && (
                    <div className="p-3 bg-muted/50 rounded-xl text-left text-xs space-y-1">
                      <span className="font-bold text-foreground block">Curriculum Subtopics:</span>
                      {emptyLevelSelected.subtopics.map((t, i) => (
                        <div key={i} className="text-muted-foreground">• {t}</div>
                      ))}
                    </div>
                  )}
                  <Button onClick={() => setEmptyLevelSelected(null)} className="w-full">
                    Got It, Continue Learning
                  </Button>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // 3. Lesson Walkthrough View (Before Quiz)
  if (view === 'lesson' && activeLevelDetails) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => setView('roadmap')} className="font-semibold text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Roadmap
        </Button>

        <div className="cartoon-card">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-primary">
            <span>{activeLevelDetails.subjectName}</span>
            <span>•</span>
            <span>{activeLevelDetails.chapterTitle}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">{activeLevelDetails.title}</h1>
          {activeLevelDetails.description && (
            <p className="text-sm text-muted-foreground">{activeLevelDetails.description}</p>
          )}
        </div>

        {/* Lesson Intro & Key Concepts */}
        {activeLevelDetails.lesson && (
          <Card className="p-6 space-y-5">
            {activeLevelDetails.lesson.intro && (
              <div className="text-sm text-foreground leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <span className="font-bold block mb-1 text-primary">📘 Concept Overview:</span>
                <MathRenderer content={activeLevelDetails.lesson.intro} />
              </div>
            )}

            {activeLevelDetails.lesson.keyConcepts && activeLevelDetails.lesson.keyConcepts.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-foreground text-base">Key Concepts to Remember:</h3>
                {activeLevelDetails.lesson.keyConcepts.map((kc, idx) => (
                  <div key={idx} className="p-3.5 bg-muted/40 rounded-xl border">
                    <span className="font-bold text-sm text-foreground block mb-0.5">{kc.title}</span>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      <MathRenderer content={kc.explanation} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Worked Examples */}
        {activeLevelDetails.examples && activeLevelDetails.examples.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-foreground text-lg">💡 Worked Examples:</h3>
            {activeLevelDetails.examples.map((ex, idx) => (
              <Card key={idx} className="p-5 space-y-2 border-2 border-indigo-100">
                <div className="font-semibold text-sm text-foreground">
                  <span className="text-primary font-bold mr-1">Example {idx + 1}:</span>
                  <MathRenderer content={ex.problem} />
                </div>
                <div className="text-xs bg-muted/60 p-3 rounded-lg text-foreground overflow-x-auto whitespace-pre-wrap">
                  <MathRenderer content={ex.solution} />
                </div>
                {ex.explanation && (
                  <div className="text-xs text-muted-foreground italic">
                    <MathRenderer content={ex.explanation} />
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        <Button onClick={() => setView('quiz')} className="w-full h-12 text-base font-bold gradient-primary shadow-lg">
          Start Practice Quiz ({activeQuestions.length} Questions) 🎯
        </Button>
      </div>
    );
  }

  // 4. Interactive Quiz View
  if (view === 'quiz' && activeLevelDetails) {
    const currentQ = activeQuestions[currentQuestionIndex];
    const isAnswered = currentQ && !!selectedAnswers[currentQ.id];
    const isLastQuestion = currentQuestionIndex === activeQuestions.length - 1;

    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setView('lesson')} className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" /> Lesson Notes
          </Button>

          <span className="text-xs font-bold text-muted-foreground">
            Question {currentQuestionIndex + 1} of {activeQuestions.length}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReportingQuestionId(currentQ?.id || null)}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            <Flag className="w-3.5 h-3.5 mr-1" /> Report
          </Button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / activeQuestions.length) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        {currentQ && (
          <Card className="p-6 space-y-6 shadow-md border-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold">
                  {currentQ.difficulty}
                </Badge>
                {currentQ.topicTag && (
                  <span className="text-xs text-muted-foreground">• {currentQ.topicTag}</span>
                )}
              </div>
              <div className="text-lg font-bold text-foreground leading-snug">
                <MathRenderer content={currentQ.prompt} />
              </div>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {(currentQ.options || []).map((opt, i) => {
                const isSelected = selectedAnswers[currentQ.id] === opt;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentQ.id]: opt })}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-foreground font-semibold shadow-sm'
                        : 'border-border hover:border-primary/40 bg-card text-foreground'
                    }`}
                  >
                    <span className="text-sm">
                      <MathRenderer content={opt} />
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Hint toggle */}
            {currentQ.hint && (
              <div className="pt-2">
                {revealedHints[currentQ.id] ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Hint: </strong>
                      <MathRenderer content={currentQ.hint} />
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRevealedHints({ ...revealedHints, [currentQ.id]: true })}
                    className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    <Lightbulb className="w-3.5 h-3.5" /> Need a hint?
                  </button>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
          >
            Previous
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmitQuiz}
              disabled={isGrading}
              className="font-bold gradient-primary px-8"
            >
              {isGrading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Grading on Server...
                </>
              ) : (
                'Submit Quiz & Grade'
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex((prev) => Math.min(activeQuestions.length - 1, prev + 1))}
              disabled={!isAnswered}
            >
              Next Question
            </Button>
          )}
        </div>

        {/* Question Reporting Modal */}
        {reportingQuestionId && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 space-y-4 shadow-xl border-2">
              <h3 className="text-lg font-bold text-foreground">Report Question Issue</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Issue Type</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full text-sm border rounded-lg p-2 bg-background"
                  >
                    <option value="incorrect_answer">Incorrect answer key</option>
                    <option value="typo_or_grammar">Typo or grammar error</option>
                    <option value="unclear_explanation">Explanation unclear</option>
                    <option value="bad_options">Confusing or duplicate options</option>
                    <option value="other">Other problem</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Details (Optional)</label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Describe what seemed wrong with this question..."
                    className="w-full text-xs border rounded-lg p-2 h-20 bg-background resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setReportingQuestionId(null)}>
                  Cancel
                </Button>
                <Button size="sm" disabled={isSubmittingReport} onClick={handleSubmitReport}>
                  {isSubmittingReport ? 'Submitting...' : 'Send Report'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // 5. Quiz Results & Review View
  if (view === 'result' && gradingResult) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
        {/* Celebration Header */}
        <Card className="p-8 text-center space-y-4 shadow-xl border-2">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl shadow-md bg-gradient-to-tr from-amber-400 to-yellow-300">
            {gradingResult.passed ? '🏆' : '📚'}
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-foreground mb-1">
              {gradingResult.passed ? 'Level Completed!' : 'Keep Practicing!'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {gradingResult.passed
                ? 'Great job! You met the 70% passing threshold and unlocked the next level.'
                : 'You scored below 70%. Review the explanations below and give it another shot!'}
            </p>
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-2 py-2">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`w-9 h-9 ${
                  s <= gradingResult.stars ? 'fill-amber-400 text-amber-400 animate-bounce' : 'text-muted'
                }`}
              />
            ))}
          </div>

          {/* Score & XP badges */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-muted/40 rounded-xl">
            <div>
              <span className="text-xs text-muted-foreground block">Score</span>
              <span className="text-xl font-bold text-foreground">{gradingResult.score}%</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Correct</span>
              <span className="text-xl font-bold text-foreground">
                {gradingResult.correctCount}/{gradingResult.totalQuestions}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">XP Earned</span>
              <span className="text-xl font-bold text-emerald-600">+{gradingResult.xpAwarded} XP</span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentQuestionIndex(0);
                setSelectedAnswers({});
                setRevealedHints({});
                setGradingResult(null);
                setView('quiz');
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Try Again
            </Button>
            <Button onClick={() => setView('roadmap')} className="gradient-primary px-6">
              Back to Roadmap
            </Button>
          </div>
        </Card>

        {/* Detailed Solutions & Explanations */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Review Explanations & Mistakes</h2>
          {gradingResult.results.map((r, i) => (
            <Card
              key={r.questionId || i}
              className={`p-5 border-2 space-y-3 ${
                r.isCorrect ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-bold text-foreground">
                  <span className="mr-1">Q{i + 1}.</span>
                  <MathRenderer content={r.prompt} />
                </div>
                <Badge className={r.isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}>
                  {r.isCorrect ? 'Correct' : 'Incorrect'}
                </Badge>
              </div>

              <div className="text-xs space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="font-semibold text-muted-foreground">Your Answer: </span>
                  <span className={r.isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                    <MathRenderer content={String(r.userChoice || 'Not answered')} />
                  </span>
                </div>
                {!r.isCorrect && (
                  <div className="flex items-baseline gap-1">
                    <span className="font-semibold text-muted-foreground">Correct Answer: </span>
                    <span className="text-emerald-700 font-bold">
                      <MathRenderer content={String(r.correctAnswer)} />
                    </span>
                  </div>
                )}
              </div>

              {r.explanation && (
                <div className="p-3 bg-muted/60 rounded-xl text-xs text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground block mb-0.5">💡 Explanation:</span>
                  <MathRenderer content={r.explanation} />
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return null;
}