/**
 * Selection-based UI components for ABA Session Note Generator
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SelectionSectionProps {
  id: string;
  label: string;
  children: React.ReactNode;
  note?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export const SelectionSection = ({ id, label, children, note, collapsible = false, defaultCollapsed = false }: SelectionSectionProps) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsible ? defaultCollapsed : false);

  return (
    <div className="bg-[#131b2e] rounded-lg border border-slate-800 shadow-md mb-4.5 overflow-hidden">
      <div 
        onClick={() => {
          if (collapsible) {
            setIsCollapsed(!isCollapsed);
          }
        }}
        className={`bg-[#1e293b]/50 px-5 sm:px-6 py-4 border-b border-slate-800 flex justify-between items-center gap-4 ${
          collapsible ? 'cursor-pointer hover:bg-slate-700/20 transition-colors select-none' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-sm sm:text-base md:text-lg font-black uppercase tracking-wider text-slate-200">{label}</h3>
          {collapsible && (
            <span className="text-xs sm:text-sm text-blue-400/90 font-extrabold uppercase tracking-widest bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/15">
              {isCollapsed ? 'Optional' : 'Active'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {note && <span className="text-sm text-slate-400 font-semibold hidden md:inline truncate">{note}</span>}
          {collapsible && (
            <div className="text-slate-450">
              {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </div>
          )}
        </div>
      </div>
      {!isCollapsed && (
        <div className="p-5 sm:p-6 flex flex-col gap-5">
          {note && <p className="text-sm md:hidden italic text-slate-400">{note}</p>}
          {children}
        </div>
      )}
    </div>
  );
};

interface ChipGroupProps {
  label?: string;
  options: string[];
  selected: string | string[];
  onChange: (value: any) => void;
  multiple?: boolean;
}

export const ChipGroup = ({ label, options, selected, onChange, multiple = false }: ChipGroupProps) => {
  const isSelected = (opt: string) => {
    if (multiple && Array.isArray(selected)) {
      return selected.includes(opt);
    }
    return selected === opt;
  };

  const handleToggle = (opt: string) => {
    if (multiple && Array.isArray(selected)) {
      if (selected.includes(opt)) {
        onChange(selected.filter(s => s !== opt));
      } else {
        onChange([...selected, opt]);
      }
    } else {
      onChange(opt);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {label && <label className="text-sm sm:text-base font-black text-slate-300 uppercase tracking-wider">{label}</label>}
      <div className="flex flex-wrap gap-2.5">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => handleToggle(opt)}
            className={`px-4.5 py-2.5 sm:px-5 sm:py-3 rounded-lg text-sm sm:text-base md:text-lg font-bold transition-all border cursor-pointer duration-150 ${
              isSelected(opt)
                ? 'bg-blue-600 border-blue-450 text-white shadow-lg scale-[1.02]'
                : 'bg-[#1e293b]/40 border-slate-700/60 text-slate-200 hover:border-slate-500 hover:bg-slate-700/30 font-semibold'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};
