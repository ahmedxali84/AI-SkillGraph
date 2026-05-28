"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ModeToggle } from "@/components/ModeToggle";
import { useStore } from "@/store/useStore";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Upload,
  User,
  LogOut,
  Brain,
  Rocket,
  Dna,
  ListTodo,
  FileText,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Command", href: "/dashboard", icon: LayoutDashboard },
  { name: "Genomap", href: "/genomap", icon: Dna },
  { name: "Audit", href: "/upload", icon: Upload },
  { name: "Launch", href: "/launchpad", icon: Rocket },
  { name: "Missions", href: "/tasks", icon: ListTodo },
  { name: "Resume", href: "/resume", icon: FileText },
  { name: "Identity", href: "/profile", icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, logout } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    setMobileOpen(false);
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
            <Link href="/" className="text-[11px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors text-black dark:text-white">
              Portal Access
            </Link>
            <ModeToggle />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* ── DESKTOP: SIDE COMMAND STATION ─────────────────────────────── */}
      <nav className="fixed left-0 top-0 h-screen w-20 z-[100] hidden lg:flex flex-col items-center justify-between py-8 bg-zinc-950 border-r border-zinc-900 shadow-[20px_0_40px_rgba(0,0,0,0.1)]">
        {/* Top Logo */}
        <Link href="/dashboard" className="group">
          <div className="p-2.5 bg-primary rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.25)] group-hover:scale-105 transition-all">
            <Brain className="h-5 w-5 text-white" />
          </div>
        </Link>

        {/* Center Navigation Links */}
        <div className="flex flex-col gap-6 w-full items-center">
          {NAV_ITEMS.map((item) => {
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

      {/* ── MOBILE: TOP BAR ───────────────────────────────────────────── */}
      <nav className="fixed top-0 z-[90] w-full border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/90 dark:bg-black/90 backdrop-blur-xl lg:hidden h-16 flex items-center px-5">
        <Link href="/dashboard" className="flex-1 flex items-center gap-3 group">
          <div className="p-1.5 bg-primary rounded-lg group-hover:scale-105 transition-transform">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="text-md font-black uppercase tracking-tighter text-black dark:text-white">
            SkillGraph
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ModeToggle />
          <button
            id="mobile-menu-toggle"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* ── MOBILE: OVERLAY BACKDROP ──────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── MOBILE: DRAWER ────────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 right-0 h-full w-[300px] z-[100] lg:hidden flex flex-col bg-zinc-950 border-l border-zinc-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Navigation drawer"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-primary rounded-lg">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-black uppercase tracking-tighter text-white">
              SkillGraph <span className="text-primary italic">AI</span>
            </span>
          </div>
          <button
            aria-label="Close navigation menu"
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-black text-xs uppercase tracking-widest ${
                  isActive
                    ? "bg-primary text-white shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.name}
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Drawer Footer */}
        <div className="px-4 py-5 border-t border-zinc-900">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-black text-xs uppercase tracking-widest"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            Terminate Session
          </button>
        </div>
      </aside>
    </>
  );
}
