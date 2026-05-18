"use client";

import { useStore } from "@/store/useStore";
import { Hexagon, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { use } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { username: currentUsername, skills, projects, score } = useStore();

  const isCurrentUser = currentUsername.toLowerCase() === username.toLowerCase();

  // If not current user, generate some dynamic data based on the name for demo purposes, 
  // but for the user's request we'll prioritize real data if it's the current user.
  const displaySkills = isCurrentUser ? skills : [];
  const displayScore = isCurrentUser ? score : 0;
  const displayProjects = isCurrentUser ? projects.length : 0;

  const sortedSkills = [...displaySkills].sort((a, b) => {
    if (a.level === b.level) return b.progress - a.progress;
    return b.level - a.level;
  });

  return (
    <div className="container max-w-7xl py-24 px-6 space-y-24 bg-white dark:bg-black min-h-screen">
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center p-20 bg-white dark:bg-black rounded-[4rem] border border-zinc-100 dark:border-zinc-900 shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-32 bg-zinc-50 dark:bg-zinc-950 rounded-full blur-[120px] -z-10 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-900 transition-colors duration-1000" />
        
        <div className="h-48 w-48 rounded-full border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-black flex items-center justify-center text-7xl font-black shadow-2xl mb-12 relative group-hover:italic transition-all">
          <div className="absolute inset-0 rounded-full border-2 border-black dark:border-white animate-ping opacity-10" />
          {username.charAt(0).toUpperCase()}
        </div>
        
        <div className="space-y-6">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">{username}.</h1>
          <div className="flex items-center justify-center gap-4">
             <ShieldCheck className="h-6 w-6 text-black dark:text-white" />
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">Verified Intelligence Node</p>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-12 mt-16">
          <div className="flex flex-col items-center p-10 bg-zinc-50 dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-900 min-w-[200px] group/item hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
            <Hexagon className="h-8 w-8 mb-4 opacity-20 group-hover/item:opacity-100 transition-all" />
            <span className="text-5xl font-black tracking-tighter italic">{displayScore}</span>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] mt-3 opacity-40">Magnitude</span>
          </div>
          <div className="flex flex-col items-center p-10 bg-zinc-50 dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-900 min-w-[200px] group/item hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
            <Zap className="h-8 w-8 mb-4 opacity-20 group-hover/item:opacity-100 transition-all" />
            <span className="text-5xl font-black tracking-tighter italic">{displayProjects}</span>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] mt-3 opacity-40">Verified Proofs</span>
          </div>
        </div>
      </motion.div>

      {/* Skills Grid */}
      <div className="space-y-16">
        <div className="space-y-4 text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 italic">Sector Analysis</p>
           <h2 className="text-5xl font-black uppercase tracking-tighter italic leading-none">Core Competencies.</h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          {sortedSkills.map((skill, index) => (
            <motion.div 
              key={skill.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-12 border border-zinc-100 dark:border-zinc-900 rounded-[3rem] bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-all group"
            >
              <div className="flex justify-between items-start mb-10">
                <div className="space-y-3">
                  <h3 className="font-black text-4xl tracking-tighter uppercase italic leading-none">{skill.name}</h3>
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${skill.level > 8 ? 'bg-black dark:bg-white animate-pulse' : 'bg-zinc-200'}`} />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">Sector Synchronization: Active</span>
                  </div>
                </div>
                <div className="h-20 w-20 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-900 flex flex-col items-center justify-center group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all duration-500">
                  <span className="text-[8px] font-black opacity-30 uppercase mb-1">MAG</span>
                  <span className="text-3xl font-black italic leading-none">{skill.level}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300">
                  <span>Progress Magnification</span>
                  <span className="group-hover:text-black dark:group-hover:text-white transition-colors">{Math.round(skill.progress)}%</span>
                </div>
                <div className="h-[2px] w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                   <div className="h-full bg-black dark:bg-white" style={{ width: `${skill.progress}%` }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="text-center pt-24 border-t border-zinc-100 dark:border-zinc-900">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-12 italic">Intelligence verified by SkillGraph AI Synthetic Agents.</p>
        {!isCurrentUser && (
          <Link href="/" className={buttonVariants({ className: "rounded-full h-20 px-16 font-black uppercase tracking-[0.3em] text-xs bg-black text-white dark:bg-white dark:text-black shadow-2xl hover:scale-105 transition-transform" })}>
            Initialize Your Node <Zap className="ml-4 h-5 w-5" />
          </Link>
        )}
      </div>
    </div>
  );
}


