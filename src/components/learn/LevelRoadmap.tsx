import React, { useState } from 'react';
import { Lock, Check, Star, ArrowLeft, BookOpen, Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompanionAvatar } from '@/components/companions/CompanionAvatar';
import { useTheme } from '@/contexts/ThemeContext';

interface Level {
  id: number;
  status: 'locked' | 'current' | 'completed';
  stars: number;
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

const subjects: Subject[] = [
  {
    id: 'biology',
    name: 'Biology',
    emoji: '🧬',
    chapters: [
      {
        id: 1,
        name: 'Photosynthesis',
        subject: 'Biology',
        levels: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          status: i < 4 ? 'completed' : i === 4 ? 'current' : 'locked',
          stars: i < 4 ? Math.floor(Math.random() * 2) + 2 : 0,
        })) as Level[],
      },
      {
        id: 2,
        name: 'Cell Structure',
        subject: 'Biology',
        levels: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          status: 'locked',
          stars: 0,
        })) as Level[],
      },
    ],
  },
  {
    id: 'math',
    name: 'Mathematics',
    emoji: '📐',
    chapters: [
      {
        id: 1,
        name: 'Algebra Basics',
        subject: 'Math',
        levels: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          status: i < 6 ? 'completed' : i === 6 ? 'current' : 'locked',
          stars: i < 6 ? Math.floor(Math.random() * 2) + 2 : 0,
        })) as Level[],
      },
    ],
  },
  {
    id: 'history',
    name: 'History',
    emoji: '🏛️',
    chapters: [
      {
        id: 1,
        name: 'Ancient Civilizations',
        subject: 'History',
        levels: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          status: i < 2 ? 'completed' : i === 2 ? 'current' : 'locked',
          stars: i < 2 ? 3 : 0,
        })) as Level[],
      },
    ],
  },
  {
    id: 'science',
    name: 'Science',
    emoji: '🔬',
    chapters: [
      {
        id: 1,
        name: 'States of Matter',
        subject: 'Science',
        levels: Array.from({ length: 8 }, (_, i) => ({
          id: i + 1,
          status: i < 3 ? 'completed' : i === 3 ? 'current' : 'locked',
          stars: i < 3 ? Math.floor(Math.random() * 3) + 1 : 0,
        })) as Level[],
      },
      {
        id: 2,
        name: 'Space & Planets',
        subject: 'Science',
        levels: Array.from({ length: 8 }, (_, i) => ({
          id: i + 1,
          status: 'locked',
          stars: 0,
        })) as Level[],
      },
    ],
  },
  {
    id: 'english',
    name: 'English',
    emoji: '✍️',
    chapters: [
      {
        id: 1,
        name: 'Grammar Basics',
        subject: 'English',
        levels: Array.from({ length: 6 }, (_, i) => ({
          id: i + 1,
          status: i < 1 ? 'completed' : i === 1 ? 'current' : 'locked',
          stars: i < 1 ? 3 : 0,
        })) as Level[],
      },
      {
        id: 2,
        name: 'Reading Comprehension',
        subject: 'English',
        levels: Array.from({ length: 6 }, (_, i) => ({
          id: i + 1,
          status: 'locked',
          stars: 0,
        })) as Level[],
      },
    ],
  },
];

const lessonContentMap: Record<string, Record<number, { title: string; intro: string; fact?: string; quiz: { question: string; options: string[] } }>> = {
  biology: {
    1: {
      title: 'Photosynthesis Basics',
      intro: "Photosynthesis is the process plants use to convert sunlight into energy. We'll learn how sunlight, water, and CO₂ become sugar and oxygen.",
      fact: 'Sunlight + Water + CO₂ → Sugar + Oxygen 🌿',
      quiz: {
        question: 'What do plants need to perform photosynthesis?',
        options: ['Sunlight, water, and carbon dioxide', 'Only water', 'Only sunlight', 'Pizza and soda'],
      },
    },
    2: {
      title: 'Cell Structure',
      intro: 'Cells are the building blocks of life. Learn the parts like nucleus, membrane, and mitochondria.',
      quiz: {
        question: 'Which cell part is the powerhouse of the cell?',
        options: ['Mitochondria', 'Nucleus', 'Cell wall', 'Chloroplast'],
      },
    },
  },
  science: {
    1: {
      title: 'States of Matter',
      intro: 'Matter comes in solids, liquids, and gases. We will explore particle behavior in each state.',
      fact: 'Solids keep their shape, liquids take container shape, gases expand to fill space.',
      quiz: {
        question: 'Which change is an example of matter changing state?',
        options: ['Ice melting', 'Cutting paper', 'Dissolving sugar', 'Painting a wall'],
      },
    },
    2: {
      title: 'Space & Planets',
      intro: 'Discover our solar system, planets, and interesting space facts.',
      quiz: {
        question: 'Which planet is known as the Red Planet?',
        options: ['Mars', 'Venus', 'Jupiter', 'Saturn'],
      },
    },
  },
  english: {
    1: {
      title: 'Grammar Basics',
      intro: 'Learn nouns, verbs, and simple sentence structure to write clear sentences.',
      fact: 'A sentence needs a subject and a verb to be complete.',
      quiz: {
        question: 'Which of the following is a verb?',
        options: ['Run', 'Happy', 'Blue', 'Quickly'],
      },
    },
    2: {
      title: 'Reading Comprehension',
      intro: 'Practice reading passages and answering questions to improve understanding.',
      quiz: {
        question: 'What should you do first when answering a reading question?',
        options: ['Read the passage', 'Guess the answer', 'Skip to the last paragraph', 'Count the words'],
      },
    },
  },
};

type View = 'subjects' | 'chapters' | 'levels' | 'lesson';

