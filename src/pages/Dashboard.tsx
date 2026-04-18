import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, CheckCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import api from '../lib/axios';

interface Quest {
  _id: string;
  title: string;
  category: string;
  status: string;
  resin_cost: number;
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const response = await api.get('/quests');
        setQuests(response.data);
      } catch (error) {
        console.error("Failed to fetch quests", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuests();
  }, []);

  const handleStartDomain = (questId?: string) => {
    navigate('/focus');
  };

  if (loading) return <div className="p-8 text-center text-[var(--color-primary)]">Syncing with Adventurer's Guild...</div>;

  const archonQuest = quests.find(q => q.category === 'Boss');
  const commissions = quests.filter(q => q.category === 'Commission').slice(0, 4);
  const pityCount = 82; // This would ideally come from /me, but we'll mock it for the widget

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">

      {/* Hero Section: Current Archon Quest */}
      {archonQuest && (
        <section className="relative overflow-hidden rounded-2xl border border-gray-800 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-indigo-900 opacity-60"></div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-pink-600 rounded-full blur-[100px] opacity-40"></div>

          <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 relative">
            <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-50 px-3 py-1 rounded text-xs text-purple-300 font-bold uppercase tracking-widest border border-purple-800">
              Archon Quest
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-300 mb-2 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-pink-400" />
                Main Objective
              </h2>
              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-4">
                {archonQuest.title}
              </h1>
              <p className="text-gray-400 max-w-xl">
                This is your primary focus block. Taking on this challenge requires substantial energy but grants massive progression.
              </p>
            </div>

            <button
              onClick={() => handleStartDomain(archonQuest._id)}
              className="shrink-0 bg-white text-black px-8 py-4 rounded-xl font-black flex items-center gap-3 hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              Challenge Boss
              <span className="bg-black text-white px-2 py-1 rounded text-xs">{archonQuest.resin_cost} Resin</span>
            </button>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Daily 4 & Entry */}
        <div className="lg:col-span-2 space-y-8">

          <section>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-2xl font-bold tracking-tight">The Daily 4</h2>
              <span className="text-sm text-gray-400">Resets in 14h 22m</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {commissions.map((quest) => (
                <div key={quest._id} className={`glass-card p-4 flex flex-col justify-between ${quest.status === 'Completed' ? 'opacity-50 grayscale' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-white text-sm leading-tight pr-4">{quest.title}</h3>
                    {quest.status === 'Completed' ? (
                      <CheckCircle className="text-[var(--color-resin)] shrink-0 w-5 h-5" />
                    ) : (
                      <div className="text-xs font-mono text-pink-400 font-bold">10 Gems</div>
                    )}
                  </div>

                  {quest.status === 'Available' ? (
                    <button
                      onClick={() => handleStartDomain(quest._id)}
                      className="w-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-gray-300 py-1.5 rounded text-xs font-semibold transition-colors border border-gray-700 hover:border-gray-500"
                    >
                      Dispatch
                    </button>
                  ) : (
                    <span className="w-full text-center text-gray-600 font-bold uppercase text-xs tracking-widest bg-gray-900 py-1.5 rounded block">
                      Done
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <button
              onClick={() => navigate('/quests')}
              className="w-full relative overflow-hidden group glass-card p-6 border-gray-700 hover:border-[var(--color-primary)] transition-colors flex items-center justify-between"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[rgba(139,92,246,0.1)] to-transparent group-hover:from-[rgba(139,92,246,0.2)] transition-colors"></div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="bg-[var(--color-primary-dark)] p-3 rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.5)] group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-black uppercase tracking-wider text-white">Enter the Domains</h2>
                  <p className="text-gray-400 text-sm">Browse all pending technical tasks and skills.</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-500 group-hover:text-white group-hover:translate-x-2 transition-all relative z-10" />
            </button>
          </section>

        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-6">
          {/* Wish Tracker Widget */}
          <div className="glass-card p-6 relative overflow-hidden h-full flex flex-col justify-center border-gray-800">
            <div className="absolute right-0 top-0 w-32 h-32 bg-pink-500 rounded-full blur-[80px] opacity-20"></div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Pity Tracker</h3>

            <div className="text-center mb-6">
              <div className="text-5xl font-black text-white">{pityCount}<span className="text-2xl text-gray-500">/90</span></div>
              <p className="text-pink-400 text-sm mt-1">Guaranteed 5-Star in {90 - pityCount} pulls</p>
            </div>

            <div className="w-full bg-gray-900 rounded-full h-3 mb-6 relative overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full" style={{ width: `${(pityCount / 90) * 100}%` }}></div>
            </div>

            <button
              onClick={() => navigate('/wish')}
              className="w-full border border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-white font-bold py-2 rounded-lg transition-colors"
            >
              Go to Wish Banner
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
