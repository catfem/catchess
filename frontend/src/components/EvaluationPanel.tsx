import { useState, useEffect, useCallback, useMemo, type ReactElement } from 'react';
import { Chessboard } from 'react-chessboard';
import type { Arrow, Square } from 'react-chessboard/dist/chessboard/types';
import { Chess } from 'chess.js';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { useGameStore } from '../store/gameStore';
import { engineManager } from '../utils/engineManager';
import type { MaiaLevel } from '../utils/maiaEngine';

interface MoveAnalysis {
  move: string; // UCI
  san: string;
  probability: number;
  evaluation: number;
  stockfishLoss: number;
  tone: 'best' | 'good' | 'caution' | 'danger' | 'neutral';
}

interface MoveQualityDistribution {
  best: number;
  ok: number;
  blunder: number;
}

interface BlunderMapPoint {
  move: string;
  stockfishLoss: number;
  maiaLikelihood: number;
  color: string;
}

const MAIA_LEVELS: MaiaLevel[] = [1100, 1300, 1500, 1700, 1900];

const moveToneStyles: Record<MoveAnalysis['tone'], string> = {
  danger: 'bg-red-500/20 border border-red-500/40 text-red-300',
  caution: 'bg-yellow-500/10 border border-yellow-500/40 text-yellow-200',
  best: 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-200',
  good: 'bg-sky-500/10 border border-sky-500/40 text-sky-200',
  neutral: 'bg-gray-500/10 border border-gray-500/30 text-gray-200',
};

const renderScatterDot = (props: unknown): ReactElement => {
  const typedProps = props as {
    cx?: number;
    cy?: number;
    payload?: BlunderMapPoint;
  };

  const { cx = 0, cy = 0, payload } = typedProps;

  if (!payload) {
    return <circle cx={0} cy={0} r={0} opacity={0} />;
  }
  const radius = Math.max(6, payload.maiaLikelihood * 0.35);
  const color = payload.color ?? '#94a3b8';

  return (
    <g>
      <circle cx={cx} cy={cy} r={radius} fill={color} opacity={0.75} />
      <text
        x={cx}
        y={cy - radius - 6}
        textAnchor="middle"
        fill="#e5e7eb"
        fontSize={10}
      >
        {payload.move}
      </text>
    </g>
  );
};

const evalToWinPercentage = (evaluation: number): number => {
  const winPct = 50 + 50 * (2 / (1 + Math.exp(-0.4 * evaluation)) - 1);
  return Math.round(Math.max(0, Math.min(100, winPct)));
};

const getToneFromLoss = (loss: number): MoveAnalysis['tone'] => {
  if (loss < 0.25) return 'best';
  if (loss < 0.75) return 'good';
  if (loss < 1.75) return 'caution';
  return 'danger';
};

const getColorForMove = (loss: number): string => {
  if (loss < 0.5) return '#22c55e';
  if (loss < 1.5) return '#eab308';
  if (loss < 3) return '#f97316';
  return '#ef4444';
};

const generateMaiaProbabilities = (
  analyses: MoveAnalysis[],
  rating: MaiaLevel,
  maiaBestUci?: string
): number[] => {
  if (analyses.length === 0) return [];

  const ratingFactor = (rating - 1100) / 800; // 0-1 scale
  const bestKey = maiaBestUci?.slice(0, 4) ?? null;

  const weights = analyses.map((analysis) => {
    const loss = analysis.stockfishLoss;
    let weight: number;

    if (loss < 0.4) {
      weight = 28 + ratingFactor * 35;
    } else if (loss < 1.2) {
      weight = 22 + ratingFactor * 12;
    } else if (loss < 2.5) {
      weight = 18 - ratingFactor * 8;
    } else {
      weight = 12 - ratingFactor * 10;
    }

    if (bestKey && analysis.move.startsWith(bestKey)) {
      weight *= 1.4;
    }

    if (loss > 2 && rating <= 1300) {
      weight *= 1.2;
    }

    return Math.max(weight, 1);
  });

  const total = weights.reduce((sum, w) => sum + w, 0);
  return analyses.map((_, idx) => (weights[idx] / total) * 100);
};

