import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HUD } from './components/HUD';
import { Dashboard } from './pages/Dashboard';
import { Quests } from './pages/Quests';
import { FocusSanctum } from './pages/FocusSanctum';
import { GachaWish } from './pages/GachaWish';
import { Inventory } from './pages/Inventory';
import { VideoBackground } from './components/VideoBackground';

function App() {
  return (
    <Router>
      <div className="min-h-screen text-[var(--color-text)] flex flex-col bg-transparent">
        <VideoBackground />
        <HUD />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/quests" element={<Quests />} />
            <Route path="/focus" element={<FocusSanctum />} />
            <Route path="/wish" element={<GachaWish />} />
            <Route path="/inventory" element={<Inventory />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
