
import React, { useState, useEffect } from 'react';
import { Wand2, BrainCircuit, Zap, Globe, Server, Shield, Code2, Gauge, ZapOff, History, Search, Terminal as TerminalIcon, Check, Settings2, Sparkles, AlertTriangle } from 'lucide-react';
import { AIModel, ProjectType, AIProvider, CreationRule } from '../types.ts';

interface Props {
  initialType?: ProjectType;
  onGenerate: (params: { 
    type: ProjectType,
    prompt: string, 
    name: string, 
    modId: string, 
    version: string, 
    loader: string, 
    patchClient: boolean,
    model: AIModel,
    provider: AIProvider,
    rules: CreationRule[],
    useSearch: boolean
  }) => void;
}

interface ModelDetails {
  id: AIModel;
  name: string;
  desc: string;
  icon: any;
  color: string;
  provider: AIProvider;
  isPro: boolean;
}

const RULE_DEFINITIONS: { id: CreationRule, name: string, icon: any, desc: string }[] = [
  { id: 'OFFLINE_READY', name: 'Offline Core', icon: ZapOff, desc: 'Bypass auth checks' },
  { id: 'STRICT_TYPES', name: 'Strict Safety', icon: Shield, desc: 'Type-safe Java' },
  { id: 'MODULAR_ARCH', name: 'Modular', icon: Settings2, desc: 'Clean patterns' },
  { id: 'OPTIMIZED_PERF', name: 'Turbo', icon: Gauge, desc: 'Optimized loops' },
];

const ModGenerator: React.FC<Props> = ({ onGenerate, initialType }) => {
  const [type, setType] = useState<ProjectType>(initialType || 'MOD');
  const [prompt, setPrompt] = useState('');
  const [name, setName] = useState('New Project');
  const [modId, setModId] = useState('project_id');
  const [version, setVersion] = useState('1.21.1');
  const [loader, setLoader] = useState('Fabric');
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [model, setModel] = useState<AIModel>('gemini-3-pro-preview');
  const [selectedRules, setSelectedRules] = useState<CreationRule[]>(['OFFLINE_READY']);
  const [useSearch, setUseSearch] = useState(false);

  useEffect(() => {
    if (initialType) setType(initialType);
  }, [initialType]);

  const toggleRule = (rule: CreationRule) => {
    setSelectedRules(prev => prev.includes(rule) ? prev.filter(r => r !== rule) : [...prev, rule]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !name.trim() || !modId.trim()) return;
    onGenerate({ type, prompt, name, modId, version, loader, patchClient: false, model, provider, rules: selectedRules, useSearch });
  };

  const modelOptions: ModelDetails[] = [
    { id: 'gemini-3-pro-preview', name: 'Gemini Pro', desc: 'Complex Logic', icon: Globe, color: 'text-omni-primary', provider: 'gemini', isPro: true },
    { id: 'gpt-4o', name: 'GPT-4o', desc: 'Reasoning', icon: BrainCircuit, color: 'text-purple-400', provider: 'puter', isPro: true },
  ];

  const filteredModels = modelOptions.filter(m => m.provider === provider);

  return (
    <div className="w-full">
      {/* Type Selector */}
      <div className="flex bg-black/20 p-1.5 rounded-xl mb-8 border border-white/5">
        {['MOD', 'RESOURCEPACK', 'DATAPACK'].map((t) => (
          <button key={t} type="button" onClick={() => setType(t as ProjectType)} className={`flex-1 py-3 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all ${type === t ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-400'}`}>
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Core Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
             <label className="text-[10px] uppercase font-bold text-omni-muted tracking-widest">Project Name</label>
             <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-omni-primary focus:outline-none transition-colors" placeholder="Project Name" />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] uppercase font-bold text-omni-muted tracking-widest">Mod ID</label>
             <input type="text" value={modId} onChange={(e) => setModId(e.target.value.toLowerCase().replace(/\s+/g, '_'))} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-mono text-omni-primary focus:border-omni-primary focus:outline-none transition-colors" placeholder="mod_id" />
          </div>
        </div>

        {/* Prompt Area */}
        <div className="space-y-2">
           <div className="flex justify-between items-center">
             <label className="text-[10px] uppercase font-bold text-omni-muted tracking-widest">Blueprint Specification</label>
             <div className="flex gap-2">
                <button type="button" onClick={() => setPrompt("Create a magic wand that shoots explosive fireballs.")} className="text-[9px] px-2 py-1 rounded border border-white/10 text-gray-500 hover:text-white hover:border-white/30">Magic</button>
                <button type="button" onClick={() => setPrompt("Add a machine that crushes ores into dust.")} className="text-[9px] px-2 py-1 rounded border border-white/10 text-gray-500 hover:text-white hover:border-white/30">Tech</button>
             </div>
           </div>
           <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-300 focus:border-omni-primary focus:outline-none transition-colors resize-none placeholder:text-gray-700" placeholder="Describe functionality..." required />
        </div>

        {/* Engine Selection */}
        <div className="grid grid-cols-2 gap-4">
             {filteredModels.map((opt) => (
                <button key={opt.id} type="button" onClick={() => setModel(opt.id)} className={`relative p-4 rounded-xl border text-left transition-all ${model === opt.id ? 'bg-omni-primary/5 border-omni-primary/50' : 'bg-transparent border-white/10 hover:border-white/20'}`}>
                   <div className="flex justify-between items-start mb-2">
                      <opt.icon size={20} className={model === opt.id ? opt.color : 'text-gray-600'} />
                      {model === opt.id && <div className="w-2 h-2 rounded-full bg-omni-primary animate-pulse"></div>}
                   </div>
                   <div className="text-xs font-bold text-white mb-0.5">{opt.name}</div>
                   <div className="text-[9px] text-gray-500 uppercase">{opt.desc}</div>
                </button>
             ))}
        </div>

        {/* Rules */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {RULE_DEFINITIONS.map((rule) => (
               <button key={rule.id} type="button" onClick={() => toggleRule(rule.id)} className={`p-3 rounded-xl border text-center flex flex-col items-center gap-2 transition-all ${selectedRules.includes(rule.id) ? 'bg-omni-primary/10 border-omni-primary text-omni-primary' : 'bg-transparent border-white/5 text-gray-600 hover:border-white/10'}`}>
                  <rule.icon size={16} />
                  <div>
                    <div className="text-[9px] font-bold uppercase">{rule.name}</div>
                  </div>
               </button>
            ))}
        </div>

        {/* Versions */}
        <div className="grid grid-cols-2 gap-6">
           <div className="space-y-2">
             <label className="text-[10px] uppercase font-bold text-omni-muted tracking-widest">Version</label>
             <select value={version} onChange={(e) => setVersion(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white focus:outline-none">
               <option value="1.21.1">1.21.1 (Latest)</option>
               <option value="1.20.1">1.20.1 (Stable)</option>
             </select>
           </div>
           {type === 'MOD' && (
             <div className="space-y-2">
               <label className="text-[10px] uppercase font-bold text-omni-muted tracking-widest">Loader</label>
               <select value={loader} onChange={(e) => setLoader(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-bold text-white focus:outline-none">
                 <option value="Fabric">Fabric</option>
                 <option value="Forge">Forge</option>
               </select>
             </div>
           )}
        </div>

        <button type="submit" className="w-full py-5 bg-gradient-to-r from-omni-secondary to-blue-600 rounded-xl text-white font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(112,0,255,0.4)] transition-all flex items-center justify-center gap-3">
           <Sparkles size={18} /> Initiate Synthesis
        </button>
      </form>
    </div>
  );
};

export default ModGenerator;
