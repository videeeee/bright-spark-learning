import React, { useState, useRef } from 'react';
import { Search, Wand2, Download, FileText, BookOpen, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CompanionAvatar } from '@/components/companions/CompanionAvatar';
import jsPDF from 'jspdf';
import PptxGenJS from 'pptxgenjs';

type NoteStyle = 'ghibli' | 'doraemon' | 'shinchan' | 'naruto' | 'solin' | 'pyro' | 'aqua' | 'lumi' | 'verdi';

interface StyleOption {
  id: NoteStyle;
  name: string;
  emoji: string;
  description: string;
  color: string;
  // optional icon image (put images under public/notes/icons/<id>.png)
  icon?: string;
}

const styles: StyleOption[] = [
  { id: 'ghibli', name: 'Ghibli Style', emoji: '🌸', description: 'Magical, dreamy explanations', color: 'from-pink-400 to-purple-500', icon: '/notes/icons/ghibli.png' },
  { id: 'doraemon', name: 'Doraemon Style', emoji: '🤖', description: 'Fun gadgets & clear steps', color: 'from-blue-400 to-cyan-500', icon: '/notes/icons/doraemon.png' },
  { id: 'shinchan', name: 'Shinchan Style', emoji: '😜', description: 'Silly but memorable', color: 'from-yellow-400 to-orange-500', icon: '/notes/icons/shinchan.png' },
  { id: 'naruto', name: 'Naruto Style', emoji: '🍥', description: 'Action-packed learning', color: 'from-orange-400 to-red-500', icon: '/notes/icons/naruto.png' },
];

const sampleNotes = {
  ghibli: {
    title: '🌸 The Magical Dance of Photosynthesis',
    sections: [
      {
        heading: 'Chapter 1: The Awakening Light',
        content: 'In the gentle morning glow, our leaf friend stretches to greet the sun. Like Totoro waiting for the rain, the chloroplasts wait patiently for sunlight to begin their magical dance...',
      },
      {
        heading: 'Chapter 2: The River of Life',
        content: 'Water travels up from the roots, like Chihiro\'s journey through the spirit world. Each droplet carries hope and possibility to the leaves above...',
      },
      {
        heading: 'Chapter 3: The Transformation',
        content: 'Carbon dioxide from the air joins the dance. With the power of the sun, sugar crystals form like the glowing forest spirits—pure, sweet energy for the plant...',
      },
    ],
  },
  doraemon: {
    title: '🤖 Doraemon\'s Photosynthesis Gadget Guide',
    sections: [
      {
        heading: 'Gadget #1: The Light Catcher 3000!',
        content: 'Nobita, watch this! The leaf has tiny solar panels called chloroplasts. They catch sunlight faster than I can pull gadgets from my pocket!',
      },
      {
        heading: 'Gadget #2: The Water Elevator!',
        content: 'Just like my Anywhere Door, plants have a special system! Water zooms up from the roots to the leaves through tiny tubes. Pretty neat, right?',
      },
      {
        heading: 'Gadget #3: The Food Factory!',
        content: 'Here\'s where the magic happens! Sunlight + Water + CO₂ = FOOD! It\'s like my Table Cloth gadget, but for plants! And bonus—they release oxygen for us to breathe!',
      },
    ],
  },
  shinchan: {
    title: '😜 Shinchan Explains: Plants Making Food (Hehe!)',
    sections: [
      {
        heading: 'Part 1: Sunbathing Time!',
        content: 'Plants love sunbathing more than Mom loves shopping! Their leaves are like tiny green frying pans catching sunlight. Ooh la la! ☀️',
      },
      {
        heading: 'Part 2: Drinking Games!',
        content: 'Plants slurp water like I drink my chocolate milk! SLUUURP! The water goes up, up, up through tiny straws in the stem. No spilling allowed!',
      },
      {
        heading: 'Part 3: Cooking Without Kitchen!',
        content: 'Mix sun + water + air... BOOM! Plant food appears! And they burp out oxygen for us. Even plants have better manners than Action Mask!',
      },
    ],
  },
  naruto: {
    title: '🍥 The Photosynthesis Jutsu: A Ninja\'s Guide!',
    sections: [
      {
        heading: 'Chapter 1: Gathering Solar Chakra!',
        content: 'BELIEVE IT! Plants are nature\'s ninjas! Their chloroplasts gather chakra from the sun, storing power for their ultimate jutsu!',
      },
      {
        heading: 'Chapter 2: The Water Style Technique!',
        content: 'Like Kakashi\'s water jutsu, plants draw water from the earth! It flows through their chakra pathways—I mean, xylem tubes—to reach every leaf!',
      },
      {
        heading: 'Chapter 3: PHOTOSYNTHESIS NO JUTSU!',
        content: 'RASENGAN meets CHLOROPHYLL! The plant combines all elements: SUN CHAKRA + WATER + AIR = SUGAR ENERGY! They also release oxygen—that\'s their gift to Konoha!',
      },
    ],
  },
};

