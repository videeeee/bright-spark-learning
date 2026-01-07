import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, FastForward, Rewind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { CompanionAvatar } from '@/components/companions/CompanionAvatar';
import { cn } from '@/lib/utils';

const sampleTopics = [
  { id: 1, title: 'Photosynthesis', content: 'Photosynthesis is the process by which plants convert sunlight, water, and carbon dioxide into glucose and oxygen. This amazing process happens in the chloroplasts of plant cells.' },
  { id: 2, title: 'World War II', content: 'World War II was a global conflict from 1939 to 1945. It involved the Allies and the Axis powers.' },
  { id: 3, title: 'Pythagorean Theorem', content: 'The Pythagorean theorem is a famous geometric theorem. In a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides.' },
];

const ViewContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 md:p-8 lg:p-10 max-w-5xl mx-auto">{children}</div>
);

export function TextToSpeech() {
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([1]);
  const [volume, setVolume] = useState([80]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && text) {
      const duration = (text.length / (speed[0] * 10)) * 1000;
      const increment = 100 / (duration / 100);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 100;
          }
          return prev + increment;
        });
      }, 100);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isPlaying, text, speed]);

  const handlePlayPause = () => {
    if (text) setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handleTopicSelect = (content: string) => {
    handleStop();
    setText(content);
  };

  return (
    <ViewContainer>
      <div className="text-center mb-10">
        <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground tracking-tighter">Listen & Learn</h1>
        <p className="text-lg text-muted-foreground mt-2 font-semibold">Transform text into audio and learn on the go! 🎧</p>
      </div>

      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="cartoon-card p-6">
            <h3 className="text-2xl font-bold text-foreground mb-4">Quick Topics</h3>
            <div className="flex flex-wrap gap-4">
              {sampleTopics.map(topic => (
                <Button key={topic.id} variant="outline" onClick={() => handleTopicSelect(topic.content)} className="cartoon-button font-bold text-md border-2">
                  {topic.title}
                </Button>
              ))}
            </div>
        </div>

        <div className="relative">
          <Textarea
            placeholder="Paste your text here..."
            value={text}
            onChange={e => setText(e.target.value)}
            className="w-full min-h-[200px] text-lg p-6 cartoon-card resize-y"
          />
          <div className="absolute bottom-4 right-4 text-sm font-bold text-muted-foreground bg-background/50 px-2 py-1 rounded-md">
            {text.length} characters
          </div>
        </div>

        {text && (
          <div className="cartoon-card p-6 md:p-8 animate-in fade-in duration-500">
            <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-6">
              <div className="absolute h-full gradient-primary rounded-full transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}/>
            </div>

            <div className="flex items-center justify-center gap-4 md:gap-6 mb-8">
              <Button variant="ghost" size="icon" className="w-14 h-14 rounded-full"> <Rewind className="w-7 h-7" /> </Button>
              <Button onClick={handlePlayPause} className="cartoon-button gradient-primary text-primary-foreground w-20 h-20 rounded-full shadow-lg">
                {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
              </Button>
              <Button onClick={handleStop} variant="ghost" size="icon" className="w-14 h-14 rounded-full"> <Square className="w-7 h-7" /> </Button>
              <Button variant="ghost" size="icon" className="w-14 h-14 rounded-full"> <FastForward className="w-7 h-7" /> </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-foreground">Speed</span>
                  <span className="text-muted-foreground">{speed[0]}x</span>
                </div>
                <Slider value={speed} onValueChange={setSpeed} min={0.5} max={2} step={0.25} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-foreground">Volume</span>
                  <Volume2 className="w-6 h-6 text-muted-foreground" />
                </div>
                <Slider value={volume} onValueChange={setVolume} />
              </div>
            </div>
          </div>
        )}

        {!text && (
          <div className="pt-8 flex justify-center">
            <CompanionAvatar size="xl" showBubble message="I can read anything for you! ✨" />
          </div>
        )}
      </div>
    </ViewContainer>
  );
}
