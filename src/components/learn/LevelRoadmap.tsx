import React, { useState } from 'react';
import { Lock, Trophy, Star, ArrowLeft, BookOpen, Brain, Sparkles, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompanionAvatar } from '@/components/companions/CompanionAvatar';
import { cn } from '@/lib/utils';

// --- DATA STRUCTURES ---
interface Level {
  id: number;
  status: 'locked' | 'current' | 'completed';
  stars: number;
}

interface Lesson {
  title: string;
  content: React.ReactNode;
  quiz: {
    question: string;
    options: string[];
    correctAnswer: string;
  };
}

interface Chapter {
  id: number;
  name: string;
  subject: string;
  levels: Level[];
  lessons: Lesson[];
}

interface Subject {
  id: string;
  name: string;
  emoji: string;
  chapters: Chapter[];
}


// --- MOCK DATA ---
const createLevels = (statusOverride?: 'completed'): Level[] => {
  if (statusOverride === 'completed') {
    return Array.from({ length: 10 }, (_, i) => ({ id: i + 1, status: 'completed' as const, stars: 3 }));
  }
  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    status: i < 5 ? ('completed' as const) : i === 5 ? ('current' as const) : ('locked' as const),
    stars: i < 5 ? 3 : 0,
  }));
};

const createChapter = (id: number, name: string, subject: string, lessons: Omit<Lesson, 'title'>[], allComplete = false): Chapter => ({
  id,
  name,
  subject,
  levels: allComplete ? createLevels('completed') : createLevels(),
  lessons: lessons.map((lesson, i) => ({ title: `${name}: Part ${i + 1}`, ...lesson })),
});

