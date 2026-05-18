"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ModeToggle } from "@/components/ModeToggle";
import { useStore } from "@/store/useStore";
import { 
  LayoutDashboard, 
  Upload, 
  User, 
  LogOut, 
  Brain, 
  Rocket,
  Dna,
  ListTodo,
  FileText
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, logout } = useStore();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!isLoggedIn) {
    return (
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-200/10 dark:border-zinc-900/30 bg-transparent backdrop-blur-md transition-all h-20 flex items-center px-8">
        <div className="container max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-primary rounded-xl transition-all group-hover:rotate-12 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase text-black dark:text-white">
              SkillGraph <span className="text-primary italic">AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-8">
             <Link href="/" className="text-[11px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors text-black dark:text-white">Portal Access</Link>
             <ModeToggle />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* UNIQUE SIDE COMMAND STATION */}
      <nav className="fixed left-0 top-0 h-screen w-20 z-[100] hidden lg:flex flex-col items-center justify-between py-8 bg-zinc-950 border-r border-zinc-900 shadow-[20px_0_40px_rgba(0,0,0,0.1)]">
        
        {/* Top Logo */}
        <Link href="/dashboard" className="group">
           <div className="p-2.5 bg-primary rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.25)] group-hover:scale-105 transition-all">
              <Brain className="h-5 w-5 text-white" />
           </div>
        </Link>

        {/* Center Navigation Links */}
        <div className="flex flex-col gap-6 w-full items-center">
           {[
             { name: "Command", href: "/dashboard", icon: LayoutDashboard },
             { name: "Genomap", href: "/genomap", icon: Dna },
             { name: "Audit", href: "/upload", icon: Upload },
             { name: "Launch", href: "/launchpad", icon: Rocket },
             { name: "Missions", href: "/tasks", icon: ListTodo },
             { name: "Resume", href: "/resume", icon: FileText },
             { name: "Identity", href: "/profile", icon: User },
           ].map((item) => {
             const isActive = pathname === item.href;
             return (
               <Link
                 key={item.href}
                 href={item.href}
                 className={`p-3 rounded-xl transition-all group relative ${
                   isActive 
                     ? "bg-primary text-white shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-105" 
                     : "text-zinc-500 hover:bg-zinc-900 hover:text-primary"
                 }`}
               >
                 <item.icon className="h-5 w-5" />
                 <span className="absolute left-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-zinc-800 pointer-events-none z-50">
                    {item.name}
                 </span>
               </Link>
             );
           })}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-5 items-center">
           <ModeToggle />
           <button 
             onClick={handleLogout} 
             className="p-3 rounded-xl text-zinc-500 hover:bg-red-500/10 hover:text-red-500 transition-all group relative animate-none"
           >
              <LogOut className="h-5 w-5" />
              <span className="absolute left-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Terminate
               </span>
           </button>
        </div>
      </nav>

      {/* MOBILE / TOP BAR (Minimalist & Fully Navigation-Enabled) */}
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-black/80 backdrop-blur-xl lg:hidden h-20 flex items-center px-6">
         <Link href="/dashboard" className="flex-1 flex items-center gap-3 group">
            <div className="p-2 bg-primary rounded-lg group-hover:scale-105 transition-transform">
               <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-md font-black uppercase tracking-tighter text-black dark:text-white">SkillGraph</span>
         </Link>
         <div className="flex items-center gap-1.5">
            {[
              { href: "/dashboard", icon: LayoutDashboard },
              { href: "/genomap", icon: Dna },
              { href: "/upload", icon: Upload },
              { href: "/launchpad", icon: Rocket },
              { href: "/tasks", icon: ListTodo },
              { href: "/resume", icon: FileText },
              { href: "/profile", icon: User },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`p-2 rounded-xl transition-all ${
                  pathname === item.href 
                    ? "bg-primary/10 text-primary animate-pulse" 
                    : "text-zinc-500 hover:text-black dark:hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5" />
              </Link>
            ))}
            <button 
              onClick={handleLogout} 
              className="p-2 rounded-xl text-zinc-500 hover:text-red-500 transition-all"
            >
              <LogOut className="h-5 w-5" />
            </button>
         </div>
      </nav>
    </>
  );
}
