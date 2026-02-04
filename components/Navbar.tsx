
import React from 'react';
import { Theme } from '../types';

interface NavbarProps {
  theme: Theme;
  onToggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ theme, onToggleTheme }) => {
  return (
    <nav className="sticky top-0 z-[100] w-full border-b border-white/10 bg-white/5 dark:bg-[#020617]/40 backdrop-blur-xl">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer perspective-1000">
          <div className="relative w-12 h-12 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 group-hover:rotate-y-180 transition-transform duration-700 preserve-3d">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v19"/><path d="M5 8h14"/><path d="M15 21l-3-3-3 3"/>
            </svg>
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur-sm"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter leading-none">
              IMG 2 <span className="text-blue-500">PROMPT</span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Generator</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={onToggleTheme}
            className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 hover:border-blue-500/50 transition-all hover:scale-110 active:scale-95 shadow-lg shadow-black/5"
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            )}
          </button>
          
          <a 
            href="https://t.me/tech_master_a2z" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs tracking-widest shadow-2xl shadow-blue-600/30 hover:-translate-y-1 active:translate-y-0 transition-all"
          >
            COMMUNITY
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