const subjects: Subject[] = [
  {
    id: 'biology',
    name: 'Biology',
    emoji: '🧬',
    chapters: [createChapter(1, 'The Secrets of the Cell', 'Biology', [
      { content: <p>This is lesson 1 for Biology.</p>, quiz: { question: 'What is the powerhouse of the cell?', options: ['Mitochondria', 'Nucleus', 'Ribosome'], correctAnswer: 'Mitochondria' } }, { content: <p>This is lesson 2 for Biology.</p>, quiz: { question: 'Question 2?', options: ['A', 'B', 'C'], correctAnswer: 'A' } }, { content: <p>This is lesson 3 for Biology.</p>, quiz: { question: 'Question 3?', options: ['A', 'B', 'C'], correctAnswer: 'A' } }, { content: <p>This is lesson 4 for Biology.</p>, quiz: { question: 'Question 4?', options: ['A', 'B', 'C'], correctAnswer: 'A' } }, { content: <p>This is lesson 5 for Biology.</p>, quiz: { question: 'Question 5?', options: ['A', 'B', 'C'], correctAnswer: 'A' } }, { content: <p>This is lesson 6 for Biology.</p>, quiz: { question: 'Question 6?', options: ['A', 'B', 'C'], correctAnswer: 'A' } }, { content: <p>This is lesson 7 for Biology.</p>, quiz: { question: 'Question 7?', options: ['A', 'B', 'C'], correctAnswer: 'A' } }, { content: <p>This is lesson 8 for Biology.</p>, quiz: { question: 'Question 8?', options: ['A', 'B', 'C'], correctAnswer: 'A' } }, { content: <p>This is lesson 9 for Biology.</p>, quiz: { question: 'Question 9?', options: ['A', 'B', 'C'], correctAnswer: 'A' } }, { content: <p>This is lesson 10 for Biology.</p>, quiz: { question: 'Question 10?', options: ['A', 'B', 'C'], correctAnswer: 'A' } }
    ])],
  },
  {
    id: 'math',
    name: 'Mathematics',
    emoji: '📐',
    chapters: [createChapter(1, 'The Magic of Algebra', 'Mathematics', [
      { content: <p>Welcome to Algebra! Let\'s learn about variables.</p>, quiz: { question: 'What is x in x + 2 = 5?', options: ['1', '2', '3'], correctAnswer: '3' } }, { content: <p>This is lesson 2 for Math.</p>, quiz: { question: 'Question 2?', options: ['A', 'B', 'C'], correctAnswer: 'B' } }, { content: <p>This is lesson 3 for Math.</p>, quiz: { question: 'Question 3?', options: ['A', 'B', 'C'], correctAnswer: 'B' } }, { content: <p>This is lesson 4 for Math.</p>, quiz: { question: 'Question 4?', options: ['A', 'B', 'C'], correctAnswer: 'B' } }, { content: <p>This is lesson 5 for Math.</p>, quiz: { question: 'Question 5?', options: ['A', 'B', 'C'], correctAnswer: 'B' } }, { content: <p>This is lesson 6 for Math.</p>, quiz: { question: 'Question 6?', options: ['A', 'B', 'C'], correctAnswer: 'B' } }, { content: <p>This is lesson 7 for Math.</p>, quiz: { question: 'Question 7?', options: ['A', 'B', 'C'], correctAnswer: 'B' } }, { content: <p>This is lesson 8 for Math.</p>, quiz: { question: 'Question 8?', options: ['A', 'B', 'C'], correctAnswer: 'B' } }, { content: <p>This is lesson 9 for Math.</p>, quiz: { question: 'Question 9?', options: ['A', 'B', 'C'], correctAnswer: 'B' } }, { content: <p>This is lesson 10 for Math.</p>, quiz: { question: 'Question 10?', options: ['A', 'B', 'C'], correctAnswer: 'B' } }
    ])],
  },
  {
    id: 'science',
    name: 'Science',
    emoji: '🔬',
    chapters: [createChapter(1, 'Journey Through the Water Cycle', 'Science', [
      { content: <p>Evaporation, Condensation, Precipitation. Let\'s explore!</p>, quiz: { question: 'What is it called when water turns into vapor?', options: ['Evaporation', 'Condensation', 'Precipitation'], correctAnswer: 'Evaporation' } }, { content: <p>Lesson 2 on the Water Cycle.</p>, quiz: { question: 'Q2?', options: ['A', 'B', 'C'], correctAnswer: 'A' } }, { content: <p>Lesson 3 on the Water Cycle.</p>, quiz: { question: 'Q3?', options: ['A', 'B', 'C'], correctAnswer: 'A' } }, { content: <p>Lesson 4 on the Water Cycle.</p>, quiz: { question: 'Q4?', options: ['A', 'B', 'C'], correctAnswer: 'A' } }, { content: <p>Lesson 5 on the Water Cycle.</p>, quiz: { question: 'Q5?', options: ['A', 'B', 'C'], correctAnswer: 'A' } }, { content: <p>Lesson 6 on the Water Cycle.</p>, quiz: { question: 'Q6?', options: ['A', 'B', 'C'], correctAnswer: 'A' } }, { content: <p>Lesson 7 on the Water Cycle.</p>, quiz: { question: 'Q7?', options: ['A', 'B', 'C'], correctAnswer: 'A' } }, { content: <p>Lesson 8 on the Water Cycle.</p>, quiz: { question: 'Q8?', options: ['A', 'B', 'C'], correctAnswer: 'A' } }, { content: <p>Lesson 9 on the Water Cycle.</p>, quiz: { question: 'Q9?', options: ['A', 'B', 'C'], correctAnswer: 'A' } }, { content: <p>Lesson 10 on the Water Cycle.</p>, quiz: { question: 'Q10?', options: ['A', 'B', 'C'], correctAnswer: 'A' } }
    ])],
  },
  {
    id: 'english',
    name: 'English',
    emoji: '📝',
    chapters: [createChapter(1, 'The Art of Storytelling', 'English', [
      { content: <p>Every story has a beginning, a middle, and an end.</p>, quiz: { question: 'What are the three parts of a story?', options: ['Intro, Climax, Conclusion', 'Beginning, Middle, End', 'Exposition, Rising Action, Resolution'], correctAnswer: 'Beginning, Middle, End' } }, { content: <p>Lesson 2 of Storytelling.</p>, quiz: { question: 'Q2?', options: ['A', 'B', 'C'], correctAnswer: 'C' } }, { content: <p>Lesson 3 of Storytelling.</p>, quiz: { question: 'Q3?', options: ['A', 'B', 'C'], correctAnswer: 'C' } }, { content: <p>Lesson 4 of Storytelling.</p>, quiz: { question: 'Q4?', options: ['A', 'B', 'C'], correctAnswer: 'C' } }, { content: <p>Lesson 5 of Storytelling.</p>, quiz: { question: 'Q5?', options: ['A', 'B', 'C'], correctAnswer: 'C' } }, { content: <p>Lesson 6 of Storytelling.</p>, quiz: { question: 'Q6?', options: ['A', 'B', 'C'], correctAnswer: 'C' } }, { content: <p>Lesson 7 of Storytelling.</p>, quiz: { question: 'Q7?', options: ['A', 'B', 'C'], correctAnswer: 'C' } }, { content: <p>Lesson 8 of Storytelling.</p>, quiz: { question: 'Q8?', options: ['A', 'B', 'C'], correctAnswer: 'C' } }, { content: <p>Lesson 9 of Storytelling.</p>, quiz: { question: 'Q9?', options: ['A', 'B', 'C'], correctAnswer: 'C' } }, { content: <p>Lesson 10 of Storytelling.</p>, quiz: { question: 'Q10?', options: ['A', 'B', 'C'], correctAnswer: 'C' } }
    ])],
  },
  {
    id: 'history',
    name: 'History',
    emoji: '📜',
    // CORRECTED: The 'true' argument was misplaced, causing a syntax error and app crash.
    chapters: [createChapter(1, 'Echoes of the Roman Empire', 'History', [
      { content: <p>Rome was not built in a day. It was a vast and powerful empire.</p>, quiz: { question: 'Who was the first Roman Emperor?', options: ['Julius Caesar', 'Augustus', 'Nero'], correctAnswer: 'Augustus' } }, { content: <p>Lesson 2 of Roman History.</p>, quiz: { question: 'Q2?', options: ['A', 'B', 'C'], correctAnswer: 'B' } }, { content: <p>Lesson 3 of Roman History.</p>, quiz: { question: 'Q3?', options: ['A', 'B', 'C'], correctAnswer: 'B' } }, { content: <p>Lesson 4 of Roman History.</p>, quiz: { question: 'Q4?', options: ['A', 'B', 'C'], correctAnswer: 'B' } }, { content: <p>Lesson 5 of Roman History.</p>, quiz: { question: 'Q5?', options: ['A', 'B', 'C'], correctAnswer: 'B' } }, { content: <p>Lesson 6 of Roman History.</p>, quiz: { question: 'Q6?', options: ['A', 'B', 'C'], correctAnswer: 'B' } }, { content: <p>Lesson 7 of Roman History.</p>, quiz: { question: 'Q7?', options: ['A', 'B', 'C'], correctAnswer: 'B' } }, { content: <p>Lesson 8 of Roman History.</p>, quiz: { question: 'Q8?', options: ['A', 'B', 'C'], correctAnswer: 'B' } }, { content: <p>Lesson 9 of Roman History.</p>, quiz: { question: 'Q9?', options: ['A', 'B', 'C'], correctAnswer: 'B' } }, { content: <p>Lesson 10 of Roman History.</p>, quiz: { question: 'Q10?', options: ['A', 'B', 'C'], correctAnswer: 'B' } }
    ], true)],
  },
];

type View = 'subjects' | 'levels' | 'lesson';


// --- HELPER & UI COMPONENTS ---
const ViewContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">{children}</div>
);

const PageTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <h1 className={cn("text-4xl lg:text-5xl font-extrabold text-foreground tracking-tighter text-center mb-8", className)}>{children}</h1>
);

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <Button variant="ghost" onClick={onClick} className="mb-6 font-bold text-lg">
    <ArrowLeft className="w-5 h-5 mr-2" /> Back
  </Button>
);

