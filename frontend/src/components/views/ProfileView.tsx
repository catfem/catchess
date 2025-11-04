export function ProfileView() {
  // Mock user data - will be replaced with real data from Cloudflare D1
  const user = {
    username: 'Guest',
    rating: 1500,
    games: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    puzzleRating: 1200,
    joinDate: 'Today',
  };

  const stats = [
    { label: 'Games Played', value: user.games, icon: '🎮' },
    { label: 'Wins', value: user.wins, icon: '🏆', color: 'text-green-600 dark:text-green-400' },
    { label: 'Draws', value: user.draws, icon: '🤝', color: 'text-yellow-600 dark:text-yellow-400' },
    { label: 'Losses', value: user.losses, icon: '😔', color: 'text-red-600 dark:text-red-400' },
  ];

  const recentGames = [
    // Mock data - will come from D1
  ];

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-auto">
      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
              {user.username[0].toUpperCase()}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{user.username}</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-3">Member since {user.joinDate}</p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-semibold">
                  Rating: {user.rating}
                </span>
                <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full font-semibold">
                  Puzzle: {user.puzzleRating}
                </span>
              </div>
            </div>

            {/* Edit Profile Button */}
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <span className={`text-3xl font-bold ${stat.color || 'text-gray-900 dark:text-white'}`}>
                  {stat.value}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6">
            <div className="flex gap-4">
              <button className="px-4 py-4 border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold">
                Recent Games
              </button>
              <button className="px-4 py-4 border-b-2 border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold">
                Statistics
              </button>
              <button className="px-4 py-4 border-b-2 border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold">
                Achievements
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {recentGames.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No games yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start playing to build your game history!
                </p>
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                  Play Your First Game
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Game history will be displayed here */}
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🔐 Authentication Coming Soon
          </h3>
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            Sign up with Google, GitHub, or Chess.com to save your games, track your rating, and compete on leaderboards.
            All data will be securely stored in Cloudflare D1.
          </p>
        </div>
      </div>
    </div>
  );
}
