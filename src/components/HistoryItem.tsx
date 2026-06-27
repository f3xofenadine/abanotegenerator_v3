import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface HistoryItemProps {
  text: string;
  index: number;
  key?: any;
}

export function HistoryItem({ text, index }: HistoryItemProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents expanding/collapsing when clicking the copy button
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      onClick={() => setIsExpanded(!isExpanded)}
      className="group relative bg-slate-950/30 rounded-xl p-3.5 border border-slate-800 hover:border-indigo-500/25 hover:bg-slate-950/40 transition-all cursor-pointer select-none"
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/40">
        <div className="flex items-center gap-2">
          <div className="text-slate-400 group-hover:text-indigo-400 transition-colors">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Draft #{index}</span>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs text-slate-350 hover:text-white flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 px-2.5 py-1.5 rounded-md border border-slate-700 transition-colors cursor-pointer font-semibold shadow-sm"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      
      <p className={`text-slate-300 text-xs sm:text-sm leading-relaxed font-sans transition-all ${
        isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-1 text-slate-400'
      }`}>
        {text}
      </p>
    </div>
  );
}
