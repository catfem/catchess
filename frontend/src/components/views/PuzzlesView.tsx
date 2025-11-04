export function PuzzlesView() {
  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="text-8xl mb-6">🧩</div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Puzzles Coming Soon
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Practice tactical patterns and sharpen your chess skills with our puzzle library.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Features in Development:
          </h3>
          <ul className="text-left space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-green-500 text-xl">✓</span>
              <span>Thousands of rated puzzles</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 text-xl">✓</span>
              <span>Puzzle rush mode with time challenges</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 text-xl">✓</span>
              <span>Track your puzzle rating and progress</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 text-xl">✓</span>
              <span>Daily puzzle challenges</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 text-xl">✓</span>
              <span>Tactical themes (pins, forks, skewers, etc.)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
