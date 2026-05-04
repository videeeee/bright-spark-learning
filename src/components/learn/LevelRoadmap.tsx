import React, { useState, useEffect } from 'react';
import { Lock, Check, Star, ArrowLeft, BookOpen, Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompanionAvatar } from '@/components/companions/CompanionAvatar';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';

interface Level {
  id: number;
  status: 'locked' | 'current' | 'completed';
  stars: number;
  topicTitle: string;
  explanation: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
  };
}

interface Chapter {
  id: number;
  name: string;
  subject: string;
  levels: Level[];
}

interface Subject {
  id: string;
  name: string;
  emoji: string;
  chapters: Chapter[];
}

// --- Data Generation ---

const SUBJECT_EMOJI_MAP: Record<string, string> = {
  biology: '🧬',
  mathematics: '📐',
  math: '📐',
  history: '🏛️',
  science: '🔬',
  english: '✍️',
  default: '📘',
};

const getSubjectEmoji = (subjectName: string) => {
  return SUBJECT_EMOJI_MAP[subjectName.toLowerCase()] || SUBJECT_EMOJI_MAP.default;
};

const createTopic = (subjectName: string, chapterId: number, levelId: number) => {
  const baseLabel = subjectName.split(' ')[0];
  const title = `${baseLabel} Concept ${chapterId}.${levelId}`;
  const explanation = `A short explanation of a core ${subjectName.toLowerCase()} idea for lesson ${chapterId}.${levelId}.`;
  const correct = `This answer correctly captures the main idea behind ${subjectName.toLowerCase()} lesson ${chapterId}.${levelId}.`;
  const distractors = [
    `This answer is unrelated to ${subjectName.toLowerCase()}.`,
    `This describes a different ${subjectName.toLowerCase()} idea.`,
    `This statement is false for ${subjectName.toLowerCase()}.`,
  ];
  return { title, explanation, correct, distractors };
};

const buildSubjects = (subjectNames: string[]): Subject[] => {
  return subjectNames.map((name, subjectIndex) => ({
    id: `subject-${subjectIndex}`,
    name,
    emoji: getSubjectEmoji(name),
    chapters: Array.from({ length: 3 }, (_, chapterIndex) => ({
      id: chapterIndex + 1,
      name: `Chapter ${chapterIndex + 1}`,
      subject: name,
      levels: Array.from({ length: 5 }, (_, levelIndex) => {
        const levelId = levelIndex + 1;
        const topicData = createTopic(name, chapterIndex + 1, levelId);
        const options = [topicData.correct, ...topicData.distractors].slice(0, 4).sort(() => Math.random() - 0.5);
        const correctIndex = options.indexOf(topicData.correct);

        return {
          id: levelId,
          status: chapterIndex === 0 && levelId === 1 ? 'current' : 'locked',
          stars: 0,
          topicTitle: topicData.title,
          explanation: topicData.explanation,
          quiz: {
            question: `Which statement best describes ${topicData.title}?`,
            options,
            correctIndex,
          },
        } as Level;
      }),
    })),
  }));
};

type View = 'subjects' | 'chapters' | 'levels' | 'lesson';