const createPositionWarning = (
  humanMoves: MoveAnalysis[],
  engineMoves: MoveAnalysis[],
  rating: MaiaLevel,
  maiaBestSan?: string
): string => {
  const topHuman = humanMoves[0];
  const topEngine = engineMoves[0];

  if (!topHuman || !topEngine) {
    return 'Analyzing position dynamics...';
  }

  const loss = topHuman.stockfishLoss;
  const probability = topHuman.probability.toFixed(1);

  if (loss > 3) {
    return `Critical warning: ${probability}% of Maia ${rating} players choose ${topHuman.san}, but this collapses the position. The quiet ${topEngine.san}${maiaBestSan ? ` (Maia also favors ${maiaBestSan})` : ''} is the only winning path.`;
  }

  if (loss > 1.5) {
    return `Sharp position: ${topHuman.san} tempts human players (${probability}%), yet Stockfish insists on ${topEngine.san}. Spotting the engine line converts the edge.`;
  }

  if (loss > 0.5) {
    return `Balanced but tricky. ${topHuman.san} keeps practical chances, though ${topEngine.san} squeezes more. ${maiaBestSan ? `${maiaBestSan} matches Maia's intuition.` : ''}`;
  }

  return `Human intuition and engine precision align: ${topHuman.san} is both natural and strongest, mirroring Maia's recommendation.`;
};

const computeMoveQuality = (analyses: MoveAnalysis[]): MoveQualityDistribution => {
  if (analyses.length === 0) {
    return { best: 33, ok: 33, blunder: 34 };
  }

  let best = 0;
  let ok = 0;
  let blunder = 0;

  analyses.forEach((analysis) => {
    const { stockfishLoss: loss, probability } = analysis;
    if (loss < 0.5) {
      best += probability;
    } else if (loss < 2) {
      ok += probability;
    } else {
      blunder += probability;
    }
  });

  const total = best + ok + blunder || 1;
  const bestPct = Math.round((best / total) * 100);
  const okPct = Math.round((ok / total) * 100);
  const blunderPct = Math.max(0, 100 - bestPct - okPct);

  return { best: bestPct, ok: okPct, blunder: blunderPct };
};

const buildMovesByRatingData = (humanMoves: MoveAnalysis[]) => {
  if (humanMoves.length === 0) return [];

  const ratings = MAIA_LEVELS;
  return ratings.map((rating) => {
    const ratingFactor = (rating - 1100) / 800;
    const dataPoint: Record<string, number> = { rating };

    humanMoves.slice(0, 5).forEach((move) => {
      const base = move.probability;
      const loss = move.stockfishLoss;
      let adjusted = base;

      if (loss < 0.5) {
        adjusted = base * (0.6 + ratingFactor);
      } else if (loss > 2) {
        adjusted = base * (1.5 - ratingFactor);
      } else {
        adjusted = base * (0.9 + (1 - Math.abs(0.5 - ratingFactor)) * 0.2);
      }

      dataPoint[move.san] = Number(adjusted.toFixed(1));
    });

    return dataPoint;
  });
};

const buildBlunderMapData = (humanMoves: MoveAnalysis[]): BlunderMapPoint[] =>
  humanMoves.map((move) => ({
    move: move.san,
    stockfishLoss: move.stockfishLoss,
    maiaLikelihood: move.probability,
    color: getColorForMove(move.stockfishLoss),
  }));

const uciToSan = (fen: string, move: string): string => {
  if (!move) return '';
  const chess = new Chess(fen);
  const from = move.slice(0, 2);
  const to = move.slice(2, 4);
  const promotion = move.length > 4 ? move[4] : undefined;
  const result = chess.move({ from, to, promotion });
  return result?.san ?? move;
};

const extractArrowSquares = (move: string): [Square, Square] | null => {
  if (!move || move.length < 4) return null;
  return [move.slice(0, 2) as Square, move.slice(2, 4) as Square];
};

