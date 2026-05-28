"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Rocket, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Brain, 
  Terminal, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  Zap
} from "lucide-react";
import { toast } from "sonner";

export default function LaunchpadPage() {
  const router = useRouter();
  const { isLoggedIn, addVenture, ventures, toggleVentureTask, evolveVenture } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEvolving, setIsEvolving] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [activeVentureId, setActiveVentureId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  const activeVenture = useMemo(() => {
    return ventures.find(v => v.id === activeVentureId) || null;
  }, [ventures, activeVentureId]);

  const stats = useMemo(() => {
    if (!activeVenture) return { total: 0, completed: 0, progress: 0 };
    let total = 0;
    let completed = 0;
    activeVenture.roadmap.forEach(stage => {
      stage.tasks.forEach(task => {
        total++;
        if (task.completed) completed++;
      });
    });
    return { total, completed, progress: total > 0 ? (completed / total) * 100 : 0 };
  }, [activeVenture]);

  const focusTask = useMemo(() => {
    if (!activeVenture) return null;
    for (let sIdx = 0; sIdx < activeVenture.roadmap.length; sIdx++) {
      const stage = activeVenture.roadmap[sIdx];
      for (let tIdx = 0; tIdx < stage.tasks.length; tIdx++) {
        const task = stage.tasks[tIdx];
        if (!task.completed) {
          return { task, stageIdx: sIdx, stageTitle: stage.title };
        }
      }
    }
    return null;
  }, [activeVenture]);

  const launchVenture = async () => {
    if (!file && !repoUrl) {
      toast.error("Provide a PDF idea or a GitHub MVP link.");
      return;
    }

    setIsLoading(true);
    setIsAnalyzing(true);
    setAnalyzeStep(0);

    const progressInterval = setInterval(() => {
      setAnalyzeStep(prev => (prev < 6 ? prev + 1 : prev));
    }, 1800);

    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      if (repoUrl) formData.append("repo_url", repoUrl);

      const response = await fetch("http://localhost:8000/launch-venture", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Venture Analysis Failed.");

      const data = await response.json();
      
      const newVenture = {
        ...data,
        id: Math.random().toString(36).substring(7),
        date: new Date().toISOString()
      };
      
      addVenture(newVenture);
      setActiveVentureId(newVenture.id);
      toast.success("Venture Protocol Initialized.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
      setIsAnalyzing(false);
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  };

  const handleEvolve = async () => {
    if (!activeVenture) return;
    setIsEvolving(true);
    const toastId = toast.loading("Neural Expansion Protocol Initiated...");

    try {
      const response = await fetch("http://localhost:8000/evolve-venture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: activeVenture.projectName,
          roadmap: activeVenture.roadmap
        }),
      });

      if (!response.ok) throw new Error("Evolution Logic Fault.");

      const data = await response.json();
      if (!data || !data.newStage) throw new Error("Evolution Logic Fault: Data Corrupted.");
      
      const { newStage } = data;
      evolveVenture(activeVenture.id, newStage);
      toast.dismiss(toastId);
      toast.success("New High-Magnitude Features Synthesized.");
    } catch (error: unknown) {
      toast.dismiss(toastId);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsEvolving(false);
    }
  };

  const completeTask = (stageIdx: number, taskId: string) => {
    if (!activeVentureId) return;
    toggleVentureTask(activeVentureId, stageIdx, taskId);
    toast.success("Milestone Synthesized.");
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-primary selection:text-white pt-28 lg:pt-10 pb-20 lg:pl-24">
      
      <div className="container max-w-7xl mx-auto px-4 grid lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT SIDEBAR: Venture Context */}
        <aside className="lg:col-span-3 space-y-4">
           <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-900 p-6 space-y-6 shadow-sm">
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Protocol Phase</p>
                 <h3 className="text-xl font-black uppercase tracking-tight">Mission Control</h3>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                 <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-zinc-500 uppercase">Active Nodes</span>
                    <span className="text-primary">{ventures.length}</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-zinc-500 uppercase">Magnitude Status</span>
                    <span className="text-zinc-400">Stable</span>
                 </div>
              </div>
              
              <nav className="flex flex-col gap-1 pt-4">
                 <button onClick={() => setActiveVentureId(null)} className="w-full text-left p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all">
                    <ChevronRight className="h-3 w-3 text-primary" /> Hub Terminal
                 </button>
                 <Link href="/dashboard" className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all">
                    <ChevronRight className="h-3 w-3 text-primary" /> Strategy Cmd
                 </Link>
              </nav>
           </div>

           <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-900 p-6 space-y-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 bg-primary/10 rounded-full blur-2xl -z-10" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 italic">Venture DNA</p>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 italic leading-relaxed">
                 AI-driven pathfinding for technical magnitude. Initiating neural expansion protocols.
              </p>
           </div>
        </aside>

        {/* MIDDLE COLUMN: Interface */}
        <main className="lg:col-span-6 space-y-6">
          
          {!activeVenture && !isAnalyzing && (
            <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-900 overflow-hidden shadow-sm">
               <div className="p-8 border-b border-zinc-100 dark:border-zinc-900 space-y-2">
                  <h2 className="text-2xl font-black uppercase tracking-tight">Initiate Venture Node.</h2>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Submit vision protocols for architectural synthesis...</p>
               </div>
               
               <div className="p-8 space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Strategic Blueprint (PDF)</label>
                    <div 
                      className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${file ? 'border-primary bg-primary/5' : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-300'}`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={(e) => setFile(e.target.files?.[0] || null)} />
                      {file ? (
                        <div className="space-y-2">
                          <CheckCircle2 className="h-8 w-8 mx-auto text-primary" />
                          <span className="font-black text-[10px] uppercase tracking-widest">{file.name}</span>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <FileText className="h-10 w-10 mx-auto text-zinc-200" />
                          <p className="font-black text-[10px] uppercase tracking-widest text-zinc-400">Deploy Vision PDF</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">GitHub MVP Endpoint (Optional)</label>
                    <Input 
                      className="h-14 bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 focus:border-primary transition-all rounded-xl font-bold px-6"
                      placeholder="https://github.com/..." 
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                    />
                  </div>

                  <Button 
                    className="w-full h-20 rounded-full font-black uppercase tracking-widest text-xs bg-primary text-white shadow-lg active:scale-95 transition-all" 
                    onClick={launchVenture} 
                    disabled={isLoading}
                  >
                    Initiate Launch Protocol <Sparkles className="ml-4 h-5 w-5" />
                  </Button>
               </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-900 p-20 text-center space-y-12 shadow-sm">
               <div className="h-24 w-24 rounded-full border-4 border-zinc-100 dark:border-zinc-900 border-t-primary animate-spin mx-auto flex items-center justify-center">
                  <Rocket className="h-10 w-10 text-primary animate-pulse" />
               </div>
               <div className="space-y-6">
                  <h2 className="text-3xl font-black uppercase tracking-tighter italic">Synthesizing DNA...</h2>
                  <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                     <div className="h-full bg-primary transition-all duration-500" style={{ width: `${((analyzeStep + 1) / 7) * 100}%` }} />
                  </div>
                  <p className="text-zinc-500 font-bold italic text-sm">
                     {[
                       "Orchestrating Vision Context...",
                       "Extracting Technical Parameters...",
                       "Decomposing Architectural DNA...",
                       "Executing Strategic Audit...",
                       "Synthesizing Step-by-Step Guide...",
                       "Mapping Five-Stage Roadmap...",
                       "Protocol Synthesis Complete."
                     ][analyzeStep]}
                  </p>
               </div>
            </div>
          )}

          {activeVenture && !isAnalyzing && (
            <div className="space-y-6">
               {/* Focus Directive Card */}
               {focusTask ? (
                  <div className="bg-black dark:bg-white text-white dark:text-black rounded-xl p-10 space-y-10 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-12 bg-primary/20 rounded-full blur-3xl" />
                     <div className="space-y-3 relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 italic">Active Directive // Phase {focusTask.stageIdx + 1}</p>
                        <h2 className="text-4xl font-black uppercase tracking-tight italic leading-tight">{focusTask.task.title}</h2>
                     </div>
                     <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-3 opacity-40">
                           <Terminal className="h-4 w-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Synthesis Prompt</span>
                        </div>
                        <p className="text-lg font-bold italic opacity-80 leading-relaxed border-l-4 border-primary/40 pl-8">
                           {focusTask.task.howTo}
                        </p>
                     </div>
                     <Button 
                        onClick={() => completeTask(focusTask.stageIdx, focusTask.task.id)}
                        className="w-full h-16 rounded-full bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-transform"
                     >
                        Directive Synthesized <CheckCircle className="ml-3 h-4 w-4" />
                     </Button>
                  </div>
               ) : (
                  <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-900 p-16 text-center space-y-10 shadow-sm">
                     <div className="h-20 w-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                        <Sparkles className="h-10 w-10 text-primary" />
                     </div>
                     <div className="space-y-4">
                        <h3 className="text-3xl font-black uppercase tracking-tight leading-none italic">Mission Complete.</h3>
                        <p className="text-zinc-500 text-xs font-bold italic uppercase tracking-widest">All milestones verified. System evolution ready.</p>
                     </div>
                     <Button 
                        onClick={handleEvolve}
                        disabled={isEvolving}
                        className="rounded-full px-12 h-14 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[10px] shadow-xl"
                     >
                        {isEvolving ? "Expanding DNA..." : "Evolve Protocol"} <Zap className="ml-3 h-4 w-4" />
                     </Button>
                  </div>
               )}

               {/* Roadmap Breakdown */}
               <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-900 p-8 space-y-8 shadow-sm">
                  <div className="flex justify-between items-center">
                     <h3 className="text-xl font-black uppercase tracking-tight">Venture Roadmap</h3>
                     <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{Math.round(stats.progress)}% Verified</p>
                  </div>
                  <div className="space-y-4">
                     {activeVenture.roadmap.map((stage, sIdx) => (
                        <div key={sIdx} className={`p-6 rounded-xl border transition-all flex items-center justify-between ${stage.tasks.every(t => t.completed) ? 'bg-zinc-50 dark:bg-zinc-900/50 border-transparent opacity-40' : 'bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-900 shadow-sm'}`}>
                           <div className="flex items-center gap-6">
                              <span className="text-lg font-black italic text-primary/40">0{sIdx + 1}</span>
                              <div className="space-y-1">
                                 <p className="text-sm font-black uppercase tracking-tight">{stage.title}</p>
                                 <p className="text-[9px] font-bold text-zinc-400 uppercase italic">Sync {stage.tasks.filter(t => t.completed).length}/{stage.tasks.length}</p>
                              </div>
                           </div>
                           {stage.tasks.every(t => t.completed) ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Clock className="h-5 w-5 text-zinc-200" />}
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          )}
        </main>

        {/* RIGHT SIDEBAR: History & Strategy */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-900 p-6 space-y-6 shadow-sm">
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Venture History</p>
             <div className="space-y-6">
                {ventures.length > 0 ? ventures.map(v => (
                   <div key={v.id} className="space-y-3 cursor-pointer group" onClick={() => setActiveVentureId(v.id)}>
                      <div className="flex justify-between text-[10px] font-black uppercase">
                         <span className="group-hover:text-primary transition-colors truncate max-w-[120px]">{v.projectName}</span>
                         <span className="text-zinc-400">{Math.round((v.roadmap.reduce((acc, s) => acc + s.tasks.filter(t => t.completed).length, 0) / v.roadmap.reduce((acc, s) => acc + s.tasks.length, 0)) * 100)}%</span>
                      </div>
                      <div className="h-[1px] w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                         <div className="h-full bg-primary" style={{ width: `${(v.roadmap.reduce((acc, s) => acc + s.tasks.filter(t => t.completed).length, 0) / v.roadmap.reduce((acc, s) => acc + s.tasks.length, 0)) * 100}%` }} />
                      </div>
                   </div>
                )) : (
                   <p className="text-[9px] font-bold text-zinc-300 italic">No historical nodes found.</p>
                )}
             </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-900 p-6 space-y-6 shadow-sm">
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">AI Critiques</p>
             {activeVenture ? (
                <div className="space-y-4">
                   <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                      <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-2 italic leading-none">Brutal Audit</p>
                      <p className="text-[10px] font-bold italic text-zinc-500 leading-relaxed">&quot;{activeVenture.brutalCritique.slice(0, 100)}...&quot;</p>
                   </div>
                   <button className="w-full text-center text-[9px] font-black uppercase tracking-widest text-primary hover:underline">Full Assessment</button>
                </div>
             ) : (
                <p className="text-[9px] font-bold text-zinc-300 italic">Initiate node for critique.</p>
             )}
          </div>

          <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-900 p-6 space-y-4 shadow-sm text-center">
             <Brain className="h-6 w-6 text-primary opacity-20 mx-auto" />
             <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Venture Protocol v2.4 // Verified</p>
          </div>
        </aside>

      </div>
    </div>
  );
}

