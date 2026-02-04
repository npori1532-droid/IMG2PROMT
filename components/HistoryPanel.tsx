
import React from 'react';
import { PromptHistoryItem } from '../types';

interface HistoryPanelProps {
  items: PromptHistoryItem[];
  onSelect: (item: PromptHistoryItem) => void;
  onClear: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ items, onSelect, onClear }) => {
  return (
    <div className="bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl flex flex-col h-full sticky top-28">
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
          </div>
          Archives
        </h3>
        {items.length > 0 && (
          <button onClick={onClear} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">
            Reset
          </button>
        )}
      </div>

      <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {items.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 mx-auto flex items-center justify-center text-slate-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
            </div>
            <p className="font-bold text-sm uppercase tracking-tighter">No Session History</p>
          </div>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="w-full text-left group bg-slate-50 dark:bg-white/5 hover:bg-blue-600 rounded-[1.5rem] p-4 border border-transparent hover:border-blue-400/20 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-200 flex-shrink-0 shadow-lg group-hover:scale-95 transition-transform">
                  <img src={item.imageUrl.startsWith('data') ? item.imageUrl : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=100'} alt="Archived" className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow min-w-0 flex flex-col justify-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-100 mb-1">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-white truncate">
                    {item.prompt}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
