
import React, { useState, useCallback, useEffect } from 'react';
import { 
  Shield, Download, Activity, Package, Check, Archive, FileJson, 
  User, Binary, Monitor, Cpu, Wand2, Search, Zap, CloudLightning, 
  Unlock, X, Palette, BrainCircuit, LayoutDashboard, Library, 
  TerminalSquare, BoxSelect, Menu, Sparkles, UserCircle, 
  Github, Twitter, Coffee, Code2
} from 'lucide-react';
import JSZip from 'jszip';

import { AppState, LogEntry, ModPlan, AIModel, AIProvider, ProjectType, DownloadOption, CreationRule, KnowledgeSnippet } from './types.ts';
import { createMod, createResourcePack, createDataPack, patchBinary } from './services/geminiService.ts';
import FileUploader from './components/FileUploader.tsx';
import ModGenerator from './components/ModGenerator.tsx';
import Terminal from './components/Terminal.tsx';
import Modal from './components/Modal.tsx';
import KnowledgeBase from './components/KnowledgeBase.tsx';
import ModelViewer from './components/ModelViewer.tsx';

const QUOTA_LIMIT = 100;

// Sample Data
const CLIENT_LIBRARY = [
  { id: 'feather', name: 'Feather Client (Patched)', version: '1.20.4', desc: 'Performance-focused client. Auth-check removed for offline server compatibility.', tags: ['FPS', 'Offline-Mode'], type: 'client' },
  { id: 'lunar', name: 'Lunar Client (Solar Fork)', version: '1.21.0', desc: 'Popular PvP client. Patched to allow "Cracked" account login on compatible servers.', tags: ['PvP', 'Cracked'], type: 'client' },
  { id: 'badlion', name: 'Badlion Client (Free)', version: '4.0', desc: 'Optimized client with Anticheat disabled for offline/cracked server support.', tags: ['FPS', 'No-Auth'], type: 'client' },
  { id: 'labymod', name: 'LabyMod 4 (Unlocked)', version: '4.2.0', desc: 'Cosmetics & addons unlocked. Verified working on cracked servers.', tags: ['Customization', 'Offline'], type: 'client' },
  { id: 'meteor', name: 'Meteor Client', version: '1.21.1', desc: 'Advanced utility mod for Fabric. Fully open-source.', tags: ['Fabric', 'Utility'], type: 'client' },
  { id: 'aristois', name: 'Aristois', version: '1.20.4', desc: 'All-in-one mod with chat extensions.', tags: ['Fabric', 'Forge'], type: 'client' },
  { id: 'liquid', name: 'LiquidBounce Next', version: '1.20.1', desc: 'Next generation injection client.', tags: ['Fabric', 'Injection'], type: 'client' },
];

