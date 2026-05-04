import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Mail, BookOpen, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { useState } from "react";

export default function Settings() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Loading user profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Profile Settings ⚙️</h1>
            <p className="text-muted-foreground text-lg">Manage your account and personalization</p>
          </div>

          {/* User Profile Card */}
          <Card className="p-6 lg:p-8 shadow-lg">
            <div className="space-y-6">
              {/* Personal Info */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="cartoon-card p-4">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Full Name</div>
                    <div className="text-xl font-bold text-foreground">{user.name}</div>
                  </div>

                  {/* Email */}
                  <div className="cartoon-card p-4 flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-2">Email</div>
                      <div className="text-lg font-semibold text-foreground break-all">{user.email}</div>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-muted" />

              {/* Learning Info */}
              {(user.classLevel || user.curriculum || user.subjects) && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Learning Profile</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Class Level */}
                    {user.classLevel && (
                      <div className="cartoon-card p-4">
                        <div className="text-sm font-medium text-muted-foreground mb-2">Class Level</div>
                        <Badge className="text-base px-3 py-1 bg-primary text-primary-foreground">
                          Class {user.classLevel}
                        </Badge>
                      </div>
                    )}

                    {/* Curriculum */}
                    {user.curriculum && (
                      <div className="cartoon-card p-4">
                        <div className="text-sm font-medium text-muted-foreground mb-2">Curriculum</div>
                        <Badge className="text-base px-3 py-1 bg-secondary text-secondary-foreground">
                          {user.curriculum}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Subjects */}
                  {user.subjects && user.subjects.length > 0 && (
                    <div className="cartoon-card p-4 mt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Layers className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-foreground">Your Subjects</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {user.subjects.map((subject) => (
                          <Badge 
                            key={subject}
                            variant="outline"
                            className="bg-blue-50 border-blue-200 text-blue-700"
                          >
                            📚 {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <hr className="border-muted" />

              {/* Account Actions */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Account Actions</h2>
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate("/")}
                    variant="outline"
                    className="w-full md:w-auto"
                  >
                    ← Back to Dashboard
                  </Button>
                  
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    className="w-full md:w-auto"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Info Footer */}
          <div className="cartoon-card p-4 text-sm text-muted-foreground text-center">
            <p>🔒 Your data is secure and encrypted. You can update your profile anytime.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
