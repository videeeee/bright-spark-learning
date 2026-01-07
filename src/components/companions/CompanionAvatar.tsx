import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface CompanionAvatarProps {
  companionId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBubble?: boolean;
  message?: string;
}

// This is the fallback component if an image fails to load.
const FallbackAvatar = ({ companion, sizeClass }: { companion: any, sizeClass: string }) => (
  <div 
    className={cn(
      `flex items-center justify-center rounded-full font-bold text-white`,
      sizeClass
    )}
    style={{ 
      backgroundColor: `var(--color-${companion.theme})`,
      // Adjust font size based on avatar size for the initial
      fontSize: sizeClass.includes('48') ? '4rem' : sizeClass.includes('32') ? '3rem' : '2rem',
    }}
  >
    {companion.name.charAt(0)}
  </div>
);

export function CompanionAvatar({ companionId, size = 'md', showBubble = false, message }: CompanionAvatarProps) {
  const { companions, companion: currentCompanion } = useTheme();
  const [hasError, setHasError] = React.useState(false);
  
  const companion = companionId ? companions.find(c => c.id === companionId) : currentCompanion;

  if (!companion) {
    return null; // Should not happen with ThemeProvider loading state
  }

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  }[size];

  // This flag will be true if the image loading fails.
  const useFallback = hasError || !companion.image;

  return (
    <div className="relative flex flex-col items-center">
      <div className={cn("relative float transform transition-transform duration-500 hover:scale-110", sizeClasses)}>
        {useFallback ? (
          <FallbackAvatar companion={companion} sizeClass={sizeClasses} />
        ) : (
          <img 
            src={companion.image} // The path is now correctly pointing to /public/companions/*.png
            alt={companion.name}
            className="w-full h-full object-contain"
            // If the image fails to load, we set the error state to render the fallback.
            onError={() => setHasError(true)}
          />
        )}
      </div>
      {showBubble && message && (
        <div className="speech-bubble p-4 mt-4 max-w-xs text-center">
          <p className="font-bold text-lg text-foreground">{message}</p>
        </div>
      )}
    </div>
  );
}
