
import React, { useRef, useState } from 'react';

interface ImageUploaderProps {
  imageUrl: string;
  onImageChange: (url: string, base64?: string, type?: string) => void;
  onGenerate: (url: string) => void;
  isLoading: boolean;
  onClear: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  imageUrl, 
  onImageChange, 
  onGenerate, 
  isLoading,
  onClear 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFiles(e.dataTransfer.files);
  };

  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (file?.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) return alert("File size too large (Max 5MB)");
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onImageChange(base64, base64, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl transition-all">
      <div className="flex flex-col md:flex-row gap-6 items-end mb-8">
        <div className="flex-grow w-full">
          <label className="block text-xs font-black uppercase tracking-widest mb-3 text-slate-400">
            Resource Endpoint
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Paste image link here..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 dark:text-slate-200"
              value={imageUrl.startsWith('data:') ? '' : imageUrl}
              onChange={(e) => onImageChange(e.target.value)}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </div>
          </div>
        </div>
        {imageUrl && (
          <button onClick={onClear} className="h-[60px] px-6 rounded-2xl text-slate-400 hover:text-red-500 transition-colors font-bold text-sm uppercase tracking-tighter">
            Reset
          </button>
        )}
      </div>

      <div 
        className={`relative overflow-hidden group border-2 border-dashed rounded-[1.5rem] transition-all duration-500 flex flex-col items-center justify-center min-h-[320px] cursor-pointer
          ${dragActive ? 'border-blue-500 bg-blue-500/10 scale-105' : 'border-slate-200 dark:border-white/10 hover:border-blue-500/30 dark:hover:border-white/20 bg-slate-50/50 dark:bg-slate-900/20'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleFiles(e.target.files)}/>
        
        {imageUrl ? (
          <div className="w-full h-full absolute inset-0 group">
            <img src={imageUrl} alt="Ref" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white font-bold px-6 py-2 rounded-full bg-white/20 backdrop-blur-md">Change Image</span>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 space-y-4">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-600/10 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <div>
              <p className="text-xl font-bold">Drop Image Asset</p>
              <p className="text-slate-500 font-medium">PNG, JPG, or WebP up to 5MB</p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => onGenerate(imageUrl)}
        disabled={!imageUrl || isLoading}
        className={`w-full mt-8 py-5 rounded-2xl font-black text-lg tracking-widest uppercase shadow-2xl transition-all overflow-hidden relative group
          ${!imageUrl || isLoading 
            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}
      >
        <div className="relative z-10 flex items-center justify-center gap-3">
          {isLoading ? (
            <>
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Analyzing...</span>
            </>
          ) : (
            <span>Execute Analysis</span>
          )}
        </div>
        {!isLoading && imageUrl && (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
        )}
      </button>
    </div>
  );
};

export default ImageUploader;
