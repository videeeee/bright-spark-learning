import { useTheme } from '@/contexts/ThemeContext';
import { getContrastColor } from '@/lib/color';

interface CompanionAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBubble?: boolean;
  message?: string;
  className?: string;
}

const companionMessages: Record<string, { greeting: string; motivation: string; success: string } > = {
  solin: {
    greeting: "Hey bright mind! Ready to glow today?",
    motivation: "One level a day keeps the fear away!",
    success: "Shine on — you did it! 🌟",
  },
  pyro: {
    greeting: "BOOM! Level unlocked!",
    motivation: "Mistake? Nah, that's training!",
    success: "That was 🔥 — keep the momentum!",
  },
  aqua: {
    greeting: "Take a breath… let's understand this slowly.",
    motivation: "You're closer than you think.",
    success: "Calm and steady — nice work!",
  },
  lumi: {
    greeting: "Let me tell you a story~",
    motivation: "Learning can be cute AND smart!",
    success: "That was expressive and brilliant! ✨",
  },
  verdi: {
    greeting: "You're improving. Slowly is still progress.",
    motivation: "Let's strengthen this topic together.",
    success: "Consistency grows mastery — well done! 🌿",
  },
};

const sizeClasses = {
  sm: 'w-12 h-12 text-2xl',
  md: 'w-16 h-16 text-3xl',
  lg: 'w-24 h-24 text-5xl',
  xl: 'w-32 h-32 text-6xl',
};

export function CompanionAvatar({ size = 'md', showBubble = false, message, className = '' }: CompanionAvatarProps) {
  const { companion, getCompanionMeta } = useTheme();
  const meta = getCompanionMeta(companion)!;
  const dlg = companionMessages[companion];
  const randomMessage = message || (Math.random() < 0.5 ? dlg.greeting : dlg.motivation);

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {showBubble && (
        <div className="speech-bubble max-w-[200px] text-center text-sm font-semibold text-foreground bounce-in" style={{ background: `linear-gradient(135deg, ${meta.colors[0]}, ${meta.colors[1]})` }}>
          {randomMessage}
        </div>
      )}
      <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center shadow-cartoon float`}>
        {meta.image ? (
          <img src={meta.image} alt={meta.name} className="w-full h-full object-cover rounded-full" />
        ) : (
          <div style={{ background: `linear-gradient(135deg, ${meta.colors[0]}, ${meta.colors[1]})` }} className="w-full h-full flex items-center justify-center rounded-full">
            <span className="drop-shadow-lg">{meta.emoji}</span>
          </div>
        )}
      </div>
      {size !== 'sm' && (
        <span className="font-bold text-foreground">{meta.name}</span>
      )}
    </div>
  );
}

export function getCompanionMessage(companion: 'solin' | 'pyro' | 'aqua' | 'lumi' | 'verdi', type: 'motivation' | 'greeting' | 'success' = 'motivation') {
  const messages: Record<string, Record<string, string>> = {
    solin: {
      motivation: "One level a day keeps the fear away!",
      greeting: "Hey bright mind! Ready to glow today?",
      success: "Shine on — you did it! 🌟",
    },
    pyro: {
      motivation: "Mistake? Nah, that's training!",
      greeting: "BOOM! Level unlocked!",
      success: "That was 🔥 — keep the momentum!",
    },
    aqua: {
      motivation: "You're closer than you think.",
      greeting: "Take a breath… let's understand this slowly.",
      success: "Calm and steady — nice work!",
    },
    lumi: {
      motivation: "Learning can be cute AND smart!",
      greeting: "Let me tell you a story~",
      success: "That was expressive and brilliant! ✨",
    },
    verdi: {
      motivation: "Let's strengthen this topic together.",
      greeting: "You're improving. Slowly is still progress.",
      success: "Consistency grows mastery — well done! 🌿",
    },
  };
  return messages[companion][type];
}
