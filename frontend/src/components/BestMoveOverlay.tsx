import { useMemo } from 'react';

interface BestMoveOverlayProps {
  bestMove: string | null;
  boardWidth: number;
}

export function BestMoveOverlay({ bestMove, boardWidth }: BestMoveOverlayProps) {
  const SVG = useMemo(() => {
    if (!bestMove || bestMove.length < 4) {
      return null;
    }

    const from = bestMove.substring(0, 2);
    const to = bestMove.substring(2, 4);

    // Parse square coordinates (a1 = (0, 7), h8 = (7, 0))
    const fromFile = from.charCodeAt(0) - 'a'.charCodeAt(0);
    const fromRank = 8 - parseInt(from[1]);
    const toFile = to.charCodeAt(0) - 'a'.charCodeAt(0);
    const toRank = 8 - parseInt(to[1]);

    // Calculate square size
    const squareSize = boardWidth / 8;

    // Calculate center positions of squares
    const fromX = fromFile * squareSize + squareSize / 2;
    const fromY = fromRank * squareSize + squareSize / 2;
    const toX = toFile * squareSize + squareSize / 2;
    const toY = toRank * squareSize + squareSize / 2;

    // Calculate arrow end point (with offset for arrow head)
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const arrowHeadOffset = 20;
    const arrowEndX = toX - Math.cos(angle) * arrowHeadOffset;
    const arrowEndY = toY - Math.sin(angle) * arrowHeadOffset;

    return (
      <svg
        width={boardWidth}
        height={boardWidth}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#4ade80" opacity="0.8" />
          </marker>
          <marker
            id="arrowhead-alt"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#facc15" opacity="0.6" />
          </marker>
        </defs>

        {/* Main arrow line */}
        <line
          x1={fromX}
          y1={fromY}
          x2={arrowEndX}
          y2={arrowEndY}
          stroke="#4ade80"
          strokeWidth="3"
          opacity="0.8"
          markerEnd="url(#arrowhead)"
        />

        {/* Start circle */}
        <circle
          cx={fromX}
          cy={fromY}
          r={8}
          fill="none"
          stroke="#4ade80"
          strokeWidth="2"
          opacity="0.8"
        />

        {/* End circle */}
        <circle
          cx={toX}
          cy={toY}
          r={8}
          fill="none"
          stroke="#4ade80"
          strokeWidth="2"
          opacity="0.8"
        />
      </svg>
    );
  }, [bestMove, boardWidth]);

  return SVG;
}
