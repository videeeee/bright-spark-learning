import React, { useState } from 'react';
import { Search, Wand2, Download, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CompanionAvatar } from '@/components/companions/CompanionAvatar';
import { cn } from '@/lib/utils';

type NoteStyle = 'ghibli' | 'doraemon' | 'shinchan' | 'naruto';

const styles = [
  { id: 'ghibli', name: 'Ghibli Style', emoji: '🌸', description: 'Magical, dreamy explanations' },
  { id: 'doraemon', name: 'Doraemon Style', emoji: '🤖', description: 'Fun gadgets & clear steps' },
  { id: 'shinchan', name: 'Shinchan Style', emoji: '😜', description: 'Silly but memorable' },
  { id: 'naruto', name: 'Naruto Style', emoji: '🍥', description: 'Action-packed learning' },
];

const sampleNotes = {
  ghibli: {
    title: '🌸 The Magical Dance of Photosynthesis',
    sections: [
      { heading: 'The Awakening Light', content: 'In the gentle morning glow, our leaf friend stretches to greet the sun. Like Totoro waiting for the rain, the chloroplasts wait patiently for sunlight to begin their magical dance...' },
      { heading: 'The River of Life', content: 'Water travels up from the roots, like Chihiro\'s journey through the spirit world. Each droplet carries hope and possibility to the leaves above...' },
      { heading: 'The Transformation', content: 'Carbon dioxide from the air joins the dance. With the power of the sun, sugar crystals form like the glowing forest spirits—pure, sweet energy for the plant...' },
    ],
  },
  doraemon: { title: '🤖 Doraemon\'s Photosynthesis Gadget Guide', sections: [{ heading: 'Light Catcher 3000!', content: 'Nobita, watch this! The leaf has tiny solar panels called chloroplasts.' }] },
  shinchan: { title: '😜 Shinchan Explains: Plants Making Food', sections: [{ heading: 'Sunbathing Time!', content: 'Plants love sunbathing more than Mom loves shopping! Ooh la la!' }] },
  naruto: { title: '🍥 The Photosynthesis Jutsu', sections: [{ heading: 'Gathering Solar Chakra!', content: 'BELIEVE IT! Plants are nature\'s ninjas!' }] },
};

const ViewContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 md:p-8 lg:p-10 max-w-5xl mx-auto">{children}</div>
);

export function NotesGenerator() {
  const [topic, setTopic] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<NoteStyle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const handleGenerate = () => {
    if (!topic || !selectedStyle) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowNotes(true);
    }, 1500);
  };

  const handleBackToStyles = () => {
    setSelectedStyle(null);
    setTopic(''); // Reset topic when going back to styles
  };
  
  const handleBackFromNotes = () => {
    setShowNotes(false);
    // Keep topic and style, just hide the notes view
  };

  // --- 1. FINAL NOTES VIEW ---
  if (showNotes && selectedStyle) {
    const notes = sampleNotes[selectedStyle];
    return (
      <ViewContainer>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-primary">Step 3</h2>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground tracking-tighter mt-1">Your Notes Are Ready!</h1>
        </div>
         <Button variant="ghost" onClick={handleBackFromNotes} className="mb-4 font-bold text-lg">
          <ArrowLeft className="w-5 h-5 mr-2" /> Change Topic or Style
        </Button>
        <div className="cartoon-card p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tighter text-center">{notes.title}</h1>
            <div className="space-y-6">
              {notes.sections.map((section, index) => (
                <div key={index} className="bg-background/50 rounded-2xl p-6 border-2 border-border">
                  <h2 className="text-2xl font-bold text-foreground mb-3">{section.heading}</h2>
                  <p className="text-lg text-foreground/80 leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-4 text-center">Download Your Notes</h3>
              <div className="flex justify-center flex-wrap gap-4">
                <Button size="lg" className="cartoon-button bg-primary text-primary-foreground font-bold"> <Download className="w-5 h-5 mr-2" /> PDF </Button>
                <Button size="lg" variant="outline" className="cartoon-button font-bold border-2"> <Download className="w-5 h-5 mr-2" /> Text </Button>
              </div>
            </div>
        </div>
        <div className="mt-8 flex justify-center">
          <CompanionAvatar size="lg" showBubble={true} message="Ta-da! Fresh notes, just for you. 🎨" />
        </div>
      </ViewContainer>
    );
  }

  // --- 2. TOPIC INPUT VIEW ---
  if (selectedStyle) {
    const styleInfo = styles.find(s => s.id === selectedStyle)!;
    return (
      <ViewContainer>
        <Button variant="ghost" onClick={handleBackToStyles} className="mb-8 font-bold text-lg">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Styles
        </Button>
        <div className="text-center mb-10 animate-in fade-in duration-500">
          <h2 className="text-2xl font-bold text-primary">Step 2</h2>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground tracking-tighter mt-1">What's the Topic?</h1>
           <p className="text-lg text-muted-foreground mt-3 font-semibold max-w-2xl mx-auto">
            You chose <span className="font-bold text-foreground">{styleInfo.name}</span>. Now, enter the topic for your notes below.
          </p>
        </div>
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                <Input
                    placeholder="E.g., Photosynthesis, The Roman Empire..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="pl-16 w-full text-xl h-auto py-5 cartoon-card"
                />
            </div>
            <div className="text-center">
                <Button onClick={handleGenerate} disabled={!topic || isGenerating} size="lg"
                    className="cartoon-button bg-primary text-primary-foreground h-auto py-4 px-12 text-xl font-bold">
                    {isGenerating ? <><Loader2 className="w-6 h-6 mr-3 animate-spin"/>Generating...</> : <><Wand2 className="w-6 h-6 mr-3"/>Generate Notes</>}
                </Button>
            </div>
        </div>
        <div className="mt-12 flex justify-center">
            {/* CORRECTED: The 'showBubble' prop now correctly receives a boolean value. */}
            <CompanionAvatar size="xl" showBubble={true} message={'Great choice! What topic should I explain?'} />
        </div>
      </ViewContainer>
    );
  }

  // --- 3. STYLE SELECTION VIEW (Initial View) ---
  return (
    <ViewContainer>
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-primary">Step 1</h2>
        <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground tracking-tighter mt-1">Choose a Note Style</h1>
        <p className="text-lg text-muted-foreground mt-3 font-semibold max-w-2xl mx-auto">
            How do you want your notes to feel? Select a style below, and the AI will write in that voice.
        </p>
      </div>
      <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {styles.map((style) => (
            <button key={style.id} onClick={() => setSelectedStyle(style.id as NoteStyle)}
              className={cn(
                'cartoon-card p-6 text-left transition-all duration-300 transform hover:-translate-y-1.5 focus:outline-none focus:ring-4 focus:ring-primary/50'
              )} >
              <div className="text-4xl mb-3">{style.emoji}</div>
              <h3 className="text-xl font-bold text-foreground">{style.name}</h3>
              <p className="text-md text-muted-foreground font-semibold">{style.description}</p>
            </button>
          ))}
        </div>
      </div>
       <div className="mt-12 flex justify-center">
            <CompanionAvatar size="xl" showBubble={true} message="Let's give your notes some personality! ✨" />
        </div>
    </ViewContainer>
  );
}
