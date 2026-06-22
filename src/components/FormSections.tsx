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
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-md mb-5 overflow-hidden">
      <div 
        onClick={() => {
          if (collapsible) {
            setIsCollapsed(!isCollapsed);
          }
        }}
        className={`bg-slate-900/40 px-5 sm:px-6 py-4 border-b border-slate-850 flex justify-between items-center gap-4 ${
          collapsible ? 'cursor-pointer hover:bg-slate-800/80 transition-colors select-none' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-sm sm:text-base md:text-md font-bold tracking-tight text-slate-200">{label}</h3>
          {collapsible && (
            <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              {isCollapsed ? 'Optional' : 'Active'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {note && <span className="text-xs sm:text-sm text-slate-400 font-semibold hidden md:inline truncate">{note}</span>}
          {collapsible && (
            <div className="text-slate-400">
              {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </div>
          )}
        </div>
      </div>
      {!isCollapsed && (
        <div className="p-5 sm:p-6 flex flex-col gap-5">
          {note && <p className="text-xs md:hidden italic text-slate-400">{note}</p>}
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
    <div className="flex flex-col gap-2.5">
      {label && <label className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => handleToggle(opt)}
            className={`px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all border cursor-pointer hover:scale-[1.01] active:scale-[0.98] duration-150 ${
              isSelected(opt)
                ? 'bg-indigo-650 border-indigo-600 text-white shadow-xs font-semibold'
                : 'bg-slate-800/50 border-slate-700/80 text-slate-350 hover:border-slate-600 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};
