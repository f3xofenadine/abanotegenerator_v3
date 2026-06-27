import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface HistoryItemProps {
  text: string;
  index: number;
  key?: any;
}

export function HistoryItem({ text, index }: HistoryItemProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative bg-slate-950/30 rounded-xl p-4 border border-slate-800 hover:border-indigo-500/25 transition-all">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/40">
        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Draft #{index}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-slate-350 hover:text-white flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 px-2.5 py-1.5 rounded-md border border-slate-700 transition-colors cursor-pointer font-semibold shadow-sm"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">{text}</p>
    </div>
  );
}
