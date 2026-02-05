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
  
  // Track if we are in a managed environment that supports API key selection
  const isManagedEnv = typeof window !== 'undefined' && !!(window.aistudio && window.aistudio.openSelectKey);
  
  // Initial state for hasKey
  const [hasKey, setHasKey] = useState<boolean>(!!process.env.API_KEY);
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

  // Verify platform key state
  useEffect(() => {
    const checkKey = async () => {
      if (process.env.API_KEY) {
        setHasKey(true);
        return;
      }
      if (isManagedEnv) {
        const selected = await window.aistudio.hasSelectedApiKey();
        if (selected) setHasKey(true);
      }
    };
    checkKey();
    
    // Periodically check for key injection if we don't have one yet
    const int = setInterval(checkKey, 3000);
    return () => clearInterval(int);
  }, [isManagedEnv]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('prompt_history', JSON.stringify(history.slice(0, 10)));
  }, [history]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleSelectKey = async () => {
    if (isManagedEnv) {
      await window.aistudio.openSelectKey();
      // Assume success per platform standard to avoid race conditions
      setHasKey(true);
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
      
      if (msg.includes("Requested entity was not found") || msg.includes("API key") || msg.includes("AUTH_REQUIRED")) {
        // Only reset hasKey if we are in a managed env where selection is the solution
        if (isManagedEnv) {
          setHasKey(false);
          setError("API Session Expired: Please re-initialize the connection.");
        } else {
          setError("GEMINI AUTH ERROR: Ensure process.env.API_KEY is set in your host environment.");
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

  // Only block the UI if we are in a managed environment and truly missing a key
  const showSetupScreen = isManagedEnv && !hasKey && !process.env.API_KEY;

  if (showSetupScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 relative overflow-hidden">
        <div className="glow-blob top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30"></div>
        <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-3xl border border-white/10 p-12 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] text-center space-y-10 animate-in fade-in zoom-in duration-700 relative z-10">
          <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-[2rem] mx-auto flex items-center justify-center text-white text-4xl font-black shadow-[0_20px_40px_rgba(37,99,235,0.3)] rotate-3">TM</div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Initialize Engine</h2>
            <p className="text-slate-400 font-medium leading-relaxed">
              To activate the <span className="text-blue-400 font-bold">Tech Master Neural Engine</span>, please connect a valid API Project.
            </p>
          </div>
          <button 
            onClick={handleSelectKey}
            className="w-full py-6 rounded-[1.5rem] bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-95"
          >
            Connect API Project
          </button>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="hover:text-blue-400">Project Documentation &rarr;</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-all duration-700 perspective-2000 bg-[#020617]">
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      
      <main className="flex-grow container mx-auto px-4 py-12 max-w-6xl z-10">
        <div className="flex justify-center mb-12">
          <div className="group relative floating">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative px-8 py-4 bg-slate-900/90 border border-white/10 rounded-[2rem] flex items-center gap-6 shadow-xl backdrop-blur-xl">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-xl">TM</div>
              <div className="flex flex-col">
                <span className="text-white font-black text-base uppercase tracking-widest">Tech Master Systems</span>
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em]">Architect & Lead Engineer</span>
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
          <p className="text-slate-400 max-w-2xl mx-auto text-2xl font-bold mt-10 tracking-tight leading-relaxed">
            High-speed visual semantic analysis. <br/>
            Engine: {activeEngine ? <span className="text-blue-500">{activeEngine} AI</span> : <span className="text-slate-600 italic">Standby...</span>}
          </p>
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
          </div>

          <aside className="lg:col-span-4 h-full">
            <div className="card-3d preserve-3d h-full">
              <HistoryPanel 
                items={history} 
                onSelect={(item) => {
                  setImageUrl(item.imageUrl);
                  setGeneratedPrompt(item.prompt);
                  setError(null);
                  setActiveEngine('Gemini');
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
