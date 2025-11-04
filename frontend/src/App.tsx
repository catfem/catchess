import { useState } from 'react';
import { PlayView } from './components/views/PlayView';
import { AnalyzeView } from './components/views/AnalyzeView';
import { PuzzlesView } from './components/views/PuzzlesView';
import { LearnView } from './components/views/LearnView';
import { ProfileView } from './components/views/ProfileView';
import { SettingsView } from './components/views/SettingsView';
import { Navigation } from './components/layout/Navigation';
import { useGameStore } from './store/gameStore';

type View = 'play' | 'analyze' | 'puzzles' | 'learn' | 'profile' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<View>('play');
  const { theme } = useGameStore();
  
  const isDark = theme.mode === 'dark';

  const renderView = () => {
    switch (currentView) {
      case 'play':
        return <PlayView />;
      case 'analyze':
        return <AnalyzeView />;
      case 'puzzles':
        return <PuzzlesView />;
      case 'learn':
        return <LearnView />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <PlayView />;
    }
  };

  return (
    <div className={`h-screen flex flex-col ${isDark ? 'dark' : ''}`}>
      {/* Navigation */}
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
