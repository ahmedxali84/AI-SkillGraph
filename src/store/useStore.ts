import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Skill {
  name: string;
  level: number;
  progress: number;
}

export interface Project {
  id: string;
  name: string;
  type: string;
  skillsDetected: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  date: string;
}

export interface Task {
  id: string;
  title: string;
  xp: number;
  completed: boolean;
  skill?: string;
}

export interface Venture {
  id: string;
  projectName: string;
  currentStage: number;
  brutalCritique: string;
  securityAudit: string;
  roadmap: Array<{
    stage: number;
    title: string;
    tasks: Array<{
      id: string;
      title: string;
      howTo: string;
      completed: boolean;
    }>;
    milestone: string;
  }>;
  nextImmediateAction: string;
  date: string;
}

export interface ProfileData {
  fullName: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    linkedin: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    role: string;
    period: string;
    bulletPoints: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    techStack: string;
    impact: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
  };
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  atsScore: number;
}

interface UserState {
  isLoggedIn: boolean;
  username: string;
  score: number;
  streak: number;
  skills: Skill[];
  projects: Project[];
  ventures: Venture[];
  tasks: Task[];
  profileData: ProfileData | null;
  login: (username: string) => void;
  logout: () => void;
  addProject: (project: Project) => void;
  addVenture: (venture: Venture) => void;
  evolveVenture: (ventureId: string, newStage: Venture['roadmap'][0]) => void;
  toggleVentureTask: (ventureId: string, stageIdx: number, taskId: string) => void;
  updateSkill: (skillName: string, progressAmount: number) => void;
  completeTask: (taskId: string) => void;
  addTasks: (tasks: Task[]) => void;
  setGitHubData: (data: { skills: Skill[]; projects: Project[]; score: number }) => void;
  setProfileData: (data: ProfileData) => void;
  resetStore: () => void;
}

export const useStore = create<UserState>()(
  persist(
    (set) => ({
  isLoggedIn: false,
  username: '',
  score: 0,
  streak: 0,
  skills: [],
  projects: [],
  ventures: [],
  tasks: [],
  profileData: null,
  login: (username) =>
    set({ isLoggedIn: true, username, streak: 1, score: 0 }),
  logout: () =>
    set({ isLoggedIn: false, username: '', score: 0, streak: 0, projects: [], ventures: [], skills: [], tasks: [], profileData: null }),
  resetStore: () =>
    set({ isLoggedIn: false, username: '', score: 0, streak: 0, projects: [], ventures: [], skills: [], tasks: [], profileData: null }),
  setProfileData: (data) => set({ profileData: data }),
  addVenture: (venture) =>
    set((state) => ({ ventures: [venture, ...state.ventures] })),
  evolveVenture: (ventureId, newStage) =>
    set((state) => ({
      ventures: state.ventures.map((v) =>
        v.id === ventureId
          ? { ...v, roadmap: [...v.roadmap, newStage] }
          : v
      ),
    })),
  toggleVentureTask: (ventureId, stageIdx, taskId) =>
    set((state) => ({
      ventures: state.ventures.map((v) =>
        v.id === ventureId
          ? {
              ...v,
              roadmap: v.roadmap.map((s, sIdx) =>
                sIdx === stageIdx
                  ? {
                      ...s,
                      tasks: s.tasks.map((t) =>
                        t.id === taskId ? { ...t, completed: !t.completed } : t
                      ),
                    }
                  : s
              ),
            }
          : v
      ),
    })),
  setGitHubData: (data) =>
    set((state) => ({ 
      skills: [...state.skills, ...data.skills], 
      projects: [...data.projects, ...state.projects],
      score: state.score + data.score 
    })),
  addProject: (project) =>
    set((state) => ({ projects: [project, ...state.projects] })),
  updateSkill: (skillName, progressAmount) =>
    set((state) => {
      const newSkills = state.skills.map((skill) => {
        if (skill.name === skillName) {
          let newProgress = skill.progress + progressAmount;
          let newLevel = skill.level;
          if (newProgress >= 100) {
            newLevel += Math.floor(newProgress / 100);
            newProgress = newProgress % 100;
          }
          return { ...skill, progress: newProgress, level: newLevel };
        }
        return skill;
      });
      
      if (!newSkills.find(s => s.name === skillName)) {
        let newProgress = progressAmount;
        let newLevel = 1;
        if (newProgress >= 100) {
          newLevel += Math.floor(newProgress / 100);
          newProgress = newProgress % 100;
        }
        newSkills.push({ name: skillName, level: newLevel, progress: newProgress });
      }
      
      return { skills: newSkills };
    }),
  completeTask: (taskId) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (task && !task.completed) {
        return {
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: true } : t
          ),
          score: state.score + task.xp,
        };
      }
      return state;
    }),
  addTasks: (tasks) => set((state) => ({ tasks: [...state.tasks, ...tasks] })),
    }),
    {
      name: 'skillgraph-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

