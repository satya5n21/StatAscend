export const Inventory = () => {
  // Mock inventory for MVP
  const items = [
    { id: 1, name: 'Purple EXP Book', amount: 15, rarity: 4 },
    { id: 2, name: 'Common Advice', amount: 89, rarity: 3 },
    { id: 3, name: 'Fragile Resin', amount: 5, rarity: 4 },
    { id: 4, name: 'Golden Ticket', amount: 1, rarity: 5 },
  ];

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8">Inventory</h1>
      
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {items.map((item) => (
          <div key={item.id} className="relative aspect-square glass-card flex flex-col items-center justify-center p-4 group cursor-pointer">
            {/* Rarity border hint */}
            <div className={`absolute top-0 left-0 w-full h-1 rounded-t-xl ${item.rarity === 5 ? 'bg-yellow-400' : item.rarity === 4 ? 'bg-purple-500' : 'bg-blue-400'}`}></div>
            
            <div className={`w-16 h-16 rounded-full mb-3 bg-gradient-to-br flex items-center justify-center text-2xl shadow-inner ${item.rarity === 5 ? 'from-yellow-600 to-yellow-800' : item.rarity === 4 ? 'from-purple-600 to-purple-800' : 'from-blue-600 to-blue-800'}`}>
              🔮
            </div>
            
            <span className="text-xs text-center font-medium text-gray-300 group-hover:text-white transition-colors line-clamp-1">{item.name}</span>
            <span className="absolute bottom-2 right-2 text-xs font-mono font-bold bg-[rgba(0,0,0,0.5)] px-1.5 rounded">{item.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
