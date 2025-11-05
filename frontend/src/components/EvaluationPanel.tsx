import type { ReactElement } from 'react';
import { Chessboard } from 'react-chessboard';
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

const boardPosition = 'r2q1rk1/pppn1ppp/2n1p3/3pP3/2pP1BP1/2P2N1P/PP1N1P2/R2Q1RK1 w - - 0 1';

const humanMoves = [
  { move: 'Nf5', probability: 34.8, tone: 'danger' as const },
  { move: 'Bxf7+', probability: 33.4, tone: 'danger' as const },
  { move: 'Ng4', probability: 12.2, tone: 'caution' as const },
  { move: 'Ne4', probability: 8.4, tone: 'best' as const },
];

const engineMoves = [
  { move: 'Ne4', evaluation: 6.07, tone: 'best' as const },
  { move: 'Nf3', evaluation: 4.28, tone: 'good' as const },
  { move: 'Nf5', evaluation: 1.25, tone: 'caution' as const },
  { move: 'Ng4', evaluation: 0, tone: 'neutral' as const },
];

const moveQualityDistribution = {
  best: 16,
  ok: 12,
  blunder: 72,
};

const movesByRatingData = [
  { rating: 1100, Nf5: 46, 'Bxf7+': 38, Ng4: 12, Ne4: 3, Nf3: 1 },
  { rating: 1300, Nf5: 41, 'Bxf7+': 32, Ng4: 15, Ne4: 7, Nf3: 5 },
  { rating: 1500, Nf5: 34, 'Bxf7+': 29, Ng4: 16, Ne4: 12, Nf3: 9 },
  { rating: 1700, Nf5: 21, 'Bxf7+': 22, Ng4: 17, Ne4: 19, Nf3: 15 },
  { rating: 1900, Nf5: 12, 'Bxf7+': 14, Ng4: 15, Ne4: 32, Nf3: 27 },
];

const blunderMapData = [
  { move: 'Nf5', stockfishLoss: 5.4, maiaLikelihood: 34.8 },
  { move: 'Bxf7+', stockfishLoss: 4.8, maiaLikelihood: 33.4 },
  { move: 'Ng4', stockfishLoss: 2.1, maiaLikelihood: 12.2 },
  { move: 'Ne4', stockfishLoss: 0.0, maiaLikelihood: 8.4 },
  { move: 'Nf3', stockfishLoss: 0.4, maiaLikelihood: 4.1 },
];

const lineColors: Record<string, string> = {
  Nf5: '#ef4444',
  'Bxf7+': '#f97316',
  Ng4: '#facc15',
  Ne4: '#22c55e',
  Nf3: '#38bdf8',
};

const scatterColors: Record<string, string> = {
  Nf5: '#ef4444',
  'Bxf7+': '#f97316',
  Ng4: '#eab308',
  Ne4: '#22c55e',
  Nf3: '#0ea5e9',
};

const moveToneStyles: Record<string, string> = {
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
    payload?: {
      move: string;
      stockfishLoss: number;
      maiaLikelihood: number;
    };
  };
  
  const { cx = 0, cy = 0, payload } = typedProps;
  
  if (!payload) {
    return <circle cx={0} cy={0} r={0} opacity={0} />;
  }
  const radius = Math.max(6, payload.maiaLikelihood * 0.35);
  const color = scatterColors[payload.move] ?? '#94a3b8';

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

