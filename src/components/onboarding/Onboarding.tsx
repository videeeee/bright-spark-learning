import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CompanionAvatar } from '@/components/companions/CompanionAvatar';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const { companions, setCompanion, companion } = useTheme();
  
  // Safely initialize state, it might be null briefly
  const [selectedCompanionId, setSelectedCompanionId] = useState<string | null>(null);

  // Effect to sync selected ID when companion context is available or changes
  useEffect(() => {
    if (companion) {
      setSelectedCompanionId(companion.id);
    }
  }, [companion]);

  const handleSelectCompanion = (id: string) => {
    setSelectedCompanionId(id);
    setCompanion(id); // This also updates the theme
  };

  const nextStep = () => setStep(s => s + 1);

  // Render a loading state if the companion data isn't ready yet
  if (!companion || !selectedCompanionId) {
    return (
      <div className="fixed inset-0 bg-background/90 backdrop-blur-lg z-50 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin"/>
          <p className="text-lg text-muted-foreground font-semibold mt-4">Waking up your buddy...</p>
      </div>
    );
  }

  const steps = [
    // --- Step 0: Welcome ---
    {
      title: "Welcome to Pippa!",
      description: "Your fun and friendly AI learning companion. Let's make learning an adventure!",
      content: <CompanionAvatar size="xl" showBubble message="Hey there! I'm so glad you're here!" />,
      button: <Button onClick={nextStep} size="lg" className="cartoon-button bg-primary text-primary-foreground h-auto py-4 px-12 text-xl font-bold">Get Started</Button>
    },
    // --- Step 1: Choose Your Buddy ---
    {
      title: "Choose Your Learning Buddy!",
      description: "Each buddy has a unique personality and teaching style. Who will you choose to guide you on your learning journey?",
      content: (
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {companions.map(c => (
              <button 
                key={c.id}
                onClick={() => handleSelectCompanion(c.id)}
                className={cn(
                  'cartoon-card p-4 flex flex-col items-center gap-2 transform transition-all duration-300', 
                  selectedCompanionId === c.id ? 'border-primary/80 ring-4 ring-primary/20 scale-105' : 'hover:border-primary/50 hover:-translate-y-1' 
                )}>
                <CompanionAvatar companionId={c.id} size="lg" />
                <h3 className="font-bold text-lg text-foreground">{c.name}</h3>
              </button>
            ))}
          </div>
          <div className="cartoon-card p-4 min-h-[100px] flex flex-col items-center justify-center text-center">
            <h4 className="text-xl font-bold text-foreground">{companions.find(c=>c.id === selectedCompanionId)?.name}</h4>
            <p className="text-md text-muted-foreground font-semibold">{companions.find(c=>c.id === selectedCompanionId)?.mood}</p>
            <p className="text-sm text-foreground/80 mt-1 italic">“{companions.find(c=>c.id === selectedCompanionId)?.welcomeMessage}”</p>
          </div>
        </div>
      ),
      button: <Button onClick={nextStep} size="lg" className="cartoon-button bg-primary text-primary-foreground h-auto py-4 px-12 text-xl font-bold">Next</Button>
    },
    // --- Step 2: All Set ---
    {
      title: "All Set!",
      description: `You and ${companions.find(c=>c.id === selectedCompanionId)?.name} are ready to start learning. Let the adventure begin!`,
      content: <CompanionAvatar size="xl" showBubble message="We're going to have so much fun!" />,
      button: <Button onClick={onComplete} size="lg" className="cartoon-button bg-primary text-primary-foreground h-auto py-4 px-12 text-xl font-bold">Start Learning</Button>
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-lg z-50 flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="w-full max-w-3xl text-center flex flex-col items-center gap-8">
        <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground tracking-tighter">{currentStep.title}</h1>
        <p className="text-lg text-muted-foreground font-semibold max-w-xl">{currentStep.description}</p>
        <div className="my-4">
            {currentStep.content}
        </div>
        {currentStep.button}
      </div>
    </div>
  );
}
