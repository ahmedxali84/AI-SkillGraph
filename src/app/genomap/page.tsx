"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";
import { 
  Dna, 
  GitBranch, 
  Search, 
  Activity, 
  ArrowRight,
  User,
  Calendar,
  Sparkles,
  Info
} from "lucide-react";

interface DnaNode {
  sha: string;
  message: string;
  author: string;
  date: string;
  base: "A" | "S" | "T" | "I" | "V";
  impact: number;
  details: string;
}

export default function GenomapPage() {
  const router = useRouter();
  const { isLoggedIn } = useStore();
  const [repoUrl, setRepoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [dnaSeq, setDnaSeq] = useState<DnaNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<DnaNode | null>(null);
  const [executiveSummary, setExecutiveSummary] = useState("");
  const [complexityIndex, setComplexityIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  // Canvas drawing reference for hover tracking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodePositions = useRef<any>([]);

  const fetchDnaSequence = async (initial = false) => {
    if (!repoUrl.trim()) {
      toast.error("Repository URL cannot be empty.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/genomap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: repoUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        setProjectName(data.projectName || "Codebase Node");
        setDnaSeq(data.dnaSequence || []);
        setExecutiveSummary(data.executiveSummary || "");
        setComplexityIndex(data.complexityIndex || 0);
        if (data.dnaSequence && data.dnaSequence.length > 0) {
          setSelectedNode(data.dnaSequence[0]);
        }
        if (!initial) {
          toast.success("Codebase deconstructed! Evolutionary DNA Synced.");
        }
      } else {
        toast.error("Failed to deconstruct codebase DNA.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error communicating with AI deconstruction backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      // Initial fetch on mount
      fetchDnaSequence(true);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  // Canvas Double-Helix Animator
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dnaSeq.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 420);
    let phase = 0;

    const baseColors = {
      A: "#06b6d4", // Cyan
      S: "#8b5cf6", // Violet
      T: "#10b981", // Emerald
      I: "#f59e0b", // Amber
      V: "#f43f5e", // Rose
    };

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = canvas.parentElement?.clientWidth || 800;
        height = canvas.height = 420;
      }
    };
    window.addEventListener("resize", handleResize);

    const drawHelix = () => {
      ctx.clearRect(0, 0, width, height);

      const numPoints = dnaSeq.length;
      const spacing = width / (numPoints + 1);
      const amplitude = 70;
      const speed = 0.02;

      nodePositions.current = [];
      phase += speed;

      // Draw standard connection threads first (Rungs of the ladder)
      for (let i = 0; i < numPoints; i++) {
        const x = spacing * (i + 1);
        const factor = (i / numPoints) * Math.PI * 4;
        
        const y1 = height / 2 + Math.sin(factor + phase) * amplitude;
        const y2 = height / 2 - Math.sin(factor + phase) * amplitude;

        const node = dnaSeq[i];
        const color = baseColors[node.base] || "#ffffff";

        // Draw connections (rungs)
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.strokeStyle = `${color}25`; // Very transparent connection
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw dynamic inner glow connection
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.strokeStyle = `${color}0A`;
        ctx.lineWidth = 8;
        ctx.stroke();
      }

      // Draw Strand 1 & Strand 2 (nucleotides & nodes)
      for (let i = 0; i < numPoints; i++) {
        const x = spacing * (i + 1);
        const factor = (i / numPoints) * Math.PI * 4;
        
        const y1 = height / 2 + Math.sin(factor + phase) * amplitude;
        const y2 = height / 2 - Math.sin(factor + phase) * amplitude;

        const node = dnaSeq[i];
        const color = baseColors[node.base] || "#ffffff";

        // Track Node positions for hover checks
        // We track both complimentary nodes
        nodePositions.current.push(
          { x, y: y1, index: i },
          { x, y: y2, index: i }
        );

        const isSelected = selectedNode?.sha === node.sha;

        // Draw Base 1 (Strand A Node)
        ctx.beginPath();
        ctx.arc(x, y1, isSelected ? 12 : 7, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowBlur = isSelected ? 20 : 8;
        ctx.shadowColor = color;
        ctx.fill();

        // Draw Base 2 (Strand B Complimentary Node)
        ctx.beginPath();
        ctx.arc(x, y2, isSelected ? 12 : 7, 0, Math.PI * 2);
        ctx.fillStyle = `${color}BB`;
        ctx.shadowBlur = isSelected ? 20 : 8;
        ctx.shadowColor = color;
        ctx.fill();

        // Reset shadow
        ctx.shadowBlur = 0;

        // Draw dynamic outer particle pulses
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(x, y1, 20 + Math.sin(phase * 4) * 6, 0, Math.PI * 2);
          ctx.strokeStyle = `${color}40`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Draw Base letters on selected nodes
        if (isSelected) {
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 9px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(node.base, x, y1);
          ctx.fillText(node.base, x, y2);
        }
      }

      animationFrameId.current = requestAnimationFrame(drawHelix);
    };

    drawHelix();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [dnaSeq, selectedNode]);

  // Handle click on canvas nodes
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Scale coordinates back to canvas dimensions
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clickX = mouseX * scaleX;
    const clickY = mouseY * scaleY;

    // Find closest node
    let closestNode: { x: number; y: number; index: number } | null = null;
    let minDistance = 25; // Click radius

    const positions = nodePositions.current as Array<{ x: number; y: number; index: number }>;
    for (const nodePos of positions) {
      const dist = Math.sqrt(Math.pow(clickX - nodePos.x, 2) + Math.pow(clickY - nodePos.y, 2));
      if (dist < minDistance) {
        minDistance = dist;
        closestNode = nodePos;
      }
    }

    if (closestNode !== null) {
      const nodeIndex = closestNode.index;
      setSelectedNode(dnaSeq[nodeIndex]);
    }
  };

  const getBaseBadge = (base: string) => {
    switch (base) {
      case "A":
        return <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg text-[10px] font-black uppercase tracking-wider">Complexity [A]</span>;
      case "S":
        return <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/30 text-violet-400 rounded-lg text-[10px] font-black uppercase tracking-wider">Security [S]</span>;
      case "T":
        return <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-wider">Test Coverage [T]</span>;
      case "I":
        return <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-[10px] font-black uppercase tracking-wider">Infra [I]</span>;
      default:
        return <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-[10px] font-black uppercase tracking-wider">Velocity [V]</span>;
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen w-full bg-white dark:bg-black text-black dark:text-white lg:pl-24 pt-24 pb-16 px-8 relative overflow-hidden font-sans">
      
      {/* Background radial gradients for command deck */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(245,158,11,0.03),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--gold)_0.5px,transparent_0.5px)] bg-[length:35px_35px] opacity-[0.04] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-100 dark:border-zinc-900 pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 border border-primary/20 bg-primary/5 rounded-full">
              <Dna className="h-3 w-3 text-primary animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-primary">Evolution Simulation Arena</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase italic tracking-tighter leading-none">
              Codebase <span className="text-primary">DNA Genomap</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold italic">
              Watch your repository commits deconstructed into organic genetic building blocks in real-time.
            </p>
          </div>

          {/* Repo Input Box */}
          <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-950 p-2 border border-zinc-200 dark:border-zinc-900 rounded-2xl w-full md:max-w-md shadow-sm">
            <div className="pl-3 text-zinc-400"><Search className="h-4 w-4" /></div>
            <input
              type="text"
              placeholder="github.com/owner/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none font-bold text-xs text-black dark:text-white"
              disabled={isLoading}
            />
            <button
              onClick={() => fetchDnaSequence()}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-white cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
            >
              {isLoading ? "Analyzing..." : "Deconstruct"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Double-Helix Visualizer Node Deck */}
        <div className="bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-900 rounded-[2.5rem] p-6 lg:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-6 left-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 z-20">
            <GitBranch className="h-4 w-4 text-primary" />
            <span>Active Helix Node: <span className="text-black dark:text-white italic">{projectName}</span></span>
          </div>

          {/* Guide Helper */}
          <div className="absolute top-6 right-6 flex items-center gap-1.5 text-[9px] font-bold text-zinc-400 bg-white dark:bg-black border border-zinc-150 dark:border-zinc-900 px-3 py-1 rounded-full z-20">
            <Info className="h-3.5 w-3.5 text-primary" />
            <span>Click double-helix nodes to inspect genetic commit details.</span>
          </div>

          <div className="w-full flex items-center justify-center pt-8">
            {isLoading ? (
              <div className="h-[420px] w-full flex flex-col items-center justify-center space-y-4">
                <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Sequencing nucleotides from repository...</p>
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="w-full h-[420px] cursor-pointer"
              />
            )}
          </div>
        </div>

        {/* Genome Architect AI Intelligence Summary */}
        {executiveSummary && (
          <div className="bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-900 rounded-[2.5rem] p-8 lg:p-10 space-y-6 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl">
                <Dna className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter italic">AI Genome Executive Analysis</h3>
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Structured system DNA briefing from the Genome Architect Agent</span>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6 pt-2 border-t border-zinc-150 dark:border-zinc-900/60">
              {executiveSummary.split("\n\n").map((paragraph, index) => (
                <div key={index} className="p-6 bg-white dark:bg-black border border-zinc-200/50 dark:border-zinc-900/50 rounded-3xl space-y-2 relative">
                  <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary/40 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary">PHASE 0{index + 1} Matrix</span>
                  <p className="text-[11px] font-semibold leading-relaxed text-zinc-600 dark:text-zinc-400 italic">
                    {paragraph}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Genetic Mutation Dossier & Stats */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Genetic Mutation Dossier Panel */}
          <div className="lg:col-span-2 bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-900 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic">Genetic Mutation Dossier</h3>
            </div>

            {selectedNode ? (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-4 justify-between border-b border-zinc-100 dark:border-zinc-900 pb-5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nucleotide Node ID</span>
                    <h4 className="text-xl font-bold font-mono tracking-wide text-primary">#{selectedNode.sha}</h4>
                  </div>
                  {getBaseBadge(selectedNode.base)}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-5 bg-white dark:bg-black border border-zinc-200/60 dark:border-zinc-900/60 rounded-2xl space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                      <User className="h-3 w-3 text-primary" /> Author Architect
                    </span>
                    <p className="text-xs font-black uppercase tracking-wide text-zinc-700 dark:text-zinc-300">{selectedNode.author}</p>
                  </div>

                  <div className="p-5 bg-white dark:bg-black border border-zinc-200/60 dark:border-zinc-900/60 rounded-2xl space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-primary" /> Mutation Timestamp
                    </span>
                    <p className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                      {new Date(selectedNode.date).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Codon Message</span>
                  <p className="text-sm font-bold italic leading-relaxed text-zinc-800 dark:text-zinc-200">
                    &quot;{selectedNode.message}&quot;
                  </p>
                </div>

                <div className="space-y-3 p-5 bg-primary/5 border border-primary/20 rounded-2xl">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                    <Activity className="h-4 w-4 animate-pulse" /> AI Synthesis Details
                  </span>
                  <p className="text-xs font-bold italic leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {selectedNode.details}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-[250px] w-full flex items-center justify-center text-zinc-400 text-xs font-bold italic">
                Select a nucleotide base pair in the Double-Helix to inspect.
              </div>
            )}
          </div>

          {/* Genetic Engineering Metrics summary */}
          <div className="bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-900 rounded-[2.5rem] p-8 space-y-8 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-2xl font-black uppercase tracking-tighter italic">Nucleotide Breakdown</h3>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                    <span className="text-cyan-400">Complexity [A]</span>
                    <span>{dnaSeq.filter(n => n.base === "A").length} genes</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-500 rounded-full transition-all duration-500" 
                      style={{ width: `${(dnaSeq.filter(n => n.base === "A").length / (dnaSeq.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                    <span className="text-violet-400">Security [S]</span>
                    <span>{dnaSeq.filter(n => n.base === "S").length} genes</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-violet-500 rounded-full transition-all duration-500" 
                      style={{ width: `${(dnaSeq.filter(n => n.base === "S").length / (dnaSeq.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                    <span className="text-emerald-400">Test Coverage [T]</span>
                    <span>{dnaSeq.filter(n => n.base === "T").length} genes</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                      style={{ width: `${(dnaSeq.filter(n => n.base === "T").length / (dnaSeq.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                    <span className="text-amber-400">Infrastructure [I]</span>
                    <span>{dnaSeq.filter(n => n.base === "I").length} genes</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                      style={{ width: `${(dnaSeq.filter(n => n.base === "I").length / (dnaSeq.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                    <span className="text-rose-400">Velocity [V]</span>
                    <span>{dnaSeq.filter(n => n.base === "V").length} genes</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                      style={{ width: `${(dnaSeq.filter(n => n.base === "V").length / (dnaSeq.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-900 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Codebase Magnitude</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-primary italic">
                    {dnaSeq.length > 0 ? Math.round(dnaSeq.reduce((acc, curr) => acc + curr.impact, 0) / dnaSeq.length) : 0}%
                  </span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Index</span>
                </div>
              </div>
              
              <div className="space-y-2 border-l border-zinc-200 dark:border-zinc-900 pl-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Helix Complexity</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-primary italic">
                    {complexityIndex > 0 ? complexityIndex.toFixed(1) : "0.0"}/10
                  </span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Helix</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

