import React, { useState, useEffect } from 'react';

interface PromptDisplayProps {
  prompt: string;
  isLoading: boolean;
  error: string | null;
}

const PromptDisplay: React.FC<PromptDisplayProps> = ({ prompt, isLoading, error }) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editablePrompt, setEditablePrompt] = useState(prompt);

  useEffect(() => {
    setEditablePrompt(prompt);
  }, [prompt]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editablePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-12 flex flex-col items-center justify-center min-h-[350px] shadow-2xl animate-in fade-in duration-500">
        <div className="relative w-28 h-28 mb-10">
           <div className="absolute inset-0 rounded-full border-[6px] border-blue-500/10"></div>
           <div className="absolute inset-0 rounded-full border-[6px] border-t-blue-600 animate-spin"></div>
           <div className="absolute inset-4 rounded-full border-[4px] border-b-purple-500 animate-spin [animation-direction:reverse]"></div>
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
           </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-2xl font-black tracking-tighter text-white">Synthesizing Visual Signal</p>
          <p className="text-blue-500 font-bold uppercase tracking-[0.2em] text-[10px] animate-pulse">Initializing Tech Master Neural Engine</p>
          <p className="text-slate-500 text-xs font-medium max-w-[250px] mx-auto mt-4">Connecting to high-speed relay nodes for accurate descriptive mapping...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/5 border border-red-500/20 rounded-[2.5rem] p-10 flex flex-col sm:flex-row items-start gap-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-white flex-shrink-0 shadow-xl shadow-red-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div className="flex-grow">
          <h3 className="text-2xl font-black text-red-500 mb-2 uppercase tracking-tight">System Interruption</h3>
          <p className="text-red-400/80 font-bold leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 transition-colors uppercase tracking-widest"
          >
            Force Restart Engine
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl transition-all animate-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div className="flex flex-col">
            <h3 className="text-2xl font-black tracking-tighter uppercase text-white">Analysis Result</h3>
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Optimized Art Command</span>
          </div>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`p-4 rounded-2xl transition-all shadow-lg ${isEditing ? 'bg-blue-600 text-white shadow-blue-500/40' : 'bg-white/5 text-slate-400 hover:text-blue-500 hover:scale-110'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
        </button>
      </div>

      <div className="relative group rounded-3xl overflow-hidden border border-white/10 bg-slate-900/60 p-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
        {isEditing ? (
          <textarea
            className="w-full min-h-[220px] p-8 bg-transparent outline-none text-xl font-bold leading-relaxed resize-none text-white selection:bg-blue-600"
            value={editablePrompt}
            onChange={(e) => setEditablePrompt(e.target.value)}
            spellCheck={false}
          />
        ) : (
          <div className="w-full min-h-[220px] p-8 text-xl font-bold leading-relaxed text-slate-100 break-words selection:bg-blue-600 selection:text-white">
            {editablePrompt}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-5 mt-10">
        <button
          onClick={handleCopy}
          className="flex-grow flex items-center justify-center gap-4 py-5 rounded-2xl bg-white text-slate-900 font-black tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Copied to Clipboard</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              <span>Copy Prompt</span>
            </>
          )}
        </button>
        <button
          onClick={() => {
            if (navigator.share) navigator.share({ text: editablePrompt, title: 'AI Generated Art Prompt' });
          }}
          className="px-10 py-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-blue-600/30"
        >
          Export
        </button>
      </div>
    </div>
  );
};

export default PromptDisplay;
