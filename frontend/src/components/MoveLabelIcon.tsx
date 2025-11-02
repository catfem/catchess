import { MoveLabel } from '../types';

interface MoveLabelIconProps {
  label: MoveLabel;
  size?: number;
}

// Try to use external images first, fallback to SVG if not available
const useExternalImage = true; // Set to false to use SVG icons

export function MoveLabelIcon({ label, size = 20 }: MoveLabelIconProps) {
  // External image paths (can be updated to use actual hosted images)
  const imagePaths: Record<MoveLabel, string> = {
    brilliant: '/icons/brilliant.svg',
    best: '/icons/best.svg',
    excellent: '/icons/excellent.svg',
    great: '/icons/great.svg',
    good: '/icons/good.svg',
    inaccuracy: '/icons/inaccuracy.svg',
    mistake: '/icons/mistake.svg',
    blunder: '/icons/blunder.svg',
    miss: '/icons/miss.svg',
    book: '/icons/book.svg',
  };

  // Fallback SVG icons
  const svgIcons: Record<MoveLabel, JSX.Element> = {
    brilliant: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
              fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    best: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17L4 12" 
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    excellent: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17L4 12" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    great: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    good: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    inaccuracy: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 8V13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="12" cy="17" r="1.5" fill="currentColor"/>
        <path d="M10.29 3.86L1.82 18C1.64 18.3 1.54 18.64 1.54 19C1.54 20.1 2.44 21 3.54 21H20.46C21.56 21 22.46 20.1 22.46 19C22.46 18.64 22.36 18.3 22.18 18L13.71 3.86C13.16 2.94 11.84 2.94 10.29 3.86Z" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    mistake: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    blunder: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 8L16 16M16 8L8 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    miss: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    book: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 19.5C4 18.12 5.12 17 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6.5 2H20V22H6.5C5.12 22 4 20.88 4 19.5V4.5C4 3.12 5.12 2 6.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  };

  // Use external image if available, otherwise use SVG
  if (useExternalImage) {
    return (
      <div className="flex items-center justify-center">
        <img 
          src={imagePaths[label]} 
          alt={`${label} move`}
          width={size}
          height={size}
          style={{ width: size, height: size }}
          onError={(e) => {
            // Fallback to SVG if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const svgContainer = target.nextElementSibling as HTMLElement;
            if (svgContainer) svgContainer.style.display = 'flex';
          }}
        />
        <div style={{ display: 'none' }} className="flex items-center justify-center">
          {svgIcons[label]}
        </div>
      </div>
    );
  }

  return <div className="flex items-center justify-center">{svgIcons[label]}</div>;
}
