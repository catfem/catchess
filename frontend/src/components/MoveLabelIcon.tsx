import { useState } from 'react';
import { MoveLabel } from '../types';
import { getMoveColor, getMoveIcon } from '../utils/stockfish';

interface MoveLabelIconProps {
  label: MoveLabel;
  size?: number;
}

export function MoveLabelIcon({ label, size = 20 }: MoveLabelIconProps) {
  // Only include image paths for icons that actually exist in public/icons
  const imagePaths: Partial<Record<MoveLabel, string>> = {
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

  const [errored, setErrored] = useState(false);
  const imageSrc = imagePaths[label];

  // Fallback renderer for labels without images (or if image fails to load)
  const renderFallback = () => (
    <div
      className="inline-flex items-center justify-center rounded"
      style={{
        width: size,
        height: size,
        backgroundColor: `${getMoveColor(label)}20`,
        color: getMoveColor(label),
        fontSize: Math.max(10, size * 0.6),
        lineHeight: 1,
      }}
      aria-label={`${label} move`}
      title={label}
    >
      {getMoveIcon(label)}
    </div>
  );

  if (!imageSrc || errored) {
    return renderFallback();
  }

  return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <img
        src={imageSrc}
        alt={`${label} move`}
        width={size}
        height={size}
        onError={() => setErrored(true)}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  );
}
