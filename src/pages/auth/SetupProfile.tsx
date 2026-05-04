import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  CLASS_LEVELS,
  CURRICULA,
  getSubjects,
  type ClassLevel,
  type Curriculum,
} from "@/lib/subjectMapping";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";

export default function SetupProfile() {
  const navigate = useNavigate();
  const { fetchUserProfile } = useUser();

  const [classLevel, setClassLevel] = useState<ClassLevel | "">("");
  const [curriculum, setCurriculum] = useState<Curriculum | "">("");
  const [isLoading, setIsLoading] = useState(false);

  const subjects =
    classLevel && curriculum
      ? getSubjects(classLevel as ClassLevel, curriculum as Curriculum)
      : [];

  const isComplete = classLevel && curriculum && subjects.length > 0;

  const handleSubmit = async () => {
    if (!isComplete) {
      toast.error("Please select both class level and curriculum");
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token") || "";

      if (!token) {
        toast.error("Session lost. Please login again.");
        navigate("/login");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/profile-setup`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            classLevel,
            curriculum,
            subjects,
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to save profile (${res.status}): ${errorText}`);
      }

      await res.json();
      await fetchUserProfile();
      toast.success("Profile setup complete!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Profile setup error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </h1>
            <p className="text-gray-600 text-sm">
              Help us personalize your learning experience
            </p>
          </div>

          <div className="space-y-6">
            {/* Class Level Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Level
              </label>
              <Select value={classLevel} onValueChange={(val) => setClassLevel(val as ClassLevel)}>
                <SelectTrigger className={cn(
                  "w-full",
                  classLevel && "border-blue-300 bg-blue-50"
                )}>
                  <SelectValue placeholder="Select your class" />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_LEVELS.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      Class {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Curriculum Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Curriculum
              </label>
              <Select value={curriculum} onValueChange={(val) => setCurriculum(val as Curriculum)}>
                <SelectTrigger className={cn(
                  "w-full",
                  curriculum && "border-blue-300 bg-blue-50"
                )}>
                  <SelectValue placeholder="Select curriculum" />
                </SelectTrigger>
                <SelectContent>
                  {CURRICULA.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {curr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Subjects Preview */}
            {subjects.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Your Subjects
                </label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject) => (
                    <Badge 
                      key={subject} 
                      variant="secondary"
                      className="bg-blue-100 text-blue-700 text-xs py-1 px-2"
                    >
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!isComplete || isLoading}
              className={cn(
                "w-full h-10 font-semibold text-white",
                !isComplete ? "opacity-50 cursor-not-allowed" : ""
              )}
            >
              {isLoading ? "Saving..." : "Continue to Dashboard"}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            You can update these settings anytime in your profile
          </p>
        </div>
      </Card>
    </div>
  );
}
