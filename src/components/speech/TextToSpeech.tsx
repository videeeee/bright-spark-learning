import React, { useState } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { CompanionAvatar } from '@/components/companions/CompanionAvatar';

const sampleTopics = [
  { id: 1, title: 'Photosynthesis', content: 'Photosynthesis is the process by which plants convert sunlight, water, and carbon dioxide into glucose and oxygen. This amazing process happens in the chloroplasts of plant cells, which contain a green pigment called chlorophyll.' },
  { id: 2, title: 'World War II', content: 'World War II was a global conflict that lasted from 1939 to 1945. It involved most of the world\'s nations, including all of the great powers, organized into two opposing military alliances: the Allies and the Axis powers.' },
  { id: 3, title: 'Pythagorean Theorem', content: 'The Pythagorean theorem states that in a right-angled triangle, the square of the hypotenuse is equal to the sum of squares of the other two sides. This can be written as a squared plus b squared equals c squared.' },
];

export function TextToSpeech() {
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([1]);
  const [volume, setVolume] = useState([80]);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 100);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handleTopicSelect = (topic: typeof sampleTopics[0]) => {
    setText(topic.content);
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Listen & Learn 🎧</h1>
        <p className="text-muted-foreground text-lg">Enter text or select a topic to listen!</p>
      </div>

      {/* Quick Topics */}
      <div className="cartoon-card mb-6">
        <h3 className="font-bold text-foreground mb-4">Quick Topics</h3>
        <div className="flex flex-wrap gap-3">
          {sampleTopics.map((topic) => (
            <Button
              key={topic.id}
              variant="outline"
              onClick={() => handleTopicSelect(topic)}
              className="rounded-full font-semibold"
            >
              {topic.title}
            </Button>
          ))}
        </div>
      </div>

      {/* Text Input */}
      <div className="cartoon-card mb-6">
        <Textarea
          placeholder="Enter or paste text you want to listen to..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[150px] text-lg border-2 rounded-xl resize-none"
        />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>{text.length} characters</span>
          <span>~{Math.ceil(text.split(' ').length / 150)} min read</span>
        </div>
      </div>

      {/* Player Controls */}
      {text && (
        <div className="cartoon-card bounce-in">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full gradient-primary transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>{Math.floor(progress / 10)}:0{Math.floor(progress / 10) % 10}</span>
              <span>~{Math.ceil(text.split(' ').length / 150)}:00</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-12 h-12"
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button
              onClick={handlePlay}
              className="cartoon-button gradient-primary text-primary-foreground w-16 h-16 rounded-full"
            >
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={handleStop}
            >
              <Square className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-12 h-12"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Speed & Volume */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-foreground">Speed</span>
                <span className="text-muted-foreground">{speed[0]}x</span>
              </div>
              <Slider
                value={speed}
                onValueChange={setSpeed}
                min={0.5}
                max={2}
                step={0.25}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-foreground">Volume</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                  className="h-6 w-6"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
              <Slider
                value={isMuted ? [0] : volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {!text && (
        <div className="flex justify-center mt-8">
          <CompanionAvatar size="lg" showBubble message="Type something and I'll read it for you! 📖" />
        </div>
      )}
    </div>
  );
}
