import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/10 py-24 mt-32 bg-white/5 dark:bg-[#020617]/80 backdrop-blur-3xl relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_25px_rgba(59,130,246,0.6)]"></div>
      
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-24">
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-4 group cursor-pointer perspective-1000">
              <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-800 rounded-2xl flex items-center justify-center text-white shadow-[0_15px_35px_rgba(59,130,246,0.4)] group-hover:rotate-y-180 transition-transform duration-700 preserve-3d">
                <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 3v19"/><path d="M5 8h14"/></svg>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-black tracking-tighter leading-none">IMG 2 <span className="text-blue-500">PROMT</span></span>
                <span className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-500 mt-1">GANERETOR SYSTEM</span>
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-xl leading-relaxed">
              Leading the frontier in visual intelligence. 
              Developed by the <span className="text-blue-500 underline decoration-2 underline-offset-4">Tech Master</span> ecosystem for global AI creators.
            </p>
          </div>
          
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-10">
            {/* TECH MASTER HIGHLIGHT */}
            <div className="relative group p-12 rounded-[3.5rem] bg-slate-900/60 border-2 border-blue-500/50 shadow-[0_20px_60px_rgba(59,130,246,0.2)] overflow-hidden preserve-3d transition-all hover:-translate-y-4 hover:shadow-[0_40px_80px_rgba(59,130,246,0.3)]">
              <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] group-hover:bg-blue-600/40 transition-colors"></div>
              
              <div className="relative z-10 flex flex-col gap-10">
                <div className="flex items-center gap-6">
                   <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-blue-500 via-blue-700 to-indigo-900 flex items-center justify-center text-3xl font-black text-white shadow-2xl rotate-6 group-hover:rotate-0 transition-transform duration-500">TM</div>
                   <div>
                      <h5 className="text-3xl font-black tracking-tighter text-white">Tech Master</h5>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
                         <span className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em]">Core Developer</span>
                      </div>
                   </div>
                </div>
                
                <p className="text-slate-400 font-semibold text-base leading-relaxed">Join the inner circle on Telegram for source code and system updates.</p>
                
                <a 
                  href="https://t.me/tech_master_a2z" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-5 rounded-3xl bg-blue-600 text-white flex items-center justify-center gap-3 hover:bg-blue-500 active:scale-95 transition-all shadow-2xl shadow-blue-600/30"
                >
                  <span className="font-black uppercase tracking-[0.2em] text-xs">Official Telegram</span>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                </a>
              </div>
            </div>

            {/* SECONDARY LINK */}
            <div className="relative group p-12 rounded-[3.5rem] bg-slate-900/30 border-2 border-slate-800 shadow-2xl overflow-hidden preserve-3d transition-all hover:-translate-y-4">
              <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]"></div>
              
              <div className="relative z-10 flex flex-col gap-10">
                <div className="flex items-center gap-6">
                   <div className="w-20 h-20 rounded-[2rem] bg-slate-800 flex items-center justify-center text-slate-400 shadow-xl -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                   </div>
                   <div>
                      <h5 className="text-3xl font-black tracking-tighter text-white">Bot Support</h5>
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">GajarBotolz AI</span>
                   </div>
                </div>

                <p className="text-slate-500 font-semibold text-base leading-relaxed">Automated AI assistance for developers and researchers 24/7.</p>
                
                <a 
                  href="https://t.me/GAJARBOTOLZ" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-5 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
                >
                  <span className="font-black uppercase tracking-[0.2em] text-xs">Launch Bot</span>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[12px] font-black uppercase tracking-[0.6em] text-slate-600">
          <div className="flex items-center gap-4">
             <div className="w-4 h-4 rounded-full bg-blue-500/30 animate-pulse"></div>
             <p>© {new Date().getFullYear()} TECH MASTER SYSTEMS &bull; NEURAL GEN</p>
          </div>
          <div className="flex gap-12">
            <span className="hover:text-blue-400 cursor-pointer transition-colors">API Status: Optimal</span>
            <span className="hover:text-blue-400 cursor-pointer transition-colors">V: 2.0.4-PRO</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;