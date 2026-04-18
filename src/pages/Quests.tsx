import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Zap } from 'lucide-react';
import api from '../lib/axios';

interface Quest {
  _id: string;
  title: string;
  category: string;
  status: string;
  resin_cost: number;
}

export const Quests = () => {
  const navigate = useNavigate();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Commission' | 'Domain' | 'World'>('Domain');

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

  const displayedQuests = quests.filter(q => q.category === activeTab);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8">Quest Log</h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-800 pb-4">
        {['Commission', 'Domain', 'World'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
              activeTab === tab 
                ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab === 'Commission' ? 'Daily Commissions' : tab === 'Domain' ? 'Domains (Skills)' : 'World Quests'}
          </button>
        ))}
      </div>

      {/* Quest Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedQuests.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 font-medium">
            No active quests in this category.
          </div>
        ) : (
          displayedQuests.map((quest) => (
            <div key={quest._id} className={`glass-card p-6 flex flex-col justify-between ${quest.status === 'Completed' ? 'opacity-50 grayscale' : ''}`}>
               <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white pr-4">{quest.title}</h3>
                  {quest.status === 'Completed' && <CheckCircle className="text-[var(--color-resin)] shrink-0" />}
               </div>
               
               <div className="flex justify-between items-center mb-6">
                 <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-800 text-gray-300 uppercase tracking-widest">
                   {quest.category}
                 </span>
                 {quest.resin_cost > 0 ? (
                   <span className="flex items-center gap-1 text-xs font-mono text-[var(--color-resin)] border border-[var(--color-resin)] px-2 py-1 rounded">
                     <Zap className="w-3 h-3" />
                     {quest.resin_cost} Resin
                   </span>
                 ) : (
                   <span className="text-xs font-mono text-gray-400 border border-gray-700 px-2 py-1 rounded">0 Resin</span>
                 )}
               </div>

               <div className="flex justify-between items-center mt-auto">
                 {quest.status === 'Available' ? (
                   <button 
                     onClick={() => handleStartDomain(quest._id)}
                     className={`w-full text-white px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                       quest.category === 'Domain' 
                         ? 'bg-[rgba(139,92,246,0.2)] hover:bg-[rgba(139,92,246,0.6)] border border-purple-500/30' 
                         : 'bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-white/10'
                     }`}
                    >
                     {quest.category === 'Domain' ? 'Enter Domain' : 'Start Quest'}
                   </button>
                 ) : (
                   <span className="w-full text-center text-gray-500 font-bold uppercase text-sm tracking-widest bg-gray-900 py-2 rounded-lg">
                      {quest.status}
                   </span>
                 )}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
