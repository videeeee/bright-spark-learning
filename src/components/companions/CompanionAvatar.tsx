import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface CompanionAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBubble?: boolean;
  message?: string;
  className?: string;
}

const companionData = {
  monkey: {
    emoji: '🐵',
    name: 'Momo',
    color: 'from-amber-400 to-orange-500',
    messages: [
      "You're doing amazing! 🍌",
      "Let's learn something fun!",
      "Keep that streak going! 🔥",
      "You're a superstar! ⭐",
    ],
  },
  fox: {
    emoji: '🦊',
    name: 'Felix',
    color: 'from-orange-400 to-red-500',
    messages: [
      "Clever thinking! 🧠",
      "Ready for an adventure?",
      "You're so smart! 📚",
      "Let's outsmart this lesson!",
    ],
  },
  doraemon: {
    emoji: '🤖',
    name: 'Dora',
    color: 'from-blue-400 to-cyan-500',
    messages: [
      "I have a gadget for this! 🎒",
      "Time to learn, friend!",
      "You can do anything! 💪",
      "Knowledge is power!",
    ],
  },
};

const sizeClasses = {
  sm: 'w-12 h-12 text-2xl',
  md: 'w-16 h-16 text-3xl',
  lg: 'w-24 h-24 text-5xl',
  xl: 'w-32 h-32 text-6xl',
};

export function CompanionAvatar({ size = 'md', showBubble = false, message, className = '' }: CompanionAvatarProps) {
  const { companion } = useTheme();
  const data = companionData[companion];
  const randomMessage = message || data.messages[Math.floor(Math.random() * data.messages.length)];

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {showBubble && (
        <div className="speech-bubble max-w-[200px] text-center text-sm font-semibold text-foreground bounce-in">
          {randomMessage}
        </div>
      )}
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${data.color} flex items-center justify-center shadow-cartoon float`}>
        <span className="drop-shadow-lg">{data.emoji}</span>
      </div>
      {size !== 'sm' && (
        <span className="font-bold text-foreground">{data.name}</span>
      )}
    </div>
  );
}

export function getCompanionMessage(companion: 'monkey' | 'fox' | 'doraemon', type: 'motivation' | 'greeting' | 'success' = 'motivation') {
  const messages = {
    monkey: {
      motivation: "Go bananas with learning! 🍌",
      greeting: "Hey there, superstar! Ready to swing into action?",
      success: "You're absolutely amazing! High five! 🙌",
    },
    fox: {
      motivation: "Let's be clever together! 🦊",
      greeting: "Hello, bright mind! What shall we discover today?",
      success: "Brilliant work! You outsmarted that lesson! 🌟",
    },
    doraemon: {
      motivation: "I believe in you! Let's go! 🚀",
      greeting: "Hi friend! I've got the perfect gadget for learning!",
      success: "Wonderful! You're becoming a genius! 🎓",
    },
  };
  return messages[companion][type];
}
