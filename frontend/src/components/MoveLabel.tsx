import { useEffect, useState } from 'react';
import { MoveLabel as MoveLabelType } from '../types';
import { MoveLabelIcon } from './MoveLabelIcon';

interface MoveLabelProps {
  label: MoveLabelType | null;
  moveNumber?: number;
}

const labelConfig: Record<MoveLabelType, { bg: string; text: string }> = {
  brilliant: { bg: '#FFD700', text: '#000' },
  critical: { bg: '#5b8baf', text: '#fff' },
  best: { bg: '#22C55E', text: '#fff' },
  excellent: { bg: '#4ADE80', text: '#fff' },
  great: { bg: '#3B82F6', text: '#fff' },
  good: { bg: '#2DD4BF', text: '#fff' },
  inaccuracy: { bg: '#F97316', text: '#000' },
  mistake: { bg: '#EF4444', text: '#fff' },
  blunder: { bg: '#991B1B', text: '#fff' },
  miss: { bg: '#9333EA', text: '#fff' },
  book: { bg: '#6B7280', text: '#fff' },
  forced: { bg: '#97af8b', text: '#000' },
  risky: { bg: '#8983ac', text: '#fff' },
};

const labelText: Record<MoveLabelType, string> = {
  brilliant: 'Brilliant!',
  critical: 'Critical',
  best: 'Best Move',
  excellent: 'Excellent',
  great: 'Great',
  good: 'Good',
  inaccuracy: 'Inaccuracy',
  mistake: 'Mistake',
  blunder: 'Blunder',
  miss: 'Missed Win',
  book: 'Book Move',
  forced: 'Forced',
  risky: 'Risky',
};

export function MoveLabel({ label, moveNumber }: MoveLabelProps) {
  const [visible, setVisible] = useState(false);
  const [currentLabel, setCurrentLabel] = useState<MoveLabelType | null>(null);
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    if (label && label !== 'book') {
      setCurrentLabel(label);
      setVisible(true);
      setFadeKey(prev => prev + 1);

      // Fade out after 2.5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [label, moveNumber]);

  if (!currentLabel || !visible) {
    return null;
  }

  const config = labelConfig[currentLabel];

  return (
    <div
      key={fadeKey}
      className="absolute z-50 pointer-events-none animate-fade-in-out"
      style={{
        top: '2%',
        right: '2%',
      }}
    >
      <div
        className="rounded-xl px-4 py-2 font-bold shadow-2xl text-sm select-none flex items-center gap-2"
        style={{
          backgroundColor: config.bg,
          color: config.text,
          animation: 'slideInRight 0.4s ease-out, fadeOut 0.5s ease-in 2s forwards',
        }}
      >
        <MoveLabelIcon label={currentLabel} size={20} />
        <span className="text-base">{labelText[currentLabel]}</span>
      </div>
    </div>
  );
}
