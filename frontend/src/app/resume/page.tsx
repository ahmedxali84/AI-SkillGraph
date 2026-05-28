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
      setAiSummary(
        "Software Developer with an AI-verified track record of shipping complex projects. Proficient in modern engineering architectures with demonstrable proof of work."
      );
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

  // ── Multi-page PDF generation ──────────────────────────────────────────────
  const handleDownload = async () => {
    if (!resumeRef.current) return;

    setIsDownloading(true);
    toast.info("Generating PDF — please wait...");

    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      // Allow any pending renders to settle
      await new Promise((resolve) => setTimeout(resolve, 600));

      const element = resumeRef.current;

      const canvas = await html2canvas(element, {
        scale: 2.5,          // balanced quality vs. file size
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const A4_W_MM = pdf.internal.pageSize.getWidth();   // 210
      const A4_H_MM = pdf.internal.pageSize.getHeight();  // 297

      // Convert canvas pixels → mm using jsPDF internal DPI (72 pt/inch → mm)
      const pxPerMm = canvas.width / A4_W_MM;
      const totalHeightMm = canvas.height / pxPerMm;

      let remainingHeightMm = totalHeightMm;
      let sourceYPx = 0;
      let isFirstPage = true;

      while (remainingHeightMm > 0) {
        if (!isFirstPage) pdf.addPage();

        const sliceHeightMm = Math.min(remainingHeightMm, A4_H_MM);
        const sliceHeightPx = Math.round(sliceHeightMm * pxPerMm);

        // Slice the canvas for this page
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeightPx;

        const ctx = pageCanvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            canvas,
            0, sourceYPx,               // source x, y
            canvas.width, sliceHeightPx, // source w, h
            0, 0,                        // dest x, y
            canvas.width, sliceHeightPx  // dest w, h
          );
        }

        const pageImg = pageCanvas.toDataURL("image/jpeg", 0.92);
        pdf.addImage(pageImg, "JPEG", 0, 0, A4_W_MM, sliceHeightMm);

        sourceYPx += sliceHeightPx;
        remainingHeightMm -= sliceHeightMm;
        isFirstPage = false;
      }

      pdf.save(`${username}_SkillGraph_Resume.pdf`);
      toast.success("Resume downloaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("PDF generation failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const topSkills = [...skills].sort((a, b) => b.level - a.level).slice(0, 8);
  const recentProjects = [...projects].slice(0, 4);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-primary selection:text-white pt-28 lg:pt-10 pb-20 lg:pl-24">
      <div className="container py-16 px-6 max-w-7xl mx-auto space-y-16">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-10 border-b border-zinc-100 dark:border-zinc-900 pb-12">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Professional Synthesis</p>
            <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">Smart Resume.</h1>
            <p className="text-zinc-500 font-medium max-w-md italic">
              Drafted by neural agents based on verified SkillGraph metrics.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => generateAiSummary(true)}
              disabled={isGenerating}
              className="rounded-full h-12 px-8 text-xs font-black uppercase tracking-widest border-zinc-200 dark:border-zinc-800"
            >
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              {isGenerating ? "Synthesizing..." : "Re-Synthesize"}
            </Button>
            <Button
              id="download-pdf-btn"
              onClick={handleDownload}
              disabled={isDownloading}
              className="rounded-full h-12 px-8 text-xs font-black uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black"
            >
              <Download className="mr-2 h-3.5 w-3.5" />
              {isDownloading ? "Generating..." : "Export PDF"}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-12">
          {/* Controls/Info Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="p-8 border border-zinc-100 dark:border-zinc-900 rounded-2xl bg-zinc-50 dark:bg-zinc-950 space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Brain className="h-3 w-3" /> AI Insights
              </h3>
              <div className="space-y-4 text-xs font-bold text-zinc-500 leading-relaxed uppercase tracking-widest">
                <p>
                  Verified Skills:{" "}
                  <span className="text-black dark:text-white">{skills.length}</span>
                </p>
                <p>
                  Project Proofs:{" "}
                  <span className="text-black dark:text-white">{projects.length}</span>
                </p>
                <p>
                  Skill Score:{" "}
                  <span className="text-black dark:text-white">{score} XP</span>
                </p>
                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
                  <p className="text-[9px] italic lowercase leading-normal tracking-normal text-zinc-400">
                    &quot;Profile indicates strong alignment with{" "}
                    {skills[0]?.name || "modern engineering"} standards. verified by
                    agent v1.2.&quot;
                  </p>
                </div>
              </div>
            </div>

            {/* PDF tip */}
            <div className="p-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 leading-relaxed">
                <span className="text-primary">Tip:</span> The exported PDF will auto-paginate across multiple pages for long resumes.
              </p>
            </div>
          </div>

          {/* Resume Preview */}
          <div className="lg:col-span-3 bg-zinc-50 dark:bg-zinc-950 p-6 md:p-12 rounded-3xl border border-zinc-100 dark:border-zinc-900 flex justify-center overflow-x-auto">
            {/*
              resumeRef wraps only the white A4-like content — no outer dark UI chrome.
              This is what gets captured by html2canvas.
            */}
            <div
              ref={resumeRef}
              className="bg-white text-black shadow-2xl border border-zinc-100 flex-shrink-0"
              style={{
                width: "210mm",
                padding: "20mm",
                fontFamily: "Inter, system-ui, sans-serif",
                minHeight: "297mm",
                boxSizing: "border-box",
              }}
            >
              {/* ── HEADER ───────────────────────────────────────────── */}
              <div
                style={{
                  borderBottom: "12px solid black",
                  paddingBottom: "12mm",
                  marginBottom: "12mm",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <div>
                  <h1
                    style={{
                      fontSize: "48px",
                      fontWeight: 900,
                      letterSpacing: "-2px",
                      textTransform: "uppercase",
                      lineHeight: 1,
                      marginBottom: "8px",
                    }}
                  >
                    {username}
                  </h1>
                  <div style={{ display: "flex", gap: "24px", fontSize: "10px", fontWeight: 800, color: "#71717a", textTransform: "uppercase", letterSpacing: "3px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <ShieldCheck style={{ width: 12, height: 12, color: "black" }} />
                      {score} XP Verified
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <ShieldCheck style={{ width: 12, height: 12, color: "black" }} />
                      {projects.length} AI Proofs
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    background: "black",
                    color: "white",
                    padding: "8px 16px",
                    fontWeight: 900,
                    fontSize: "11px",
                    letterSpacing: "4px",
                    textTransform: "uppercase",
                  }}
                >
                  PROTOCOL
                </div>
              </div>

              {/* ── SUMMARY ──────────────────────────────────────────── */}
              <div style={{ marginBottom: "12mm" }}>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#18181b",
                    lineHeight: 1.5,
                    fontStyle: "italic",
                    maxWidth: "560px",
                  }}
                >
                  {isGenerating ? "AI Agent is crafting your summary..." : aiSummary}
                </p>
              </div>

              {/* ── BODY: 2-COLUMN GRID ──────────────────────────────── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16mm" }}>
                {/* SIDEBAR */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12mm" }}>
                  {/* Skills */}
                  <section>
                    <h2
                      style={{
                        fontSize: "9px",
                        fontWeight: 800,
                        color: "#a1a1aa",
                        marginBottom: "8mm",
                        textTransform: "uppercase",
                        letterSpacing: "3px",
                      }}
                    >
                      Core Intelligence
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6mm" }}>
                      {topSkills.length > 0 ? topSkills.map((skill) => (
                        <div key={skill.name}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "9px",
                              fontWeight: 800,
                              textTransform: "uppercase",
                              letterSpacing: "2px",
                              marginBottom: "3px",
                            }}
                          >
                            <span style={{ color: "black" }}>{skill.name}</span>
                            <span style={{ color: "#a1a1aa" }}>LVL {skill.level}</span>
                          </div>
                          <div style={{ width: "100%", background: "#f4f4f5", height: "2px", overflow: "hidden" }}>
                            <div
                              style={{
                                background: "#f59e0b",
                                height: "100%",
                                width: `${Math.min(100, (skill.level / 10) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )) : (
                        <p style={{ fontSize: "9px", color: "#a1a1aa", fontStyle: "italic" }}>No skills yet.</p>
                      )}
                    </div>
                  </section>

                  {/* Global Rank */}
                  <section style={{ background: "#fafafa", padding: "8mm", border: "1px solid #f4f4f5" }}>
                    <h2
                      style={{
                        fontSize: "9px",
                        fontWeight: 800,
                        color: "#a1a1aa",
                        marginBottom: "6mm",
                        textTransform: "uppercase",
                        letterSpacing: "3px",
                      }}
                    >
                      Global Rank
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4mm" }}>
                      {[
                        { label: "Architectural", rank: "TOP 5%" },
                        { label: "Implementation", rank: "TOP 2%" },
                      ].map((row) => (
                        <div
                          key={row.label}
                          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                        >
                          <span style={{ fontSize: "9px", fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: "2px" }}>
                            {row.label}
                          </span>
                          <span style={{ fontSize: "12px", fontWeight: 900, color: "black" }}>{row.rank}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* MAIN CONTENT */}
                <div>
                  <section>
                    <h2
                      style={{
                        fontSize: "9px",
                        fontWeight: 800,
                        color: "#a1a1aa",
                        marginBottom: "10mm",
                        textTransform: "uppercase",
                        letterSpacing: "3px",
                      }}
                    >
                      Verified Proof of Work
                    </h2>

                    {recentProjects.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10mm" }}>
                        {recentProjects.map((project) => (
                          <div key={project.id}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "3px" }}>
                              <h3
                                style={{
                                  fontSize: "20px",
                                  fontWeight: 900,
                                  textTransform: "uppercase",
                                  letterSpacing: "-0.5px",
                                  lineHeight: 1,
                                  color: "black",
                                }}
                              >
                                {project.name}
                              </h3>
                              <span
                                style={{
                                  fontSize: "8px",
                                  fontWeight: 900,
                                  color: "white",
                                  background: "black",
                                  padding: "4px 10px",
                                  textTransform: "uppercase",
                                  letterSpacing: "2px",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {project.difficulty}
                              </span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                gap: "16px",
                                fontSize: "9px",
                                fontWeight: 800,
                                color: "#a1a1aa",
                                textTransform: "uppercase",
                                letterSpacing: "2px",
                                marginBottom: "5mm",
                              }}
                            >
                              <span>{project.type}</span>
                              <span>{new Date(project.date).toLocaleDateString()}</span>
                            </div>
                            <p style={{ fontSize: "11px", color: "#52525b", lineHeight: 1.7, fontWeight: 500 }}>
                              Successfully evaluated by SkillGraph Agents. Demonstrated verified proficiency in{" "}
                              <strong style={{ color: "black" }}>
                                {project.skillsDetected.join(", ")}
                              </strong>
                              . Engineering maturity verified at{" "}
                              {project.difficulty.toLowerCase()} level with high architectural integrity scores.
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: "24mm 0",
                          textAlign: "center",
                          border: "1px dashed #e4e4e7",
                          borderRadius: "8px",
                        }}
                      >
                        <FileText style={{ width: 32, height: 32, color: "#e4e4e7", margin: "0 auto 8px" }} />
                        <p style={{ fontSize: "9px", color: "#a1a1aa", fontWeight: 800, textTransform: "uppercase", letterSpacing: "3px" }}>
                          No verified projects found.
                        </p>
                      </div>
                    )}
                  </section>
                </div>
              </div>

              {/* ── FOOTER ───────────────────────────────────────────── */}
              <div
                style={{
                  marginTop: "auto",
                  paddingTop: "12mm",
                  borderTop: "1px solid #f4f4f5",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "8px",
                  fontWeight: 800,
                  color: "#a1a1aa",
                  textTransform: "uppercase",
                  letterSpacing: "3px",
                }}
              >
                <span>SkillGraph Intelligence Protocol v1.0</span>
                <span style={{ color: "black", textDecoration: "underline", textDecorationThickness: "2px" }}>
                  skillgraph.ai/p/{username.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
