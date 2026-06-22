/**
 * Narrative Preview component
 */

import React, { useState } from 'react';
import { Copy, Check, FileText, Trash2, Brain, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NarrativePreviewProps {
  narrative: string;
  onReset: () => void;
  isLoading: boolean;
  onGenerate?: () => void;
}

export const NarrativePreview = ({ narrative, onReset, isLoading, onGenerate }: NarrativePreviewProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(narrative);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg flex flex-col h-full min-h-[440px] lg:min-h-[540px] overflow-hidden">
      <div className="h-12 border-b border-slate-800 flex items-center justify-between px-4 sm:px-5 bg-slate-900/40 shrink-0">
        <div className="flex items-center gap-2">
           <FileText size={16} className="text-indigo-400" />
           <span className="text-xs sm:text-sm font-bold text-slate-200 tracking-tight">Narrative Preview</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
        </div>
      </div>
      
      <div className="flex-1 p-5 sm:p-6 overflow-y-auto bg-slate-950/20">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center gap-4 text-slate-500"
            >
              <div className="w-9 h-9 border-2 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-xs font-semibold tracking-wider uppercase animate-pulse text-indigo-400">Drafting Session Note...</p>
            </motion.div>
          ) : narrative ? (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-none text-slate-200 text-sm sm:text-base font-sans leading-relaxed"
            >
              <div className="whitespace-pre-wrap bg-slate-950 p-4 sm:p-5 rounded-lg border border-slate-800 text-slate-200 text-sm sm:text-base leading-relaxed font-sans shadow-inner">
                {narrative}
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-500 py-12">
               <Brain size={56} strokeWidth={1.2} className="text-slate-700" />
               <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Selection</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex gap-3">
        {onGenerate && (
          <button
            onClick={onGenerate}
            disabled={isLoading}
            className="hidden lg:flex flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-sm hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-all items-center justify-center gap-2 cursor-pointer h-10"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Generate</span>
              </>
            )}
          </button>
        )}
        <button
          onClick={handleCopy}
          disabled={!narrative || isLoading}
          className="flex-1 bg-indigo-650 lg:bg-slate-800 border lg:border-slate-700 lg:text-slate-200 text-white py-2.5 rounded-lg text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-sm hover:bg-indigo-700 lg:hover:bg-slate-755 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer h-10"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          onClick={onReset}
          disabled={!narrative && !isLoading}
          className="px-4 py-2.5 bg-slate-800 border border-slate-700 hover:border-red-900/45 rounded-lg text-slate-400 hover:text-red-400 disabled:opacity-30 hover:bg-slate-750 transition-all flex items-center justify-center scroll-smooth duration-200 cursor-pointer h-10"
          title="Reset"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
