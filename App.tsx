import React, { useState, useEffect } from 'react';
import { Theme, PromptHistoryItem } from './types';
import Navbar from './components/Navbar';
import ImageUploader from './components/ImageUploader';
import PromptDisplay from './components/PromptDisplay';
import HistoryPanel from './components/HistoryPanel';
import Footer from './components/Footer';
import { fetchPromptFromImage } from './services/promptService';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'dark';
  });
  
  const [hasInjectedKey, setHasInjectedKey] = useState<boolean>(!!process.env.API_KEY);
  const [isManagedEnv, setIsManagedEnv] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [base64Data, setBase64Data] = useState<string | undefined>();
  const [mimeType, setMimeType] = useState<string | undefined>();
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [activeEngine, setActiveEngine] = useState<'Aryan' | 'Gemini' | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<PromptHistoryItem[]>(() => {
    const saved = localStorage.getItem('prompt_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Environment Detection & Key Verification
  useEffect(() => {
    const checkEnvironment = async () => {
      // Check for static injected key
      if (process.env.API_KEY && process.env.API_KEY.length > 5) {
        setHasInjectedKey(true);
        return;
      }

      // Check for dynamic bridge (AI Studio / Managed hosts)
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        setIsManagedEnv(true);
        const selected = await window.aistudio.hasSelectedApiKey();
        if (selected) setHasInjectedKey(true);
      }
    };

    checkEnvironment();
    const interval = setInterval(checkEnvironment, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('prompt_history', JSON.stringify(history.slice(0, 10)));
  }, [history]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setHasInjectedKey(true);
    }
  };

  const handleGenerate = async (url: string) => {
    if (!url && !base64Data) return;
    
    setIsLoading(true);
    setError(null);
    setGeneratedPrompt('');
    setActiveEngine(null);
    
    try {
      const { prompt, engine } = await fetchPromptFromImage(url, base64Data, mimeType);
      
      setGeneratedPrompt(prompt);
      setActiveEngine(engine);
      
      const newHistoryItem: PromptHistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        imageUrl: url.startsWith('data:') ? 'Local Asset' : url,
        prompt: prompt
      };
      setHistory(prev => [newHistoryItem, ...prev]);
    } catch (err: any) {
      console.error("Critical Fault:", err);
      const msg = err.message || "";
      
      if (msg.includes("AUTH_REQUIRED")) {
        if (isManagedEnv) {
          setHasInjectedKey(false);
          setError("Session Offline: Please click the 'Connect Project' button below.");
        } else {
          // Specific instruction for Vercel/Standard hosters
          setError("API KEY REQUIRED: Local analysis requires a Gemini API Key. Please add 'API_KEY' to your Vercel Environment Variables. (Remote URLs may also fail if the secondary engine is offline or blocked by HTTPS security).");
        }
      } else {
        setError(msg || "The engine encountered an unexpected interruption.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setImageUrl('');
    setBase64Data(undefined);
    setMimeType(undefined);
    setGeneratedPrompt('');
    setError(null);
    setActiveEngine(null);
  };

  const handleImageDataChange = (url: string, base64?: string, type?: string) => {
    setImageUrl(url);
    setBase64Data(base64);
    setMimeType(type);
    setError(null);
  };

  // Setup Screen is only mandatory in managed environments that require the bridge.
  // On Vercel, we allow users to see the UI so they can try the Aryan API or see instructions.
  const showLockScreen = isManagedEnv && !hasInjectedKey;

  if (showLockScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 relative overflow-hidden">
        <div className="glow-blob top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30"></div>
        <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-3xl border border-white/10 p-12 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] text-center space-y-10 animate-in fade-in zoom-in duration-700 relative z-10">
          <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-[2rem] mx-auto flex items-center justify-center text-white text-4xl font-black shadow-[0_20px_40px_rgba(37,99,235,0.3)] rotate-3">TM</div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Initialize Engine</h2>
            <p className="text-slate-400 font-medium leading-relaxed">
              Connect your <span className="text-blue-400 font-bold">API Project</span> to activate high-performance analysis.
            </p>
          </div>
          <button 
            onClick={handleSelectKey}
            className="w-full py-6 rounded-[1.5rem] bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-95"
          >
            Connect Project
          </button>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="hover:text-blue-400">Project Console &rarr;</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-all duration-700 bg-[#020617]">
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      
      <main className="flex-grow container mx-auto px-4 py-12 max-w-6xl z-10">
        <div className="flex justify-center mb-12">
          <div className="group relative floating">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative px-8 py-4 bg-slate-900/90 border border-white/10 rounded-[2rem] flex items-center gap-6 shadow-xl backdrop-blur-xl">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-xl">TM</div>
              <div className="flex flex-col">
                <span className="text-white font-black text-base uppercase tracking-widest">Tech Master Systems</span>
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em]">Neural Engineering Lead</span>
              </div>
            </div>
          </div>
        </div>

        <header className="text-center mb-24 relative tilt-in">
          <h1 className="text-6xl md:text-[9.5rem] font-black mb-8 tracking-tighter leading-[0.85] perspective-1000">
            <span className="inline-block hover:scale-105 transition-transform duration-500 bg-clip-text text-transparent bg-gradient-to-br from-white via-blue-400 to-purple-600 animate-gradient">
              IMG TO PROMT
            </span>
            <br />
            <span className="inline-block hover:-scale-95 transition-transform duration-500 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 animate-gradient">
              GANERETOR
            </span>
          </h1>
          <div className="flex flex-col items-center gap-4 mt-10">
            <p className="text-slate-400 max-w-2xl mx-auto text-2xl font-bold tracking-tight leading-relaxed">
              Professional visual semantic mapping.
            </p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-white/5 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                <div className={`w-1.5 h-1.5 rounded-full ${activeEngine === 'Aryan' ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`}></div>
                Aryan API
              </span>
              <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-white/5 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                <div className={`w-1.5 h-1.5 rounded-full ${hasInjectedKey ? 'bg-blue-500 animate-pulse' : 'bg-red-500'}`}></div>
                Gemini Core
              </span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 perspective-2000">
          <div className="lg:col-span-8 space-y-16">
            <div className="card-3d preserve-3d">
              <ImageUploader 
                imageUrl={imageUrl} 
                onImageChange={handleImageDataChange} 
                onGenerate={handleGenerate}
                isLoading={isLoading}
                onClear={handleClear}
              />
            </div>

            {(generatedPrompt || isLoading || error) && (
              <div className="card-3d preserve-3d">
                <PromptDisplay 
                  prompt={generatedPrompt} 
                  isLoading={isLoading} 
                  error={error}
                />
              </div>
            )}
            
            {!hasInjectedKey && !isLoading && (
              <div className="p-10 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/20 text-center animate-in fade-in duration-1000">
                 <div className="w-16 h-16 bg-amber-500/20 rounded-2xl mx-auto flex items-center justify-center text-amber-500 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                 </div>
                 <h4 className="text-xl font-black text-amber-500 uppercase tracking-tight mb-2">Neural Link Warning</h4>
                 <p className="text-slate-400 font-medium mb-8 max-w-lg mx-auto leading-relaxed">
                   Analysis for <span className="text-white">local file uploads</span> is currently disabled. Please configure your API settings to enable the full Tech Master Neural Engine.
                 </p>
                 {isManagedEnv ? (
                   <button onClick={handleSelectKey} className="px-10 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-[#020617] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-amber-500/20">Connect API Project</button>
                 ) : (
                   <div className="inline-block px-6 py-3 rounded-xl bg-slate-900 border border-white/5 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                     Vercel: Configure 'API_KEY' in Environment Variables
                   </div>
                 )}
              </div>
            )}
          </div>

          <aside className="lg:col-span-4 h-full">
            <div className="card-3d preserve-3d h-full">
              <HistoryPanel 
                items={history} 
                onSelect={(item) => {
                  setImageUrl(item.imageUrl);
                  setGeneratedPrompt(item.prompt);
                  setError(null);
                }}
                onClear={() => setHistory([])}
              />
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;
