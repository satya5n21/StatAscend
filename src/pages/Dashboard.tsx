import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, CheckCircle, ArrowRight, ShieldAlert, Sparkles, Navigation, Coins, Brain } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative z-10">
      {/* Hero Section: Current Archon Quest */}
      {archonQuest && (
        <section className="relative overflow-hidden rounded-2xl border border-gray-800 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-800 via-indigo-950 to-black opacity-80"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-pink-600 rounded-full blur-[100px] opacity-40"></div>

          <div className="relative z-10 p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-6 relative">
            <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-70 px-4 py-1.5 rounded-full text-xs text-yellow-500 font-bold uppercase tracking-widest border border-yellow-700/50 shadow-[0_0_10px_rgba(255,215,0,0.2)]">
              Archon Quest
            </div>
            <div>
              <h2 className="text-sm font-sans uppercase tracking-[0.3em] text-gray-300 mb-2 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-pink-400" />
                Main Objective
              </h2>
              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 mb-4 drop-shadow-sm">
                {archonQuest.title}
              </h1>
              <p className="text-gray-300 max-w-xl text-lg opacity-90">
                This is your primary focus block. Taking on this challenge requires substantial energy but grants massive progression.
              </p>
            </div>

            <button
              onClick={() => handleStartDomain(archonQuest._id)}
              className="shrink-0 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-8 py-4 rounded-xl font-black flex items-center gap-3 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,215,0,0.5)] border border-yellow-400"
            >
              Challenge Boss
              <span className="bg-black/80 text-yellow-400 px-2 py-1 rounded text-xs">{archonQuest.resin_cost} Resin</span>
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
              {commissions.map((quest) => {
                // Determine icon based on title string for a dynamic feel
                let QuestIcon = Navigation;
                if (quest.title.toLowerCase().includes('meditation')) QuestIcon = Brain;
                if (quest.title.toLowerCase().includes('atm')) QuestIcon = Coins;
                if (quest.title.toLowerCase().includes('office')) QuestIcon = Sparkles;

                return (
                  <div key={quest._id} className={`glass-card p-5 flex flex-col justify-between ${quest.status === 'Completed' ? 'opacity-50 grayscale' : ''}`}>
                    <div className="flex justify-between items-start mb-4 gap-3">
                      <div className="bg-gray-800/50 p-2 rounded-lg border border-gray-700">
                        <QuestIcon className="w-5 h-5 text-pink-400" />
                      </div>
                      <h3 className="font-bold text-white text-sm leading-tight flex-1">{quest.title}</h3>
                      {quest.status === 'Completed' ? (
                        <CheckCircle className="text-[var(--color-resin)] shrink-0 w-5 h-5" />
                      ) : (
                        <div className="text-xs font-mono text-pink-400 font-bold bg-pink-900/30 px-2 py-1 rounded">10 Gems</div>
                      )}
                    </div>

                    <div className="mt-auto">
                      {quest.status === 'Available' ? (
                        <div className="w-full">
                          <button
                            onClick={() => handleStartDomain(quest._id)}
                            className="w-full relative h-8 bg-gray-800 rounded overflow-hidden group cursor-pointer border border-gray-700"
                          >
                            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-600/20 to-pink-500/20 w-0 group-hover:w-full transition-all duration-700 ease-out"></div>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-pink-400 uppercase tracking-widest z-10 group-hover:text-pink-300 transition-colors">
                              Begin Commission
                            </span>
                          </button>
                        </div>
                      ) : (
                        <div className="w-full h-8 bg-gray-900 rounded flex items-center justify-center border border-gray-800">
                          <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">
                            Done
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <button
              onClick={() => navigate('/quests')}
              className="w-full py-8 relative overflow-hidden group glass-card px-8 border-yellow-700/30 hover:border-yellow-400/80 transition-colors flex items-center justify-between"
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
              <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-md tracking-tighter">
                {pityCount}<span className="text-4xl text-gray-600">/90</span>
              </div>
              <p className="text-pink-400 text-sm mt-3 uppercase tracking-widest font-semibold opacity-80">Guaranteed 5-Star in {90 - pityCount} pulls</p>
            </div>

            <div className="w-full bg-black/60 rounded-full h-4 mb-6 relative overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-gray-800">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full animate-breathe" style={{ width: `${(pityCount / 90) * 100}%` }}></div>
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
