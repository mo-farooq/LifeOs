"use client";

import React, { useState, useEffect, useRef } from "react";
import { Settings, X, ChevronLeft, ChevronRight } from "lucide-react";
import Sidebar, { NavTab } from "@/components/navigation/sidebar";
import BottomNav from "@/components/navigation/bottom-nav";

// Views
import DashboardView from "@/components/views/dashboard-view";
import HealthView from "@/components/views/health-view";
import GymView from "@/components/views/gym-view";
import FinanceView from "@/components/views/finance-view";
import FocusView from "@/components/views/focus-view";
import BrainView from "@/components/views/brain-view";
import ReviewsView from "@/components/views/reviews-view";
import SalahView from "@/components/views/salah-view";
import SettingsView from "@/components/views/settings-view";

import { 
  LifeOSState, 
  Task, 
  CharacterStats, 
  Skill, 
  Supplement, 
  WaterConfig, 
  GymExercise, 
  GymPhoto, 
  Asset, 
  Subscription, 
  PurchaseOrder,
  VisionOS,
  BrainNote,
  DailyRituals,
  NutritionConfig,
  WeeklyReview,
  MonthlyReview,
  QuarterlyReview,
  YearlyReview,
  SalahLog,
  ModuleConfig,
  SleepConfig,
  FocusConfig,
  Habit,
  BlocksConfig
} from "@/types";
import { supabase } from "@/lib/supabase";
import AuthView from "@/components/views/auth-view";

