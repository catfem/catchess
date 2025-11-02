import { MoveLabel } from '../types';

interface MoveLabelIconProps {
  label: MoveLabel;
  size?: number;
}

// Try to use external images first, fallback to SVG if not available
const useExternalImage = true; // Set to false to use SVG icons

export function MoveLabelIcon({ label, size = 20 }: MoveLabelIconProps) {
  // External image paths from GitHub
  const imagePaths: Record<MoveLabel, string> = {
    brilliant: 'https://github.com/user-attachments/assets/1010fb7d-04ff-449c-acd0-cce74e4f2d09',
    best: 'https://github.com/user-attachments/assets/4b59410a-afb2-4151-aeee-7ff83488ddc7',
    excellent: 'https://github.com/user-attachments/assets/284c397f-93d5-41b4-ad45-04d6813de1e2', // "ok" image
    great: 'https://github.com/user-attachments/assets/a41ec3c2-caf6-4113-89c1-d5e89d0b0e11',
    good: 'https://github.com/user-attachments/assets/a9553ea0-7578-44b3-9a93-37d12b8a17ba',
    inaccuracy: 'https://github.com/user-attachments/assets/333ff6f7-35b2-4393-84ed-08a61dfc0961', // "inaccurate" image
    mistake: 'https://github.com/user-attachments/assets/c71870f4-066c-48da-9d86-480a2b212381',
    blunder: 'https://github.com/user-attachments/assets/a1c632f0-30a4-4253-b091-e71db00b007f',
    miss: 'https://github.com/user-attachments/assets/5c6dffa0-fa09-4057-88a2-be9383fab7b7',
    book: 'https://github.com/user-attachments/assets/6bd0c479-ed4b-4594-b629-36873a392f4a',
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
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <img 
          src={imagePaths[label]} 
          alt={`${label} move`}
          width={size}
          height={size}
          style={{ 
            width: size, 
            height: size,
            objectFit: 'contain'
          }}
          onError={(e) => {
            // Fallback to SVG if image fails to load
            console.log(`Failed to load image for ${label}, falling back to SVG`);
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const svgContainer = target.nextElementSibling as HTMLElement;
            if (svgContainer) svgContainer.style.display = 'flex';
          }}
          onLoad={() => {
            console.log(`Successfully loaded image for ${label}`);
          }}
        />
        <div style={{ display: 'none', width: size, height: size }} className="flex items-center justify-center">
          {svgIcons[label]}
        </div>
      </div>
    );
  }

  return <div className="flex items-center justify-center" style={{ width: size, height: size }}>{svgIcons[label]}</div>;
}
