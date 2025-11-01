import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useGameStore } from '../store/gameStore';

export function EvaluationGraph() {
  const { moveHistory } = useGameStore();

  const data = moveHistory.map((move, index) => ({
    move: index + 1,
    evaluation: Math.max(-10, Math.min(10, move.eval)),
    moveLabel: move.san,
  }));

  if (data.length === 0) {
    return (
      <div className="w-full h-[200px] bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Play some moves to see the evaluation graph</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[200px] bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-2 dark:text-white">Evaluation Graph</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="move" 
            stroke="#9ca3af"
            label={{ value: 'Move', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            stroke="#9ca3af"
            domain={[-10, 10]}
            ticks={[-10, -5, 0, 5, 10]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: 'none', 
              borderRadius: '8px',
              color: '#fff' 
            }}
            formatter={(value: number) => [
              `${value > 0 ? '+' : ''}${value.toFixed(2)}`,
              'Evaluation'
            ]}
            labelFormatter={(label) => `Move ${label}`}
          />
          <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
          <Line 
            type="monotone" 
            dataKey="evaluation" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
