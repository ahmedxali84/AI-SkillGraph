"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  MoreHorizontal, 
  ShieldCheck as ShieldIcon,
  Search,
  Bell,
  FileText,
  Zap,
  Activity,
  ArrowRight,
  Rocket,
  ListTodo,
  FileOutput
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { isLoggedIn, username, projects, ventures, score, skills } = useStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Compute real venture progress stats
  const ventureStats = useMemo(() => {
    if (!ventures[0]) return { progress: 0, magnitude: "—" };
    const roadmap = ventures[0].roadmap;
    let total = 0, completed = 0;
    roadmap.forEach(stage => stage.tasks.forEach(t => { total++; if (t.completed) completed++; }));
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const mag = (pct / 10).toFixed(1);
    return { progress: pct, magnitude: mag };
  }, [ventures]);

  // Filter projects/skills by search
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q) ||
      p.skillsDetected.some(s => s.toLowerCase().includes(q))
    );
  }, [projects, searchQuery]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    } else {
      setIsLoaded(true);
    }
  }, [isLoggedIn, router]);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-primary selection:text-white pt-20 lg:pt-0 pb-20 lg:pl-24">
      
      <div className="sticky top-20 lg:top-0 z-40 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-900 px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="flex flex-col">
            <h1 className="text-2xl font-black uppercase tracking-tighter italic">Command Station <span className="text-primary">{"//"}</span> {username}</h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.4em]">Operational Magnitude: Verified</p>
         </div>
         
         <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="relative flex-1 md:w-64 group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
               <input 
                  placeholder="Search projects & skills..." 
                  className="w-full h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full pl-10 pr-4 text-xs font-bold outline-none focus:border-primary transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
            <Link href="/tasks" className="p-2 relative hover:text-primary transition-colors" title="Mission Hub">
               <Bell className="h-5 w-5" />
               {projects.length > 0 && <div className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full" />}
            </Link>
         </div>
      </div>

      <div className="container max-w-7xl mx-auto px-8 py-10 space-y-8">
         
         {/* BENTO GRID LAYOUT */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* LARGE HEADER CARD: Identity Stats */}
            <div className="lg:col-span-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-[2.5rem] p-10 flex flex-col md:flex-row justify-between items-center gap-12 relative overflow-hidden shadow-sm group">
               <div className="absolute top-0 right-0 p-40 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors duration-1000" />
               
               <div className="space-y-6 flex-1">
                  <div className="space-y-2">
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic leading-none">Global Magnitude Sync</p>
                     <h2 className="text-5xl font-black tracking-tighter uppercase italic leading-tight">Identity <br /> Protocol v4.0</h2>
                  </div>
                  <div className="flex flex-wrap gap-10">
                     <div className="space-y-1">
                        <p className="text-3xl font-black italic tracking-tighter">{score}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">XP Magnitude</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-3xl font-black italic tracking-tighter">{skills.length}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Verified Skills</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-3xl font-black italic tracking-tighter">{ventures.length}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Operations</p>
                     </div>
                  </div>
                  <Button className="rounded-full bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[10px] h-12 px-10 shadow-xl hover:scale-105 transition-transform" onClick={() => router.push("/profile")}>Intelligence Dossier</Button>
               </div>
               
               <div className="h-48 w-48 relative flex items-center justify-center">
                  <div className="absolute inset-0 border border-primary/20 rounded-full animate-ping opacity-20" />
                  <div className="absolute inset-4 border border-primary/40 rounded-full animate-pulse opacity-20" />
                  <div className="h-32 w-32 bg-primary rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.3)]">
                     <ShieldIcon className="h-14 w-14 text-white" />
                  </div>
               </div>
            </div>

            {/* SMALL CARD: Active Node */}
            <div className="bg-primary rounded-[2.5rem] p-10 flex flex-col justify-between items-start text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute -top-10 -right-10 p-20 bg-white/20 rounded-full blur-2xl" />
               <Zap className="h-10 w-10 opacity-80" />
               <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 italic leading-none">Active Pulse</p>
                  <h3 className="text-2xl font-black uppercase tracking-tight leading-tight">Neural Sync Active</h3>
                  <p className="text-[10px] font-bold opacity-80 italic">Optimizing architectural clusters for verified magnitude.</p>
               </div>
            </div>

            {/* PROJECTS WALL: 2x2 Bento */}
            <div className="md:col-span-2 lg:col-span-2 space-y-6">
               <div className="flex justify-between items-center px-4">
                  <h3 className="text-lg font-black uppercase tracking-tight italic flex items-center gap-3">
                     <Activity className="h-5 w-5 text-primary" /> Verification Wall
                  </h3>
                  <Link href="/upload" className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline">New Proof</Link>
               </div>
               
               <div className="grid sm:grid-cols-2 gap-6">
                  {filteredProjects.length > 0 ? filteredProjects.slice(0, 4).map((p) => (
                     <div key={p.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 space-y-6 shadow-sm hover:border-primary/40 transition-all group">
                        <div className="flex justify-between items-start">
                           <div className="h-10 w-10 bg-zinc-50 dark:bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
                              <FileText className="h-5 w-5 opacity-20" />
                           </div>
                           <span className="text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1.5 rounded-full">{p.difficulty}</span>
                        </div>
                        <div className="space-y-1">
                           <h4 className="text-lg font-black uppercase tracking-tight leading-none group-hover:text-primary transition-colors">{p.name}</h4>
                           <p className="text-[10px] font-bold text-zinc-400 uppercase italic">{p.type}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {p.skillsDetected.slice(0, 3).map(s => (
                              <span key={s} className="text-[8px] font-black uppercase tracking-widest text-zinc-300">#{s}</span>
                           ))}
                        </div>
                     </div>
                  )) : (
                     <div className="col-span-2 p-12 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 border-dashed rounded-3xl text-center space-y-4 opacity-30">
                        <Upload className="h-10 w-10 mx-auto" />
                        <p className="text-[10px] font-black uppercase tracking-widest italic">Awaiting technical proofs...</p>
                     </div>
                  )}
               </div>
            </div>

            {/* VENTURE PROGRESS CARD */}
            <div className="md:col-span-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-[2.5rem] p-10 space-y-10 shadow-sm group relative overflow-hidden">
               <div className="absolute bottom-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors duration-1000" />
               <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black uppercase tracking-tight italic flex items-center gap-3">
                     <Rocket className="h-5 w-5 text-primary" /> Active Operation
                  </h3>
                  <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors"><MoreHorizontal className="h-5 w-5" /></button>
               </div>
               
               {ventures.length > 0 ? (
                  <div className="space-y-8">
                     <div className="space-y-2">
                        <h4 className="text-4xl font-black uppercase tracking-tight leading-none italic">{ventures[0].projectName}</h4>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">Neural Protocol Sync in progress...</p>
                     </div>
                     <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                           <span>Operational Completion</span>
                           <span className="text-primary italic">{ventureStats.magnitude} Magnitude</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                           <div className="h-full bg-primary transition-all duration-700" style={{ width: `${ventureStats.progress}%` }} />
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <Button className="flex-1 rounded-full bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-[9px] h-12 shadow-lg" onClick={() => router.push("/launchpad")}>Command Terminal</Button>
                        <Button variant="outline" className="flex-1 rounded-full border-zinc-200 dark:border-zinc-800 font-black uppercase tracking-widest text-[9px] h-12" onClick={() => router.push("/upload")}>Audit Reports</Button>
                     </div>
                  </div>
               ) : (
                  <div className="text-center py-10 opacity-30 italic">No operations initialized.</div>
               )}
            </div>

            {/* RECOMMENDATIONS SIDEBAR */}
            <div className="lg:col-span-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Quick Actions</p>
               <div className="space-y-3">
                  {[
                    { name: "Mission Hub", type: "Daily AI Tasks", href: "/tasks", icon: ListTodo },
                    { name: "Launch Venture", type: "Startup Analysis", href: "/launchpad", icon: Rocket },
                    { name: "Smart Resume", type: "Export PDF", href: "/resume", icon: FileOutput },
                  ].map((rec, i) => (
                     <Link key={i} href={rec.href} className="flex items-center gap-4 group cursor-pointer p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                        <div className="h-10 w-10 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-100 dark:border-zinc-800 group-hover:border-primary transition-colors">
                           <rec.icon className="h-4 w-4 text-zinc-400 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1 space-y-0.5">
                           <p className="text-[10px] font-black uppercase tracking-tight group-hover:text-primary transition-colors">{rec.name}</p>
                           <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest leading-none">{rec.type}</p>
                        </div>
                     </Link>
                  ))}
               </div>
               <Link href="/tasks" className="w-full block text-center text-[9px] font-black uppercase tracking-[0.3em] text-primary hover:underline">View All Missions</Link>
            </div>

            {/* SKILLS MAP CARD */}
            <div className="lg:col-span-1 bg-black text-white dark:bg-white dark:text-black rounded-[2.5rem] p-8 flex flex-col justify-between items-start shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-16 bg-primary/20 rounded-full blur-3xl" />
               <div className="space-y-2 relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic leading-none">Resource Matrix</p>
                  <h3 className="text-2xl font-black uppercase tracking-tight">Verified Skills</h3>
               </div>
               <div className="space-y-4 w-full relative z-10">
                  <div className="flex flex-wrap gap-2">
                     {skills.slice(0, 5).map(s => (
                        <span key={s.name} className="px-3 py-1.5 bg-white/10 dark:bg-black/10 rounded-lg text-[8px] font-black uppercase tracking-widest border border-white/10 dark:border-black/10">{s.name}</span>
                     ))}
                  </div>
                  <Link href="/resume" className="text-[9px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 flex items-center gap-2 group/btn">
                     Full Protocol Map <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
               </div>
            </div>

         </div>

      </div>
    </div>
  );
}

