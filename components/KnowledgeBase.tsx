
import React, { useState } from 'react';
import { Book, Code2, Paintbrush, Scroll, Plus, Trash2, Edit2, Check, X, BrainCircuit, Lightbulb } from 'lucide-react';
import { KnowledgeSnippet } from '../types';

interface Props {
  knowledge: KnowledgeSnippet[];
  setKnowledge: React.Dispatch<React.SetStateAction<KnowledgeSnippet[]>>;
}

const KnowledgeBase: React.FC<Props> = ({ knowledge, setKnowledge }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<KnowledgeSnippet['category']>('LORE');
  const [newContent, setNewContent] = useState('');

  const addSnippet = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const snippet: KnowledgeSnippet = {
      id: Math.random().toString(36).substr(2, 9),
      category: newCategory,
      title: newTitle,
      content: newContent,
      isActive: true
    };
    setKnowledge(prev => [...prev, snippet]);
    resetForm();
  };

  const removeSnippet = (id: string) => {
    setKnowledge(prev => prev.filter(k => k.id !== id));
  };

  const toggleSnippet = (id: string) => {
    setKnowledge(prev => prev.map(k => k.id === id ? { ...k, isActive: !k.isActive } : k));
  };

  const resetForm = () => {
    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
  };

  const getIcon = (cat: string) => {
    switch(cat) {
      case 'LORE': return <Scroll size={16} />;
      case 'ART_STYLE': return <Paintbrush size={16} />;
      case 'CODE_PATTERN': return <Code2 size={16} />;
      case 'MECHANIC': return <Book size={16} />;
      default: return <BrainCircuit size={16} />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Neural <span className="text-omni-primary">Training</span></h2>
          <p className="text-omni-muted text-sm">Fine-tune the synthesis engine with custom datasets.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className={`px-6 py-3 font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 border ${isAdding ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-omni-primary text-black border-omni-primary hover:bg-white'}`}
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />} {isAdding ? 'Cancel' : 'Add Node'}
        </button>
      </div>

      {isAdding && (
        <div className="glass rounded-[2rem] p-8 animate-slide-up relative overflow-hidden border border-omni-primary/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-omni-muted uppercase tracking-widest">Type</label>
                <select 
                  value={newCategory} 
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-bold text-white focus:border-omni-primary focus:outline-none"
                >
                  <option value="LORE">Lore / World</option>
                  <option value="ART_STYLE">Visual Style</option>
                  <option value="CODE_PATTERN">Code Logic</option>
                  <option value="MECHANIC">Game Mechanics</option>
                </select>
             </div>
             <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-omni-muted uppercase tracking-widest">Identifier</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., 'Cyberpunk Neon Palette'"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-omni-primary focus:outline-none"
                />
             </div>
          </div>
          <div className="space-y-2 mb-6">
            <label className="text-[10px] font-bold text-omni-muted uppercase tracking-widest">Training Data</label>
            <textarea 
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Input hex codes, narrative descriptions, or code snippets..."
              className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm font-mono text-gray-300 focus:border-omni-primary focus:outline-none resize-none"
            />
          </div>
          <button 
            onClick={addSnippet}
            className="w-full py-3 bg-omni-primary/20 hover:bg-omni-primary border border-omni-primary text-omni-primary hover:text-black font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
          >
            <Check size={14} /> Compile Node
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {knowledge.map((k) => (
          <div key={k.id} className={`group relative p-6 rounded-2xl border transition-all duration-300 ${k.isActive ? 'bg-white/[0.03] border-omni-primary/30' : 'bg-black/20 border-white/5 opacity-60 grayscale'}`}>
            <div className="flex justify-between items-start mb-4">
               <div className={`p-2.5 rounded-xl ${k.isActive ? 'bg-omni-primary/20 text-omni-primary' : 'bg-white/5 text-gray-500'}`}>
                 {getIcon(k.category)}
               </div>
               <div className="flex gap-2">
                 <button onClick={() => toggleSnippet(k.id)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    {k.isActive ? <Check size={14} className="text-omni-primary"/> : <X size={14} className="text-gray-500"/>}
                 </button>
                 <button onClick={() => removeSnippet(k.id)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-500 transition-colors text-gray-500">
                    <Trash2 size={14} />
                 </button>
               </div>
            </div>
            
            <h3 className="text-sm font-bold text-white mb-2">{k.title}</h3>
            <div className="bg-black/30 rounded-lg p-3 h-20 overflow-y-auto custom-scrollbar border border-white/5 mb-3">
              <p className="text-[10px] font-mono text-gray-400 whitespace-pre-wrap">{k.content}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-widest text-omni-muted">{k.category}</span>
              <div className={`w-1.5 h-1.5 rounded-full ${k.isActive ? 'bg-omni-primary shadow-[0_0_8px_cyan]' : 'bg-gray-800'}`}></div>
            </div>
          </div>
        ))}

        {knowledge.length === 0 && !isAdding && (
          <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 text-gray-600 bg-white/[0.01]">
             <Lightbulb size={32} className="opacity-20" />
             <p className="text-xs font-bold uppercase tracking-widest">No Active Nodes</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;