export function LevelRoadmap() {
  const [view, setView] = useState<View>('subjects');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [weakTopics, setWeakTopics] = useState<Array<{ subject: string; chapter: number; level: number; topic: string }>>([]);
  const { companion } = useTheme();
  const { user } = useUser();
  const [celebration, setCelebration] = useState<{ levelId: number; show: boolean } | null>(null);

  useEffect(() => {
    const intent = localStorage.getItem('learnIntent');
    if (intent) {
      const { subject, chapter } = JSON.parse(intent);
      // auto-select subject + chapter
      localStorage.removeItem('learnIntent');
    }
  }, []);

  useEffect(() => {
    if (!user?.subjects?.length) return;

    setSubjects(buildSubjects(user.subjects));

    async function loadProgress() {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/progress/mine`, {
          headers: { Authorization: token },
        });

        if (!res.ok) {
          console.error('Failed to load progress', res.statusText);
          return;
        }

        const data: Array<{ subject: string; chapterNumber: number; levelNumber: number }> = await res.json();

        setSubjects((prev) => {
          const copy = JSON.parse(JSON.stringify(prev)) as Subject[];

          data.forEach((p) => {
            const subject = copy.find((s) => s.name === p.subject);
            if (!subject) return;

            const chapter = subject.chapters.find((c) => c.id === p.chapterNumber);
            if (!chapter) return;

            const level = chapter.levels.find((l) => l.id === p.levelNumber);
            if (!level) return;

            level.status = 'completed';
            level.stars = 3;
            const idx = chapter.levels.findIndex((l) => l.id === level.id);
            if (chapter.levels[idx + 1] && chapter.levels[idx + 1].status === 'locked') {
              chapter.levels[idx + 1].status = 'current';
            }
          });

          copy.forEach((subject) => {
            subject.chapters.forEach((chapter) => {
              for (let i = 0; i < chapter.levels.length - 1; i++) {
                if (chapter.levels[i].status === 'completed' && chapter.levels[i + 1].status === 'locked') {
                  chapter.levels[i + 1].status = 'current';
                }
              }
            });
          });

          return copy;
        });
      } catch (error) {
        console.error('Unable to load progress', error);
      }
    }

    loadProgress();
  }, [user?.subjects]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(t);
  }, [message]);

  // No persistence in this component — UI-only state handled below

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubjectId(subject.id);
    setView('chapters');
  };

  const handleChapterClick = (chapter: Chapter) => {
    setSelectedChapterId(chapter.id);
    setView('levels');
  };

  const handleLevelClick = (level: Level) => {
    if (level.status !== 'locked') {
      setSelectedLevelId(level.id);
      setView('lesson');
    }
  };

  const goBack = () => {
    if (view === 'chapters') {
      setView('subjects');
      setSelectedSubjectId(null);
    } else if (view === 'levels') {
      setView('chapters');
      setSelectedChapterId(null);
    } else if (view === 'lesson') {
      setView('levels');
      setSelectedLevelId(null);
    }
  };

  const renderStars = (count: number) => {
    return (
      <div className="flex gap-0.5 mt-1">
        {[1, 2, 3].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= count ? 'fill-primary text-primary' : 'text-muted'}`}
          />
        ))}
      </div>
    );
  };

  // Derived selections from id-based state
  const selectedSubject = selectedSubjectId ? subjects.find((s) => s.id === selectedSubjectId) || null : null;
  const selectedChapter = selectedSubject && selectedChapterId ? selectedSubject.chapters.find((c) => c.id === selectedChapterId) || null : null;
  const selectedLevel = selectedChapter && selectedLevelId ? selectedChapter.levels.find((l) => l.id === selectedLevelId) || null : null;

  // show a short celebration when a level becomes completed
  useEffect(() => {
    if (selectedLevel && selectedLevel.status === 'completed') {
      // avoid re-showing for same level
      if (!celebration || celebration.levelId !== selectedLevel.id) {
        setCelebration({ levelId: selectedLevel.id, show: true });
        const h = setTimeout(() => setCelebration(null), 2800);
        return () => clearTimeout(h);
      }
    }
    return;
  }, [selectedLevel, selectedLevel?.id, selectedLevel?.status, celebration]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center text-muted-foreground">
        Loading your learning path...
      </div>
    );
  }

  if (!user.subjects?.length) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center text-muted-foreground">
        Please complete your profile to unlock your learning path.
      </div>
    );
  }

  if (!subjects.length) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center text-muted-foreground">
        Loading subjects...
      </div>
    );
  }

  async function handleAnswer(selectedIndex: number) {
    if (!selectedSubject || !selectedChapter || !selectedLevel) return;
    const subject = selectedSubject;
    const chapter = selectedChapter;
    const correct = selectedIndex === selectedLevel.quiz.correctIndex;

    if (correct) {

      setMessage("🎉 Correct! You’ve unlocked the next level!");


      await fetch(`${import.meta.env.VITE_API_URL}/api/progress/complete-level`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") || ""
        },
        body: JSON.stringify({
          subject: selectedSubject.name,
          chapterNumber: selectedChapter.id,
          levelNumber: selectedLevel.id,
          score: 100
        })
      });
      setSubjects((prev) => {
        const copy = JSON.parse(JSON.stringify(prev)) as Subject[];
        const sIdx = copy.findIndex((s) => s.id === subject.id);
        if (sIdx === -1) return prev;
        const cIdx = copy[sIdx].chapters.findIndex((c) => c.id === chapter.id);
        if (cIdx === -1) return prev;

        const levels = copy[sIdx].chapters[cIdx].levels;
        const lvlIdx = levels.findIndex((l) => l.id === selectedLevel.id);
        if (lvlIdx === -1) return prev;

        // mark current level completed
        levels[lvlIdx].status = 'completed';
        levels[lvlIdx].stars = 3;

        // unlock next level in the same chapter
        if (lvlIdx + 1 < levels.length) {
          if (levels[lvlIdx + 1].status === 'locked') {
            levels[lvlIdx + 1].status = 'current';
          }

        } else {
          // if the last level is completed, check if the entire chapter is now completed
          const allCompleted = levels.every((lv) => lv.status === 'completed');
          if (allCompleted) {
            const nextChapter = copy[sIdx].chapters[cIdx + 1];
            // unlock the first level of the next chapter
            if (nextChapter && nextChapter.levels[0].status === 'locked') {
              nextChapter.levels[0].status = 'current';
            }
          }
        }

        return copy;
      });
    } else {
      setMessage('⚠️ Oops! This topic seems weak. Revise it to unlock the next level.');
      setWeakTopics((prev) => {
        const exists = prev.some((w) => w.subject === subject.name && w.chapter === chapter.id && w.level === selectedLevel.id);
        if (exists) return prev;
        return [...prev, { subject: subject.name, chapter: chapter.id, level: selectedLevel.id, topic: selectedLevel.topicTitle }];
      });
    }
  }

  if (view === 'chapters' && selectedSubject) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <Button variant="ghost" onClick={goBack} className="mb-6 font-semibold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Subjects
        </Button>

        <h1 className="text-2xl font-bold text-foreground mb-6 text-center">{selectedSubject.name}</h1>

        <div className="space-y-4">
          {selectedSubject.chapters.map((chapter) => {
            const completedCount = chapter.levels.filter((lv) => lv.status === 'completed').length;
            const progressPercent = Math.round((completedCount / 10) * 100);
            const isFullyLocked = chapter.levels.every((lv) => lv.status === 'locked');
            const isCurrent = chapter.levels.some((lv) => lv.status === 'current' || lv.status === 'completed');

            return (
              <button
                key={chapter.id}
                onClick={() => handleChapterClick(chapter)}
                className={`w-full flex items-center gap-4 p-6 rounded-2xl transition-transform transform hover:scale-105 active:scale-100 bg-white/60 dark:bg-slate-800/60 shadow-lg hover:shadow-2xl relative overflow-hidden ${isFullyLocked ? 'opacity-70 grayscale' : 'ring-0'} `}
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-extrabold bg-gradient-to-br from-primary/60 to-secondary/40 text-primary-foreground shadow-sm">
                    {chapter.id}
                  </div>
                </div>

                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground">{chapter.name}</h3>
                    <div className="text-sm text-muted-foreground">{completedCount}/10 levels completed ({progressPercent}%)</div>
                  </div>
                  <p className="text-sm mt-2 text-foreground/80">
                    {isFullyLocked ? (
                      chapter.id === 1 ? (
                        'Locked — start with the earlier levels'
                      ) : (
                        <>Unlock by completing Chapter {chapter.id - 1} 🔒</>
                      )
                    ) : isCurrent ? (
                      <>Ready to learn — Let’s go! 🚀</>
                    ) : (
                      <>Locked for now 😴</>
                    )}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  <BookOpen className={`w-6 h-6 ${isFullyLocked ? 'text-muted-foreground' : 'text-primary'}`} />
                </div>

                <span className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-yellow-100/80 flex items-center justify-center text-xs shadow-md">⭐</span>
                <span className="absolute left-2 top-2 w-2 h-2 rounded-full bg-white/40 blur-sm" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (view === 'subjects') {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-foreground">Learning Path</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => {
            const subtitleMap: Record<string, string> = {
              Biology: 'Explore life 🌱',
              Mathematics: 'Crack numbers 🔢',
              History: 'Travel through time 🏛️',
              Science: 'Discover the world 🔬',
              English: 'Master words ✍️',
            };
            const subtitle = subtitleMap[subject.name] || `${subject.chapters.length} Chapters`;

            return (
              <button
                key={subject.id}
                onClick={() => handleSubjectClick(subject)}
                className="relative p-8 rounded-3xl shadow-2xl transform transition-all hover:scale-105 active:scale-100 bg-gradient-to-br from-white/70 to-white/40 dark:from-slate-800/60 dark:to-slate-700/50 overflow-hidden"
              >
                <div className="absolute -top-6 -left-10 opacity-30 text-6xl">{subject.emoji}</div>
                <div className="relative flex flex-col items-start gap-3">
                  <div className="text-5xl leading-none">{subject.emoji}</div>
                  <h3 className="text-2xl font-extrabold text-foreground">{subject.name}</h3>
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                </div>

                <div className="absolute right-4 top-4 px-2 py-1 rounded-full bg-gradient-to-r from-pink-300 to-yellow-300 text-xs font-semibold shadow-sm">{subject.chapters.length} Chapters</div>
                <span className="absolute -bottom-4 -right-6 w-24 h-24 rounded-full bg-primary/10 blur-3xl" />
                <span className="absolute top-3 left-3 w-2 h-2 bg-white/60 rounded-full" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (view === 'levels' && selectedChapter) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <Button variant="ghost" onClick={goBack} className="mb-6 font-semibold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Chapters
        </Button>

        <h1 className="text-2xl font-bold text-foreground mb-2 text-center">{selectedChapter.name}</h1>
        <div className="text-center text-sm text-muted-foreground mb-6">
          {selectedChapter.levels.filter((lv) => lv.status === 'completed').length}/10 levels completed ({Math.round((selectedChapter.levels.filter((lv) => lv.status === 'completed').length / 10) * 100)}%)
        </div>

        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-border h-full" />

          <div className="flex flex-col space-y-6">
            {selectedChapter.levels.map((level, index) => {
              const isLeft = index % 2 === 0;
              const locked = level.status === 'locked';
              const completed = level.status === 'completed';
              const current = level.status === 'current';

              return (
                <div key={level.id} className="relative flex items-center w-full">
                  <div className={`w-1/2 ${isLeft ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className={`inline-block max-w-[320px] ${isLeft ? 'mr-auto' : 'ml-auto'}`}>
                      <div className={`inline-flex items-center gap-3 p-4 rounded-2xl ${completed ? 'bg-green-50 border border-green-200' : current ? 'bg-primary/10 border border-primary/30 animate-pulse' : 'bg-muted-foreground/5 border border-border'} transition-shadow shadow-sm`}>
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold">
                          {completed ? <Check className="w-5 h-5 text-green-600" /> : locked ? <Lock className="w-5 h-5 text-muted-foreground" /> : <span className="text-foreground">{level.id}</span>}
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-foreground">Level {level.id}</div>
                          <div className="text-sm text-muted-foreground mt-1">{locked ? 'Locked for now 😴' : current ? 'Start here 🚀' : 'Completed ⭐'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center -mx-6">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${completed ? 'bg-green-200' : current ? 'bg-primary/20' : 'bg-muted-foreground/20'}`}>
                      {completed ? <Check className="w-5 h-5 text-green-600" /> : locked ? <Lock className="w-4 h-4 text-muted-foreground" /> : <div className="text-sm font-bold">{level.id}</div>}
                    </div>
                  </div>

                  <div className={`w-1/2 ${isLeft ? 'pl-8 text-left' : 'pr-8 text-right'}`}>
                    <div className={`inline-block max-w-[320px] ${isLeft ? 'ml-6' : 'mr-6'}`}>
                      <div className={`p-4 rounded-2xl ${isLeft ? '' : ''} bg-white/60 shadow-sm`}>
                        <div className="font-semibold text-foreground">{level.topicTitle}</div>
                        <div className="text-sm text-muted-foreground mt-1">{locked ? 'Unlock by completing previous levels' : level.explanation.split('.').slice(0, 2).join('.')}.</div>
                        <div className="mt-3">
                          <Button variant="ghost" onClick={() => handleLevelClick(level)} disabled={locked}>
                            {locked ? 'Locked' : 'Start learning 🎯'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'lesson' && selectedLevel && selectedSubject && selectedChapter) {
    const quizOptions = selectedLevel.quiz?.options ?? ['Option A', 'Option B', 'Option C', 'Option D'];
    const quizQuestion = selectedLevel.quiz?.question ?? `Quick question about ${selectedChapter.name}`;

    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <Button variant="ghost" onClick={goBack} className="mb-6 font-semibold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Levels
        </Button>

        <div className="cartoon-card mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Level {selectedLevel.id}: {selectedLevel.topicTitle}</h1>
              <p className="text-muted-foreground">{selectedLevel.explanation.split('.').slice(0, 2).join('.')}.</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-foreground leading-relaxed">
              {selectedLevel.explanation}
            </p>
          </div>
        </div>

        {/* Practice Task */}
        <div className="cartoon-card">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Quick Quiz!</h2>
          </div>

          <p className="text-foreground mb-4">{quizQuestion}</p>

          <div className="space-y-3">
            {quizOptions.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className="w-full text-left p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-muted/50 transition-all font-medium text-foreground"
              >
                {option}
              </button>
            ))}
          </div>
          {message && (
            <div className="mt-4 text-sm font-medium">{message}</div>
          )}

          <div className="mt-4">
            <div className="text-xs text-muted-foreground">Weak topics this session:</div>
            <ul className="mt-2 text-sm space-y-1">
              {weakTopics.length > 0 ? (
                weakTopics.map((w, i) => (
                  <li key={i} className="truncate">{w.subject} — Ch{w.chapter} L{w.level}: {w.topic}</li>
                ))
              ) : (
                <li className="text-muted-foreground">None</li>
              )}
            </ul>
          </div>
        </div>

        {/* Celebration banner (non-overlapping, between sections) */}
        {celebration?.show && celebration.levelId === selectedLevel.id && (
          <div
            role="status"
            aria-live="polite"
            className="mx-auto max-w-3xl my-4 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center gap-3 transition-opacity duration-300"
          >
            <div className="text-2xl">🎉</div>
            <div className="text-sm font-semibold">Level complete! You’re on fire 🔥</div>
          </div>
        )}

        {/* Companion encouragement */}
        <div className="mt-6 flex justify-center">
          <CompanionAvatar size="md" showBubble message="You've got this! 🌟" />
        </div>

        {/* Next Level button (visible only after completion) */}
        <div className="mt-6 flex justify-center">
          {selectedLevel.status === 'completed' && (
            (() => {
              const levels = selectedChapter.levels;
              const idx = levels.findIndex((l) => l.id === selectedLevel.id);
              const next = idx !== -1 ? levels[idx + 1] : null;
              // if no next in this chapter, check next chapter's first level
              let nextAvailable = next;
              let nextChapterId: number | null = null;
              if (!next) {
                const sIdx = subjects.findIndex((s) => s.id === selectedSubject.id);
                if (sIdx !== -1) {
                  const nextChap = subjects[sIdx].chapters.find((c) => c.id === selectedChapter.id + 1);
                  if (nextChap) {
                    nextAvailable = nextChap.levels[0];
                    nextChapterId = nextChap.id;
                  }
                }
              }

              const canAdvance = !!nextAvailable && nextAvailable.status !== 'locked';

              const handleNext = () => {
                if (!canAdvance || !nextAvailable) return;
                // if advancing to a level in the same chapter
                if (next && nextAvailable.id === next.id) {
                  setSelectedLevelId(next.id);
                } else {
                  // advance to next chapter's first level
                  if (nextChapterId) setSelectedChapterId(nextChapterId);
                  setSelectedLevelId(nextAvailable.id);
                }
              };

              return (
                <div>
                  <Button onClick={handleNext} disabled={!canAdvance} aria-disabled={!canAdvance} className="ml-2">
                    Next Level →
                  </Button>
                  {!canAdvance && (
                    <div className="text-xs text-muted-foreground mt-2 text-center">Next level locked — finish the previous one to unlock.</div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      </div>
    );
  }

  return null;
}