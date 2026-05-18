"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Target, Sparkles, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function TasksPage() {
  const router = useRouter();
  const { isLoggedIn, tasks, addTasks, completeTask, skills } = useStore();
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  const generateTasks = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch("http://localhost:8000/generate-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills }),
      });

      if (!response.ok) throw new Error("Failed to generate tasks.");

      const newTasks = await response.json();
      
      // Ensure the tasks have a 'completed' field as required by our store
      const formattedTasks = newTasks.map((t: { id: string, title: string, xp: number, skill?: string }) => ({
        ...t,
        completed: false
      }));

      addTasks(formattedTasks);
      toast.success("New AI-curated tasks generated!");
    } catch (error) {
      console.error(error);
      toast.error("Backend offline. Make sure the FastAPI server is running.");
      
      // Fallback logic
      const topSkills = [...skills].sort((a,b) => b.level - a.level).slice(0, 3);
      const skill0 = topSkills[0]?.name || 'Web Component';
      const skill1 = topSkills[1]?.name || 'Core Logic';
      const fallbackTasks = [
        { id: Math.random().toString(36).substring(7), title: `Optimize a ${skill0} module`, xp: 40, completed: false },
        { id: Math.random().toString(36).substring(7), title: `Write unit tests for the ${skill1} layer`, xp: 60, completed: false }
      ];
      addTasks(fallbackTasks);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompleteTask = (id: string) => {
    completeTask(id);
    toast.success("Task verified! XP earned.");
  };

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans selection:bg-primary selection:text-white pt-28 lg:pt-10 pb-20 lg:pl-24">
      <div className="container max-w-6xl mx-auto px-6 space-y-16">
      <div className="flex flex-col md:flex-row items-end justify-between gap-10 border-b border-zinc-100 dark:border-zinc-900 pb-12">
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Intelligence Cycle</p>
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">Mission Hub.</h1>
          <p className="text-zinc-500 font-medium max-w-md italic">Daily technical challenges curated by neural intelligence.</p>
        </div>
        <Button 
          size="lg" 
          onClick={generateTasks} 
          loading={isGenerating}
          className="rounded-full px-10 h-14 text-xs font-black uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black"
        >
          <Sparkles className="mr-2 h-4 w-4" /> Generate Missions
        </Button>
      </div>

      <div className="grid gap-16 md:grid-cols-5">
        <div className="md:col-span-3 space-y-8">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-zinc-400">
            <Target className="h-4 w-4" /> Active Protocols
          </h2>
          <AnimatePresence mode="popLayout">
            {incompleteTasks.length > 0 ? (
              <div className="grid gap-4">
                {incompleteTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    layout
                  >
                    <div className="group relative border border-zinc-100 dark:border-zinc-900 p-8 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-all duration-500">
                      <div className="flex items-center gap-8">
                        <button 
                          onClick={() => handleCompleteTask(task.id)}
                          className="flex-shrink-0 hover:scale-110 transition-transform focus:outline-none"
                        >
                          <Circle className="h-8 w-8 text-zinc-200 group-hover:text-black dark:group-hover:text-white transition-colors" />
                        </button>
                        <div className="flex-1 space-y-2">
                          <p className="font-black text-xl tracking-tight uppercase">{task.title}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Domain: {task.skill || "Core Engineering"}</p>
                        </div>
                        <div className="text-sm font-black tracking-tighter">
                          +{task.xp} XP
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-center py-32 border border-dashed border-zinc-100 dark:border-zinc-900 rounded-3xl space-y-8"
              >
                <div className="p-8 bg-zinc-50 dark:bg-zinc-950 rounded-full w-fit mx-auto">
                  <Brain className="h-12 w-12 text-zinc-200" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black uppercase tracking-tight">Cycle Optimized.</h3>
                  <p className="text-zinc-500 max-w-xs mx-auto text-sm font-medium italic">Your neural agent has fulfilled all current mission protocols.</p>
                </div>
                <Button variant="outline" onClick={generateTasks} loading={isGenerating} className="rounded-full px-12 h-12 text-[10px] font-black uppercase tracking-widest border-zinc-200 dark:border-zinc-800">
                  New Mission Cycle
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="md:col-span-2 space-y-8">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-zinc-300 dark:text-zinc-700">
            <CheckCircle2 className="h-4 w-4" /> Archive
          </h2>
          <div className="space-y-4">
            {completedTasks.length > 0 ? (
              completedTasks.map((task) => (
                <div key={task.id} className="p-6 border border-zinc-100 dark:border-zinc-900 rounded-2xl opacity-40 hover:opacity-100 transition-opacity flex items-center gap-4">
                  <div className="p-2 bg-zinc-50 dark:bg-zinc-950 rounded-full">
                    <CheckCircle2 className="h-4 w-4 text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs uppercase tracking-widest text-zinc-500 line-through truncate">{task.title}</p>
                    <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest mt-1">VERIFIED PROTOCOL</p>
                  </div>
                  <span className="text-[10px] font-black">+{task.xp}</span>
                </div>
              ))
            ) : (
              <div className="text-[10px] text-center text-zinc-300 font-black uppercase tracking-[0.2em] py-32">
                Empty Archive
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

