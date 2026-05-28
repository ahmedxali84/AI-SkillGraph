"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  UploadCloud, 
  CheckCircle2, 
  FileCode2,
  Sparkles, 
  ArrowRight, 
  Brain, 
  HardDrive, 
  ChevronRight,
  Info,
  Clock
} from "lucide-react";
import { toast } from "sonner";

export default function UploadPage() {
  const router = useRouter();
  const { isLoggedIn, addProject, updateSkill, syncProfile, projects } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [driveUrl] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [result, setResult] = useState<{ type: string; difficulty: string; skillsDetected: string[]; feedback: string; name?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sourceType, setSourceType] = useState<"GitHub" | "ZIP">("GitHub");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  const analyzeProject = async () => {
    if (sourceType === "GitHub" && !repoUrl) {
      toast.error("Please provide a GitHub URL.");
      return;
    }
    if (sourceType === "ZIP" && !file) {
      toast.error("Please upload a ZIP file.");
      return;
    }
    if (!projectDescription.trim()) {
      toast.error("Please provide a brief project description for the AI Agent.");
      return;
    }

    setIsLoading(true);
    setIsAnalyzing(true);
    setAnalyzeStep(0);

    const progressInterval = setInterval(() => {
      setAnalyzeStep(prev => (prev < 4 ? prev + 1 : prev));
    }, 1500);

    try {
      let response: Response;

      if (sourceType === "ZIP" && file) {
        // ZIP: use multipart/form-data with the actual file
        const formData = new FormData();
        formData.append("file", file);
        formData.append("description", projectDescription);
        response = await fetch("http://localhost:8000/analyze-project-zip", {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch("http://localhost:8000/analyze-project", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            repo_url: repoUrl, 
            project_description: projectDescription,
            source_type: sourceType
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Strategic Analysis Failed.");
      }

      const data = await response.json();
      
      setAnalyzeStep(5);
      setResult(data);
      
      addProject({
        id: Math.random().toString(36).substring(7),
        name: data.name,
        type: data.type,
        skillsDetected: data.skillsDetected,
        difficulty: data.difficulty,
        date: new Date().toISOString()
      });

      data.skillsDetected.forEach((skill: string) => {
        updateSkill(skill, Math.floor(Math.random() * 25) + 15);
      });

      // Sync updated profile to backend (fire-and-forget)
      syncProfile().catch(() => {});

      toast.success("Intelligence Audit Complete.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
      setIsAnalyzing(false);
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-primary selection:text-white pt-28 lg:pt-10 pb-20 lg:pl-24">
      
      <div className="container max-w-7xl mx-auto px-4 grid lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT SIDEBAR: Audit Context */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-900 p-6 space-y-6 shadow-sm">
             <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Protocol Status</p>
                <h3 className="text-xl font-black uppercase tracking-tight">Audit Center</h3>
             </div>
             
             <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <div className="flex justify-between text-[10px] font-bold">
                   <span className="text-zinc-500 uppercase">Verified Nodes</span>
                   <span className="text-primary">{projects.length}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                   <span className="text-zinc-500 uppercase">Pending Validation</span>
                   <span className="text-zinc-400">0</span>
                </div>
             </div>
             
             <nav className="flex flex-col gap-1 pt-4">
                <Link href="/dashboard" className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all">
                   <ChevronRight className="h-3 w-3 text-primary" /> Back to Dashboard
                </Link>
                <Link href="/profile" className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all">
                   <ChevronRight className="h-3 w-3 text-primary" /> View Identity
                </Link>
             </nav>
          </div>

          <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-900 p-6 space-y-4 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 bg-primary/10 rounded-full blur-2xl -z-10" />
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 italic">Audit Magnitude</p>
             <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 italic leading-relaxed">
                Submitting high-magnitude proofs increases your visibility to top-tier intelligence nodes.
             </p>
          </div>
        </aside>

        {/* MIDDLE COLUMN: Submission Interface */}
        <main className="lg:col-span-6 space-y-6">
          
          {!isAnalyzing && !result && (
            <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-900 overflow-hidden shadow-sm">
               <div className="p-8 border-b border-zinc-100 dark:border-zinc-900 space-y-2">
                  <h2 className="text-2xl font-black uppercase tracking-tight">Submit Engineering Proof.</h2>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Awaiting technical parameters for magnitude analysis...</p>
               </div>
               
               <div className="p-8 space-y-8">
                  {/* Source Toggle */}
                  <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
                      {[
                        { id: "GitHub", icon: FileCode2, label: "GitHub" },
                        { id: "ZIP", icon: UploadCloud, label: "Archive" },
                      ].map((src) => (
                         <button
                           key={src.id}
                           onClick={() => setSourceType(src.id as "GitHub" | "ZIP")}
                           className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${sourceType === src.id ? 'bg-white dark:bg-black text-primary shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                         >
                            <src.icon className="h-3 w-3" /> {src.label}
                         </button>
                      ))}
                      <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-300 dark:text-zinc-700 cursor-not-allowed" title="Coming Soon">
                         <HardDrive className="h-3 w-3" /> Cloud
                      </div>
                   </div>

                  <div className="space-y-6">
                    {sourceType === "GitHub" && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Repository Endpoint</label>
                        <Input 
                          className="h-14 bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 focus:border-primary transition-all rounded-xl font-bold px-6"
                          placeholder="https://github.com/..." 
                          value={repoUrl}
                          onChange={(e) => setRepoUrl(e.target.value)}
                        />
                      </div>
                    )}


                    {sourceType === "ZIP" && (
                      <div 
                        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${file ? 'border-primary bg-primary/5' : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-300'}`}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input type="file" accept=".zip" className="hidden" ref={fileInputRef} onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        {file ? (
                          <div className="space-y-2">
                            <CheckCircle2 className="h-8 w-8 mx-auto text-primary" />
                            <span className="font-black text-[10px] uppercase tracking-widest">{file.name}</span>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <UploadCloud className="h-10 w-10 mx-auto text-zinc-200" />
                            <p className="font-black text-[10px] uppercase tracking-widest text-zinc-400">Deploy Local Source</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Contextual Briefing</label>
                        <button 
                           onClick={async () => {
                             const name = repoUrl || driveUrl || file?.name || "New Project";
                             if (!name) { toast.error("Provide link first."); return; }
                             setIsLoading(true);
                             try {
                               const resp = await fetch("http://localhost:8000/generate-description", {
                                 method: "POST",
                                 headers: { "Content-Type": "application/json" },
                                 body: JSON.stringify({ name, context: repoUrl || driveUrl }),
                               });
                               const data = await resp.json();
                               setProjectDescription(data.description);
                               toast.success("AI Synthesis Complete.");
                             } catch { toast.error("Sync failed."); } finally { setIsLoading(false); }
                           }}
                           className="text-[9px] font-black text-primary uppercase flex items-center gap-1 hover:underline"
                        >
                           <Sparkles className="h-3 w-3" /> AI Sync
                        </button>
                      </div>
                      <Textarea 
                        className="min-h-[160px] bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 focus:border-primary transition-all rounded-2xl font-bold p-6 text-sm resize-none italic"
                        placeholder="Define the architectural complexity and core engineering challenges..." 
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                      />
                    </div>

                    <Button 
                      className="w-full h-16 rounded-full font-black uppercase tracking-widest text-xs bg-primary text-white shadow-lg active:scale-95 transition-all" 
                      onClick={analyzeProject} 
                      disabled={isLoading}
                    >
                      Initialize Audit <ArrowRight className="ml-3 h-4 w-4" />
                    </Button>
                  </div>
               </div>
            </div>
          )}

          {isAnalyzing && !result && (
            <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-900 p-20 text-center space-y-12 shadow-sm">
               <div className="h-24 w-24 rounded-full border-4 border-zinc-100 dark:border-zinc-900 border-t-primary animate-spin mx-auto flex items-center justify-center">
                  <Brain className="h-10 w-10 text-primary animate-pulse" />
               </div>
               <div className="space-y-6">
                  <h2 className="text-3xl font-black uppercase tracking-tighter italic">Synthesizing Audit...</h2>
                  <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                     <div className="h-full bg-primary transition-all duration-500" style={{ width: `${((analyzeStep + 1) / 5) * 100}%` }} />
                  </div>
                  <p className="text-zinc-500 font-bold italic text-sm">
                     {[
                       "Orchestrating Strategic Neural Assets...",
                       "Decomposing Architectural Context...",
                       "Validating Engineering Magnitude via Groq...",
                       "Synthesizing Strategic Signatures...",
                       "Finalizing Verified Intelligence...",
                       "Audit Protocol Verified."
                     ][analyzeStep]}
                  </p>
               </div>
            </div>
          )}

          {result && (
            <div className="space-y-6">
               <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-900 p-8 space-y-8 shadow-sm">
                  <div className="flex justify-between items-start">
                     <div className="space-y-2">
                        <h2 className="text-4xl font-black uppercase tracking-tight leading-none italic">Audit Finalized.</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Intelligence Verified // Magnitude Map Sync</p>
                     </div>
                     <div className="h-12 w-12 rounded-full border-2 border-primary flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8 border-y border-zinc-100 dark:border-zinc-900 py-10">
                     <div className="text-center space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Category Node</p>
                        <p className="text-2xl font-black uppercase">{result.type}</p>
                     </div>
                     <div className="text-center space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Magnitude Level</p>
                        <p className="text-2xl font-black uppercase italic text-primary">{result.difficulty}</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Verified Protocols</p>
                     <div className="flex flex-wrap gap-2">
                        {result.skillsDetected.map((s: string) => (
                           <span key={s} className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900 rounded-full text-[9px] font-black uppercase border border-zinc-100 dark:border-zinc-800">{s}</span>
                        ))}
                     </div>
                  </div>

                  <div className="p-8 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border-l-4 border-primary">
                     <p className="text-lg font-bold italic leading-snug">&quot;{result.feedback}&quot;</p>
                  </div>

                  <div className="flex gap-4">
                     <Button variant="outline" className="flex-1 h-12 rounded-full font-black uppercase tracking-widest text-[9px]" onClick={() => setResult(null)}>New Audit</Button>
                     <Link href="/profile" className={buttonVariants({ className: "flex-1 h-12 rounded-full bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[9px]" })}>View Profile</Link>
                  </div>
               </div>
            </div>
          )}
        </main>

        {/* RIGHT SIDEBAR: Guidelines */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-900 p-6 space-y-6 shadow-sm">
             <div className="flex items-center gap-3">
                <Info className="h-4 w-4 text-primary" />
                <p className="text-[10px] font-black uppercase tracking-widest">Audit Guidelines</p>
             </div>
             
             <div className="space-y-4">
                {[
                  { title: "Direct Proof", desc: "Always provide verified endpoints." },
                  { title: "Magnitude Check", desc: "AI Agent audits for code logic." },
                  { title: "XP Synthesis", desc: "XP is calculated based on difficulty." },
                ].map((g, i) => (
                   <div key={i} className="space-y-1">
                      <p className="text-[10px] font-black uppercase leading-none">{g.title}</p>
                      <p className="text-[9px] font-bold text-zinc-400 italic">{g.desc}</p>
                   </div>
                ))}
             </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-900 p-6 space-y-4 shadow-sm text-center">
             <div className="h-12 w-12 rounded-full bg-zinc-50 dark:bg-zinc-900 mx-auto flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary opacity-30" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest">History</p>
             <div className="space-y-3">
                {projects.slice(0, 3).map(p => (
                   <div key={p.id} className="flex justify-between items-center text-[9px] font-bold border-b border-zinc-100 dark:border-zinc-900 pb-2 italic">
                      <span className="truncate max-w-[100px]">{p.name}</span>
                      <span className="text-primary">{p.difficulty}</span>
                   </div>
                ))}
             </div>
             <Link href="/dashboard" className="block text-[8px] font-black uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors pt-2">Full History</Link>
          </div>
        </aside>

      </div>
    </div>
  );
}



