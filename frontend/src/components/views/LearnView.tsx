export function LearnView() {
  const lessons = [
    {
      category: '📖 Basics',
      items: [
        { title: 'How Pieces Move', difficulty: 'Beginner', duration: '10 min' },
        { title: 'Basic Checkmates', difficulty: 'Beginner', duration: '15 min' },
        { title: 'Special Moves', difficulty: 'Beginner', duration: '12 min' },
      ],
    },
    {
      category: '🎯 Tactics',
      items: [
        { title: 'Pins and Skewers', difficulty: 'Intermediate', duration: '20 min' },
        { title: 'Forks and Discoveries', difficulty: 'Intermediate', duration: '18 min' },
        { title: 'Advanced Tactics', difficulty: 'Advanced', duration: '25 min' },
      ],
    },
    {
      category: '🏰 Strategy',
      items: [
        { title: 'Opening Principles', difficulty: 'Beginner', duration: '15 min' },
        { title: 'Pawn Structure', difficulty: 'Intermediate', duration: '22 min' },
        { title: 'Endgame Basics', difficulty: 'Intermediate', duration: '20 min' },
      ],
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'Intermediate':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'Advanced':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-auto">
      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            📚 Learn Chess
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Master chess through interactive lessons and guided practice
          </p>
        </div>

        {/* Lessons Grid */}
        <div className="space-y-8">
          {lessons.map((category, idx) => (
            <div key={idx}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{category.category}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.items.map((lesson, lessonIdx) => (
                  <button
                    key={lessonIdx}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all text-left border-2 border-transparent hover:border-blue-500 group"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {lesson.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(lesson.difficulty)}`}>
                        {lesson.difficulty}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">⏱️ {lesson.duration}</span>
                    </div>
                    <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      Start Lesson →
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-3">More Lessons Coming Soon!</h3>
          <p className="text-blue-100 mb-4">
            We're working on adding interactive lessons, video tutorials, and personalized learning paths.
          </p>
          <ul className="space-y-2 text-sm text-blue-50">
            <li className="flex items-center gap-2">
              <span>✓</span>
              <span>Interactive board positions with hints</span>
            </li>
            <li className="flex items-center gap-2">
              <span>✓</span>
              <span>Grandmaster game analysis</span>
            </li>
            <li className="flex items-center gap-2">
              <span>✓</span>
              <span>Opening repertoire builder</span>
            </li>
            <li className="flex items-center gap-2">
              <span>✓</span>
              <span>Endgame training with tablebase</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