interface NoteSection { heading: string; content: string }
interface SavedNote { id: number; topic: string; style: NoteStyle; title: string; sections: NoteSection[]; createdAt: string }

export function NotesGenerator() {
  const notesRef = useRef<HTMLDivElement | null>(null);
  const [topic, setTopic] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<NoteStyle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  // saved notes list (persist in localStorage)
  const [notesReady, setNotesReady] = useState(false);
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>(() => {
    try {
      const raw = localStorage.getItem('myNotes');
      return raw ? (JSON.parse(raw) as SavedNote[]) : [];
    } catch (e) {
      console.warn('Failed to parse saved notes', e);
      return [];
    }
  });

  // persist saved notes
  React.useEffect(() => {
    try {
      localStorage.setItem('myNotes', JSON.stringify(savedNotes));
    } catch (e) {
      console.warn('Failed to persist saved notes', e);
    }
  }, [savedNotes]);

  const handleGenerate = async () => {
    if (!topic || !selectedStyle) return;

    try {
      setIsGenerating(true);

      const res = await fetch("http://localhost:5000/api/notes", {
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

      const data = await res.json();

      const generated = {
        id: Date.now(),
        topic,
        style: selectedStyle,
        title: data.title || `${topic} — AI Notes`,
        sections: data.sections || [
          { heading: "Generated Notes", content: "No content returned" }
        ],
        createdAt: new Date().toISOString(),
      };

      setSavedNotes((s) => [generated, ...s]);
      setNotesReady(true);
    } catch (err) {
      console.error("AI generation failed", err);
      alert("AI failed to generate notes");
    } finally {
      setIsGenerating(false);
    }
  };

  const removeNote = (id: number) => {
    setSavedNotes((s) => s.filter((n) => n.id !== id));
  };

  // generate and download PDF for a saved note
  const downloadPdf = (note: SavedNote) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(note.title, 10, 20);
    doc.setFontSize(12);
    let y = 36;
    note.sections.forEach((sec: NoteSection) => {
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
  };

  // generate and download PPTX for a saved note
  const downloadPpt = (note: any) => {
    const pres = new PptxGenJS();
    pres.layout = 'LAYOUT_WIDE';
    pres.defineSlideMaster({
      title: 'MASTER_SLIDE',
      bkgd: { color: 'FFFFFF' },
    });

    const slide = pres.addSlide({ masterName: 'MASTER_SLIDE' });
    slide.addText(note.title, { x: 0.5, y: 0.5, fontSize: 24, bold: true });

    note.sections.forEach((sec: any, i: number) => {
      const s = pres.addSlide({ masterName: 'MASTER_SLIDE' });
      s.addText(sec.heading, { x: 0.5, y: 0.5, fontSize: 20, bold: true });
      s.addText(sec.content, { x: 0.5, y: 1.2, fontSize: 14, color: '363636', w: '90%' });
    });

    pres.writeFile({ fileName: `${note.title.replace(/[^a-z0-9]/gi, '_').slice(0, 40)}.pptx` });
  };


  function renderContent(content: any) {
    if (typeof content === "string") {
      return <p>{content}</p>;
    }

    if (Array.isArray(content)) {
      return content.map((item, i) => (
        <div key={i} className="ml-4">
          • {renderContent(item)}
        </div>
      ));
    }

    if (typeof content === "object") {
      return Object.entries(content).map(([key, val], i) => (
        <div key={i} className="mt-2">
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

      {/* Topic Input */}
      <div className="cartoon-card mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Enter a topic (e.g., Photosynthesis, World War II, Algebra)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="pl-12 py-6 text-lg border-2 rounded-xl"
          />
        </div>
      </div>

      {/* Style Selection (first 4 visible) */}
      <div className="bounce-in mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-4 text-center">Choose Your Style 🎨</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {styles.slice(0, 4).map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`cartoon-card text-left transition-all hover:scale-105 ${selectedStyle === style.id ? 'ring-4 ring-primary ring-offset-2' : ''
                }`}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${style.color} flex items-center justify-center text-3xl mb-3 overflow-hidden`}>
                {style.icon ? (
                  <img src={style.icon} alt={style.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">{style.emoji}</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-foreground">{style.name}</h3>
              <p className="text-muted-foreground">{style.description}</p>
            </button>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={handleGenerate}
            disabled={!topic || !selectedStyle || isGenerating}
            className={`cartoon-button px-10 py-4 text-lg font-bold ${!topic || !selectedStyle ? 'opacity-60 pointer-events-none' : ''}`}
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
      {savedNotes.length > 0 && (
        <button
          onClick={() => {
            notesRef.current?.scrollIntoView({ behavior: "smooth" });
            setNotesReady(false);
          }}
          className={`fixed bottom-6 right-6 px-5 py-3 rounded-full shadow-lg z-50 transition-all 
      ${notesReady
              ? "bg-yellow-400 text-black animate-pulse scale-110 ring-4 ring-yellow-300"
              : "bg-primary text-white hover:scale-105"
            }`}
        >
          📚 View Notes
        </button>
      )}

      {/* Companion prompt below */}
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

      {/* My Notes (saved generated notes) */}
      <div className="space-y-6" ref={notesRef}>
        <h2 className="text-2xl font-bold text-foreground">My Notes</h2>
        {savedNotes.length === 0 ? (
          <div className="text-muted-foreground">No notes yet — generate your first note above.</div>
        ) : (
          savedNotes.map((note) => (
            <div key={note.id} className="cartoon-card">
              <div className="flex items-start justify-between gap-4">
                <div className="w-28 flex-shrink-0">
                  {/* Thumbnail: gradient swatch + first section heading */}
                  <div className="w-28 h-20 rounded-md overflow-hidden mb-2" style={{ background: `linear-gradient(135deg, ${styles.find(s => s.id === note.style)?.icon ? '#fff' : '#eee'}, ${styles.find(s => s.id === note.style)?.color ? '#ddd' : '#ccc'})` }}>
                    {/* show style icon if available */}
                    {styles.find(s => s.id === note.style)?.icon ? (
                      <img src={styles.find(s => s.id === note.style)!.icon} alt={note.style} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">{styles.find(s => s.id === note.style)?.emoji}</div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{new Date(note.createdAt).toLocaleDateString()}</div>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">{note.title}</h3>
                  <div className="space-y-4">
                    {note.sections.map((section: any, i: number) => (
                      <div key={i} className="bg-muted/50 rounded-xl p-4">
                        <h4 className="font-semibold text-foreground mb-1">{section.heading}</h4>
                        <div className="text-foreground leading-relaxed space-y-2">
                          {renderContent(section.content)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="ml-4 text-right flex flex-col items-end gap-2">
                  <div className="text-sm text-muted-foreground">{new Date(note.createdAt).toLocaleString()}</div>
                  <div className="flex flex-col gap-2 mt-2">
                    <Button variant="ghost" onClick={() => downloadPdf(note)}>
                      <Download className="w-4 h-4 mr-2" /> PDF
                    </Button>
                    <Button variant="ghost" onClick={() => downloadPpt(note)}>
                      <FileText className="w-4 h-4 mr-2" /> PPT
                    </Button>
                    <Button variant="ghost" className="mt-2" onClick={() => removeNote(note.id)}>
                      Delete
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
