import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import SetupProfile from "./pages/auth/SetupProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import { UserProvider } from "@/contexts/UserContext";
import { HomeDashboard } from "@/components/dashboard/HomeDashboard";
import { LevelRoadmap } from "@/components/learn/LevelRoadmap";
import { NotesGenerator } from "@/components/notes/NotesGenerator";
import { TextToSpeech } from "@/components/speech/TextToSpeech";
import { StatsAnalytics } from "@/components/stats/StatsAnalytics";
import { Leaderboard } from "@/components/leaderboard/Leaderboard";
import { SettingsPanel } from "@/components/settings/SettingsPanel";

const queryClient = new QueryClient();

const DashboardHome = () => {
  const navigate = useNavigate();
  return <HomeDashboard onStartLearning={() => navigate("/learn")} />;
};

const App = () => {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log("✅ User has existing token");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <UserProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route
                path="/setup"
                element={
                  <ProtectedRoute>
                    <SetupProfile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardHome />} />
                <Route path="learn" element={<LevelRoadmap />} />
                <Route path="notes" element={<NotesGenerator />} />
                <Route path="speech" element={<TextToSpeech />} />
                <Route path="stats" element={<StatsAnalytics />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="settings" element={<SettingsPanel />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </UserProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

