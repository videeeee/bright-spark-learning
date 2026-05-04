import React, { useState, useRef, useEffect } from 'react';
import { Search, Wand2, Download, FileText, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CompanionAvatar } from '@/components/companions/CompanionAvatar';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import PptxGenJS from 'pptxgenjs';

type NotesStyle = 'ghibli' | 'doraemon' | 'shinchan' | 'naruto' | 'solin' | 'pyro' | 'aqua' | 'lumi' | 'verdi';

interface NoteStyleOption {
  id: NotesStyle;
  name: string;
  emoji: string;
  description: string;
  color: string;
  icon?: string;
}

interface NoteSection { 
  heading: string; 
  content: string; 
}

interface SavedNote { 
  _id: string; 
  topic: string; 
  style: NotesStyle; 
  title: string; 
  sections?: NoteSection[]; 
  content?: NoteSection[]; 
  createdAt: string; 
}

const noteStyles: NoteStyleOption[] = [
  { id: 'ghibli', name: 'Ghibli Style', emoji: '🌸', description: 'Magical, dreamy explanations', color: 'from-pink-400 to-purple-500', icon: '/notes/icons/ghibli.png' },
  { id: 'doraemon', name: 'Doraemon Style', emoji: '🤖', description: 'Fun gadgets & clear steps', color: 'from-blue-400 to-cyan-500', icon: '/notes/icons/doraemon.png' },
  { id: 'shinchan', name: 'Shinchan Style', emoji: '😜', description: 'Silly but memorable', color: 'from-yellow-400 to-orange-500', icon: '/notes/icons/shinchan.png' },
  { id: 'naruto', name: 'Naruto Style', emoji: '🍥', description: 'Action-packed learning', color: 'from-orange-400 to-red-500', icon: '/notes/icons/naruto.png' },
];

