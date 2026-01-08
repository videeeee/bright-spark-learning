import React, { useState } from 'react';
import { Search, Wand2, Download, FileText, BookOpen, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CompanionAvatar } from '@/components/companions/CompanionAvatar';

type NoteStyle = 'ghibli' | 'doraemon' | 'shinchan' | 'naruto' | 'solin' | 'pyro' | 'aqua' | 'lumi' | 'verdi';

interface StyleOption {
  id: NoteStyle;
  name: string;
  emoji: string;
  description: string;
  color: string;
}

const styles: StyleOption[] = [
  { id: 'ghibli', name: 'Ghibli Style', emoji: '🌸', description: 'Magical, dreamy explanations', color: 'from-pink-400 to-purple-500' },
  { id: 'doraemon', name: 'Doraemon Style', emoji: '🤖', description: 'Fun gadgets & clear steps', color: 'from-blue-400 to-cyan-500' },
  { id: 'shinchan', name: 'Shinchan Style', emoji: '😜', description: 'Silly but memorable', color: 'from-yellow-400 to-orange-500' },
  { id: 'naruto', name: 'Naruto Style', emoji: '🍥', description: 'Action-packed learning', color: 'from-orange-400 to-red-500' },
  { id: 'solin', name: 'Solin Style', emoji: '🌞', description: 'Sunshine motivation & bright tips', color: 'from-yellow-200 to-yellow-500' },
  { id: 'pyro', name: 'Pyro Style', emoji: '🔥', description: 'High-energy concise notes', color: 'from-yellow-200 to-orange-500' },
  { id: 'aqua', name: 'Aqua Style', emoji: '🌊', description: 'Calm, clear explanations', color: 'from-blue-200 to-cyan-400' },
  { id: 'lumi', name: 'Lumi Style', emoji: '✨', description: 'Creative storytelling & notes', color: 'from-pink-200 to-purple-400' },
  { id: 'verdi', name: 'Verdi Style', emoji: '🌿', description: 'Growth-focused progressive notes', color: 'from-green-200 to-green-400' },
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
  solin: {
    title: '🌞 Solin\'s Bright Notes: Motivational Photosynthesis',
    sections: [
      {
        heading: 'Rise & Shine: What is Photosynthesis?',
        content: 'Solin says: Start small! Plants use sunlight to turn water and CO₂ into sugar. One small step = big glow!',
      },
      {
        heading: 'Daily Habit: Light & Water',
        content: 'A little sunlight each day helps plants (and you!). Make practice a daily spark and watch progress grow.',
      },
    ],
  },
  pyro: {
    title: '🔥 Pyro\'s Quick-Action Notes: Photosynthesis (Short & Strong)',
    sections: [
      {
        heading: 'Step 1: Catch the Sun',
        content: 'BOOM! Chloroplasts grab sunlight. Quick fact: chlorophyll captures energy fast.',
      },
      {
        heading: 'Step 2: Move the Water',
        content: 'Flow it up! Water travels up through vessels to join the reaction.',
      },
      {
        heading: 'Step 3: Create Food',
        content: 'Mix sun + water + CO₂ = sugar. Speed up by practicing short quick reviews.',
      },
    ],
  },
  aqua: {
    title: '🌊 Aqua\'s Calm Guide to Photosynthesis',
    sections: [
      {
        heading: 'Breathe & Observe',
        content: 'Take a breath and read slowly. Photosynthesis is simply plants using light to make sugar.',
      },
      {
        heading: 'Gentle Steps',
        content: 'Understand each ingredient: sunlight, water, carbon dioxide — each plays a clear role.',
      },
    ],
  },
  lumi: {
    title: '✨ Lumi\'s Creative Notes: Photosynthesis Story',
    sections: [
      {
        heading: 'Once Upon a Leaf',
        content: 'Lumi whispers: the leaf dreams of sunlight. Each beam helps it weave sugar like a story thread.',
      },
      {
        heading: 'Colorful Steps',
        content: 'Use drawings and playful examples to remember the process — make it yours!',
      },
    ],
  },
  verdi: {
    title: '🌿 Verdi\'s Growth Plan: Step-by-step Photosynthesis',
    sections: [
      {
        heading: 'Small Wins',
        content: 'Verdi reminds you: small daily practice compounds. Track progress and celebrate small wins.',
      },
      {
        heading: 'Strengthen the Basics',
        content: 'Review the core ingredients often and practice problems to solidify learning.',
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
    }, 2000);
  };

  const handleBack = () => {
    setShowNotes(false);
    setSelectedStyle(null);
  };

  if (showNotes && selectedStyle) {
    const notes = sampleNotes[selectedStyle];
    
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={handleBack} className="mb-6 font-semibold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Generate New Notes
        </Button>

        <div className="cartoon-card mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">{notes.title}</h1>
          
          <div className="space-y-6">
            {notes.sections.map((section, index) => (
              <div key={index} className="bg-muted/50 rounded-xl p-5">
                <h2 className="text-xl font-bold text-foreground mb-3">{section.heading}</h2>
                <p className="text-foreground leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Download Options */}
        <div className="cartoon-card">
          <h3 className="text-xl font-bold text-foreground mb-4">Download Your Notes</h3>
          <div className="flex flex-wrap gap-4">
            <Button className="cartoon-button gradient-primary text-primary-foreground">
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
            <Button className="cartoon-button gradient-secondary text-secondary-foreground">
              <FileText className="w-4 h-4 mr-2" /> Download PPT
            </Button>
            <Button className="cartoon-button gradient-accent text-accent-foreground">
              <BookOpen className="w-4 h-4 mr-2" /> Generate Ebook
            </Button>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <CompanionAvatar size="md" showBubble message="Your notes are ready! 📚" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Notes Generator ✨</h1>
        <p className="text-muted-foreground text-lg">Enter a topic and choose your favorite style!</p>
      </div>

      {/* Topic Input */}
      <div className="cartoon-card mb-8">
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

      {/* Style Selection */}
      {topic && (
        <div className="bounce-in">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Choose Your Style 🎨</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`cartoon-card text-left transition-all hover:scale-105 ${
                  selectedStyle === style.id ? 'ring-4 ring-primary ring-offset-2' : ''
                }`}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${style.color} flex items-center justify-center text-3xl mb-3`}>
                  {style.emoji}
                </div>
                <h3 className="text-lg font-bold text-foreground">{style.name}</h3>
                <p className="text-muted-foreground">{style.description}</p>
              </button>
            ))}
          </div>

          {selectedStyle && (
            <div className="text-center bounce-in">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="cartoon-button gradient-primary text-primary-foreground px-10 py-6 text-lg font-bold"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating Magic...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" /> Generate Notes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {!topic && (
        <div className="flex justify-center">
          <CompanionAvatar size="lg" showBubble message="What would you like to learn about? 🤔" />
        </div>
      )}
    </div>
  );
}
