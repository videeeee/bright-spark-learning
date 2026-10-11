import { useState, useEffect } from "react";
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
import { Loader2, Check, ArrowLeft, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import { api } from "@/lib/api";

interface CatalogBoard {
  id: string;
  name: string;
  fullName: string;
  description: string;
  badge: string;
  classes: string[];
  comingSoonClasses?: string[];
}

interface CatalogSubject {
  id: string;
  name: string;
  category: string;
  icon?: string;
  color?: string;
  gradient?: string;
  isCompulsory: boolean;
  status: "live" | "partial" | "coming-soon";
  description?: string;
}

interface CatalogResponse {
  boards?: CatalogBoard[];
  catalog?: Record<string, Record<string, CatalogSubject[]>>;
}

export default function SetupProfile() {
  const navigate = useNavigate();
  const { user, fetchUserProfile } = useUser();

  const [boards, setBoards] = useState<CatalogBoard[]>([]);
  const [catalogMap, setCatalogMap] = useState<Record<string, Record<string, CatalogSubject[]>>>({});
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);

  const [selectedBoard, setSelectedBoard] = useState<string>(user?.curriculum || "ICSE");
  const [selectedClass, setSelectedClass] = useState<string>(user?.classLevel || "9");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(user?.subjects || []);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch dynamic catalog
  useEffect(() => {
    async function loadCatalog() {
      try {
        setIsCatalogLoading(true);
        const data = await api.get<CatalogResponse>("/api/curriculum/catalog");
        if (data.boards) setBoards(data.boards);
        if (data.catalog) setCatalogMap(data.catalog);
      } catch (err) {
        console.error("Failed to load catalog from API:", err);
        // Fallback default boards if API is slow
        setBoards([
          { id: "ICSE", name: "ICSE", fullName: "CISCE Board", description: "Comprehensive syllabus", badge: "ICSE", classes: ["9"], comingSoonClasses: ["6", "7", "8", "10", "11", "12"] },
          { id: "CBSE", name: "CBSE", fullName: "Central Board", description: "NCERT aligned", badge: "CBSE", classes: ["9"], comingSoonClasses: ["6", "7", "8", "10", "11", "12"] },
          { id: "State", name: "State Board", fullName: "State Board", description: "Standard state syllabus", badge: "State", classes: [], comingSoonClasses: ["6", "7", "8", "9", "10", "11", "12"] },
        ]);
      } finally {
        setIsCatalogLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // 2. Derive available classes and subjects for current selections
  const currentBoardObj = boards.find((b) => b.id.toUpperCase() === selectedBoard.toUpperCase()) || boards[0];
  const availableClasses = currentBoardObj?.classes || ["6", "7", "8", "9", "10", "11", "12"];

  const availableSubjects: CatalogSubject[] = useMemo(() => {
    return (selectedBoard && selectedClass && catalogMap[selectedBoard]?.[selectedClass])
      ? catalogMap[selectedBoard][selectedClass]
      : [];
  }, [selectedBoard, selectedClass, catalogMap]);

  // 3. Pre-select compulsory subjects when board or class changes
  useEffect(() => {
    if (availableSubjects.length > 0) {
      const compulsoryNames = availableSubjects
        .filter((s) => s.isCompulsory)
        .map((s) => s.name);

      setSelectedSubjects((prev) => {
        const validExisting = (prev || []).filter((name) =>
          availableSubjects.some((s) => s.name.toLowerCase() === name.toLowerCase())
        );
        const combined = Array.from(new Set([...compulsoryNames, ...validExisting]));
        return combined.length > 0 ? combined : compulsoryNames;
      });
    }
  }, [availableSubjects]);

  const toggleSubject = (subjectName: string, isCompulsory: boolean) => {
    if (isCompulsory) {
      toast.info(`${subjectName} is a compulsory subject in this curriculum`);
      return;
    }

    if (selectedSubjects.includes(subjectName)) {
      if (selectedSubjects.length <= 1) {
        toast.error("You must have at least one subject selected");
        return;
      }
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subjectName));
    } else {
      setSelectedSubjects([...selectedSubjects, subjectName]);
    }
  };

  const handleSave = async () => {
    if (!selectedBoard || !selectedClass || selectedSubjects.length === 0) {
      toast.error("Please select board, class, and at least one subject");
      return;
    }

    try {
      setIsSaving(true);
      await api.put("/api/auth/profile-setup", {
        curriculum: selectedBoard,
        classLevel: selectedClass,
        subjects: selectedSubjects,
      });

      await fetchUserProfile();
      toast.success("Academic profile saved successfully! 🚀");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Profile setup save failed:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-2 border-indigo-100">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            {user?.classLevel ? (
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            ) : <div />}
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full">
              Full Official Syllabus
            </span>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Personalize Your Curriculum
            </h1>
            <p className="text-gray-600 text-sm">
              Select your educational board and grade to load real syllabus roadmaps
            </p>
          </div>

          {isCatalogLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading curriculum catalog...</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Board Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Educational Board
                </label>
                <Select
                  value={selectedBoard}
                  onValueChange={(val) => {
                    setSelectedBoard(val);
                  }}
                >
                  <SelectTrigger className="w-full bg-white border-gray-200 h-11">
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent>
                    {boards.map((b) => (
                      <SelectItem key={b.id} value={b.id} className="py-2">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{b.name}</span>
                          <span className="text-xs text-muted-foreground">{b.fullName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Class Level Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Class / Grade Level
                </label>
                <Select
                  value={selectedClass}
                  onValueChange={(val) => {
                    setSelectedClass(val);
                  }}
                >
                  <SelectTrigger className="w-full bg-white border-gray-200 h-11">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Live Classes with real content */}
                    {availableClasses.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">Class {cls}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                    {/* Coming Soon Classes */}
                    {(currentBoardObj?.comingSoonClasses || []).map((cls) => (
                      <SelectItem key={`cs-${cls}`} value={cls} disabled className="opacity-60 cursor-not-allowed">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Class {cls}</span>
                          <span className="text-[10px] bg-gray-100 text-gray-600 font-medium px-1.5 py-0.5 rounded">
                            Coming Soon
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedClass !== "9" && (
                  <p className="text-xs text-amber-700 mt-1.5 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    ℹ️ Only Class 9 currently has active curriculums. Other classes are queued.
                  </p>
                )}
              </div>

              {/* Subjects Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-800">
                    Subjects ({selectedSubjects.length} selected)
                  </label>
                  <span className="text-xs text-muted-foreground">Click to toggle electives</span>
                </div>

                {availableSubjects.length === 0 ? (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-sm text-amber-800 text-center">
                    Subjects for {selectedBoard} Class {selectedClass} are queued in the content catalog.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-1">
                    {availableSubjects.map((sub) => {
                      const isSelected = selectedSubjects.includes(sub.name);
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => toggleSubject(sub.name, sub.isCompulsory)}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all",
                            isSelected
                              ? "border-primary bg-primary/5 text-foreground shadow-sm"
                              : "border-border hover:border-primary/40 bg-card text-muted-foreground"
                          )}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <BookOpen className="w-4 h-4 text-primary shrink-0" />
                            <div className="truncate">
                              <span className="text-sm font-semibold block truncate">{sub.name}</span>
                              <div className="flex gap-1.5 mt-0.5">
                                {sub.isCompulsory && (
                                  <span className="text-[10px] bg-blue-100 text-blue-700 font-medium px-1.5 rounded">
                                    Compulsory
                                  </span>
                                )}
                                <span className={cn(
                                  "text-[10px] font-medium px-1.5 rounded",
                                  sub.status === "live" ? "bg-emerald-100 text-emerald-700" :
                                  sub.status === "partial" ? "bg-amber-100 text-amber-700" :
                                  "bg-gray-100 text-gray-600"
                                )}>
                                  {sub.status === "live" ? "Live" : sub.status === "partial" ? "Active" : "Coming Soon"}
                                </span>
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={isSaving || selectedSubjects.length === 0}
                className="w-full h-11 font-semibold text-white gradient-primary mt-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving Curriculum...
                  </>
                ) : (
                  "Save & Explore Curriculum"
                )}
              </Button>
            </div>
          )}

          <p className="text-xs text-gray-500 text-center mt-5">
            Your progress is preserved across board & class changes.
          </p>
        </div>
      </Card>
    </div>
  );
}
