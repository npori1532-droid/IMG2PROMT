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
  
  const [imageUrl, setImageUrl] = useState<string>('');
  const [base64Data, setBase64Data] = useState<string | undefined>();
  const [mimeType, setMimeType] = useState<string | undefined>();
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<PromptHistoryItem[]>(() => {
    const saved = localStorage.getItem('prompt_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('prompt_history', JSON.stringify(history.slice(0, 10)));
  }, [history]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleGenerate = async (url: string) => {
    if (!url && !base64Data) return;
    setIsLoading(true);
    setError(null);
    setGeneratedPrompt('');
    
    try {
      const result = await fetchPromptFromImage(url, base64Data, mimeType);
      
      if (!result) throw new Error("Visual signature could not be extracted.");
      
      setGeneratedPrompt(result);
      
      const newHistoryItem: PromptHistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        imageUrl: url.startsWith('data:') ? 'Local Asset' : url,
        prompt: result
      };
      setHistory(prev => [newHistoryItem, ...prev]);
    } catch (err: any) {
      console.error("App Analysis Error:", err);
      setError(err.message || "Network Error: System unresponsive.");
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
  };

  const handleImageDataChange = (url: string, base64?: string, type?: string) => {
    setImageUrl(url);
    setBase64Data(base64);
    setMimeType(type);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col transition-all duration-700 perspective-2000">
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      
      <main className="flex-grow container mx-auto px-4 py-12 max-w-6xl z-10">
        <div className="flex justify-center mb-10">
          <div className="group relative floating">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-xl">TM</div>
              <div className="flex flex-col">
                <span className="text-slate-800 dark:text-white font-black text-base uppercase tracking-widest">Tech Master Systems</span>
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em]">Architect & Lead Engineer</span>
              </div>
            </div>
          </div>
        </div>

        <header className="text-center mb-24 relative tilt-in">
          <h1 className="text-6xl md:text-[10rem] font-black mb-6 tracking-tighter leading-[0.8] perspective-1000">
            <span className="inline-block hover:scale-110 transition-transform duration-500 bg-clip-text text-transparent bg-gradient-to-br from-white via-blue-400 to-purple-600 animate-gradient">
              IMG TO PROMT
            </span>
            <br />
            <span className="inline-block hover:-scale-90 transition-transform duration-500 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-indigo-400 to-blue-500 animate-gradient">
              GANERETOR
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-2xl font-bold mt-8 tracking-tight">
            Advanced vision analysis. Powered by <span className="text-blue-500">Tech Master AI</span>.
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
