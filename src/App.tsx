/**
 * ABA Session Note Generator (Selection-Based)
 */

import React, { useState, useEffect } from 'react';
import { ABAFormSessionData, GenerateResponse } from './types';
import { SelectionSection, ChipGroup } from './components/FormSections';
import { NarrativePreview } from './components/NarrativePreview';
import { Sparkles, Brain, ClipboardCheck, Wand2, RotateCcw, RefreshCw, Plus, ArrowDown, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';

const initialData: ABAFormSessionData = {
  setting: '',
  sessionEmphasis: [],
  participationLevel: 3, // Default to High (0-4)
  affectEngagement: 2, // Default to Moderate Engagement (0-4)
  strategies: [],
  promptReceptiveness: 3, // Default to Highly Effective (0-4)
  teachingTargets: [],
  behaviorSeverity: 0, // Default to None (0-4)
  behaviorTypes: [],
  additionalDetails: '',
};

const OPTIONS = {
  SETTING: ["Home", "Clinic", "School", "Community"],
  SESSION_EMPHASIS: ["Skill Acquisition", "Behavior Reduction", "Pairing/Rapport Building", "Gen/Maint"],
  STRATEGIES: ["Antecedent Strategies", "FCT", "NET", "DTT", "Differential Reinforcement", "Token Economy", "Prompting", "Errorless Learning", "Chaining/TA", "Consequence Strategies"],
  TEACHING_TARGETS: [
    "Manding for items",
    "Manding for actions",
    "Manding for help",
    "Requesting missing items",
    "Requesting a break",
    "Requesting attention",
    "Requesting information",
    "Requesting termination",
    "Requesting peer attention",
    "Manding with adjectives",
    "Manding with prepositions",
    "Labeling objects",
    "Labeling colors",
    "Labeling shapes",
    "Labeling animals",
    "Labeling helpers",
    "Labeling actions",
    "Labeling body parts",
    "Labeling emotions",
    "Labeling prepositions",
    "Labeling parts",
    "Labeling clothing",
    "Labeling foods",
    "Labeling vehicles",
    "Labeling places",
    "Labeling sounds",
    "Labeling attributes",
    "Labeling feelings",
    "Labeling sizes",
    "Labeling possession",
    "Receptive objects",
    "Receptive colors",
    "Receptive shapes",
    "Receptive animals",
    "Receptive helpers",
    "Receptive actions",
    "Receptive body parts",
    "Receptive emotions",
    "Receptive prepositions",
    "Receptive by function",
    "Receptive by feature",
    "Receptive by class",
    "Receptive clothing",
    "Receptive foods",
    "Receptive vehicles",
    "Receptive letters",
    "Receptive numbers",
    "Receptive sizes",
    "One-step instructions",
    "Two-step instructions",
    "Conditional instructions",
    "Responding to name",
    "Understanding pronouns",
    "Understanding adverbs",
    "Song fill ins",
    "Word associations",
    "Personal information",
    "Animal sounds",
    "Naming categories",
    "Identifying opposites",
    "Describing functions",
    "Describing features",
    "Describing classes",
    "Helper duties",
    "Object locations",
    "Yes no questions",
    "Wh questions",
    "Conversational turn taking",
    "Gross motor imitation",
    "Fine motor imitation",
    "Object imitation",
    "Two step imitation",
    "Oral imitation",
    "Sound echoics",
    "Syllable echoics",
    "Word echoics",
    "Phrase echoics",
    "Peer imitation",
    "Matching objects",
    "Matching pictures",
    "Non identical matching",
    "Object picture matching",
    "Sorting by color",
    "Sorting by shape",
    "Sorting by category",
    "Sorting by size",
    "Puzzle completion",
    "Block duplication",
    "Continuing patterns",
    "Independent play",
    "Peer turn taking",
    "Cooperative play",
    "Pretend play",
    "Initiating play",
    "Peer responsiveness",
    "Reading expressions",
    "Reading sight words",
    "Counting objects",
    "Writing name",
    "Visual schedules"
  ],
  BEHAVIOR_TYPES: ["Aggression", "Elopement", "Loud Vocals", "Task Refusal", "Property Destruction", "Tantrum", "SIB", "Negative Vocals"],
};

function HistoryItem({ text, index }: { text: string; index: number; key?: any }) {
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

export default function App() {
  const [formData, setFormData] = useState<ABAFormSessionData>(initialData);
  const [narrative, setNarrative] = useState<string>('');
  const [sessionNarratives, setSessionNarratives] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Suggested Targets list containing exactly 6 randomly generated acquisition targets
  const [visibleTargets, setVisibleTargets] = useState<string[]>([]);
  const [customTargetInput, setCustomTargetInput] = useState<string>('');

  const getRandomTargets = (exclude: string[] = []) => {
    // Return 6 random targets, excluding specified ones if possible
    const available = OPTIONS.TEACHING_TARGETS.filter(t => !exclude.includes(t));
    const source = available.length >= 6 ? available : OPTIONS.TEACHING_TARGETS;
    const shuffled = [...source].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  };

  const handleRefreshTargets = () => {
    setVisibleTargets(getRandomTargets(visibleTargets));
  };

  const handleAddCustomTarget = () => {
    const trimmed = customTargetInput.trim();
    if (!trimmed) return;
    
    // Add to formData.teachingTargets if not already in there
    if (!formData.teachingTargets.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        teachingTargets: [...prev.teachingTargets, trimmed]
      }));
    }
    
    // Also add to visibleTargets if not already matching
    if (!visibleTargets.includes(trimmed)) {
      setVisibleTargets(prev => [...prev, trimmed]);
    }
    
    setCustomTargetInput('');
  };

  useEffect(() => {
    setVisibleTargets(getRandomTargets());
  }, []);

  const updateField = (field: keyof ABAFormSessionData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRandomize = () => {
    const getRandom = (arr: string[], min: number, max: number = min) => {
      const count = Math.floor(Math.random() * (max - min + 1)) + min;
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    const severity = Math.floor(Math.random() * 5); // 0 to 4
    
    // Generate fresh 6 suggestions
    const newVisible = getRandomTargets();
    setVisibleTargets(newVisible);

    // Randomly select 4 targets from the new suggestions
    const selectedTargets = [...newVisible].sort(() => 0.5 - Math.random()).slice(0, 4);
    
    const newData: ABAFormSessionData = {
      ...initialData,
      setting: OPTIONS.SETTING[Math.floor(Math.random() * OPTIONS.SETTING.length)],
      sessionEmphasis: getRandom(OPTIONS.SESSION_EMPHASIS, 2, 2),
      participationLevel: Math.floor(Math.random() * 5), // 0 to 4
      affectEngagement: Math.floor(Math.random() * 5), // 0 to 4
      strategies: getRandom(OPTIONS.STRATEGIES, 4, 4),
      promptReceptiveness: Math.floor(Math.random() * 5), // 0 to 4
      teachingTargets: selectedTargets,
      behaviorSeverity: severity,
      behaviorTypes: severity !== 0 ? getRandom(OPTIONS.BEHAVIOR_TYPES, 1, 4) : [],
      additionalDetails: '',
    };

    setFormData(newData);
    setNarrative('');
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          history: sessionNarratives.slice(0, 2)
        }),
      });

      if (!response.ok) throw new Error('Generation failed');

      const data: GenerateResponse = await response.json();
      setNarrative(data.narrative);
      if (data.narrative) {
        setSessionNarratives(prev => [data.narrative, ...prev]);
      }
      
      if (window.innerWidth < 1024) {
        document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      setError('Failed to generate narrative. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm('Clear all selections?')) {
      setFormData(initialData);
      setNarrative('');
      setSessionNarratives([]);
      setVisibleTargets(getRandomTargets());
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-[#070b14] text-slate-200 font-sans selection:bg-indigo-500/20">
      <header className="h-16 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded flex items-center justify-center shadow-xs">
            <Brain size={20} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight">ABA Note Generator</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">AI Engine Active</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRandomize}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/25 rounded-lg text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-xs cursor-pointer duration-150"
          >
            <Wand2 size={14} />
            Magic Fill
          </button>
          <button 
            onClick={handleReset}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-all cursor-pointer"
            title="Reset Form"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-3.5 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Input Form */}
        <div className="lg:col-span-7 flex flex-col gap-1.5">
          <SelectionSection id="general" label="General Info">
            <ChipGroup 
              label="Setting" 
              options={OPTIONS.SETTING} 
              selected={formData.setting} 
              onChange={val => updateField('setting', val)} 
            />
            <ChipGroup 
              label="Session Emphasis" 
              options={OPTIONS.SESSION_EMPHASIS} 
              selected={formData.sessionEmphasis} 
              onChange={val => updateField('sessionEmphasis', val)}
              multiple
            />
            <div className="flex flex-col gap-4 bg-slate-950/40 p-5 rounded-lg border border-slate-800/80 mt-4">
              <div className="flex justify-between items-center mr-1">
                <span className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider">Participation Level</span>
                <span className="text-xs sm:text-sm font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/25">
                  {formData.participationLevel === 0 && "0: No Participation"}
                  {formData.participationLevel === 1 && "1: Minimal"}
                  {formData.participationLevel === 2 && "2: Moderate"}
                  {formData.participationLevel === 3 && "3: High"}
                  {formData.participationLevel === 4 && "4: Active"}
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="4" 
                step="1"
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none my-1"
                value={formData.participationLevel}
                onChange={e => updateField('participationLevel', parseInt(e.target.value))}
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider px-1">
                <span>None</span>
                <span>Minimal</span>
                <span>Moderate</span>
                <span>High</span>
                <span>Active</span>
              </div>
            </div>
          </SelectionSection>

          <SelectionSection 
            id="affect" 
            label="Affect & Engagement"
            note="Select engagement."
          >
            <div className="flex flex-col gap-4 bg-slate-950/40 p-5 rounded-lg border border-slate-800/80">
              <div className="flex justify-between items-center mr-1">
                <span className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider">Engagement Level</span>
                <span className="text-xs sm:text-sm font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/25">
                  {formData.affectEngagement === 0 && "0: No Engagement"}
                  {formData.affectEngagement === 1 && "1: Low Engagement"}
                  {formData.affectEngagement === 2 && "2: Moderate"}
                  {formData.affectEngagement === 3 && "3: High"}
                  {formData.affectEngagement === 4 && "4: Most Engaged"}
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="4" 
                step="1"
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none my-1"
                value={formData.affectEngagement}
                onChange={e => updateField('affectEngagement', parseInt(e.target.value))}
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider px-1">
                <span>None</span>
                <span>Low</span>
                <span>Moderate</span>
                <span>High</span>
                <span>Max</span>
              </div>
            </div>
          </SelectionSection>

          <SelectionSection 
            id="strategies" 
            label="ABA Strategies"
            note="Select strategies."
          >
            <ChipGroup 
              options={OPTIONS.STRATEGIES} 
              selected={formData.strategies} 
              onChange={val => updateField('strategies', val)} 
              multiple
            />
          </SelectionSection>

          <SelectionSection 
            id="receptiveness" 
            label="Prompt Receptiveness"
            note="Evaluate prompting."
          >
            <div className="flex flex-col gap-4 bg-slate-950/40 p-5 rounded-lg border border-slate-800/80">
              <div className="flex justify-between items-center mr-1">
                <span className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider">Prompt Effectiveness</span>
                <span className="text-xs sm:text-sm font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/25">
                  {formData.promptReceptiveness === 0 && "0: Ineffective"}
                  {formData.promptReceptiveness === 1 && "1: Low"}
                  {formData.promptReceptiveness === 2 && "2: Moderate"}
                  {formData.promptReceptiveness === 3 && "3: High"}
                  {formData.promptReceptiveness === 4 && "4: Effective"}
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="4" 
                step="1"
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none my-1"
                value={formData.promptReceptiveness}
                onChange={e => updateField('promptReceptiveness', parseInt(e.target.value))}
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider px-1">
                <span>Ineffective</span>
                <span>Low</span>
                <span>Moderate</span>
                <span>High</span>
                <span>Effective</span>
              </div>
            </div>
          </SelectionSection>

          <SelectionSection 
            id="targets" 
            label="Teaching Targets"
            note="Select targeted domains."
          >
            <div className="flex items-center justify-between gap-4 mb-3">
              <span className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider">Suggested Targets</span>
              <button
                type="button"
                onClick={handleRefreshTargets}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded-lg text-xs font-semibold text-slate-350 transition-all active:scale-95 shrink-0 cursor-pointer h-9 shadow-xs"
                title="Roll 6 new suggestions"
              >
                <RefreshCw size={13} className="text-slate-400" />
                Refresh
              </button>
            </div>
            
            <ChipGroup 
              options={Array.from(new Set([...visibleTargets, ...formData.teachingTargets]))} 
              selected={formData.teachingTargets} 
              onChange={val => updateField('teachingTargets', val)} 
              multiple
            />

            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80 mt-5 shadow-inner">
              <input 
                type="text"
                placeholder="Add niche or custom target..."
                value={customTargetInput}
                onChange={e => setCustomTargetInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTarget();
                  }
                }}
                className="flex-1 bg-slate-900 sm:bg-transparent text-slate-200 placeholder:text-slate-500 text-xs sm:text-sm outline-none px-3 py-2 border border-slate-800 focus:border-indigo-500/60 sm:border-0 rounded-lg"
              />
              <button
                type="button"
                onClick={handleAddCustomTarget}
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shrink-0 shadow-xs cursor-pointer h-9"
              >
                <Plus size={15} />
                Add Custom (Enter)
              </button>
            </div>
          </SelectionSection>

          <SelectionSection id="behavior" label="Problem Behavior">
            <div className="flex flex-col gap-4 bg-slate-950/40 p-5 rounded-lg border border-slate-800/80 mb-5">
              <div className="flex justify-between items-center mr-1">
                <span className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider">Severity Range</span>
                <span className="text-xs sm:text-sm font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/25">
                  {formData.behaviorSeverity === 0 && "0: None"}
                  {formData.behaviorSeverity === 1 && "1: Occasional / Mild"}
                  {formData.behaviorSeverity === 2 && "2: Moderate"}
                  {formData.behaviorSeverity === 3 && "3: Frequent / Severe"}
                  {formData.behaviorSeverity === 4 && "4: Constant"}
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="4" 
                step="1"
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none my-1"
                value={formData.behaviorSeverity}
                onChange={e => {
                  const val = parseInt(e.target.value);
                  updateField('behaviorSeverity', val);
                  if (val === 0) {
                     updateField('behaviorTypes', []);
                  }
                }}
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider px-1">
                <span>None</span>
                <span>Occasional</span>
                <span>Moderate</span>
                <span>Frequent</span>
                <span>Constant</span>
              </div>
            </div>

            {formData.behaviorSeverity > 0 && (
              <div className="flex flex-col gap-4 mt-4">
                <ChipGroup 
                  label="Behavior Type"
                  options={OPTIONS.BEHAVIOR_TYPES} 
                  selected={formData.behaviorTypes} 
                  onChange={val => updateField('behaviorTypes', val)} 
                  multiple
                />
              </div>
            )}
          </SelectionSection>

          <SelectionSection id="additional" label="Additional Details" collapsible={true} defaultCollapsed={true}>
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider">Optional Details (No PHI)</label>
              <textarea 
                className="w-full bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm outline-none focus:border-indigo-500 transition-colors min-h-[100px] text-slate-200 font-sans shadow-inner placeholder:text-slate-500"
                placeholder="Ex. Client responded well to tokens but requested breaks..."
                value={formData.additionalDetails}
                onChange={e => updateField('additionalDetails', e.target.value)}
              />
              <p className="text-[11px] text-slate-500">Keep brief. Exclude personal identifiable details (PHI).</p>
            </div>
          </SelectionSection>

          <div className="mb-8 mt-4.5">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl font-bold uppercase tracking-wider text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 px-6 h-12.5 duration-155 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin mr-1.5" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate Narrative
                </>
              )}
            </button>
            {error && <p className="text-center text-red-500 text-xs font-semibold mt-3 uppercase tracking-wide animate-pulse">{error}</p>}
          </div>
        </div>

        {/* Preview Output */}
        <div id="preview-section" className="lg:col-span-5 h-fit lg:sticky lg:top-16 flex flex-col gap-5">
          <NarrativePreview 
            narrative={narrative} 
            onReset={handleReset} 
            isLoading={loading} 
            onGenerate={handleGenerate}
          />
          
          {sessionNarratives.length > 0 && (
            <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-md overflow-hidden flex flex-col">
              <div className="h-12 border-b border-slate-800/60 flex items-center justify-between px-5 bg-slate-900/40 shrink-0">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Session History ({sessionNarratives.length})</span>
                <span className="text-xs font-semibold text-slate-500 uppercase">This Session Only</span>
              </div>
              <div className="p-5 flex flex-col gap-4 max-h-[360px] overflow-y-auto custom-scrollbar">
                {sessionNarratives.map((narr, idx) => (
                  <HistoryItem key={idx} text={narr} index={sessionNarratives.length - idx} />
                ))}
              </div>
            </div>
          )}

          <div className="p-5 bg-indigo-950/20 rounded-xl border border-indigo-900/30 shadow-xs">
             <h3 className="text-indigo-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
               <Sparkles size={13} />
               Notice
             </h3>
             <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
               This is an AI-assisted draft template. **Review and verify** accuracy, behavior details, and HIPPA/PHI compliance before entering into your official record.
             </p>
          </div>
        </div>
      </main>

      <footer className="mt-12 py-8 bg-[#03060a] text-slate-500 border-t border-slate-900/80 px-6 mb-24 lg:mb-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs font-semibold uppercase tracking-wider flex items-center gap-3">
              <span className="text-slate-400">ABA Note Generator Pro</span>
              <div className="w-1 h-1 bg-slate-800 rounded-full" />
              <span>Version 3.2</span>
            </div>
            <div className="flex gap-4 text-xs font-semibold uppercase tracking-wider">
                <span className="hover:text-indigo-400 cursor-pointer transition-colors">Privacy Policy</span>
                <span className="hover:text-indigo-400 cursor-pointer transition-colors">Support</span>
            </div>
        </div>
      </footer>

      {/* Persistent Bottom Sidebar Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 shadow-[0_-8px_24px_rgba(0,0,0,0.6)] px-4 py-3.5 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:flex items-center gap-2.5">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-slate-405 uppercase tracking-wider">Note Assistant</span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-lg border border-slate-700/80 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all active:scale-95 cursor-pointer duration-100"
            >
              <ArrowDown size={14} />
              Jump to Narrative
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all active:scale-95 shadow-sm cursor-pointer disabled:cursor-not-allowed duration-100"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin mr-1.5" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Generate Narrative
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
