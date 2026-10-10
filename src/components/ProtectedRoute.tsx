import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const { user, isLoading } = useUser();

  const isSetupPage = location.pathname === "/setup";
  const needsProfileSetup = !!user && (!user.classLevel || !user.curriculum || !user.subjects || user.subjects.length === 0);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground font-medium">Securing session...</p>
      </div>
    );
  }

  if (!user) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  if (needsProfileSetup && !isSetupPage) {
    return <Navigate to="/setup" replace />;
  }

  if (!needsProfileSetup && isSetupPage) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