export function EvaluationPanel() {
  return (
    <div className="w-full h-full bg-[#262421] text-gray-100">
      <div className="p-6 space-y-6 min-h-full">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Human-aware Evaluation</h2>
            <p className="text-sm text-gray-400">
              Maia 1500 intuition meets Stockfish 17 precision — understand the position from both human and engine perspectives.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#312e2b] px-3 py-2 rounded-lg border border-gray-700/50 text-sm text-gray-300">
              🧠 Maia Model <span className="text-white font-semibold ml-1">1500</span>
            </div>
            <div className="bg-[#312e2b] px-3 py-2 rounded-lg border border-gray-700/50 text-sm text-gray-300">
              ⚙️ Stockfish <span className="text-white font-semibold ml-1">17 · Depth 24</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_1.7fr_1fr]">
          {/* Left: Game and Position */}
          <div className="bg-[#2b2926] rounded-2xl p-5 shadow-xl border border-gray-800/60">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm">
                <div className="text-gray-400 uppercase tracking-wide text-[11px]">White</div>
                <div className="text-lg font-semibold text-white">Spassky, Boris V.</div>
              </div>
              <div className="text-right text-sm">
                <div className="text-gray-400 uppercase tracking-wide text-[11px]">Black</div>
                <div className="text-lg font-semibold text-white">Petrosian, Tigran V.</div>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-red-500/10 pointer-events-none" />
              <Chessboard
                position={boardPosition}
                arePiecesDraggable={false}
                boardOrientation="white"
                customBoardStyle={{ borderRadius: '16px' }}
                customDarkSquareStyle={{ backgroundColor: '#7a5230' }}
                customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
                id="maia-eval-board"
                boardWidth={360}
              />
              <div className="absolute top-4 left-4 bg-red-600/80 text-xs font-semibold px-3 py-1 rounded-full shadow">🔴 Nf5? Blunder lane</div>
              <div className="absolute bottom-4 right-4 bg-blue-600/80 text-xs font-semibold px-3 py-1 rounded-full shadow">🔵 Ne4! Engine line</div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <div className="text-red-300 font-semibold">Human Hotspot</div>
                <p className="text-gray-300 mt-1 leading-snug">Most club players dive into 24.Nf5 or 24.Bxf7+, walking straight into Stockfish traps.</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <div className="text-blue-300 font-semibold">Engine Arrow</div>
                <p className="text-gray-300 mt-1 leading-snug">Stockfish identifies 24.Ne4 or 24.Nf3 as winning calm moves, preserving the attack.</p>
              </div>
            </div>
          </div>

          {/* Middle: Human vs Engine Analysis */}
          <div className="bg-[#2b2926] rounded-2xl p-5 shadow-xl border border-gray-800/60 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#312e2b] rounded-xl p-4 border border-gray-800/60">
                <div className="text-[11px] uppercase tracking-wide text-gray-400">White Win %</div>
                <div className="text-3xl font-bold text-white mt-1">50%</div>
                <p className="text-xs text-gray-400 mt-2">Maia predicts the game is perfectly balanced — human players feel the pressure to attack.</p>
              </div>
              <div className="bg-[#312e2b] rounded-xl p-4 border border-gray-800/60">
                <div className="text-[11px] uppercase tracking-wide text-gray-400">Stockfish Eval (d24)</div>
                <div className="text-3xl font-bold text-emerald-300 mt-1">+6.07</div>
                <p className="text-xs text-gray-400 mt-2">Engine shows a crushing advantage — but only if the precise defensive resources are found.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">Human Moves</h3>
                <div className="space-y-2">
                  {humanMoves.map(({ move, probability, tone }) => (
                    <div key={move} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${moveToneStyles[tone]}`}>
                      <span className="font-mono text-white">{move}</span>
                      <span>{probability.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">Engine Moves</h3>
                <div className="space-y-2">
                  {engineMoves.map(({ move, evaluation, tone }) => (
                    <div key={move} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${moveToneStyles[tone]}`}>
                      <span className="font-mono text-white">{move}</span>
                      <span>{evaluation > 0 ? '+' : ''}{evaluation.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-600/40 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-red-200 mb-2">Position Warning</h4>
              <p className="text-sm text-gray-200 leading-relaxed">
                This is a treacherous middlegame. Humans are drawn to spectacular but losing moves like <span className="font-mono text-red-200">Nf5</span>. Calm finds such as <span className="font-mono text-emerald-200">Ne4</span> or <span className="font-mono text-emerald-200">Nf3</span> convert the advantage, yet rarely appear over the board.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">Move Quality</h4>
              <div className="relative h-10 rounded-xl overflow-hidden bg-gray-800/60">
                <div className="absolute inset-y-0 left-0 bg-emerald-500/80" style={{ width: `${moveQualityDistribution.best}%` }} />
                <div className="absolute inset-y-0 left-[16%] bg-yellow-400/80" style={{ width: `${moveQualityDistribution.ok}%` }} />
                <div className="absolute inset-y-0 right-0 bg-red-500/80" style={{ width: `${moveQualityDistribution.blunder}%` }} />
                <div className="absolute inset-0 flex items-center justify-between px-4 text-xs font-semibold text-white">
                  <span>🟩 {moveQualityDistribution.best}% Best</span>
                  <span>🟨 {moveQualityDistribution.ok}% OK</span>
                  <span>🟥 {moveQualityDistribution.blunder}% Blunders</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Description & CTA */}
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
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors">
              Try Analysis
            </button>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="bg-[#2b2926] rounded-2xl p-5 shadow-xl border border-gray-800/60">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">Moves by Rating</h3>
              <span className="text-xs text-gray-500">Maia Likelihood</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={movesByRatingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3b36" />
                <XAxis dataKey="rating" stroke="#9ca3af" tickFormatter={(value) => `${value}`} />
                <YAxis stroke="#9ca3af" unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', borderRadius: '12px', border: '1px solid #374151', color: '#f9fafb' }}
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
              Nf5 dominates at sub-1500, while stronger players discover Ne4 and Nf3, matching Stockfish lines.
            </p>
          </div>

          <div className="bg-[#2b2926] rounded-2xl p-5 shadow-xl border border-gray-800/60">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">Move Map (Blunder Map)</h3>
              <span className="text-xs text-gray-500">Loss vs Likelihood</span>
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
                  contentStyle={{ backgroundColor: '#1f2937', borderRadius: '12px', border: '1px solid #374151', color: '#f9fafb' }}
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
              🔴 Red dots: blazing human blunders · 🟡 Yellow: tempting yet risky · 🟢 Green: best moves rarely played.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
