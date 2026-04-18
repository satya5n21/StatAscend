import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import api from './lib/axios';
import { HUD } from './components/HUD';
import { Dashboard } from './pages/Dashboard';
import { Quests } from './pages/Quests';
import { FocusSanctum } from './pages/FocusSanctum';
import { GachaWish } from './pages/GachaWish';
import { Inventory } from './pages/Inventory';
import { VideoBackground } from './components/VideoBackground';

const GlobalFocusSync = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkFocusStatus = async () => {
      try {
        const response = await api.get('/focus/status');
        if (response.data?.active && location.pathname !== '/focus') {
          navigate('/focus');
        }
      } catch (err) {
        console.error("Focus sync error:", err);
      }
    };
    checkFocusStatus();
  }, [navigate, location.pathname]);

  return null;
};

function App() {
  return (
    <Router>
      <GlobalFocusSync />
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
