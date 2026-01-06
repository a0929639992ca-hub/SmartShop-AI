import React, { useState, useRef } from 'react';
import { Search, Sparkles, Loader2, ShoppingCart, Camera, X } from 'lucide-react';
import { searchProduct } from './services/geminiService';
import { ProductAnalysisResult } from './types';
import ResultsView from './components/ResultsView';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProductAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection (Camera or Gallery)
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,") for Gemini API if needed, 
        // but currently our service handles the split in logic or passes full string depending on implementation.
        // The @google/genai inlineData usually expects pure base64.
        const base64Data = base64String.split(',')[1];
        setSelectedImage(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && !selectedImage) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await searchProduct(query, selectedImage || undefined);
      setData(result);
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("發生未預期的錯誤。");
        }
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetSearch = () => {
    setData(null);
    setQuery('');
    clearImage();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-[Inter]">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetSearch}>
            <div className="bg-indigo-600 p-2 rounded-lg">
                <ShoppingCart className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              智選購物 AI
            </span>
          </div>
          
          {/* Mini search bar when scrolled or in results view */}
          {data && (
             <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8 relative">
                 <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="搜尋其他產品..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
                 />
                 <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
             </form>
          )}

          <div className="text-sm font-medium text-slate-500">
            Powered by Gemini
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col p-4 md:p-8">
        
        {/* Initial Empty State */}
        {!data && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full text-center space-y-8 mt-[-10vh]">
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium">
                    <Sparkles size={14} /> 
                    <span>AI 智慧比價助手</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                  即時搜尋最優惠價格 & <br/>
                  <span className="text-indigo-600">PTT/Threads 真實評價</span>
                </h1>
                <p className="text-lg text-slate-500 max-w-lg mx-auto">
                  拍張照或輸入產品名稱。我們會搜尋全網論壇，為您整理優缺點與價格分析。
                </p>
            </div>

            <form onSubmit={handleSearch} className="w-full relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-200"></div>
                <div className="relative flex items-center bg-white rounded-2xl shadow-xl border border-slate-100 p-2">
                    
                    {/* Search Icon */}
                    <Search className="ml-4 text-slate-400 w-6 h-6 shrink-0" />
                    
                    {/* Image Preview (if selected) */}
                    {selectedImage && (
                        <div className="ml-3 relative shrink-0">
                            <img 
                                src={`data:image/jpeg;base64,${selectedImage}`} 
                                alt="Preview" 
                                className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                            />
                            <button 
                                type="button"
                                onClick={clearImage}
                                className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-0.5 hover:bg-slate-700"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    )}

                    {/* Input Field */}
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={selectedImage ? "想問什麼關於這產品的問題?" : "例如: Sony XM5, Dyson 吹風機..."}
                        className="w-full p-4 text-lg bg-transparent border-none focus:ring-0 focus:outline-none text-slate-800 placeholder:text-slate-300"
                        autoFocus
                    />
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mr-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="拍照或上傳圖片"
                        >
                            <Camera size={24} />
                        </button>
                        
                        <button 
                            type="submit"
                            disabled={!query.trim() && !selectedImage}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                        >
                            搜尋
                        </button>
                    </div>
                </div>
            </form>

            <div className="flex flex-wrap gap-3 justify-center text-sm text-slate-400">
                <span>熱門搜尋:</span>
                {['iPhone 16 Pro', 'Dyson Airstrait', 'PS5 Slim', '富士相機'].map(term => (
                    <button 
                        key={term}
                        onClick={() => { setQuery(term); clearImage(); const fakeEvent = { preventDefault: () => {} } as React.FormEvent; handleSearch(fakeEvent); }}
                        className="hover:text-indigo-600 underline decoration-dotted transition-colors"
                    >
                        {term}
                    </button>
                ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="text-indigo-600 w-6 h-6 animate-pulse" />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold text-slate-800">正在分析產品資訊...</h3>
                    <p className="text-slate-500">正在掃描 PTT, Threads 與各大論壇評價。</p>
                </div>
            </div>
        )}

        {/* Error State */}
        {error && !loading && (
             <div className="max-w-lg mx-auto mt-20 p-6 bg-rose-50 border border-rose-200 rounded-xl text-center">
                <h3 className="text-rose-700 font-bold mb-2">糟糕！發生了一些錯誤。</h3>
                <p className="text-rose-600 mb-4">{error}</p>
                <button 
                    onClick={() => { setError(null); setData(null); }}
                    className="text-sm font-semibold text-rose-800 hover:underline"
                >
                    再試一次
                </button>
             </div>
        )}

        {/* Results */}
        {data && !loading && (
            <ResultsView data={data} query={query} />
        )}

      </main>
    </div>
  );
};

export default App;