import React from 'react';
import { ProductAnalysisResult } from '../types';
import { Check, X, ExternalLink, ShoppingBag, Info } from 'lucide-react';
import PriceHistoryChart from './PriceHistoryChart';

interface ResultsViewProps {
  data: ProductAnalysisResult;
  query: string;
}

const ResultsView: React.FC<ResultsViewProps> = ({ data, query }) => {
  // Simple parser to split the Markdown response into sections
  const parseSection = (header: string): string[] => {
    const regex = new RegExp(`# ${header}[\\s\\S]*?(?=# |$)`, 'i');
    const match = data.rawText.match(regex);
    if (!match) return [];
    
    // Remove the header and clean up whitespace
    const content = match[0].replace(new RegExp(`# ${header}`, 'i'), '').trim();
    
    // Split by bullets if it's a list
    if (content.includes('- ')) {
      return content.split('- ').map(s => s.trim()).filter(s => s.length > 0);
    }
    
    return [content];
  };

  const overview = parseSection('產品概覽')[0] || "暫無概覽資訊。";
  const price = parseSection('價格分析')[0] || "暫無價格資訊。";
  const pros = parseSection('優點');
  const cons = parseSection('缺點');
  const verdict = parseSection('專家點評')[0] || "暫無點評。";

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* Header Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 aspect-square bg-slate-100 rounded-xl overflow-hidden relative group">
           {/* Placeholder for product image since we can't search images with grounding reliably yet without advanced logic */}
           <img 
            src={`https://picsum.photos/seed/${query.length > 0 ? query.replace(/\s/g, '') : 'shopping'}/500/500`} 
            alt="Product Representation" 
            className="w-full h-full object-cover mix-blend-multiply opacity-90 hover:scale-105 transition-transform duration-500"
           />
           <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full text-slate-700 shadow-sm">
             AI 推薦
           </div>
        </div>
        
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 capitalize">{query || "圖片搜尋結果"}</h1>
            <p className="text-slate-600 leading-relaxed mb-4">{overview}</p>
            
            <div className="flex items-center gap-2 mb-6">
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-sm font-semibold">
                    {price.split('。')[0]} {/* Attempt to grab just the first sentence of price */}
                </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <h3 className="text-emerald-800 font-semibold mb-2 flex items-center gap-2">
                    <Check size={18} /> 優點
                </h3>
                <ul className="space-y-2">
                    {pros.slice(0, 3).map((pro, i) => (
                        <li key={i} className="text-emerald-700 text-sm flex items-start gap-2">
                             <span className="mt-1.5 w-1 h-1 bg-emerald-400 rounded-full shrink-0" />
                             {pro}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                <h3 className="text-rose-800 font-semibold mb-2 flex items-center gap-2">
                    <X size={18} /> 缺點
                </h3>
                <ul className="space-y-2">
                    {cons.slice(0, 3).map((con, i) => (
                        <li key={i} className="text-rose-700 text-sm flex items-start gap-2">
                            <span className="mt-1.5 w-1 h-1 bg-rose-400 rounded-full shrink-0" />
                            {con}
                        </li>
                    ))}
                </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Verdict Column */}
        <div className="lg:col-span-2 space-y-6">
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                        <ShoppingBag size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">購買建議</h2>
                </div>
                <div className="prose prose-slate max-w-none text-slate-600">
                    <p>{verdict}</p>
                </div>
            </div>

            <PriceHistoryChart productName={query} />
        </div>

        {/* Sources Column */}
        <div className="lg:col-span-1">
             <div className="bg-slate-900 rounded-2xl p-6 shadow-lg text-slate-300 sticky top-24">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Info size={18} /> 參考來源 (PTT/Threads/論壇)
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                    資料來自即時搜尋結果與社群討論。
                </p>
                <div className="space-y-3">
                    {data.sources.filter(s => s.web?.title).map((source, idx) => (
                        <a 
                            key={idx}
                            href={source.web?.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-slate-800/50 hover:bg-slate-800 p-3 rounded-xl transition-colors group border border-slate-700"
                        >
                            <div className="text-xs text-indigo-400 mb-1 flex items-center justify-between">
                                <span>Source {idx + 1}</span>
                                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="text-sm font-medium text-slate-100 line-clamp-2">
                                {source.web?.title}
                            </div>
                        </a>
                    ))}
                    {data.sources.length === 0 && (
                        <div className="text-sm italic opacity-70">
                            無直接來源，基於 AI 一般知識庫分析。
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;