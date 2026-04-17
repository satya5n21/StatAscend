import { useNavigate } from 'react-router-dom';
import { PlayCircle, CheckCircle } from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();

  const dailyCommissions = [
    { id: 1, title: 'Code Refactoring', description: 'Clean up technical debt in the backend.', reward: '10 Aether Gems', status: 'available' },
    { id: 2, title: 'Algorithm Practice', description: 'Solve 2 Leetcode Mediums.', reward: '10 Aether Gems', status: 'completed' },
    { id: 3, title: 'Workout', description: '30 mins of intense physical training.', reward: '10 Aether Gems', status: 'available' },
    { id: 4, title: 'Read Documentation', description: 'Read system architecture docs for 20 mins.', reward: '10 Aether Gems', status: 'available' },
  ];

  const handleStartDomain = () => {
    navigate('/focus');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="flex justify-between items-end border-b border-gray-700 pb-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Adventurer's Guild</h1>
          <p className="text-[var(--color-text-muted)] mt-1">Complete your daily commissions to earn Aether Gems.</p>
        </div>
        
        <button 
          onClick={handleStartDomain}
          className="glass-card bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary)] px-6 py-3 font-bold flex items-center gap-2 hover:scale-105 shadow-[0_0_20px_rgba(139,92,246,0.4)]"
        >
          <PlayCircle className="w-5 h-5" />
          Quick-Start Domain (20 Resin)
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dailyCommissions.map((commission) => (
          <div key={commission.id} className={`glass-card p-6 flex flex-col justify-between ${commission.status === 'completed' ? 'opacity-50 grayscale' : ''}`}>
             <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">{commission.title}</h3>
                {commission.status === 'completed' && <CheckCircle className="text-[var(--color-resin)]" />}
             </div>
             <p className="text-gray-400 mb-6">{commission.description}</p>
             <div className="flex justify-between items-center mt-auto">
               <span className="text-pink-400 font-mono text-sm tracking-wide">Reward: {commission.reward}</span>
               {commission.status === 'available' ? (
                 <button className="bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-[rgba(255,255,255,0.1)]">
                   Dispatch
                 </button>
               ) : (
                 <span className="text-gray-500 font-bold uppercase text-sm tracking-widest">Done</span>
               )}
             </div>
          </div>
        ))}
      </section>
    </div>
  );
};
