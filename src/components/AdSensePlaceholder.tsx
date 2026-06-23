import React from 'react';

interface AdSensePlaceholderProps {
  id: string;
}

export function AdSensePlaceholder({ id }: AdSensePlaceholderProps) {
  return (
    <div 
      id={id}
      className="w-full bg-slate-950/20 rounded-xl p-4 border border-dashed border-slate-850/60 flex flex-col items-center justify-center min-h-[90px] sm:min-h-[110px] my-1 transition-all duration-200 hover:border-indigo-500/10 text-center relative overflow-hidden"
    >
      {/* Visual background details to give it an elegant feel */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-slate-700/40 rounded-tl-md" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-slate-700/40 rounded-tr-md" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-slate-700/40 rounded-bl-md" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-slate-705/40 rounded-br-md" />

      <span className="text-[10px] font-bold text-slate-550 uppercase tracking-widest mb-1.5">
        Advertisement
      </span>
      
      <div className="bg-slate-900/50 px-3 py-1.5 rounded-md border border-slate-800/40 max-w-full">
        <span className="text-[11px] text-slate-450 font-mono tracking-wider break-all">
          Google AdSense Placeholder (ID: {id})
        </span>
      </div>
      
      <p className="text-[10px] text-slate-600 mt-1.5 italic font-sans">
        AdSense code or &lt;ins className="adsbygoogle"&gt; tag will render here.
      </p>
    </div>
  );
}
