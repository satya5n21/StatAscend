import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Trophy, Play, CheckCircle } from 'lucide-react';
import api from '../lib/axios';

type ViewState = 'loading' | 'idle' | 'running' | 'victory' | 'infinite' | 'claimed';

export const FocusSanctum = () => {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [timeLeft, setTimeLeft] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [rewards, setRewards] = useState<any>(null);
  const [overtimeMins, setOvertimeMins] = useState(0);
  const [forfeitProgress, setForfeitProgress] = useState(0);

  const forfeitTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get('/focus/status');
        if (res.data?.active) {
          const session = res.data.session;
          const end = session.end_time;
          setEndTime(end);
          const now = Date.now();
          if (now >= end) {
            setOvertimeMins(Math.floor((now - end) / 60000));
            setViewState('victory');
          } else {
            setTimeLeft(Math.ceil((end - now) / 1000));
            setViewState('running');
          }
        } else {
          setViewState('idle');
        }
      } catch (err) {
        console.error(err);
        setViewState('idle');
      }
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (viewState === 'running') {
      interval = setInterval(() => {
        const now = Date.now();
        if (now >= endTime) {
          setViewState('victory');
          setTimeLeft(0);
        } else {
          setTimeLeft(Math.ceil((endTime - now) / 1000));
        }
      }, 1000);
    } else if (viewState === 'infinite') {
      interval = setInterval(() => {
        const now = Date.now();
        setOvertimeMins(Math.floor((now - endTime) / 60000));
        setTimeLeft(Math.floor((now - endTime) / 1000)); // count up
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [viewState, endTime]);

  const handleStart = async (blockType: string) => {
    try {
      if (blockType === 'instant') {
        const res = await api.post('/focus/start', { block_type: 'instant' });
        setRewards(res.data.drops);
        setViewState('claimed');
        return;
      }
      const res = await api.post('/focus/start', { block_type: blockType });
      const session = res.data.session;
      setEndTime(session.end_time);
      setTimeLeft(Math.ceil((session.end_time - Date.now()) / 1000));
      setViewState('running');
    } catch (err: any) {
      if (err.response?.data?.error) {
        alert(err.response.data.error);
      }
    }
  };

  const handleClaim = async () => {
    try {
      const res = await api.post('/focus/claim');
      setRewards(res.data.drops);
      setOvertimeMins(res.data.overtime_mins);
      setViewState('claimed');
    } catch (err) {
      console.error(err);
    }
  };

  const startForfeit = () => {
    let progress = 0;
    setForfeitProgress(0);
    forfeitTimerRef.current = setInterval(async () => {
      progress += 5;
      setForfeitProgress(progress);
      if (progress >= 100) {
        stopForfeit();
        try {
          await api.post('/focus/forfeit');
          navigate('/dashboard');
        } catch (e) {
          console.error(e);
        }
      }
    }, 50);
  };

  const stopForfeit = () => {
    if (forfeitTimerRef.current) clearInterval(forfeitTimerRef.current);
    setForfeitProgress(0);
  };

  const formatTime = (seconds: number) => {
    const absSeconds = Math.abs(seconds);
    const m = Math.floor(absSeconds / 60);
    const s = absSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (viewState === 'loading') {
    return <div className="flex h-full items-center justify-center text-white">Entering Domain...</div>;
  }

  if (viewState === 'claimed' && rewards) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in relative z-10">
        <Trophy className="w-24 h-24 text-[var(--color-secondary)] mb-6 animate-bounce" />
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2">
          Domain Cleared
        </h1>
        {overtimeMins > 0 && (
          <div className="text-pink-400 font-bold tracking-widest uppercase mb-8 text-sm bg-pink-900/30 px-4 py-1 rounded-full">
            Overtime Bonus Applied (+{overtimeMins * 10} Mora)
          </div>
        )}
        <div className="glass-card p-8 flex gap-8 mb-8 text-center bg-black/60">
          <div>
            <p className="text-gray-400 uppercase tracking-widest text-sm mb-2">Exp Gained</p>
            <p className="text-4xl font-mono text-[var(--color-primary)]">+{rewards.exp}</p>
          </div>
          <div className="w-px bg-gray-700"></div>
          <div>
            <p className="text-gray-400 uppercase tracking-widest text-sm mb-2">Mora Looted</p>
            <p className="text-4xl font-mono text-yellow-400">+{rewards.mora}</p>
          </div>
        </div>
        <button onClick={() => navigate('/dashboard')} className="px-10 py-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold rounded-xl transition-colors shadow-[0_0_15px_rgba(139,92,246,0.5)]">
          Return to Guild
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-black bg-opacity-60 rounded-3xl border border-gray-800 shadow-[inset_0_0_100px_rgba(0,0,0,1)] relative overflow-hidden backdrop-blur-sm z-10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[rgba(139,92,246,0.15)] via-transparent to-transparent pointer-events-none"></div>

      {viewState === 'idle' && (
        <div className="z-10 text-center animate-fade-in w-full max-w-2xl px-6">
          <h2 className="text-3xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 uppercase tracking-[0.2em]">Select Dispatch</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button onClick={() => handleStart('skirmish')} className="glass-card p-6 flex flex-col items-center hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] group transition-all">
              <Play className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-lg mb-1">Quick Skirmish</span>
              <span className="text-gray-400 text-sm mb-3">20 Mins</span>
              <span className="text-xs font-bold bg-blue-900/40 text-blue-300 px-3 py-1 rounded-full border border-blue-800">20 Resin</span>
            </button>

            <button onClick={() => handleStart('main')} className="glass-card p-6 flex flex-col items-center hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] group transition-all">
              <Play className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-lg mb-1">Main Quest</span>
              <span className="text-gray-400 text-sm mb-3">40 Mins</span>
              <span className="text-xs font-bold bg-purple-900/40 text-purple-300 px-3 py-1 rounded-full border border-purple-800">40 Resin</span>
            </button>

            <button onClick={() => handleStart('boss')} className="glass-card p-6 flex flex-col items-center hover:border-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] group transition-all">
              <ShieldAlert className="w-8 h-8 text-red-500 mb-3 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-lg mb-1">Boss Raid</span>
              <span className="text-gray-400 text-sm mb-3">90 Mins</span>
              <span className="text-xs font-bold bg-red-900/40 text-red-300 px-3 py-1 rounded-full border border-red-800">60 Resin</span>
            </button>
          </div>

          <button onClick={() => handleStart('instant')} className="w-full glass-card p-4 flex items-center justify-center gap-3 hover:bg-green-900/20 hover:border-green-500/50 transition-all group">
            <CheckCircle className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-green-100 uppercase tracking-wider text-sm">Already Completed (Instant Log)</span>
          </button>
        </div>
      )}

      {viewState === 'running' && (
        <div className="z-10 text-center animate-fade-in">
          <h2 className="text-xl font-semibold mb-2 text-pink-400 tracking-[0.3em] uppercase animate-pulse">Deep Focus Active</h2>
          <div className="text-9xl font-mono font-light text-white mb-16 drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">
            {formatTime(timeLeft)}
          </div>

          <div className="relative inline-block">
            <button
              onMouseDown={startForfeit}
              onMouseUp={stopForfeit}
              onMouseLeave={stopForfeit}
              onTouchStart={startForfeit}
              onTouchEnd={stopForfeit}
              className="group flex items-center justify-center gap-2 px-8 py-3 rounded-full border border-gray-700 hover:border-red-500/50 bg-black/50 text-gray-400 hover:text-red-400 transition-colors overflow-hidden relative"
            >
              <div
                className="absolute left-0 top-0 bottom-0 bg-red-900/40 transition-none"
                style={{ width: `${forfeitProgress}%` }}
              ></div>
              <ShieldAlert className="w-4 h-4 z-10" />
              <span className="uppercase tracking-widest text-xs font-bold z-10">Hold to Forfeit</span>
            </button>
            <p className="text-xs text-gray-500 mt-3 max-w-[200px] mx-auto">Refunds 50% Resin. Rewards are forfeited.</p>
          </div>
        </div>
      )}

      {(viewState === 'victory' || viewState === 'infinite') && (
        <div className="z-10 text-center animate-fade-in">
          <h2 className="text-3xl font-black mb-2 text-yellow-500 tracking-[0.2em] uppercase drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
            Victory Achieved
          </h2>
          {viewState === 'infinite' ? (
            <p className="text-pink-400 uppercase tracking-widest text-sm mb-6 font-bold bg-pink-900/20 inline-block px-4 py-1 rounded-full">
              Infinite Mode Active
            </p>
          ) : (
            <p className="text-gray-300 uppercase tracking-wider text-sm mb-6">Object Complete. Choose your path.</p>
          )}

          <div className={`text-8xl font-mono font-light mb-12 drop-shadow-md ${viewState === 'infinite' ? 'text-pink-300' : 'text-gray-300'}`}>
            {viewState === 'infinite' ? '+' : ''}{formatTime(timeLeft)}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleClaim}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-10 py-4 rounded-xl font-black text-lg shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:scale-105 hover:shadow-[0_0_40px_rgba(234,179,8,0.6)] transition-all flex items-center gap-2"
            >
              <Trophy className="w-5 h-5" />
              Claim Loot & Exit
            </button>

            {viewState === 'victory' && (
              <button
                onClick={() => setViewState('infinite')}
                className="px-10 py-4 rounded-xl font-bold text-lg border border-pink-500/50 text-pink-400 hover:bg-pink-500/10 hover:border-pink-400 transition-all flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Enter Infinite Mode
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
