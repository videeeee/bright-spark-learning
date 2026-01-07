import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { HomeDashboard } from '@/components/dashboard/HomeDashboard';
import { LevelRoadmap } from '@/components/learn/LevelRoadmap';
import { NotesGenerator } from '@/components/notes/NotesGenerator';
import { TextToSpeech } from '@/components/speech/TextToSpeech';
import { StatsAnalytics } from '@/components/stats/StatsAnalytics';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Onboarding } from '@/components/onboarding/Onboarding';

export type Tab = 'home' | 'learn' | 'notes' | 'speech' | 'stats' | 'leaderboard' | 'settings';

const DashboardContent = () => {
  // Temporarily forcing onboarding to be complete to restore the main application.
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('home');

  // The logic to check for onboarding status will be restored once the component is fixed.
  // useEffect(() => {
  //   const completed = localStorage.getItem('pippa-onboarding-complete') === 'true';
  //   setIsOnboardingComplete(completed);
  // }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('pippa-onboarding-complete', 'true');
    setIsOnboardingComplete(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeDashboard onStartLearning={() => setActiveTab('learn')} />;
      case 'learn':
        return <LevelRoadmap />;
      case 'notes':
        return <NotesGenerator />;
      case 'speech':
        return <TextToSpeech />;
      case 'stats':
        return <StatsAnalytics />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <HomeDashboard onStartLearning={() => setActiveTab('learn')} />;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>

      {/* 
        The Onboarding component is temporarily disabled. 
        It was causing a fatal crash and a blank screen.
        I will fix it and properly re-enable it as an overlay in the next step.
      */}
      {/* {!isOnboardingComplete && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )} */}
    </div>
  );
};

const Index = () => {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  );
};

export default Index;
