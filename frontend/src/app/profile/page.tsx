"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, Sparkles,
  X, ShieldCheck, MapPin, Globe,
  Target, Activity
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const { isLoggedIn, username, skills, profileData, setProfileData, score } = useStore();
  
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [resumeStep, setResumeStep] = useState(1);
  
  const [rawData, setRawData] = useState({
    fullName: username || "",
    email: "",
    phone: "",
    location: "Karachi, Sindh, Pakistan",
    linkedin: "linkedin.com/in/" + username?.toLowerCase().replace(/\s/g, "-"),
    summary: "",
    experience: "",
    education: "",
    projects: "",
    skills: skills.map(s => s.name).join(", ") || ""
  });

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  const generateProfile = async () => {
    setResumeStep(3);
    
    try {
      const response = await fetch("http://localhost:8000/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_data: rawData,
          sections: ["Summary", "Experience", "Skills", "Education", "Projects"]
        }),
      });

      if (!response.ok) throw new Error("Intelligence Synthesis Failed.");
      const data = await response.json();
      setProfileData(data);
      setResumeStep(1);
      setIsResumeModalOpen(false);
      toast.success("Identity Protocols Synchronized via AI Agent.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
      setResumeStep(2);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans selection:bg-primary selection:text-white pt-20 lg:pt-0 pb-20 lg:pl-24">
      
      {/* UNIQUE DOSSIER HERO */}
      <section className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950">
         <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--gold)_1px,transparent_1px)] bg-[length:40px_40px]" />
         </div>
         
         <div className="container max-w-6xl mx-auto px-8 relative z-10 flex flex-col items-center text-center space-y-8">
            <div className="relative group">
               <div className="h-48 w-48 rounded-[3rem] bg-black dark:bg-white flex items-center justify-center overflow-hidden rotate-45 shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
                  <div className="-rotate-45 h-full w-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-6xl font-black italic text-primary group-hover:scale-110 transition-transform">
                     {username.charAt(0).toUpperCase()}
                  </div>
               </div>
               <div className="absolute -bottom-4 -right-4 h-14 w-14 rounded-2xl bg-primary flex items-center justify-center border-4 border-white dark:border-black shadow-xl">
                  <ShieldCheck className="h-6 w-6 text-white" />
               </div>
            </div>
            
            <div className="space-y-4">
               <div className="flex flex-col items-center space-y-2">
                  <p className="text-[11px] font-black uppercase tracking-[0.6em] text-primary italic leading-none">Intelligence Dossier // 0x4F2A</p>
                  <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">{profileData?.fullName || username}</h1>
               </div>
               <p className="text-lg md:text-2xl font-bold text-zinc-500 max-w-2xl mx-auto italic leading-tight">
                  {profileData?.summary?.split('.')[0] || "Synthesizing technical magnitude through verified engineering protocols."}
               </p>
               <div className="flex flex-wrap justify-center gap-10 pt-6">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 italic border-r border-zinc-200 dark:border-zinc-800 pr-10">
                     <MapPin className="h-4 w-4 text-primary" /> {profileData?.contact?.location || "Karachi, Pakistan"}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">
                     <Target className="h-4 w-4 text-primary" /> {score} XP MAGNITUDE
                  </div>
               </div>
            </div>

            <div className="flex gap-4 pt-4">
               <Button className="rounded-full bg-primary text-white h-14 px-12 font-black uppercase tracking-widest text-[10px] shadow-[0_15px_30px_rgba(245,158,11,0.2)] hover:scale-105 transition-transform" onClick={() => setIsResumeModalOpen(true)}>
                  <Sparkles className="mr-3 h-4 w-4" /> AI Sync Identity
               </Button>
               <Button variant="outline" className="rounded-full border-zinc-200 dark:border-zinc-800 h-14 px-12 font-black uppercase tracking-widest text-[10px]">Export Protocols</Button>
            </div>
         </div>
      </section>

      {/* UNIQUE GRID LAYOUT */}
      <div className="container max-w-7xl mx-auto px-8 py-20 grid lg:grid-cols-12 gap-12">
         
         {/* LEFT: About & Experience (Technical Narratives) */}
         <div className="lg:col-span-8 space-y-16">
            
            {/* Mission Briefing */}
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-900" />
                  <h2 className="text-xl font-black uppercase tracking-tighter italic">Mission Briefing.</h2>
               </div>
               <p className="text-xl font-bold italic leading-relaxed text-zinc-600 dark:text-zinc-400 border-l-4 border-primary pl-10">
                  {profileData?.summary || "No magnitude briefing initialized. Use the Identity Architect to synthesize your technical DNA."}
               </p>
            </div>

            {/* Operations History */}
            <div className="space-y-10">
               <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black uppercase tracking-tighter italic">Operational History.</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Verified Log</p>
               </div>
               
               <div className="space-y-12">
                  {profileData?.experience ? profileData.experience.map((exp: { role: string; company: string; period: string; bulletPoints: string[] }, i: number) => (
                     <div key={i} className="group relative pl-16 pb-12 border-l border-zinc-100 dark:border-zinc-900 last:border-0 last:pb-0">
                        <div className="absolute left-[-5px] top-1 h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                        <div className="space-y-6">
                           <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                              <div className="space-y-1">
                                 <h3 className="text-2xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">{exp.role}</h3>
                                 <p className="text-xs font-bold italic text-zinc-500 uppercase tracking-widest">{exp.company} {"//"} {exp.period}</p>
                              </div>
                              <div className="px-4 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-lg text-[9px] font-black uppercase tracking-widest italic">Phase {i + 1} Node</div>
                           </div>
                           <ul className="space-y-3">
                              {exp.bulletPoints.map((bp: string, j: number) => (
                                 <li key={j} className="text-sm font-medium text-zinc-500 flex gap-4 leading-relaxed italic">
                                    <span className="text-primary font-black">/</span> {bp}
                                 </li>
                              ))}
                           </ul>
                        </div>
                     </div>
                  )) : (
                     <div className="p-20 border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[3rem] text-center opacity-30 italic">No operational logs verified.</div>
                  )}
               </div>
            </div>
         </div>

         {/* RIGHT: Stats, Skills, Meta */}
         <div className="lg:col-span-4 space-y-12">
            
            {/* Skill Matrix */}
            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-[2.5rem] p-10 space-y-8">
               <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic leading-none">Component Array</p>
                  <h3 className="text-2xl font-black uppercase tracking-tight italic">Skill Matrix.</h3>
               </div>
               
               <div className="space-y-6">
                  {skills.length > 0 ? skills.slice(0, 8).map((skill) => (
                     <div key={skill.name} className="space-y-3">
                        <div className="flex justify-between items-end">
                           <p className="text-[10px] font-black uppercase tracking-widest">{skill.name}</p>
                           <p className="text-[10px] font-bold italic text-primary">LVL {skill.level}</p>
                        </div>
                        <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-900 rounded-full overflow-hidden">
                           <div className="h-full bg-primary shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: `${skill.progress}%` }} />
                        </div>
                     </div>
                  )) : (
                     <div className="text-center py-6 opacity-30 italic">No skills mapped.</div>
                  )}
               </div>
               <Button variant="ghost" className="w-full text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-primary">Expand Protocol View</Button>
            </div>

            {/* Identity Metadata */}
            <div className="bg-black text-white dark:bg-white dark:text-black rounded-[2.5rem] p-10 space-y-8 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-16 bg-primary/20 rounded-full blur-3xl" />
               <div className="space-y-2 relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic leading-none">Identity Meta</p>
                  <h3 className="text-2xl font-black uppercase tracking-tight italic">Protocols.</h3>
               </div>
               <div className="space-y-4 relative z-10">
                  {[
                    { icon: Globe, label: "Digital Presence", value: "Verified" },
                    { icon: ShieldCheck, label: "Audit Status", value: "9.5 Magnitude" },
                    { icon: Activity, label: "Operational Sync", value: "Active" },
                  ].map((item, i) => (
                     <div key={i} className="flex justify-between items-center py-3 border-b border-white/10 dark:border-black/10 last:border-0">
                        <div className="flex items-center gap-3">
                           <item.icon className="h-4 w-4 text-primary" />
                           <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{item.label}</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest italic">{item.value}</span>
                     </div>
                  ))}
               </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-6">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 ml-4 italic leading-none">Associated Nodes</p>
               <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(n => (
                     <div key={n} className="p-6 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-3xl flex flex-col items-center gap-3 group cursor-pointer hover:border-primary transition-all">
                        <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-900 rounded-2xl flex items-center justify-center font-black italic text-zinc-400 group-hover:text-primary group-hover:scale-110 transition-all">#</div>
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Node_ID_{n}x</p>
                     </div>
                  ))}
               </div>
            </div>

         </div>
      </div>

      {/* AI AGENT SYNC MODAL */}
      {isResumeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/80 dark:bg-black/80 backdrop-blur-2xl">
          <div className="bg-white dark:bg-black w-full max-w-4xl max-h-[90vh] rounded-[3rem] border border-zinc-100 dark:border-zinc-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
            
            <div className="p-10 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
              <div className="flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-3xl font-black uppercase tracking-tighter italic">Identity Architect.</h2>
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.5em]">Protocol Sync Phase {resumeStep} {"//"} Synthetic Engine</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsResumeModalOpen(false)} className="rounded-full h-12 w-12">
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
               {resumeStep === 1 && (
                 <div className="space-y-12 max-w-2xl mx-auto text-center py-10">
                    <div className="space-y-6">
                       <h3 className="text-5xl font-black uppercase tracking-tighter leading-none italic">Initialize Neural Identity Sync.</h3>
                       <p className="text-zinc-500 text-lg font-bold italic leading-relaxed">Our AI agent will synthesize your professional DNA by analyzing your technical history. This will overwrite current profile protocols.</p>
                    </div>
                    <div className="p-12 border border-zinc-100 dark:border-zinc-900 rounded-[3rem] bg-zinc-50 dark:bg-zinc-950 space-y-10 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-20 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors" />
                       <div className="space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Active Analysis Scope</p>
                          <div className="flex flex-wrap justify-center gap-4">
                             {["Narrative Summary", "Operational History", "Skill Matrix", "Education Nodes"].map(s => (
                                <span key={s} className="text-[9px] font-black uppercase tracking-widest px-6 py-3 bg-white dark:bg-black rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm">{s}</span>
                             ))}
                          </div>
                       </div>
                       <Button className="w-full h-20 rounded-full bg-primary text-white font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:scale-105 transition-transform" onClick={() => setResumeStep(2)}>
                          Begin Technical Audit
                       </Button>
                    </div>
                 </div>
               )}

               {resumeStep === 2 && (
                 <div className="space-y-10 max-w-2xl mx-auto py-10">
                    <div className="text-center space-y-4">
                       <h3 className="text-4xl font-black uppercase tracking-tighter italic leading-none text-primary">Identity Feed.</h3>
                       <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] italic">Input raw technical intelligence or existing CV artifacts.</p>
                    </div>
                    <div className="space-y-8">
                       <div className="space-y-3">
                          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 ml-1">Full Technical Identity</label>
                          <Input value={rawData.fullName} onChange={(e) => setRawData({...rawData, fullName: e.target.value})} className="h-16 bg-zinc-50 dark:bg-zinc-950 border-zinc-100 dark:border-zinc-900 rounded-2xl px-8 font-bold text-lg" />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 ml-1">Raw Intelligence Artifact (CV Content)</label>
                          <Textarea 
                             value={rawData.experience} 
                             onChange={(e) => setRawData({...rawData, experience: e.target.value})} 
                             className="min-h-[300px] bg-zinc-50 dark:bg-zinc-950 border-zinc-100 dark:border-zinc-900 rounded-[3rem] p-10 font-bold italic text-base resize-none leading-relaxed" 
                             placeholder="Paste your resume content here for AI extraction..." 
                          />
                       </div>
                       <div className="flex gap-6 pt-4">
                          <Button variant="outline" className="flex-1 h-16 rounded-full font-black uppercase tracking-widest text-[10px] border-zinc-200 dark:border-zinc-800" onClick={() => setResumeStep(1)}>Abort</Button>
                          <Button className="flex-[2] h-16 rounded-full bg-primary text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl" onClick={generateProfile}>
                             Initialize Synthesis
                          </Button>
                       </div>
                    </div>
                 </div>
               )}

               {resumeStep === 3 && (
                 <div className="flex flex-col items-center justify-center py-40 space-y-16">
                    <div className="h-40 w-40 rounded-full border-4 border-zinc-100 dark:border-zinc-900 border-t-primary animate-spin flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                       <Brain className="h-16 w-16 text-primary animate-pulse" />
                    </div>
                    <div className="text-center space-y-6">
                       <h3 className="text-4xl font-black uppercase italic tracking-tighter">Synthesizing Profile...</h3>
                       <p className="text-zinc-400 text-[11px] font-black uppercase tracking-[0.6em] animate-pulse italic">Decomposing Experience Clusters {"//"} Rebuilding Operational DNA</p>
                    </div>
                 </div>
               )}
            </div>

            <div className="p-8 border-t border-zinc-100 dark:border-zinc-900 flex justify-center bg-zinc-50 dark:bg-zinc-950">
               <p className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-400 italic">SkillGraph Identity Architect v1.0 {"//"} Verified System</p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

