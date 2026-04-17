import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';
import api from '../lib/axios';

export const GachaWish = () => {
  const [isWishing, setIsWishing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleWish = async () => {
    setIsWishing(true);
    setError('');
    setResult(null);

    try {
      // Simulate slow animation delay before API resolves for suspense
      const [res] = await Promise.all([
        api.post('/wish'),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);
      setResult(res.data.reward);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to connect to Celestia.');
    } finally {
       setIsWishing(false);
    }
  };

  const getRarityColor = (rarity: number) => {
    switch (rarity) {
      case 5: return 'text-yellow-400 from-yellow-600 to-yellow-300';
      case 4: return 'text-purple-400 from-purple-700 to-purple-400';
      default: return 'text-blue-400 from-blue-700 to-blue-400';
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative">
      {/* Background Banner Graphic */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-black"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600 rounded-full blur-[150px]"></div>
      </div>

      <div className="z-10 text-center w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {!result && !isWishing && (
            <motion.div 
              key="banner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card p-12"
            >
              <h2 className="text-4xl font-black mb-4 uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500">
                Epitome Invocation
              </h2>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">Spend your hard-earned Aether Gems to invoke reality-altering wisdom and productivity buffs.</p>
              
              {error && <p className="text-red-400 mb-4 font-bold">{error}</p>}
              
              <button 
                onClick={handleWish}
                className="bg-white text-black px-8 py-3 rounded-full font-extrabold text-lg flex items-center gap-3 mx-auto hover:bg-gray-200 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.4)]"
              >
                <Sparkles className="w-5 h-5 text-purple-600" />
                Wish 1x (160 Gems)
              </button>
            </motion.div>
          )}

          {isWishing && (
             <motion.div
               key="wishing"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="flex flex-col items-center gap-6"
             >
               {/* Shooting star animation */}
               <motion.div 
                 animate={{ rotate: 360, scale: [1, 1.5, 1] }} 
                 transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                 className="w-16 h-16 rounded-full border-t-4 border-l-4 border-pink-400 blur-[2px]"
               />
               <p className="text-xl font-bold tracking-[0.3em] uppercase text-pink-300 animate-pulse">A star is falling...</p>
             </motion.div>
          )}

          {result && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.5, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className={`glass-card p-12 relative overflow-hidden border-2 ${result.rarity === 5 ? 'border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.5)]' : result.rarity === 4 ? 'border-purple-400 shadow-[0_0_30px_rgba(192,132,252,0.4)]' : 'border-blue-400'}`}
            >
               <div className={`absolute inset-0 bg-gradient-to-b opacity-20 ${getRarityColor(result.rarity)}`}></div>
               
               <div className="relative z-10 flex flex-col items-center">
                 <div className="flex gap-1 mb-6">
                   {Array(result.rarity).fill(0).map((_, i) => (
                      <Star key={i} fill="currentColor" className={`w-8 h-8 ${getRarityColor(result.rarity).split(' ')[0]}`} />
                   ))}
                 </div>
                 
                 <h3 className="text-3xl font-black text-white mb-2">{result.name}</h3>
                 <p className="text-gray-400 uppercase tracking-widest text-sm mb-12">New Item Discovered</p>

                 <button 
                  onClick={() => setResult(null)}
                  className="px-6 py-2 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] rounded-lg text-white font-semibold transition-colors"
                 >
                   Confirm
                 </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
