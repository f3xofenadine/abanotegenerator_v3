/**
 * Narrative Preview component
 */

import React, { useState } from 'react';
import { Copy, Check, FileText, Trash2, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NarrativePreviewProps {
  narrative: string;
  onReset: () => void;
  isLoading: boolean;
}

export const NarrativePreview = ({ narrative, onReset, isLoading }: NarrativePreviewProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(narrative);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#131b2e] rounded-lg border border-slate-800 shadow-xl flex flex-col h-full min-h-[440px] lg:min-h-[540px] overflow-hidden">
      <div className="h-12 border-b border-slate-800/80 flex items-center justify-between px-4 sm:px-5 bg-[#1e293b]/30 shrink-0">
        <div className="flex items-center gap-2">
           <FileText size={16} className="text-blue-400" />
           <span className="text-xs sm:text-sm font-extrabold text-slate-200 uppercase tracking-wider">Narrative Preview</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
        </div>
      </div>
      
      <div className="flex-1 p-5 sm:p-6 overflow-y-auto bg-[#0b0f19]/30">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center gap-4 text-slate-500"
            >
              <div className="w-10 h-10 border-2 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-xs sm:text-sm font-bold uppercase tracking-wider animate-pulse text-blue-400">Drafting Clinical Note...</p>
            </motion.div>
          ) : narrative ? (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-none text-slate-300 text-sm sm:text-base font-sans leading-relaxed"
            >
              <div className="whitespace-pre-wrap bg-[#1e293b]/20 p-4 sm:p-5 rounded-lg border border-slate-800/65 font-sans">
                {narrative}
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-700 py-12">
               <Brain size={56} strokeWidth={1} className="opacity-15" />
               <p className="text-center text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">Pending Selection</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-slate-800/80 bg-[#1e293b]/40 flex gap-3">
        <button
          onClick={handleCopy}
          disabled={!narrative || isLoading}
          className="flex-1 bg-blue-600/90 text-white py-3 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:bg-blue-500 disabled:opacity-30 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          onClick={onReset}
          disabled={!narrative && !isLoading}
          className="px-4 py-3 bg-[#1e293b]/80 border border-slate-700/80 rounded-lg text-slate-400 hover:text-red-400 disabled:opacity-30 transition-colors flex items-center justify-center scroll-smooth duration-200 cursor-pointer"
          title="Reset"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
