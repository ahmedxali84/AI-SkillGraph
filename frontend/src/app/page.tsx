"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";
import { 
  Brain, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Lock, 
  Mail, 
  Phone,
  ArrowRight,
  ShieldAlert
} from "lucide-react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [tab, setTab] = useState<"email" | "mobile">("email");
  const router = useRouter();
  const { login, isLoggedIn } = useStore();

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/dashboard");
    }
  }, [isLoggedIn, router]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Identity Verification Required.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      login(username.trim());
      toast.success(authMode === "login" ? "Protocol Synced. Welcome, Architect." : "Protocol Initialized. Node Active.");
      router.push("/dashboard");
    }, 1200);
  };

  if (isLoggedIn) return null;

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-black overflow-hidden font-sans selection:bg-primary selection:text-white pt-20 lg:pt-0">
      
      {/* LEFT COLUMN: Modern Intelligence Bento Overview */}
      <div className="w-full lg:w-1/2 relative p-8 lg:p-16 flex flex-col justify-center bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-100 dark:border-zinc-900 overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(245,158,11,0.06),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(245,158,11,0.03),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--gold)_0.5px,transparent_0.5px)] bg-[length:30px_30px] opacity-10 pointer-events-none" />

        <div className="relative z-10 space-y-12 max-w-2xl mx-auto lg:mx-0">
          {/* Version Badge */}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-primary/20 bg-primary/5 rounded-full">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Intelligence Protocol v4.2</p>
          </div>

          {/* Heading */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase italic leading-[0.85] text-black dark:text-white">
              Architect <br />
              Your Identity.
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl font-bold italic leading-tight max-w-xl">
              SkillGraph AI transforms your technical magnitude into a verified engineering dossier. No placeholders. Just pure cryptographic magnitude.
            </p>
          </div>

          {/* Bento Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 pt-4">
            <div className="p-8 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-900 rounded-[2rem] space-y-4 hover:border-primary/40 transition-all group shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-100 dark:border-zinc-800 group-hover:bg-primary transition-colors duration-500">
                <ShieldCheck className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-tight italic text-black dark:text-white">Verified Audit</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold italic leading-relaxed">Proof-of-work protocols that validate every technical milestone deeply.</p>
              </div>
            </div>

            <div className="p-8 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-900 rounded-[2rem] space-y-4 hover:border-primary/40 transition-all group shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-100 dark:border-zinc-800 group-hover:bg-primary transition-colors duration-500">
                <Activity className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-tight italic text-black dark:text-white">Magnitude Map</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold italic leading-relaxed">Real-time synchronization of your engineering capability DNA.</p>
              </div>
            </div>

            <div className="p-8 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-900 rounded-[2rem] space-y-4 hover:border-primary/40 transition-all group shadow-sm md:col-span-2">
              <div className="flex gap-6 items-start">
                <div className="h-12 w-12 shrink-0 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-100 dark:border-zinc-800 group-hover:bg-primary transition-colors duration-500">
                  <Cpu className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase tracking-tight italic text-black dark:text-white">Neural Deep Synthesis</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold italic leading-relaxed">Advanced AI agents map actual repository structures and parse files to build complete executive portfolios.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: LinkedIn-Style Premium Auth Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative bg-white dark:bg-black overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.04),transparent_70%)] pointer-events-none" />
        
        {/* Animated accent circles */}
        <div className="absolute top-1/4 right-1/4 h-72 w-72 bg-primary/5 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 h-72 w-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[460px] space-y-10 relative z-10 py-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-black uppercase tracking-tighter text-black dark:text-white">
                SkillGraph <span className="text-primary italic">AI</span>
              </span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-none text-black dark:text-white">
              {authMode === "login" ? "Portal Access." : "Initialize Node."}
            </h2>
            <p className="text-zinc-400 text-xs font-bold italic">
              {authMode === "login" ? "Enter your technical identity to access the Intelligence Command Station." : "Activate your cryptographic profile and begin proof-of-work audits."}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex gap-1.5 bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200/20 p-1.5 rounded-2xl">
            <button
              onClick={() => setAuthMode("login")}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                authMode === "login" 
                  ? "bg-white dark:bg-black text-primary shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-zinc-200/10" 
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode("signup")}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                authMode === "signup" 
                  ? "bg-white dark:bg-black text-primary shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-zinc-200/10" 
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              Register Node
            </button>
          </div>

          {/* Form Tabs */}
          <div className="flex gap-8 border-b border-zinc-100 dark:border-zinc-900/80">
            <button
              onClick={() => setTab("email")}
              className={`pb-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${
                tab === "email" ? "border-primary text-primary" : "border-transparent text-zinc-400 hover:text-zinc-600"
              }`}
            >
              E-mail Access
            </button>
            <button
              onClick={() => setTab("mobile")}
              className={`pb-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${
                tab === "mobile" ? "border-primary text-primary" : "border-transparent text-zinc-400 hover:text-zinc-600"
              }`}
            >
              Mobile Node
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleAuth} className="space-y-5">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-primary transition-colors">
                {tab === "email" ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
              </div>
              <input
                type={tab === "email" ? "email" : "text"}
                placeholder={tab === "email" ? "email@domain.com" : "+1 (555) 000-0000"}
                className="w-full h-14 pl-14 pr-6 bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-900 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none rounded-2xl font-bold text-xs transition-all text-black dark:text-white"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-primary transition-colors">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                placeholder="Identity Password"
                className="w-full h-14 pl-14 pr-6 bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-900 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none rounded-2xl font-bold text-xs transition-all text-black dark:text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 rounded-2xl text-[10px] font-bold text-zinc-500 italic">
              <ShieldAlert className="h-4 w-4 text-primary shrink-0" />
              <span>Identity validation employs AES-256 local decryption and strict CSP transport layers.</span>
            </div>

            {/* Submit Button */}
            <button
              className="w-full h-14 rounded-full font-black uppercase tracking-[0.3em] text-[10px] bg-primary hover:bg-primary/95 text-white shadow-[0_10px_30px_rgba(245,158,11,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synchronizing...</span>
                </>
              ) : (
                <>
                  <span>{authMode === "login" ? "Access Command Station" : "Initialize Protocol"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Mode switch helper text */}
          <p className="text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            {authMode === "login" ? "Don't have an active node?" : "Already verified?"}{" "}
            <button
              onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
              className="text-primary hover:underline font-black ml-1 bg-transparent border-none cursor-pointer"
            >
              {authMode === "login" ? "Initialize Now" : "Portal Access"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