export function LevelRoadmap() {
  const [view, setView] = useState<View>('subjects');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const { companion } = useTheme();

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setView('chapters');
  };

  const handleChapterClick = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setView('levels');
  };

  const handleLevelClick = (level: Level) => {
    if (level.status !== 'locked') {
      setSelectedLevel(level);
      setView('lesson');
    }
  };

  const goBack = () => {
    if (view === 'chapters') {
      setView('subjects');
      setSelectedSubject(null);
    } else if (view === 'levels') {
      setView('chapters');
      setSelectedChapter(null);
    } else if (view === 'lesson') {
      setView('levels');
      setSelectedLevel(null);
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

  if (view === 'subjects') {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Choose a Subject 📚</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => handleSubjectClick(subject)}
              className="cartoon-card text-left hover:scale-105 transition-transform"
            >
              <div className="text-5xl mb-4">{subject.emoji}</div>
              <h2 className="text-xl font-bold text-foreground mb-2">{subject.name}</h2>
              <p className="text-muted-foreground">{subject.chapters.length} chapters</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'chapters' && selectedSubject) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={goBack} className="mb-6 font-semibold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Subjects
        </Button>
        
        <div className="flex items-center gap-4 mb-8">
          <span className="text-5xl">{selectedSubject.emoji}</span>
          <h1 className="text-3xl font-bold text-foreground">{selectedSubject.name}</h1>
        </div>

        <div className="space-y-4">
          {selectedSubject.chapters.map((chapter, index) => {
            const completedLevels = chapter.levels.filter(l => l.status === 'completed').length;
            const isLocked = index > 0 && selectedSubject.chapters[index - 1].levels.some(l => l.status !== 'completed');
            
            return (
              <button
                key={chapter.id}
                onClick={() => !isLocked && handleChapterClick(chapter)}
                disabled={isLocked}
                className={`cartoon-card w-full text-left flex items-center gap-4 transition-all ${
                  isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'
                }`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                  isLocked ? 'bg-muted' : 'gradient-primary'
                }`}>
                  {isLocked ? <Lock className="w-6 h-6 text-muted-foreground" /> : <BookOpen className="w-6 h-6 text-primary-foreground" />}
                </div>
                
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-foreground">{chapter.name}</h2>
                  <p className="text-muted-foreground">{completedLevels}/10 levels completed</p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">{Math.round((completedLevels / chapter.levels.length) * 100)}%</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (view === 'levels' && selectedChapter) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <Button variant="ghost" onClick={goBack} className="mb-6 font-semibold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Chapters
        </Button>

        <h1 className="text-2xl font-bold text-foreground mb-8 text-center">{selectedChapter.name}</h1>

        {/* Roadmap */}
        <div className="relative flex flex-col items-center">
          {/* Companion at top */}
          <div className="mb-8">
            <CompanionAvatar size="lg" showBubble message="You're doing great! Keep going! 🌟" />
          </div>

          {/* Levels Path */}
          <div className="relative">
            {selectedChapter.levels.map((level, index) => {
              const isLeft = index % 2 === 0;
              
              return (
                <div key={level.id} className="relative">
                  {/* Connecting line */}
                  {index < selectedChapter.levels.length - 1 && (
                    <div className={`absolute top-16 ${isLeft ? 'left-8' : 'right-8'} w-1 h-12 bg-border rounded-full`} />
                  )}
                  
                  <div className={`flex items-center gap-4 mb-4 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                    <button
                      onClick={() => handleLevelClick(level)}
                      disabled={level.status === 'locked'}
                      className={`level-node ${
                        level.status === 'completed'
                          ? 'bg-level-completed text-success-foreground'
                          : level.status === 'current'
                          ? 'bg-level-current text-primary-foreground animate-pulse'
                          : 'bg-level-locked text-muted-foreground cursor-not-allowed'
                      }`}
                    >
                      {level.status === 'completed' ? (
                        <Check className="w-8 h-8" />
                      ) : level.status === 'locked' ? (
                        <Lock className="w-6 h-6" />
                      ) : (
                        level.id
                      )}
                    </button>

                    <div className={`text-${isLeft ? 'left' : 'right'}`}>
                      <div className="font-bold text-foreground">Level {level.id}</div>
                      {level.status === 'completed' && renderStars(level.stars)}
                      {level.status === 'current' && (
                        <span className="text-sm text-primary font-semibold">Start now!</span>
                      )}
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

  if (view === 'lesson' && selectedLevel) {
    const chapterContent = lessonContentMap[selectedSubject!.id]?.[selectedChapter!.id];

    const quizOptions = chapterContent?.quiz?.options ?? ['Option A', 'Option B', 'Option C', 'Option D'];
    const quizQuestion = chapterContent?.quiz?.question ?? `Quick question about ${selectedChapter!.name}`;

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
              <h1 className="text-2xl font-bold text-foreground">Level {selectedLevel.id}: {chapterContent?.title ?? selectedChapter!.name}</h1>
              <p className="text-muted-foreground">{chapterContent?.intro ?? `Learn about ${selectedChapter!.name}`}</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            {chapterContent?.fact && (
              <div className="bg-muted rounded-xl p-4 text-center my-6">
                <p className="text-lg font-bold text-foreground">{chapterContent.fact}</p>
              </div>
            )}

            <p className="text-foreground leading-relaxed">
              {chapterContent?.intro}
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
                className="w-full text-left p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-muted/50 transition-all font-medium text-foreground"
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Companion encouragement */}
        <div className="mt-6 flex justify-center">
          <CompanionAvatar size="md" showBubble message="You've got this! 🌟" />
        </div>
      </div>
    );
  }

  return null;
}