const LOCAL_STORAGE_KEY = "life_os_state_v7";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [state, setState] = useState<LifeOSState | null>(null);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // LED Goals Ticker index state
  const [tickerIndex, setTickerIndex] = useState(0);

  // Time & Dates logic
  const getActiveDate = (time: Date) => {
    const d = new Date(time);
    if (d.getHours() < 6) {
      d.setDate(d.getDate() - 1);
    }
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const getTomorrowDate = (activeDateStr: string) => {
    const d = new Date(activeDateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const [activeDateOverride, setActiveDateOverride] = useState<string | null>(null);

  const defaultActiveDate = getActiveDate(currentTime);
  const activeDate = activeDateOverride || defaultActiveDate;
  const tomorrowDate = getTomorrowDate(activeDate);

  // Run clock and auth listener
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      clearInterval(timer);
      subscription.unsubscribe();
    };
  }, []);

  // Seed data generator
  const getSeedState = (actDate: string, tomDate: string): LifeOSState => ({
    tasks: [
      { id: "1", text: "Complete UI shell integration of Life OS", completed: false, queued: true, date: actDate, priority: true },
      { id: "2", text: "Log nutritional intake & weight metrics", completed: true, queued: false, date: actDate, priority: false },
      { id: "3", text: "Review weekly portfolio balance sheets", completed: false, queued: false, date: actDate, priority: false },
      { id: "4", text: "Execute hypertrophic gym routine", completed: false, queued: true, date: actDate, priority: true },
      { id: "5", text: "Draft project proposal guidelines", completed: false, queued: false, date: actDate, priority: false },
      { id: "6", text: "Prepare healthy breakfast bowls", completed: false, queued: false, date: tomDate, priority: false },
      { id: "7", text: "Sync smart watch with dashboard databases", completed: false, queued: false, date: tomDate, priority: false },
    ],
    stats: { willpower: 8, focus: 7, clarity: 9, energy: 6 },
    skills: [
      { id: "s1", name: "TypeScript Architecture", keyResult: "Finish advanced type design module", currentProgress: 4, targetProgress: 5 },
      { id: "s2", name: "Solidity Smart Contracts", keyResult: "Deploy 3 testnet protocols", currentProgress: 1, targetProgress: 3 },
      { id: "s3", name: "Physical Conditioning", keyResult: "Run 50km total this month", currentProgress: 24, targetProgress: 50 }
    ],
    supplements: [
      { id: "sup1", name: "Vitamin D3", dose: "5000 IU", window: "morning", low: false, takenDates: {} },
      { id: "sup2", name: "Creatine Monohydrate", dose: "5g", window: "lunch", low: false, takenDates: {} },
      { id: "sup3", name: "Magnesium Glycinate", dose: "400mg", window: "evening", low: true, takenDates: {} }
    ],
    water: { weightKg: 82, age: 28, trainingHrs: 6, caffeineMg: 150, activeMedsCount: 1, loggedTodayMl: {} },
    gymType: "both",
    gymSplit: "push",
    gymExercises: [
      { id: "e1", name: "Barbell Bench Press", weight: 80, reps: 8, targetReps: 8, history: [{ date: "2026-06-18", weight: 78, reps: 8 }] },
      { id: "e2", name: "Overhead Shoulder Press", weight: 50, reps: 6, targetReps: 8, history: [{ date: "2026-06-18", weight: 50, reps: 6 }] },
      { id: "e3", name: "Incline DB Press", weight: 32, reps: 8, targetReps: 8, history: [] }
    ],
    gymPhotos: [
      { id: "p1", date: "2026-06-10", url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80", label: "Baseline" },
      { id: "p2", date: "2026-06-20", url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80", label: "Current" }
    ],
    assets: [
      { id: "a1", name: "Checking Account", category: "bank", amount: 4850.00 },
      { id: "a2", name: "Investment Portfolio", category: "stocks", amount: 15200.00 },
      { id: "a3", name: "Hardware Crypto Wallet", category: "crypto", amount: 2450.00 }
    ],
    subscriptions: [
      { id: "sub1", name: "Spotify Premium", cost: 15.00, period: "monthly", nextRenewalDate: "2026-06-23", linkedAssetId: "a1" },
      { id: "sub2", name: "Vercel Pro Team", cost: 20.00, period: "monthly", nextRenewalDate: "2026-07-15", linkedAssetId: "a1" },
      { id: "sub3", name: "Gym Membership", cost: 50.00, period: "monthly", nextRenewalDate: "2026-06-22", linkedAssetId: "a1" }
    ],
    orders: [],

    // New AI-Notion variables
    vision: {
      identity: "I am an elite, focused software developer creating tools that minimize human cognitive load.",
      outcomeGoal: "Achieve expert level Next.js design and deploy a complete SaaS product.",
      outputMilestone: "Launch 1 fully synchronized web dashboard with Supabase integration.",
      inputHabit: "Focus-code for 2 hours daily in the Focus Room."
    },
    notes: [
      { id: "n1", title: "Cognitive Load and Monospace aesthetics", category: "ideas", content: "Clutter limits brain performance. Minimize colored outlines, neon glow elements, and card shadows. Keep spacing geometric, use paper-thin borders, and mono strings for numbers.", date: actDate, tags: ["design", "minimalism"] },
      { id: "n2", title: "Closing Open Loops - Zeigarnik Effect", category: "notes", content: "Unfinished tasks stored only in memory drain willpower. Documenting them immediately into the buffer closes the cognitive loop.", date: actDate, tags: ["psychology", "focus"] },
      { id: "n3", title: "Project Schema Migration Sync Meeting", category: "meetings", content: "Synced with product designer. Configured the app_state Supabase table. Wired realtime Postgres channels to sync tasks, supplements, and ledger entries between mobile phone and desktop.", date: actDate, tags: ["supabase", "sync"] }
    ],
    rituals: {},
    nutrition: {
      targetCal: 2200,
      targetProt: 150,
      targetCarb: 220,
      targetFat: 70,
      loggedCal: {},
      loggedProt: {},
      loggedCarb: {},
      loggedFat: {}
    },
    weeklyReviews: {},
    monthlyReviews: {},
    quarterlyReviews: {},
    yearlyReviews: {},
    salah: {},
    modules: {
      health: true,
      gym: true,
      finance: true,
      focus: true,
      brain: true,
      reviews: true,
      salah: true
    },
    sleepConfig: {
      awakeHourStart: 6,
      awakeHourEnd: 22
    },
    monthlyNetWorthHistory: {},
    focusConfig: {
      focusDuration: 25,
      shortDuration: 5,
      longDuration: 15
    },
    habits: [
      { id: "h1", name: "Read Vision OS", completedDates: {} },
      { id: "h2", name: "1 Hour Focused Coding", completedDates: {} },
      { id: "h3", name: "Hydrate 3L Water", completedDates: {} },
      { id: "h4", name: "No Sugar Intake", completedDates: {} }
    ],
    focusSessionsLog: {},
    blocksConfig: {
      macroMonitor: true,
      waterCoach: true,
      supplementStack: true,
      workoutSplit: true,
      photoMatrix: true,
      netWorthProgress: true,
      recurringSubs: true,
      purchaseOrders: true
    }
  });

  // Supabase State loading
  useEffect(() => {
    if (!sessionUser) {
      setState(null);
      return;
    }

    const loadDatabaseState = async () => {
      try {
        const { data, error } = await supabase
          .from("user_states")
          .select("state_data")
          .eq("user_id", sessionUser.id)
          .maybeSingle();

        const actDate = getActiveDate(new Date());
        const tomDate = getTomorrowDate(actDate);
        const seed = getSeedState(actDate, tomDate);

        if (data?.state_data) {
          const parsed = data.state_data;
          // Ensure fallback properties exist
          if (!parsed.modules) parsed.modules = seed.modules;
          if (!parsed.sleepConfig) parsed.sleepConfig = seed.sleepConfig;
          if (!parsed.monthlyNetWorthHistory) parsed.monthlyNetWorthHistory = seed.monthlyNetWorthHistory;
          if (!parsed.focusConfig) parsed.focusConfig = seed.focusConfig;
          if (!parsed.habits) parsed.habits = seed.habits || [];
          if (!parsed.focusSessionsLog) parsed.focusSessionsLog = seed.focusSessionsLog || {};
          if (!parsed.blocksConfig) parsed.blocksConfig = seed.blocksConfig || {
            macroMonitor: true,
            waterCoach: true,
            supplementStack: true,
            workoutSplit: true,
            photoMatrix: true,
            netWorthProgress: true,
            recurringSubs: true,
            purchaseOrders: true
          };
          setState(parsed);
        } else {
          // No state found: insert seed state in the database
          setState(seed);
          await supabase.from("user_states").upsert({
            user_id: sessionUser.id,
            state_data: seed,
            updated_at: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error("Error loading database registry:", err);
        const actDate = getActiveDate(new Date());
        const tomDate = getTomorrowDate(actDate);
        setState(getSeedState(actDate, tomDate));
      }
    };

    loadDatabaseState();
  }, [sessionUser]);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerSave = (newState: LifeOSState, immediate = false) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    const performSave = async (data: LifeOSState) => {
      if (!sessionUser) return;
      try {
        await supabase.from("user_states").upsert({
          user_id: sessionUser.id,
          state_data: data,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.error("Failed to save state to Supabase:", err);
      }
    };

    if (immediate) {
      performSave(newState);
    } else {
      saveTimeoutRef.current = setTimeout(() => {
        performSave(newState);
      }, 1500);
    }
  };

  // Unload listener to flush unsaved changes
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current && state) {
        // Force save immediately before tab close
        const performSaveSync = async () => {
          if (!sessionUser) return;
          try {
            await supabase.from("user_states").upsert({
              user_id: sessionUser.id,
              state_data: state,
              updated_at: new Date().toISOString()
            });
          } catch (e) {
            console.error(e);
          }
        };
        performSaveSync();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [state, sessionUser]);

  // Auto-sync monthlyNetWorthHistory current month key when assets change
  useEffect(() => {
    if (!state) return;
    const currentMonth = activeDate.substring(0, 7);
    const liveNetWorthTotal = state.assets.reduce((sum, a) => sum + a.amount, 0);
    if (state.monthlyNetWorthHistory[currentMonth] !== liveNetWorthTotal) {
      setState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          monthlyNetWorthHistory: {
            ...prev.monthlyNetWorthHistory,
            [currentMonth]: liveNetWorthTotal
          }
        };
      });
    }
  }, [state?.assets, activeDate]);

  // Redirect back to dashboard if active tab is deactivated
  useEffect(() => {
    if (state && activeTab !== "dashboard") {
      const moduleKey = activeTab as keyof ModuleConfig;
      if (state.modules[moduleKey] === false) {
        setActiveTab("dashboard");
      }
    }
  }, [state?.modules, activeTab]);

  // LED Ticker logic
  const todayTasks = state?.tasks.filter((t) => t.date === activeDate) || [];
  const pendingGoals = todayTasks.filter((t) => !t.completed);
  const completedCount = todayTasks.filter((t) => t.completed).length;
  const totalCount = todayTasks.length;

  useEffect(() => {
    if (pendingGoals.length === 0) return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % pendingGoals.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [pendingGoals.length]);

  useEffect(() => {
    if (tickerIndex >= pendingGoals.length && pendingGoals.length > 0) {
      setTickerIndex(0);
    }
  }, [pendingGoals.length, tickerIndex]);

  if (!mounted || authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#000000] text-zinc-550 font-mono">
        <div className="flex flex-col items-center gap-3">
          <span className="w-1.5 h-6 bg-zinc-200 animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 animate-pulse font-semibold">
            AUTHORIZING ACCESS...
          </span>
        </div>
      </div>
    );
  }

  if (!sessionUser) {
    return <AuthView />;
  }

  if (!state) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#000000] text-zinc-550 font-mono">
        <div className="flex flex-col items-center gap-3">
          <span className="w-1.5 h-6 bg-zinc-200 animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 animate-pulse font-semibold">
            SYNCHRONIZING REGISTRY...
          </span>
        </div>
      </div>
    );
  }

  // State Dispatchers
  const updateTasks = (newTasks: Task[]) => {
    setState((prev) => {
      if (!prev) return null;
      const next = { ...prev, tasks: newTasks };
      triggerSave(next, true);
      return next;
    });
  };

  const updateStats = (newStats: CharacterStats) => {
    setState((prev) => {
      if (!prev) return null;
      const next = { ...prev, stats: newStats };
      triggerSave(next, true);
      return next;
    });
  };

  const updateSkills = (newSkills: Skill[]) => {
    setState((prev) => {
      if (!prev) return null;
      const next = { ...prev, skills: newSkills };
      triggerSave(next, true);
      return next;
    });
  };

  const updateSupplements = (newSups: Supplement[]) => {
    setState((prev) => {
      if (!prev) return null;
      const next = { ...prev, supplements: newSups };
      triggerSave(next, true);
      return next;
    });
  };

  const updateWater = (newWater: WaterConfig) => {
    setState((prev) => {
      if (!prev) return null;
      const next = { ...prev, water: newWater };
      triggerSave(next, true);
      return next;
    });
  };

  const updateGymSettings = (fields: { gymType?: "home" | "commercial" | "both"; gymSplit?: "push" | "pull" | "legs" | "rest" }) => {
    setState((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...fields };
      triggerSave(next, true);
      return next;
    });
  };

  const updateGymExercises = (newExs: GymExercise[]) => {
    setState((prev) => {
      if (!prev) return null;
      const next = { ...prev, gymExercises: newExs };
      triggerSave(next, true);
      return next;
    });
  };

  const updateGymPhotos = (newPhotos: GymPhoto[]) => {
    setState((prev) => {
      if (!prev) return null;
      const next = { ...prev, gymPhotos: newPhotos };
      triggerSave(next, true);
      return next;
    });
  };

  const updateAssets = (newAssets: Asset[]) => {
    setState((prev) => {
      if (!prev) return null;
      const next = { ...prev, assets: newAssets };
      triggerSave(next, true);
      return next;
    });
  };

  const updateSubscriptions = (newSubs: Subscription[]) => {
    setState((prev) => {
      if (!prev) return null;
      const next = { ...prev, subscriptions: newSubs };
      triggerSave(next, true);
      return next;
    });
  };

  const updateOrders = (newOrders: PurchaseOrder[]) => {
    setState((prev) => {
      if (!prev) return null;
      const next = { ...prev, orders: newOrders };
      triggerSave(next, true);
      return next;
    });
  };

  // Dispatchers for new AI-Notion features
  const updateVision = (newVision: VisionOS) => {
    setState((prev) => {
      if (!prev) return null;
      const next = { ...prev, vision: newVision };
      triggerSave(next, false);
      return next;
    });
  };

  const updateNotes = (newNotes: BrainNote[]) => {
    setState((prev) => {
      if (!prev) return null;
      const next = { ...prev, notes: newNotes };
      triggerSave(next, false);
      return next;
    });
  };

  const updateRituals = (newRituals: Record<string, DailyRituals>) => {
    setState((prev) => {
      if (!prev) return null;
      const next = { ...prev, rituals: newRituals };
      triggerSave(next, true);
      return next;
    });
  };

  const updateNutrition = (newNutrition: NutritionConfig) => {
    setState((prev) => {
      if (!prev) return null;
      const next = { ...prev, nutrition: newNutrition };
      triggerSave(next, true);
      return next;
    });
  };

  const updateWeeklyReviews = (newWeekly: Record<string, WeeklyReview>) => {
    setState((prev) => {
      if (!prev) return null;
      const next = { ...prev, weeklyReviews: newWeekly };
      triggerSave(next, false);
      return next;
    });
  };

  const updateMonthlyReviews = (newMonthly: Record<string, MonthlyReview>) => {
    setState((prev) => {
      if (!prev) return null;
      const next = { ...prev, monthlyReviews: newMonthly };
      triggerSave(next, false);
      return next;
    });
  };

  const updateQuarterlyReviews = (newQuarterly: Record<string, QuarterlyReview>) => {
    setState((prev) => {
      if (!prev) return null;
      const next = { ...prev, quarterlyReviews: newQuarterly };
      triggerSave(next, false);
      return next;
    });
  };

  const updateYearlyReviews = (newYearly: Record<string, YearlyReview>) => {
    setState((prev) => {
      if (!prev) return null;
      const next = { ...prev, yearlyReviews: newYearly };
      triggerSave(next, false);
      return next;
    });
  };

  const updateSalah = (newSalah: Record<string, SalahLog>) => {
    setState((prev) => {
      if (!prev) return null;
      const next = { ...prev, salah: newSalah };
      triggerSave(next, true);
      return next;
    });
  };

  const updateModules = (newModules: ModuleConfig) => {
    setState((prev) => {
      if (!prev) return null;
      const next = { ...prev, modules: newModules };
      triggerSave(next, true);
      return next;
    });
  };

  const updateBlocksConfig = (newBlocks: BlocksConfig) => {
    setState((prev) => {
      if (!prev) return null;
      const next = { ...prev, blocksConfig: newBlocks };
      triggerSave(next, true);
      return next;
    });
  };

  const updateSleepConfig = (newSleep: SleepConfig) => {
    setState((prev) => {
      if (!prev) return null;
      const next = { ...prev, sleepConfig: newSleep };
      triggerSave(next, true);
      return next;
    });
  };

  const updateHabits = (newHabits: Habit[]) => {
    setState((prev) => {
      if (!prev) return null;
      const next = { ...prev, habits: newHabits };
      triggerSave(next, true);
      return next;
    });
  };

  const updateFocusSessionsLog = (newLog: Record<string, number>) => {
    setState((prev) => {
      if (!prev) return null;
      const next = { ...prev, focusSessionsLog: newLog };
      triggerSave(next, true);
      return next;
    });
  };

  const handleExportBackup = () => {
    if (!state) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `life_os_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = e.target?.result as string;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && "tasks" in parsed && "assets" in parsed) {
          if (!parsed.modules) parsed.modules = { health: true, gym: true, finance: true, focus: true, brain: true, reviews: true, salah: true };
          if (!parsed.sleepConfig) parsed.sleepConfig = { awakeHourStart: 6, awakeHourEnd: 22 };
          if (!parsed.monthlyNetWorthHistory) parsed.monthlyNetWorthHistory = {};
          setState(parsed);
          alert("Database imported successfully!");
        } else {
          alert("Invalid registry file format.");
        }
      } catch (err) {
        alert("Failed to parse the registry file.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const formatHeaderDate = () => {
    const d = new Date(activeDate);
    const weekday = d.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
    const rest = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).toUpperCase();
    return { weekday, rest };
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView 
            tasks={state.tasks} 
            updateTasks={updateTasks} 
            activeDate={activeDate} 
            tomorrowDate={tomorrowDate}
            habits={state.habits || []}
            updateHabits={updateHabits}
            focusSessionsLog={state.focusSessionsLog || {}}
            water={state.water}
            nutrition={state.nutrition}
            salah={state.salah || {}}
            assets={state.assets || []}
            monthlyNetWorthHistory={state.monthlyNetWorthHistory || {}}
          />
        );
      case "health":
        return (
          <HealthView 
            stats={state.stats}
            updateStats={updateStats}
            skills={state.skills}
            updateSkills={updateSkills}
            supplements={state.supplements}
            updateSupplements={updateSupplements}
            water={state.water}
            updateWater={updateWater}
            activeDate={activeDate}
            currentTime={currentTime}
            nutrition={state.nutrition}
            updateNutrition={updateNutrition}
            blocksConfig={state.blocksConfig}
          />
        );
      case "gym":
        return (
          <GymView 
            gymType={state.gymType}
            gymSplit={state.gymSplit}
            updateGymSettings={updateGymSettings}
            gymExercises={state.gymExercises}
            updateGymExercises={updateGymExercises}
            gymPhotos={state.gymPhotos}
            updateGymPhotos={updateGymPhotos}
            activeDate={activeDate}
            blocksConfig={state.blocksConfig}
          />
        );
      case "finance":
        return (
          <FinanceView 
            assets={state.assets}
            updateAssets={updateAssets}
            subscriptions={state.subscriptions}
            updateSubscriptions={updateSubscriptions}
            orders={state.orders}
            updateOrders={updateOrders}
            activeDate={activeDate}
            monthlyNetWorthHistory={state.monthlyNetWorthHistory}
            blocksConfig={state.blocksConfig}
          />
        );
      case "focus":
        return (
          <FocusView 
            tasks={state.tasks}
            updateTasks={updateTasks}
            activeDate={activeDate}
            focusConfig={state.focusConfig}
            updateFocusConfig={(config) => {
              setState((prev) => {
                if (!prev) return null;
                const next = { ...prev, focusConfig: config };
                triggerSave(next, true);
                return next;
              });
            }}
            focusSessionsLog={state.focusSessionsLog || {}}
            updateFocusSessionsLog={updateFocusSessionsLog}
          />
        );
      case "brain":
        return (
          <BrainView 
            notes={state.notes}
            updateNotes={updateNotes}
            activeDate={activeDate}
          />
        );
      case "reviews":
        return (
          <ReviewsView 
            rituals={state.rituals}
            updateRituals={updateRituals}
            tasks={state.tasks}
            supplements={state.supplements}
            water={state.water}
            activeDate={activeDate}
            weeklyReviews={state.weeklyReviews || {}}
            updateWeeklyReviews={updateWeeklyReviews}
            monthlyReviews={state.monthlyReviews || {}}
            updateMonthlyReviews={updateMonthlyReviews}
            quarterlyReviews={state.quarterlyReviews || {}}
            updateQuarterlyReviews={updateQuarterlyReviews}
            yearlyReviews={state.yearlyReviews || {}}
            updateYearlyReviews={updateYearlyReviews}
            salah={state.salah || {}}
            skills={state.skills}
          />
        );
      case "salah":
        return (
          <SalahView 
            salah={state.salah || {}}
            updateSalah={updateSalah}
            activeDate={activeDate}
          />
        );
      case "settings":
        return (
          <SettingsView
            modules={state.modules}
            updateModules={updateModules}
            blocksConfig={state.blocksConfig}
            updateBlocksConfig={updateBlocksConfig}
            sleepConfig={state.sleepConfig}
            updateSleepConfig={updateSleepConfig}
            handleExportBackup={handleExportBackup}
            handleImportBackup={handleImportBackup}
            onSignOut={async () => {
              if (confirm("Are you sure you want to sign out? Unsaved local changes will sync first.")) {
                await supabase.auth.signOut();
              }
            }}
          />
        );
      default:
        return (
          <DashboardView 
            tasks={state.tasks} 
            updateTasks={updateTasks} 
            activeDate={activeDate} 
            tomorrowDate={tomorrowDate}
            habits={state.habits || []}
            updateHabits={updateHabits}
            focusSessionsLog={state.focusSessionsLog || {}}
            water={state.water}
            nutrition={state.nutrition}
            salah={state.salah || {}}
            assets={state.assets || []}
            monthlyNetWorthHistory={state.monthlyNetWorthHistory || {}}
          />
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#000000] text-zinc-50 font-mono">
      {/* Desktop Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentTime={currentTime} modules={state.modules} sleepConfig={state.sleepConfig} />

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative z-40">
        
        {/* Master LED Ticker Bar */}
        <div className="w-full bg-[#000000] border-b border-zinc-800 py-3.5 px-8 flex items-center justify-between z-20 text-xs font-mono text-zinc-400 select-none flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-bold text-zinc-550 tracking-widest uppercase text-xs">GOALS</span>
            <span className="bg-emerald-500 h-2 w-2 rounded-full animate-pulse" />
            <span className="text-zinc-200 transition-opacity duration-200 uppercase tracking-wider font-semibold text-xs">
              {pendingGoals.length > 0 ? pendingGoals[tickerIndex]?.text : "All goals done — solid day."}
            </span>
          </div>
          <div className="font-mono font-bold tracking-wider text-zinc-300">
            {completedCount}/{totalCount}
          </div>
        </div>

        {/* Global Desktop Header */}
        <header className="h-16 border-b border-zinc-800 bg-[#000000] px-4 md:px-8 flex items-center justify-between z-10 flex-shrink-0">
          <div className="hidden md:flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded bg-[#0a0a0a] border border-zinc-800 text-zinc-300 uppercase tracking-widest">
              {activeTab} VIEW
            </span>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <button
              onClick={() => {
                const d = new Date(activeDate);
                d.setDate(d.getDate() - 1);
                setActiveDateOverride(d.toISOString().split("T")[0]);
              }}
              className="h-11 w-9 sm:w-11 flex items-center justify-center transition-all duration-100 active:scale-[0.98] cursor-pointer rounded bg-[#0a0a0a] border border-zinc-800 hover:bg-zinc-900/60 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
              title="Previous Day"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            
            <div className="relative flex items-center gap-2 px-2.5 sm:px-4 h-11 rounded bg-[#0a0a0a] border border-zinc-800 text-[10px] sm:text-xs font-mono text-zinc-300 uppercase tracking-wider font-bold hover:border-zinc-700 hover:bg-zinc-900/60 transition-colors">
              <input
                type="date"
                value={activeDate}
                onChange={(e) => {
                  if (e.target.value) {
                    setActiveDateOverride(e.target.value);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <span>
                <span className="hidden sm:inline">{formatHeaderDate().weekday}, </span>
                <span>{formatHeaderDate().rest}</span>
              </span>
            </div>

            <button
              onClick={() => {
                const d = new Date(activeDate);
                d.setDate(d.getDate() + 1);
                setActiveDateOverride(d.toISOString().split("T")[0]);
              }}
              className="h-11 w-9 sm:w-11 flex items-center justify-center transition-all duration-100 active:scale-[0.98] cursor-pointer rounded bg-[#0a0a0a] border border-zinc-800 hover:bg-zinc-900/60 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
              title="Next Day"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>

            {activeDateOverride && (
              <button
                onClick={() => setActiveDateOverride(null)}
                className="h-11 px-3 sm:px-4 flex items-center justify-center rounded bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-mono font-bold uppercase tracking-widest transition-all duration-100 active:scale-[0.98] cursor-pointer"
                title="Reset to Live Date"
              >
                LIVE
              </button>
            )}
          </div>
            
          {/* Quick User Profile & Settings */}
          <div className="flex items-center gap-1.5 sm:gap-3 pl-1.5 sm:pl-3 border-l border-zinc-900">
            <button
              onClick={() => setActiveTab("settings")}
              className="h-11 w-9 sm:w-11 flex items-center justify-center rounded bg-[#0a0a0a] border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 transition-all duration-100 active:scale-[0.98] cursor-pointer"
              title="System Settings"
            >
              <Settings className="h-4.5 w-4.5" />
            </button>
            <div className="w-9 sm:w-11 h-11 rounded bg-[#0a0a0a] border border-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-xs select-none">
              MF
            </div>
          </div>
        </header>

        {/* Scrollable Content Workspace */}
        <main className="flex-1 overflow-y-auto px-2 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 pb-28 md:pb-12 relative z-10 bg-[#000000]">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} modules={state.modules} />
      </div>
    </div>
  );
}