const PACK_LIBRARY = [
  { id: 'faithful', name: 'Faithful 32x', version: '1.21', desc: 'The golden standard of high-resolution vanilla.', tags: ['32x', 'Vanilla'], type: 'pack' },
  { id: 'barebones', name: 'Bare Bones', version: '1.21', desc: 'The official trailer look.', tags: ['Simple', 'FPS Boost'], type: 'pack' },
  { id: 'fresh', name: 'Fresh Animations', version: '1.19+', desc: 'Overhauls entity animations.', tags: ['Animation', 'Resource'], type: 'pack' },
];

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'library' | 'train' | 'about'>('home');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [modPlan, setModPlan] = useState<ModPlan | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tree' | 'features' | 'install' | 'code'>('install');
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [progress, setProgress] = useState(0); // Progress Bar State
  
  const [knowledge, setKnowledge] = useState<KnowledgeSnippet[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [usageCount, setUsageCount] = useState(0);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const ts = new Date().toLocaleTimeString([], { hour12: false });
    setLogs(prev => [...prev, { id: Math.random().toString(36), message, timestamp: ts, type }]);
    
    // Simulate progress based on activity
    setProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.floor(Math.random() * 10) + 2;
    });
  }, []);

  const handlePatchBinary = async (file: File) => {
    if (usageCount >= QUOTA_LIMIT) { setAppState(AppState.QUOTA_EXCEEDED); return; }
    setAppState(AppState.PATCHING);
    setLogs([]);
    setProgress(5);
    addLog(`INIT: Mounting [${file.name}] for Injection...`, 'info');
    setUsageCount(prev => prev + 1);
    try {
      const plan = await patchBinary(file.name, 'gemini', addLog);
      setModPlan(plan);
      const zip = new JSZip();
      plan.files.forEach(f => { 
        let content = f.content;
        if (f.encoding === 'base64') content = content.replace(/^data:image\/[a-z]+;base64,/, "");
        zip.file(f.path, content, { base64: f.encoding === 'base64' });
      });
      setDownloadUrl(URL.createObjectURL(await zip.generateAsync({ type: "blob" })));
      setProgress(100);
      setAppState(AppState.COMPLETED);
      addLog(`SUCCESS: Patch compiled successfully.`, 'success');
    } catch (e: any) {
      setAppState(AppState.ERROR);
      setProgress(0);
      addLog(`FATAL: ${e.message}`, 'error');
    }
  };

  const handleCreate = async (params: any) => {
    if (usageCount >= QUOTA_LIMIT) { setAppState(AppState.QUOTA_EXCEEDED); return; }
    setAppState(AppState.GENERATING);
    setLogs([]);
    setProgress(5);
    addLog(`CORE: Engaging Synthesis Engine [${params.provider.toUpperCase()}]...`, 'info');
    
    if (knowledge.filter(k => k.isActive).length > 0) {
      addLog(`NEURAL: Injecting ${knowledge.filter(k => k.isActive).length} custom knowledge nodes...`, 'warning');
    }

    setUsageCount(prev => prev + 1);
    try {
      let plan: ModPlan;
      if (params.type === 'RESOURCEPACK') plan = await createResourcePack(params.prompt, params.version, params.provider, params.rules, params.useSearch, knowledge, addLog);
      else if (params.type === 'DATAPACK') plan = await createDataPack(params.prompt, params.version, params.provider, params.rules, knowledge, addLog);
      else plan = await createMod(params, knowledge, addLog);
      
      setModPlan(plan);
      
      addLog(`BUILD: Compiling artifacts...`, 'info');
      const zip = new JSZip();
      plan.files.forEach(f => { 
        let content = f.content;
        if (f.encoding === 'base64') content = content.replace(/^data:image\/[a-z]+;base64,/, "");
        zip.file(f.path, content, { base64: f.encoding === 'base64' }); 
      });
      setDownloadUrl(URL.createObjectURL(await zip.generateAsync({ type: "blob" })));
      
      setProgress(100);
      setAppState(AppState.COMPLETED);
      addLog(`SUCCESS: Build complete.`, 'success');
    } catch (e: any) { 
      setAppState(AppState.ERROR);
      setProgress(0);
      addLog(`FATAL: ${e.message}`, 'error');
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE); setModPlan(null); setLogs([]);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null); setActiveTab('install'); setProgress(0);
  };

  const getDownloadOptions = (): DownloadOption[] => {
    if (!modPlan) return [];
    const isPack = modPlan.loader === 'Resource Pack' || modPlan.loader === 'Datapack';
    return [
      { id: 'zip', name: isPack ? 'INSTALL PACK' : 'DIRECT MOD', description: 'Standard Zip Format', icon: Archive, extension: 'zip', color: 'text-omni-primary' },
      { id: 'json', name: 'MANIFEST JSON', description: 'Raw Metadata', icon: FileJson, extension: 'json', color: 'text-omni-accent' },
    ];
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-omni-bg text-omni-text font-sans selection:bg-omni-primary selection:text-black overflow-hidden">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex w-72 flex-col justify-between border-r border-white/5 bg-omni-panel/50 backdrop-blur-xl p-6 z-50">
         <div>
            <div className="flex items-center gap-3 mb-10 cursor-pointer" onClick={() => {setView('home'); resetApp();}}>
               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-omni-primary to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                 <TerminalSquare className="text-black" size={24} />
               </div>
               <div>
                 <h1 className="text-xl font-bold tracking-tight text-white leading-none">OMNI<span className="text-omni-primary">FORGE</span></h1>
                 <p className="text-[10px] font-mono text-omni-muted uppercase tracking-wider mt-1">v19.1.0 // PRO</p>
               </div>
            </div>

            <nav className="space-y-2">
               {[
                 { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
                 { id: 'library', label: 'Vault Library', icon: Library },
                 { id: 'train', label: 'Neural Training', icon: BrainCircuit },
                 { id: 'about', label: 'Profile', icon: UserCircle }
               ].map(item => (
                 <button 
                    key={item.id} 
                    onClick={() => setView(item.id as any)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 w-full group ${view === item.id ? 'bg-omni-primary/10 border border-omni-primary/20 text-omni-primary' : 'text-omni-muted hover:text-white hover:bg-white/5'}`}
                 >
                    <item.icon size={20} className={view === item.id ? 'animate-pulse' : ''} />
                    <span className="text-sm font-medium tracking-wide">{item.label}</span>
                 </button>
               ))}
            </nav>
         </div>

         <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold text-omni-muted">Sys Status</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-omni-primary animate-pulse"></span>
                <span className="text-[10px] font-bold text-omni-primary">ONLINE</span>
              </div>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-omni-primary/50 w-[80%]"></div>
            </div>
         </div>
      </aside>

      {/* --- MOBILE TOP BAR --- */}
      <div className="md:hidden flex items-center justify-between p-4 bg-omni-panel/80 backdrop-blur border-b border-white/5 z-50 sticky top-0">
          <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-omni-primary flex items-center justify-center">
                 <TerminalSquare className="text-black" size={18} />
              </div>
              <span className="font-bold text-lg">OMNI<span className="text-omni-primary">FORGE</span></span>
          </div>
          <button onClick={resetApp} className="p-2 bg-white/5 rounded-lg text-omni-primary"><Zap size={18}/></button>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow relative overflow-y-auto scroll-smooth pb-24 md:pb-10">
         <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-[0.03] pointer-events-none"></div>
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-omni-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

         <div className="max-w-7xl mx-auto p-6 md:p-12 relative z-10">
            
            {/* VIEW: TRAIN */}
            {view === 'train' && <KnowledgeBase knowledge={knowledge} setKnowledge={setKnowledge} />}

            {/* VIEW: ABOUT */}
            {view === 'about' && (
              <div className="animate-fade-in space-y-8">
                 <div className="glass rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden border border-omni-primary/20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-omni-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                       <div className="w-32 h-32 rounded-full p-1 border-2 border-omni-primary border-dashed relative">
                          <div className="w-full h-full rounded-full bg-gradient-to-tr from-gray-800 to-black overflow-hidden flex items-center justify-center">
                              <UserCircle size={80} className="text-gray-400" />
                          </div>
                          <div className="absolute bottom-0 right-0 p-2 bg-omni-primary rounded-full text-black shadow-lg">
                             <Zap size={16} fill="currentColor" />
                          </div>
                       </div>
                       <div className="text-center md:text-left flex-1">
                          <h2 className="text-4xl font-bold mb-2 text-white">Architect <span className="text-omni-primary">Profile</span></h2>
                          <p className="text-omni-muted mb-6 max-w-xl">
                             Lead Synthesis Engineer operating the OmniForge platform. Specializing in neural architecture search and Minecraft modification protocols.
                          </p>
                          <div className="flex flex-wrap justify-center md:justify-start gap-3">
                             <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                                <Code2 size={16} className="text-omni-secondary"/> <span className="text-xs font-bold">LVL 99 ARCHITECT</span>
                             </div>
                             <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                                <Activity size={16} className="text-green-400"/> <span className="text-xs font-bold">SYSTEM ACTIVE</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass p-6 rounded-3xl border border-white/5">
                       <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Sparkles size={18} className="text-yellow-400"/> Achievements</h3>
                       <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                             <span className="text-sm">Mods Generated</span>
                             <span className="font-mono font-bold text-omni-primary">{usageCount}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                             <span className="text-sm">Knowledge Nodes</span>
                             <span className="font-mono font-bold text-omni-secondary">{knowledge.length}</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="glass p-6 rounded-3xl border border-white/5 md:col-span-2 relative overflow-hidden">
                       <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><BrainCircuit size={18} className="text-omni-primary"/> Neural Link Status</h3>
                       <div className="h-32 flex items-center justify-center gap-1">
                           {[...Array(20)].map((_, i) => (
                             <div key={i} className="w-2 bg-omni-primary/20 rounded-full animate-pulse" style={{
                               height: `${Math.random() * 100}%`,
                               animationDelay: `${i * 0.05}s`,
                               opacity: Math.random() * 0.5 + 0.5
                             }}></div>
                           ))}
                       </div>
                       <p className="text-center text-xs font-mono text-omni-muted mt-2">UPLINK ESTABLISHED - LATENCY 12ms</p>
                    </div>
                 </div>
              </div>
            )}

            {/* VIEW: LIBRARY */}
            {view === 'library' && (
              <div className="animate-fade-in">
                 <h2 className="text-4xl md:text-5xl font-bold mb-2">The <span className="text-omni-primary">Vault</span></h2>
                 <p className="text-omni-muted mb-10">Verified Mods & Optimization Packages</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...CLIENT_LIBRARY, ...PACK_LIBRARY].map((item: any) => (
                      <div key={item.id} className="group glass p-6 rounded-2xl relative overflow-hidden transition-all hover:border-omni-primary/30 hover:translate-y-[-2px]">
                         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            {item.type === 'client' ? <CloudLightning size={80} /> : <Palette size={80} />}
                         </div>
                         <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 rounded-xl bg-white/5 ${item.type === 'client' ? 'text-omni-secondary' : 'text-omni-accent'}`}>
                               {item.type === 'client' ? <Unlock size={24} /> : <BoxSelect size={24} />}
                            </div>
                            <span className="text-[10px] font-bold px-2 py-1 rounded bg-white/5 text-omni-muted border border-white/5">{item.version}</span>
                         </div>
                         <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                         <p className="text-sm text-omni-muted mb-6 h-10 line-clamp-2">{item.desc}</p>
                         <button onClick={() => setSelectedItem(item)} className="w-full py-3 rounded-xl bg-white/5 hover:bg-omni-primary hover:text-black border border-white/10 hover:border-omni-primary transition-all font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                            <Download size={14} /> Install
                         </button>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {/* VIEW: HOME */}
            {view === 'home' && appState === AppState.IDLE && (
               <div className="animate-fade-in flex flex-col items-center pt-8 md:pt-16">
                  <div className="mb-12 text-center">
                    <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
                       OMNI<span className="text-omni-primary">FORGE</span>
                    </h1>
                    <p className="text-omni-muted font-mono text-sm md:text-base max-w-lg mx-auto">
                       Advanced Synthesis Engine for Minecraft. <br className="hidden md:block"/> Generate Mods, Patch Binaries, and Train Neural Models.
                    </p>
                  </div>

                  <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
                     {/* Patcher Card */}
                     <div onClick={() => setAppState(AppState.IDLE)} className="glass p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden group cursor-pointer border hover:border-omni-primary/50 transition-all">
                        <div className="absolute inset-0 bg-gradient-to-br from-omni-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                           <div className="w-14 h-14 rounded-2xl bg-omni-primary/10 flex items-center justify-center text-omni-primary mb-6 group-hover:scale-110 transition-transform">
                              <Shield size={32} />
                           </div>
                           <h3 className="text-2xl font-bold mb-2">Binary Patcher</h3>
                           <p className="text-sm text-omni-muted mb-8">Inject offline compatibility layers into existing .jar files without decompilation.</p>
                           <FileUploader onFileSelect={handlePatchBinary} mode="convert" />
                        </div>
                     </div>

                     {/* Generator Card */}
                     <div className="glass p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden group border hover:border-omni-secondary/50 transition-all flex flex-col">
                        <div className="absolute inset-0 bg-gradient-to-br from-omni-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10 flex-grow">
                           <div className="w-14 h-14 rounded-2xl bg-omni-secondary/10 flex items-center justify-center text-omni-secondary mb-6 group-hover:scale-110 transition-transform">
                              <Wand2 size={32} />
                           </div>
                           <h3 className="text-2xl font-bold mb-2">Neural Generator</h3>
                           <p className="text-sm text-omni-muted mb-8">Synthesize complete Mods, Resource Packs, and Datapacks using AI.</p>
                           <ModGenerator onGenerate={handleCreate} />
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* VIEW: PROCESSING / RESULT */}
            {appState !== AppState.IDLE && (
               <div className="animate-slide-up grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                  <div className="lg:col-span-8 flex flex-col gap-6">
                     {/* Console */}
                     <div className="glass rounded-2xl overflow-hidden border border-white/10 flex flex-col h-[400px]">
                        <div className="bg-black/40 px-6 py-4 border-b border-white/5 flex justify-between items-center relative overflow-hidden">
                           {/* PROGRESS BAR */}
                           <div className="absolute bottom-0 left-0 h-0.5 bg-omni-primary transition-all duration-300 shadow-[0_0_10px_#00f0ff]" style={{ width: `${progress}%` }}></div>

                           <div className="flex items-center gap-3 relative z-10">
                              <TerminalSquare size={16} className="text-omni-primary" />
                              <span className="text-xs font-bold uppercase tracking-widest">System Output</span>
                           </div>
                           <div className="flex gap-2 relative z-10">
                             <div className="flex gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500/20"></span>
                                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></span>
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500/20"></span>
                             </div>
                           </div>
                        </div>
                        <div className="flex-grow overflow-hidden p-2 bg-[#020408]">
                           <Terminal logs={logs} />
                        </div>
                     </div>

                     {/* Code/Files Viewer */}
                     {modPlan && (
                        <div className="glass rounded-2xl overflow-hidden flex flex-col h-[500px]">
                           <div className="flex border-b border-white/5 bg-black/20 overflow-x-auto no-scrollbar">
                              {['install', 'code', 'features'].map(t => (
                                 <button 
                                    key={t}
                                    onClick={() => setActiveTab(t as any)}
                                    className={`px-8 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === t ? 'border-omni-primary text-white bg-white/5' : 'border-transparent text-omni-muted hover:text-white'}`}
                                 >
                                    {t}
                                 </button>
                              ))}
                           </div>
                           <div className="p-0 flex-grow overflow-hidden">
                              {activeTab === 'install' && (
                                 <div className="p-8 space-y-4 overflow-y-auto h-full">
                                    <h3 className="font-bold text-lg mb-4">Instructions</h3>
                                    {modPlan.usageInstructions?.map((inst, i) => (
                                       <div key={i} className="flex gap-4 items-start p-4 rounded-xl bg-white/5 border border-white/5">
                                          <span className="flex-shrink-0 w-6 h-6 rounded bg-omni-primary/20 text-omni-primary flex items-center justify-center text-xs font-bold">{i+1}</span>
                                          <p className="text-sm text-gray-300 font-mono leading-relaxed">{inst}</p>
                                       </div>
                                    ))}
                                 </div>
                              )}
                              {activeTab === 'code' && (
                                 <div className="flex h-full">
                                    <div className="w-1/3 border-r border-white/5 overflow-y-auto p-2 bg-black/20">
                                       {modPlan.files?.map((f, i) => (
                                          <button key={i} onClick={() => setSelectedFileIndex(i)} className={`w-full text-left p-3 rounded-lg text-xs font-mono truncate mb-1 transition-colors ${selectedFileIndex === i ? 'bg-omni-primary/20 text-omni-primary border border-omni-primary/20' : 'text-omni-muted hover:bg-white/5'}`}>
                                             {f.path.split('/').pop()}
                                          </button>
                                       ))}
                                    </div>
                                    <div className="w-2/3 overflow-auto bg-[#050505] p-4">
                                       <pre className="text-[10px] md:text-xs font-mono text-gray-400 whitespace-pre-wrap font-light">{modPlan.files?.[selectedFileIndex]?.content}</pre>
                                    </div>
                                 </div>
                              )}
                           </div>
                        </div>
                     )}
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                     {/* 3D Model Viewer for Resource Packs */}
                     {modPlan?.loader === 'Resource Pack' && (
                        <ModelViewer textureData={modPlan.files?.find(f => f.path.includes('textures') && f.path.endsWith('.png'))?.content || modPlan.files?.find(f => f.path === 'pack.png')?.content} />
                     )}

                     {modPlan && (
                        <div className="glass rounded-[2rem] p-8 border border-omni-primary/20 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-8 opacity-10">
                              <Package size={100} />
                           </div>
                           <span className="inline-block px-3 py-1 rounded-full bg-omni-primary/10 text-omni-primary text-[10px] font-bold uppercase tracking-widest mb-4 border border-omni-primary/20">Build Successful</span>
                           <h2 className="text-3xl font-bold mb-2 leading-tight">{modPlan.name}</h2>
                           <p className="text-xs font-mono text-omni-muted mb-8">{modPlan.modId} • {modPlan.version}</p>
                           
                           <div className="space-y-3">
                              {getDownloadOptions().map(opt => (
                                 <button key={opt.id} onClick={() => {
                                    const a = document.createElement('a');
                                    a.href = downloadUrl!;
                                    a.download = `${modPlan.modId}.${opt.extension}`;
                                    a.click();
                                 }} className="w-full group relative overflow-hidden rounded-xl p-4 bg-white/5 border border-white/10 hover:border-omni-primary transition-all text-left">
                                    <div className="absolute inset-0 bg-omni-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    <div className="relative z-10 flex items-center justify-between">
                                       <div className="flex items-center gap-4">
                                          <div className={`p-2 rounded-lg bg-black/40 ${opt.color}`}>
                                             <opt.icon size={20} />
                                          </div>
                                          <div>
                                             <div className="text-xs font-bold uppercase tracking-widest">{opt.name}</div>
                                             <div className="text-[10px] text-omni-muted">{opt.description}</div>
                                          </div>
                                       </div>
                                       <Download size={18} className="text-white opacity-50 group-hover:opacity-100" />
                                    </div>
                                 </button>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            )}

         </div>
      </main>

      {/* --- MOBILE BOTTOM NAV --- */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-omni-panel/90 backdrop-blur-xl border-t border-white/5 flex justify-around p-2 z-50 pb-safe">
         {[
            { id: 'home', label: 'Home', icon: LayoutDashboard },
            { id: 'library', label: 'Vault', icon: Library },
            { id: 'train', label: 'Train', icon: BrainCircuit },
            { id: 'about', label: 'Profile', icon: UserCircle }
         ].map(item => (
            <button 
               key={item.id} 
               onClick={() => {setView(item.id as any); if(item.id === 'home') resetApp();}}
               className={`flex flex-col items-center gap-1 p-2 rounded-xl w-full transition-colors ${view === item.id ? 'text-omni-primary' : 'text-gray-500'}`}
            >
               <item.icon size={20} className={view === item.id ? 'animate-float' : ''} />
               <span className="text-[10px] font-medium">{item.label}</span>
            </button>
         ))}
      </nav>

      {/* Download Confirmation Modal */}
      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title="Vault Extraction">
         <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4 text-omni-primary animate-pulse-slow">
               <Download size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">{selectedItem?.name}</h3>
            <p className="text-sm text-omni-muted mb-6">Confirm secure download from OmniForge Vault?</p>
            <button onClick={() => setSelectedItem(null)} className="w-full bg-omni-primary text-black py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-white transition-colors">Confirm</button>
         </div>
      </Modal>

    </div>
  );
};

export default App;