export function NotesGenerator() {
  const notesRef = useRef<HTMLDivElement | null>(null);
  const [topic, setTopic] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<NotesStyle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [notesReady, setNotesReady] = useState(false);
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);

  // Fetch notes on component mount
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const token = localStorage.getItem("token") || "";
    if (!token) {
      setIsFetching(false);
      toast.error("Login required to load notes");
      setSavedNotes([]);
      return;
    }

    try {
      setIsFetching(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notes`, {
        headers: {
          Authorization: token,
        },
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error("Failed to fetch notes", res.status, errorBody);
        throw new Error(`Failed to fetch notes (${res.status})`);
      }

      const data = await res.json();
      setSavedNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch notes", err);
      toast.error("Failed to load notes");
      setSavedNotes([]);
    } finally {
      setIsFetching(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic || !selectedStyle) {
      toast.error("Please enter a topic and select a style");
      return;
    }

    try {
      setIsGenerating(true);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") || ""
        },
        body: JSON.stringify({
          topic,
          style: selectedStyle
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.msg || "Failed to generate notes");
      }

      const data = await res.json();
      toast.success("Notes generated successfully! ✨");
      
      // Refetch notes from backend
      await fetchNotes();
      setNotesReady(true);
      setTopic('');
      setSelectedStyle(null);
      
      // Scroll to notes
      setTimeout(() => {
        notesRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } catch (err) {
      console.error("AI generation failed", err);
      toast.error((err as Error).message || "Failed to generate notes");
    } finally {
      setIsGenerating(false);
    }
  };

  const removeNote = async (noteId: string) => {
    const token = localStorage.getItem("token") || "";
    if (!token) {
      toast.error("Login required to delete notes");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      });

      if (!res.ok) throw new Error("Failed to delete note");

      setSavedNotes((s) => s.filter((n) => n._id !== noteId));
      toast.success("Note deleted");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete note");
    }
  };

  // Download PDF
  const downloadPdf = (note: SavedNote) => {
    try {
      const sections = note.sections ?? note.content ?? [];
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(note.title, 10, 20);
      doc.setFontSize(12);
      let y = 36;
      
      sections.forEach((sec: NoteSection) => {
        doc.setFontSize(14);
        doc.text(sec.heading, 10, y);
        y += 8;
        doc.setFontSize(11);
        const lines = doc.splitTextToSize(sec.content, 180);
        doc.text(lines, 10, y);
        y += lines.length * 6 + 8;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
      
      doc.save(`${note.title.replace(/[^a-z0-9]/gi, '_').slice(0, 40)}.pdf`);
      toast.success("PDF downloaded!");
    } catch (err) {
      console.error("PDF download error:", err);
      toast.error("Failed to download PDF");
    }
  };

  // Download PPTX
  const downloadPpt = (note: SavedNote) => {
    try {
      const pres = new PptxGenJS();
      pres.layout = 'LAYOUT_WIDE';
      pres.defineSlideMaster({
        title: 'MASTER_SLIDE',
        bkgd: { color: 'FFFFFF' },
      });

      const slide = pres.addSlide({ masterName: 'MASTER_SLIDE' });
      slide.addText(note.title, { x: 0.5, y: 0.5, fontSize: 24, bold: true });

      const sections = note.sections ?? note.content ?? [];
      sections.forEach((sec: NoteSection) => {
        const s = pres.addSlide({ masterName: 'MASTER_SLIDE' });
        s.addText(sec.heading, { x: 0.5, y: 0.5, fontSize: 20, bold: true });
        s.addText(sec.content, { x: 0.5, y: 1.2, fontSize: 14, color: '363636', w: '90%' });
      });

      pres.writeFile({ fileName: `${note.title.replace(/[^a-z0-9]/gi, '_').slice(0, 40)}.pptx` });
      toast.success("PowerPoint downloaded!");
    } catch (err) {
      console.error("PPT download error:", err);
      toast.error("Failed to download PowerPoint");
    }
  };

  function renderContent(content: any) {
    if (typeof content === "string") {
      return <p className="text-sm">{content}</p>;
    }

    if (Array.isArray(content)) {
      return content.map((item, i) => (
        <div key={i} className="ml-4 text-sm">
          • {renderContent(item)}
        </div>
      ));
    }

    if (typeof content === "object" && content !== null) {
      return Object.entries(content).map(([key, val], i) => (
        <div key={i} className="mt-2 text-sm">
          <strong className="block capitalize">{key.replace(/_/g, " ")}</strong>
          <div className="ml-4">{renderContent(val)}</div>
        </div>
      ));
    }

    return null;
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Notes Generator ✨</h1>
        <p className="text-muted-foreground text-lg">Enter a topic and choose your favorite style!</p>
      </div>

      {/* Topic Input & Style Selection */}
      <form onSubmit={handleGenerate} className="space-y-6 mb-8">
        {/* Topic Input */}
        <div className="cartoon-card">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Enter a topic (e.g., Photosynthesis, World War II, Algebra)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isGenerating}
              className="pl-12 py-6 text-lg border-2 rounded-xl"
            />
          </div>
        </div>

        {/* Style Selection */}
        <div className="bounce-in">
          <h2 className="text-2xl font-bold text-foreground mb-4 text-center">Choose Your Style 🎨</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {noteStyles.slice(0, 4).map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setSelectedStyle(style.id)}
                disabled={isGenerating}
                className={`cartoon-card text-left transition-all hover:scale-105 ${selectedStyle === style.id ? 'ring-4 ring-primary ring-offset-2' : ''} ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${style.color} flex items-center justify-center text-3xl mb-3 overflow-hidden`}>
                  {style.icon ? (
                    <img src={style.icon} alt={style.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{style.emoji}</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground">{style.name}</h3>
                <p className="text-muted-foreground text-sm">{style.description}</p>
              </button>
            ))}
          </div>

          <div className="text-center">
            <Button
              type="submit"
              disabled={!topic || !selectedStyle || isGenerating}
              className={`cartoon-button px-10 py-4 text-lg font-bold`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" /> Generate Notes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Floating View Notes Button */}
      {savedNotes.length > 0 && (
        <button
          onClick={() => {
            notesRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
          className={`fixed bottom-6 right-6 px-5 py-3 rounded-full shadow-lg z-50 transition-all 
      ${notesReady
              ? "bg-yellow-400 text-black animate-pulse scale-110 ring-4 ring-yellow-300"
              : "bg-primary text-white hover:scale-105"
            }`}
        >
          📚 View Notes ({savedNotes.length})
        </button>
      )}

      {/* Companion prompt */}
      <div className="flex justify-center mb-8">
        {!topic ? (
          <CompanionAvatar size="md" showBubble message="What would you like to learn about? 🤔" />
        ) : !selectedStyle ? (
          <CompanionAvatar size="md" showBubble message="Pick a style and generate!" />
        ) : isGenerating ? (
          <CompanionAvatar size="md" showBubble message="Generating your notes... ✨" />
        ) : (
          <CompanionAvatar size="md" showBubble message="Your notes are ready! 📚" />
        )}
      </div>

      {/* My Notes (saved notes from database) */}
      <div className="space-y-6" ref={notesRef}>
        <h2 className="text-2xl font-bold text-foreground">My Notes ({savedNotes.length})</h2>
        
        {isFetching ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading notes...</p>
          </div>
        ) : savedNotes.length === 0 ? (
          <div className="text-muted-foreground text-center py-8">No notes yet — generate your first note above!</div>
        ) : (
          savedNotes.map((note) => (
            <div key={note._id} className="cartoon-card">
              <div className="flex items-start justify-between gap-4">
                {/* Thumbnail */}
                <div className="w-28 flex-shrink-0">
                  <div className="w-28 h-20 rounded-md overflow-hidden mb-2" style={{ 
                    background: `linear-gradient(135deg, #eee, #ddd)` 
                  }}>
                    {noteStyles.find(s => s.id === (note.style as NotesStyle))?.emoji && (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        {noteStyles.find(s => s.id === (note.style as NotesStyle))?.emoji}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">{note.title}</h3>
                  <div className="space-y-3">
                    {(note.sections ?? note.content ?? []).map((section: NoteSection, i: number) => (
                      <div key={i} className="bg-muted/50 rounded-xl p-3">
                        <h4 className="font-semibold text-foreground mb-1 text-sm">{section.heading}</h4>
                        <div className="text-foreground leading-relaxed text-sm">
                          {renderContent(section.content)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="ml-4 text-right flex flex-col items-end gap-2">
                  <div className="text-xs text-muted-foreground">
                    {new Date(note.createdAt).toLocaleString()}
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadPdf(note)}
                    >
                      <Download className="w-4 h-4 mr-1" /> PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadPpt(note)}
                    >
                      <FileText className="w-4 h-4 mr-1" /> PPT
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => removeNote(note._id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
