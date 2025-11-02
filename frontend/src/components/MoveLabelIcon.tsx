import { MoveLabel } from '../types';

interface MoveLabelIconProps {
  label: MoveLabel;
  size?: number;
}

export function MoveLabelIcon({ label, size = 20 }: MoveLabelIconProps) {
  // Use local image paths from public/icons directory
  const imagePaths: Record<MoveLabel, string> = {
    brilliant: '/icons/brilliant.png',
    best: '/icons/best.png',
    excellent: '/icons/excellent.png',
    great: '/icons/great.png',
    good: '/icons/good.png',
    inaccuracy: '/icons/inaccuracy.png',
    mistake: '/icons/mistake.png',
    blunder: '/icons/blunder.png',
    miss: '/icons/miss.png',
    book: '/icons/book.png',
  };

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
      />
    </div>
  );
}