const renderStars = (count: number) => (
  <div className="flex gap-1 justify-center">
    {[1, 2, 3].map((star) => (
      <Star key={star} className={cn('w-5 h-5', star <= count ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30')} />
    ))}
  </div>
);

const Celebration = () => (
  <div className="absolute inset-0 overflow-hidden z-50 pointer-events-none">
    {Array.from({ length: 50 }).map((_, i) => {
      const style = {
        left: `${Math.random() * 100}%`,
        animation: `fall ${Math.random() * 2 + 3}s linear ${Math.random() * 5}s infinite`,
        fontSize: `${Math.random() * 1.5 + 1}rem`,
      };
      return <div key={i} className="absolute top-[-10%]" style={style}>{['🎉', '✨', '🎊', '🏆', '⭐'][i % 5]}</div>;
    })}
    <style>{`
      @keyframes fall {
        to {
          transform: translateY(110vh) rotate(360deg);
        }
      }
    `}</style>
  </div>
);


// --- MAIN COMPONENT ---
export function LevelRoadmap() {
  const [view, setView] = useState<View>('subjects');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedChapter(subject.chapters[0]);
    setView('levels');
  };

  const handleSelectLevel = (level: Level) => {
    if (level.status !== 'locked') {
      setSelectedLevel(level);
      setView('lesson');
    }
  };

  const goBack = () => {
    if (view === 'lesson') setView('levels');
    else if (view === 'levels') setView('subjects');
  };

  // --- VIEWS ---

  if (view === 'subjects') {
    return (
      <ViewContainer>
        <PageTitle>Choose a Subject 📚</PageTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <button key={subject.id} onClick={() => handleSelectSubject(subject)}
              className="cartoon-card p-6 text-left transition-transform duration-300 hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-primary/50">
              <div className="text-5xl mb-3">{subject.emoji}</div>
              <h2 className="text-2xl font-bold text-foreground mb-1">{subject.name}</h2>
              <p className="text-sm text-muted-foreground font-semibold">
                1 chapter, {subject.chapters[0].levels.length} levels
              </p>
            </button>
          ))}
        </div>
      </ViewContainer>
    );
  }

  if (view === 'levels' && selectedChapter && selectedSubject) {
    const allLevelsComplete = selectedChapter.levels.every(l => l.status === 'completed');
    
    return (
      <ViewContainer>
        {allLevelsComplete && <Celebration />}
        <BackButton onClick={goBack} />
        <div className="flex items-center justify-center gap-4 mb-8 text-center">
          <span className="text-5xl">{selectedSubject.emoji}</span>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground tracking-tighter">{selectedChapter.name}</h1>
        </div>
        {allLevelsComplete && (
          <div className="text-center cartoon-card p-6 max-w-md mx-auto">
            <Trophy className="w-20 h-20 text-yellow-400 mx-auto animate-bounce"/>
            <h2 className="text-3xl font-bold text-foreground mt-4">Chapter Complete!</h2>
            <p className="text-muted-foreground font-semibold mt-2">Amazing work! You\'ve mastered all the levels in {selectedChapter.name}.</p>
          </div>
        )}
        <div className="relative flex flex-col items-center mt-10">
          <div className="absolute top-0 bottom-0 w-0 border-l-4 border-dashed border-border/80" />
          {selectedChapter.levels.map((level) => {
            const isLeft = level.id % 2 !== 0;
            const isCurrent = level.status === 'current';
            return (
              <div key={level.id} className={cn("relative w-full flex my-6 items-center", isLeft ? "justify-start" : "justify-end")}>
                <div className={cn("absolute w-1/2 h-0 border-t-4 border-dashed border-border/80", isLeft ? "right-1/2" : "left-1/2")} />
                <div className={cn(
                    "z-10 w-44 flex-shrink-0 flex flex-col",
                    isLeft ? "items-end pr-10" : "items-start pl-10 order-2"
                  )}>
                  <h3 className={cn(
                      "font-bold text-lg", 
                      isCurrent ? "text-primary text-shadow-cute" : "text-foreground/80"
                    )}>
                    {isCurrent ? 'Current Level' : `Level ${level.id}`}
                  </h3>
                  {level.status === 'completed' && renderStars(level.stars)}
                </div>
                <button onClick={() => handleSelectLevel(level)} disabled={level.status === 'locked'}
                  className={cn(
                    'z-10 rounded-full flex items-center justify-center font-bold text-3xl border-8 shadow-lg transform transition-all duration-300',
                    {
                      'w-28 h-28 bg-green-500/90 border-green-300/50 text-white hover:bg-green-500': level.status === 'completed',
                      'w-32 h-32 bg-yellow-400 border-yellow-200/50 text-yellow-900 animate-glow hover:scale-105': isCurrent,
                      'w-28 h-28 bg-muted border-gray-300/50 text-muted-foreground cursor-not-allowed': level.status === 'locked',
                    },
                    !isLeft && 'order-1'
                  )}>
                  {level.status === 'completed' && <Trophy className="w-12 h-12" />}
                  {level.status === 'locked' && <Lock className="w-10 h-10" />}
                  {isCurrent && <Play className="w-14 h-14 text-yellow-900/80 fill-yellow-900/80" />}
                </button>
              </div>
            );
          })}
        </div>
      </ViewContainer>
    );
  }

  if (view === 'lesson' && selectedLevel && selectedChapter) {
    const lesson = selectedChapter.lessons[selectedLevel.id - 1];
    if (!lesson) return <ViewContainer><PageTitle>Lesson not found!</PageTitle></ViewContainer>;

    return (
      <ViewContainer>
        <BackButton onClick={goBack} />
        <div className="cartoon-card p-6 md:p-8 mb-8">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
              <Brain className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{lesson.title}</h1>
              <p className="text-md md:text-lg text-muted-foreground font-semibold">{selectedChapter.name}</p>
            </div>
          </div>
          <div className="prose prose-lg max-w-none text-foreground leading-relaxed">
            {lesson.content}
          </div>
        </div>

        <div className="cartoon-card p-6 md:p-8">
          <div className="flex items-center gap-4 mb-5">
            <Sparkles className="w-7 h-7 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Quick Quiz!</h2>
          </div>
          <p className="text-lg text-foreground mb-5">{lesson.quiz.question}</p>
          <div className="space-y-3">
            {lesson.quiz.options.map((option) => (
              <button key={option} className="w-full text-left p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-muted/50 transition-all font-semibold text-md">
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <CompanionAvatar size="lg" showBubble message="You got this! 🚀" />
        </div>
      </ViewContainer>
    );
  }

  return null;
}
