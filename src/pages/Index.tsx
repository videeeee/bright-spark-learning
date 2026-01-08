import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { HomeDashboard } from '@/components/dashboard/HomeDashboard';
import { LevelRoadmap } from '@/components/learn/LevelRoadmap';
import { NotesGenerator } from '@/components/notes/NotesGenerator';
import { TextToSpeech } from '@/components/speech/TextToSpeech';
import { StatsAnalytics } from '@/components/stats/StatsAnalytics';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { ThemeProvider } from '@/contexts/ThemeContext';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState('home');

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
    </div>
  );
}

const Index = () => {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  );
};

export default Index;
