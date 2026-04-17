import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HUD } from './components/HUD';
import { Dashboard } from './pages/Dashboard';
import { FocusSanctum } from './pages/FocusSanctum';
import { GachaWish } from './pages/GachaWish';
import { Inventory } from './pages/Inventory';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] flex flex-col">
        <HUD />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
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