const isMaiaLevel = (value: number | undefined): value is MaiaLevel =>
  value !== undefined && MAIA_LEVELS.includes(value as MaiaLevel);

export function EvaluationPanel() {
  const { chess, engineSettings } = useGameStore();
  const depth = engineSettings.depth ?? 18;
  const currentFen = chess.fen();

  const initialMaiaLevel: MaiaLevel = isMaiaLevel(engineSettings.maiaLevel)
    ? (engineSettings.maiaLevel as MaiaLevel)
    : 1500;

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stockfishEval, setStockfishEval] = useState(0);
  const [stockfishDepth, setStockfishDepth] = useState(depth);
  const [maiaLevel, setMaiaLevel] = useState<MaiaLevel>(initialMaiaLevel);
  const [humanMoves, setHumanMoves] = useState<MoveAnalysis[]>([]);
  const [engineMoves, setEngineMoves] = useState<MoveAnalysis[]>([]);
  const [boardArrows, setBoardArrows] = useState<Arrow[]>([]);
  const [winPercentage, setWinPercentage] = useState(50);
  const [positionWarning, setPositionWarning] = useState('Analyzing position...');
  const [moveQuality, setMoveQuality] = useState<MoveQualityDistribution>({ best: 33, ok: 33, blunder: 34 });
  const [maiaBest, setMaiaBest] = useState<{ move: string; eval: number; san: string } | null>(null);

  const analyzeCurrentPosition = useCallback(async () => {
    setIsAnalyzing(true);

    try {
      const fenSnapshot = currentFen;
      const tempChess = new Chess(fenSnapshot);
      const legalMoves = tempChess.moves({ verbose: true });

      if (legalMoves.length === 0) {
        setIsAnalyzing(false);
        return;
      }

      await engineManager.setEngine('stockfish');
      const sfRootResult = await engineManager.getBestMove(fenSnapshot, depth);
      setStockfishEval(sfRootResult.eval);
      setStockfishDepth(depth);
      setWinPercentage(evalToWinPercentage(sfRootResult.eval));

      const perMoveDepth = Math.max(10, Math.min(depth - 2, 16));
      const candidateMoves = legalMoves.slice(0, Math.min(12, legalMoves.length));
      const analyses: MoveAnalysis[] = [];

      for (const move of candidateMoves) {
        const analysisBoard = new Chess(fenSnapshot);
        const moved = analysisBoard.move(move);
        if (!moved) continue;

        const resultingFen = analysisBoard.fen();
        const moveResult = await engineManager.getBestMove(resultingFen, perMoveDepth);
        const moveEval = -moveResult.eval;
        const loss = Math.max(0, sfRootResult.eval - moveEval);

        analyses.push({
          move: `${move.from}${move.to}${move.promotion ?? ''}`,
          san: move.san,
          probability: 0,
          evaluation: moveEval,
          stockfishLoss: loss,
          tone: getToneFromLoss(loss),
        });
      }

      await engineManager.setEngine('maia', maiaLevel);
      const maiaResult = await engineManager.getBestMove(fenSnapshot, 12);
      const maiaSan = uciToSan(fenSnapshot, maiaResult.bestMove);
      setMaiaBest({ move: maiaResult.bestMove, eval: maiaResult.eval, san: maiaSan });

      const maiaProbabilities = generateMaiaProbabilities(analyses, maiaLevel, maiaResult.bestMove);
      analyses.forEach((analysis, idx) => {
        analysis.probability = Number(maiaProbabilities[idx].toFixed(2));
      });

      const humanMovesData = [...analyses]
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 5);

      const engineMovesData = [...analyses]
        .sort((a, b) => b.evaluation - a.evaluation)
        .slice(0, 5);

      const arrows: Arrow[] = [];
      const seen = new Set<string>();

      const addArrow = (uci: string, color: string) => {
        const squares = extractArrowSquares(uci);
        if (!squares) return;
        const key = `${squares[0]}-${squares[1]}-${color}`;
        if (seen.has(key)) return;
        seen.add(key);
        arrows.push([squares[0], squares[1], color]);
      };

      if (humanMovesData[0] && humanMovesData[0].stockfishLoss > 1.5) {
        addArrow(humanMovesData[0].move, '#ef4444');
      }

      if (engineMovesData[0]) {
        addArrow(engineMovesData[0].move, '#2563eb');
      }

      if (maiaResult.bestMove) {
        addArrow(maiaResult.bestMove, '#a855f7');
      }

      setBoardArrows(arrows);
      setHumanMoves(humanMovesData);
      setEngineMoves(engineMovesData);
      setPositionWarning(createPositionWarning(humanMovesData, engineMovesData, maiaLevel, maiaSan));
      setMoveQuality(computeMoveQuality(analyses));
    } catch (error) {
      console.error('Human-aware analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentFen, depth, maiaLevel]);

  useEffect(() => {
    analyzeCurrentPosition();
  }, [analyzeCurrentPosition]);

  const movesByRatingData = useMemo(() => buildMovesByRatingData(humanMoves), [humanMoves]);
  const blunderMapData = useMemo(() => buildBlunderMapData(humanMoves), [humanMoves]);
  const lineColors = useMemo(() => {
    const colors: Record<string, string> = {};
    humanMoves.forEach((move) => {
      colors[move.san] = getColorForMove(move.stockfishLoss);
    });
    return colors;
  }, [humanMoves]);

  const maiaBestKey = maiaBest?.move.slice(0, 4) ?? null;

  return (
    <div className="w-full h-full bg-[#262421] text-gray-100 overflow-y-auto">
      <div className="p-6 space-y-6 min-h-full">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Human-aware Evaluation</h2>
            <p className="text-sm text-gray-400">
              Maia {maiaLevel} intuition meets Stockfish 17 precision — understand the position from both human and engine perspectives.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={maiaLevel}
              onChange={(event) => setMaiaLevel(Number(event.target.value) as MaiaLevel)}
              className="bg-[#312e2b] px-3 py-2 rounded-lg border border-gray-700/50 text-sm text-white cursor-pointer hover:border-gray-600"
            >
              {MAIA_LEVELS.map((level) => (
                <option key={level} value={level}>
                  🧠 Maia {level}
                </option>
              ))}
            </select>
            <div className="bg-[#312e2b] px-3 py-2 rounded-lg border border-gray-700/50 text-sm text-gray-300">
              ⚙️ Stockfish <span className="text-white font-semibold ml-1">17 · d{stockfishDepth}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_1.7fr_1fr]">
          <div className="bg-[#2b2926] rounded-2xl p-5 shadow-xl border border-gray-800/60">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm">
                <div className="text-gray-400 uppercase tracking-wide text-[11px]">Current Position</div>
                <div className="text-lg font-semibold text-white">
                  {chess.turn() === 'w' ? 'White to move' : 'Black to move'}
                </div>
              </div>
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-xs text-blue-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent" />
                  Analyzing...
                </div>
              )}
            </div>

            <div className="relative rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-red-500/10 pointer-events-none" />
              <Chessboard
                position={currentFen}
                arePiecesDraggable={false}
                boardOrientation="white"
                customBoardStyle={{ borderRadius: '16px' }}
                customDarkSquareStyle={{ backgroundColor: '#7a5230' }}
                customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
                customArrows={boardArrows}
                id="maia-eval-board"
                boardWidth={360}
              />
              {humanMoves.length > 0 && humanMoves[0].stockfishLoss > 1.5 && (
                <div className="absolute top-4 left-4 bg-red-600/80 text-xs font-semibold px-3 py-1 rounded-full shadow">
                  🔴 {humanMoves[0].san} — Popular blunder
                </div>
              )}
              {engineMoves.length > 0 && (
                <div className="absolute bottom-4 right-4 bg-blue-600/80 text-xs font-semibold px-3 py-1 rounded-full shadow">
                  🔵 {engineMoves[0].san} — Stockfish best
                </div>
              )}
              {maiaBest && (
                <div className="absolute top-4 right-4 bg-purple-600/80 text-xs font-semibold px-3 py-1 rounded-full shadow">
                  🧠 {maiaBest.san} — Maia pick
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <div className="text-red-300 font-semibold">Human Hotspot</div>
                <p className="text-gray-300 mt-1 leading-snug">
                  {humanMoves.length > 0
                    ? `${humanMoves[0].probability.toFixed(1)}% of Maia ${maiaLevel} players choose ${humanMoves[0].san}`
                    : 'Calculating human tendencies...'}
                </p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <div className="text-blue-300 font-semibold">Engine Line</div>
                <p className="text-gray-300 mt-1 leading-snug">
                  {engineMoves.length > 0
                    ? `Stockfish recommends ${engineMoves[0].san} (${engineMoves[0].evaluation > 0 ? '+' : ''}${engineMoves[0].evaluation.toFixed(2)})`
                    : 'Calculating best moves...'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#2b2926] rounded-2xl p-5 shadow-xl border border-gray-800/60 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#312e2b] rounded-xl p-4 border border-gray-800/60">
                <div className="text-[11px] uppercase tracking-wide text-gray-400">White Win %</div>
                <div className="text-3xl font-bold text-white mt-1">{winPercentage}%</div>
                <p className="text-xs text-gray-400 mt-2">Converted from Stockfish evaluation</p>
              </div>
              <div className="bg-[#312e2b] rounded-xl p-4 border border-gray-800/60">
                <div className="text-[11px] uppercase tracking-wide text-gray-400">Stockfish Eval (d{stockfishDepth})</div>
                <div
                  className={`text-3xl font-bold mt-1 ${
                    stockfishEval > 0 ? 'text-emerald-300' : stockfishEval < 0 ? 'text-red-300' : 'text-gray-300'
                  }`}
                >
                  {stockfishEval > 0 ? '+' : ''}{stockfishEval.toFixed(2)}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {Math.abs(stockfishEval) > 3
                    ? 'Decisive advantage'
                    : Math.abs(stockfishEval) > 1.5
                      ? 'Clear advantage'
                      : Math.abs(stockfishEval) > 0.5
                        ? 'Slight edge'
                        : 'Balanced position'}
                </p>
              </div>
              <div className="bg-[#312e2b] rounded-xl p-4 border border-gray-800/60">
                <div className="text-[11px] uppercase tracking-wide text-gray-400">Maia Suggests</div>
                <div className="text-2xl font-bold text-purple-200 mt-1">
                  {maiaBest ? maiaBest.san : '...'}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {maiaBest
                    ? `${maiaBest.eval > 0 ? '+' : ''}${maiaBest.eval.toFixed(2)} from Maia ${maiaLevel}`
                    : 'Human model analysis in progress'}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                  Human Moves (Maia {maiaLevel})
                </h3>
                <div className="space-y-2">
                  {humanMoves.length > 0 ? (
                    humanMoves.map((move) => (
                      <div key={move.move} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${moveToneStyles[move.tone]}`}>
                        <span className="flex items-center gap-2">
                          <span className="font-mono text-white">{move.san}</span>
                          {maiaBestKey && move.move.startsWith(maiaBestKey) && (
                            <span className="text-xs text-purple-200 font-semibold bg-purple-500/20 border border-purple-400/30 rounded-full px-2 py-0.5">
                              Maia
                            </span>
                          )}
                        </span>
                        <span>{move.probability.toFixed(1)}%</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm">Analyzing...</div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">Engine Moves (SF17)</h3>
                <div className="space-y-2">
                  {engineMoves.length > 0 ? (
                    engineMoves.map((move) => (
                      <div key={move.move} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${moveToneStyles[move.tone]}`}>
                        <span className="font-mono text-white">{move.san}</span>
                        <span>{move.evaluation > 0 ? '+' : ''}{move.evaluation.toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-sm">Analyzing...</div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-amber-900/20 border border-amber-600/40 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-amber-200 mb-2">Position Insight</h4>
              <p className="text-sm text-gray-200 leading-relaxed">{positionWarning}</p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">Move Quality Distribution</h4>
              <div className="relative h-10 rounded-xl overflow-hidden bg-gray-800/60">
                <div className="absolute inset-y-0 left-0 bg-emerald-500/80" style={{ width: `${moveQuality.best}%` }} />
                <div
                  className="absolute inset-y-0 bg-yellow-400/80"
                  style={{ left: `${moveQuality.best}%`, width: `${moveQuality.ok}%` }}
                />
                <div className="absolute inset-y-0 right-0 bg-red-500/80" style={{ width: `${moveQuality.blunder}%` }} />
                <div className="absolute inset-0 flex items-center justify-between px-4 text-xs font-semibold text-white">
                  <span>🟩 {moveQuality.best}%</span>
                  <span>🟨 {moveQuality.ok}%</span>
                  <span>🟥 {moveQuality.blunder}%</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Weighted by Maia {maiaLevel} move likelihoods</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#2f2940] via-[#2d344e] to-[#224060] rounded-2xl p-5 shadow-xl border border-blue-800/40 text-gray-100 space-y-4">
            <h3 className="text-xl font-bold">Analyze games with human-aware AI</h3>
            <p className="text-sm text-gray-200 leading-relaxed">
              Blend the tactical accuracy of Stockfish with Maia&apos;s model of human decision-making. See what real players attempt, where they stumble, and how to stay ahead.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-emerald-300 mt-0.5">✓</span>
                <span>Spot moves that are objectively winning yet psychologically hidden from most players.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-sky-300 mt-0.5">✓</span>
                <span>Track blunder hotspots across rating bands — learn what fails at your level.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-300 mt-0.5">✓</span>
                <span>Build intuition with data-backed narratives, not just engine scores.</span>
              </li>
            </ul>
            <button
              onClick={analyzeCurrentPosition}
              disabled={isAnalyzing}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {isAnalyzing ? 'Analyzing...' : 'Re-analyze Position'}
            </button>
          </div>
        </div>

        {movesByRatingData.length > 0 && (
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="bg-[#2b2926] rounded-2xl p-5 shadow-xl border border-gray-800/60">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">Moves by Rating</h3>
                <span className="text-xs text-gray-500">Simulated Maia likelihood</span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={movesByRatingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3b36" />
                  <XAxis dataKey="rating" stroke="#9ca3af" tickFormatter={(value) => `${value}`} />
                  <YAxis stroke="#9ca3af" unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      borderRadius: '12px',
                      border: '1px solid #374151',
                      color: '#f9fafb',
                    }}
                    formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                    labelFormatter={(label) => `${label} Elo`}
                  />
                  {Object.keys(lineColors).map((key) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={lineColors[key]}
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-400 mt-3">
                Observe how preferred moves shift as players strengthen from 1100 to 1900 Elo.
              </p>
            </div>

            <div className="bg-[#2b2926] rounded-2xl p-5 shadow-xl border border-gray-800/60">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">Move Map (Blunder Map)</h3>
                <span className="text-xs text-gray-500">Loss vs likelihood</span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3b36" />
                  <XAxis
                    type="number"
                    dataKey="stockfishLoss"
                    name="Stockfish Loss"
                    stroke="#9ca3af"
                    label={{ value: 'Stockfish Loss (pawns)', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
                  />
                  <YAxis
                    type="number"
                    dataKey="maiaLikelihood"
                    name="Maia Likelihood"
                    stroke="#9ca3af"
                    label={{ value: 'Maia Likelihood %', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                  />
                  <ZAxis type="number" dataKey="maiaLikelihood" range={[80, 400]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3', stroke: '#4b5563' }}
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      borderRadius: '12px',
                      border: '1px solid #374151',
                      color: '#f9fafb',
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'Stockfish Loss') return [`${value.toFixed(2)} pawns`, name];
                      if (name === 'Maia Likelihood') return [`${value.toFixed(1)}%`, name];
                      return [value, name];
                    }}
                  />
                  <Scatter data={blunderMapData} shape={renderScatterDot} />
                </ScatterChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-400 mt-3">
                🔴 Common blunders · 🟡 Risky temptations · 🟢 Best moves that humans rarely play.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
