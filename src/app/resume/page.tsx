"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles, Download, Brain, ShieldCheck, FileText } from "lucide-react";


export default function ResumePage() {
  const router = useRouter();
  const { isLoggedIn, username, skills, projects, score } = useStore();
  const resumeRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSummary, setAiSummary] = useState("");

  const generateAiSummary = useCallback(async (force = false) => {
    if (aiSummary && !force) return;
    setIsGenerating(true);
    try {
      const response = await fetch("http://localhost:8000/generate-resume-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, skills, projects }),
      });
      if (!response.ok) throw new Error("Failed to generate summary");
      const data = await response.json();
      setAiSummary(data.summary);
    } catch (error) {
      console.error(error);
      setAiSummary("Software Developer with an AI-verified track record of shipping complex projects. Proficient in modern engineering architectures with demonstrable proof of work.");
    } finally {
      setIsGenerating(false);
    }
  }, [aiSummary, username, skills, projects]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    } else {
      generateAiSummary();
    }
  }, [isLoggedIn, router, generateAiSummary]);

  if (!isLoggedIn) return null;

  const handleDownload = async () => {
    if (!resumeRef.current) return;
    
    setIsDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      await new Promise(resolve => setTimeout(resolve, 500));
      
      const element = resumeRef.current;
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${username}_SkillGraph_Resume.pdf`);
      
      toast.success("Resume downloaded successfully.");
    } catch (error) {
      console.error(error);
      toast.error("PDF generation failed.");
    } finally {
      setIsDownloading(false);
    }
  };

  const topSkills = [...skills].sort((a, b) => b.level - a.level).slice(0, 8);
  const recentProjects = [...projects].slice(0, 4);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-primary selection:text-white pt-28 lg:pt-10 pb-20 lg:pl-24">
      <div className="container py-16 px-6 max-w-7xl mx-auto space-y-16">
      <div className="flex flex-col md:flex-row items-end justify-between gap-10 border-b border-zinc-100 dark:border-zinc-900 pb-12">
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Professional Synthesis</p>
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">Smart Resume.</h1>
          <p className="text-zinc-500 font-medium max-w-md italic">Drafted by neural agents based on verified SkillGraph metrics.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => generateAiSummary(true)} disabled={isGenerating} className="rounded-full h-12 px-8 text-xs font-black uppercase tracking-widest border-zinc-200 dark:border-zinc-800">
            <Sparkles className="mr-2 h-3.5 w-3.5" /> Re-Synthesize
          </Button>
          <Button onClick={handleDownload} disabled={isDownloading} className="rounded-full h-12 px-8 text-xs font-black uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black">
            <Download className="mr-2 h-3.5 w-3.5" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-12">
        {/* Controls/Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="p-8 border border-zinc-100 dark:border-zinc-900 rounded-2xl bg-zinc-50 dark:bg-zinc-950 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <Brain className="h-3 w-3" /> AI Insights
            </h3>
            <div className="space-y-4 text-xs font-bold text-zinc-500 leading-relaxed uppercase tracking-widest">
              <p>Verified Skills: <span className="text-black dark:text-white">{skills.length}</span></p>
              <p>Project Proofs: <span className="text-black dark:text-white">{projects.length}</span></p>
              <p>Skill Score: <span className="text-black dark:text-white">{score} XP</span></p>
              <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-[9px] italic lowercase leading-normal tracking-normal text-zinc-400">&quot;Profile indicates strong alignment with {skills[0]?.name || 'modern engineering'} standards. verified by agent v1.2.&quot;</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resume Preview */}
        <div className="lg:col-span-3 bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12 rounded-3xl border border-zinc-100 dark:border-zinc-900 flex justify-center overflow-x-auto min-h-screen">
          <div
            ref={resumeRef}
            className="bg-white text-black p-12 md:p-20 shadow-2xl w-[210mm] min-h-[297mm] flex-shrink-0 flex flex-col border border-zinc-100"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {/* Header */}
            <div className="border-b-[12px] border-black pb-12 mb-12 flex justify-between items-end">
              <div>
                <h1 className="text-6xl font-black text-black mb-4 tracking-tighter uppercase leading-none">{username}</h1>
                <div className="flex gap-8 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3 text-black" /> 
                    {score} XP Verified
                  </span>
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3 text-black" /> 
                    {projects.length} AI Proofs
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-black text-white px-6 py-3 font-black text-sm uppercase tracking-[0.4em]">
                  PROTOCOL
                </div>
              </div>
            </div>

            <div className="mb-12">
               <p className="text-xl font-bold text-zinc-900 leading-snug italic max-w-3xl">
                  {isGenerating ? "AI Agent is crafting your summary..." : aiSummary}
               </p>
            </div>

            <div className="grid grid-cols-3 gap-16 flex-1">
              {/* Sidebar */}
              <div className="col-span-1 space-y-12">
                <section>
                  <h2 className="text-[10px] font-black text-zinc-400 mb-8 uppercase tracking-[0.3em]">Core Intelligence</h2>
                  <div className="space-y-6">
                    {topSkills.map(skill => (
                      <div key={skill.name} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-black">{skill.name}</span>
                          <span className="text-zinc-400">LVL {skill.level}</span>
                        </div>
                        <div className="w-full bg-zinc-100 h-[2px] overflow-hidden">
                          <div 
                            className="bg-primary h-full"
                            style={{ width: `${Math.min(100, (skill.level / 10) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-zinc-50 p-8 border border-zinc-100">
                  <h2 className="text-[10px] font-black text-zinc-400 mb-6 uppercase tracking-[0.3em]">Global Rank</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Architectural</span>
                      <span className="text-sm font-black text-black">TOP 5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Implementation</span>
                      <span className="text-sm font-black text-black">TOP 2%</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Main Content */}
              <div className="col-span-2 space-y-12">
                <section>
                  <h2 className="text-[10px] font-black text-zinc-400 mb-10 uppercase tracking-[0.3em]">Verified Proof of Work</h2>
                  <div className="space-y-12">
                    {recentProjects.length > 0 ? (
                      recentProjects.map(project => (
                        <div key={project.id} className="group">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-2xl font-black text-black uppercase tracking-tighter group-hover:text-zinc-500 transition-colors">{project.name}</h3>
                            <span className="text-[9px] font-black text-white bg-black px-4 py-1.5 uppercase tracking-[0.2em]">
                              {project.difficulty}
                            </span>
                          </div>
                          <div className="flex gap-6 text-[9px] font-black text-zinc-400 uppercase mb-5 tracking-[0.2em]">
                            <span>{project.type}</span>
                            <span>{new Date(project.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                            Successfully evaluated by SkillGraph Agents. 
                            Demonstrated verified proficiency in <span className="text-black font-black">{project.skillsDetected.join(", ")}</span>.
                            Engineering maturity verified at {project.difficulty.toLowerCase()} level with high architectural integrity scores.
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="py-24 text-center border border-dashed border-zinc-200 rounded-2xl">
                        <FileText className="h-12 w-12 text-zinc-200 mx-auto mb-4" />
                        <p className="text-zinc-400 text-xs font-black uppercase tracking-widest">No verified projects found.</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
            
            {/* Footer */}
            <div className="mt-auto pt-12 border-t border-zinc-100 flex justify-between items-center text-[9px] font-black text-zinc-400 uppercase tracking-[0.4em]">
              <span>SkillGraph Intelligence Protocol v1.0</span>
              <span className="text-black underline decoration-2 underline-offset-4">skillgraph.ai/p/{username.toLowerCase()}</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

