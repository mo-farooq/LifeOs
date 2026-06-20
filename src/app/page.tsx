"use client";

import React, { useState, useEffect } from "react";
import { Settings, X } from "lucide-react";
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
  Habit
} from "@/types";
import { supabase } from "@/lib/supabase";
import AuthView from "@/components/views/auth-view";

const LOCAL_STORAGE_KEY = "life_os_state_v7";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  const activeDate = getActiveDate(currentTime);
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
      { id: "1", text: "Complete UI shell integration of Life OS", completed: false, queued: true, date: actDate, energy: "charging", revenue: "high", priority: true },
      { id: "2", text: "Log nutritional intake & weight metrics", completed: true, queued: false, date: actDate, energy: "charging", revenue: "low", priority: false },
      { id: "3", text: "Review weekly portfolio balance sheets", completed: false, queued: false, date: actDate, energy: "draining", revenue: "high", priority: false },
      { id: "4", text: "Execute hypertrophic gym routine", completed: false, queued: true, date: actDate, energy: "draining", revenue: "low", priority: true },
      { id: "5", text: "Draft project proposal guidelines", completed: false, queued: false, date: actDate, energy: "charging", revenue: "high", priority: false },
      { id: "6", text: "Prepare healthy breakfast bowls", completed: false, queued: false, date: tomDate, energy: "charging", revenue: "low", priority: false },
      { id: "7", text: "Sync smart watch with dashboard databases", completed: false, queued: false, date: tomDate, energy: "charging", revenue: "low", priority: false },
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
    ]
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

  // Debounced Supabase Auto-saving
  useEffect(() => {
    if (!state || !sessionUser) return;

    const delay = setTimeout(async () => {
      try {
        await supabase.from("user_states").upsert({
          user_id: sessionUser.id,
          state_data: state,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.error("Failed to auto-save to database:", err);
      }
    }, 1500);

    return () => clearTimeout(delay);
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
    setState((prev) => prev ? { ...prev, tasks: newTasks } : null);
  };

  const updateStats = (newStats: CharacterStats) => {
    setState((prev) => prev ? { ...prev, stats: newStats } : null);
  };

  const updateSkills = (newSkills: Skill[]) => {
    setState((prev) => prev ? { ...prev, skills: newSkills } : null);
  };

  const updateSupplements = (newSups: Supplement[]) => {
    setState((prev) => prev ? { ...prev, supplements: newSups } : null);
  };

  const updateWater = (newWater: WaterConfig) => {
    setState((prev) => prev ? { ...prev, water: newWater } : null);
  };

  const updateGymSettings = (fields: { gymType?: "home" | "commercial" | "both"; gymSplit?: "push" | "pull" | "legs" | "rest" }) => {
    setState((prev) => prev ? { ...prev, ...fields } : null);
  };

  const updateGymExercises = (newExs: GymExercise[]) => {
    setState((prev) => prev ? { ...prev, gymExercises: newExs } : null);
  };

  const updateGymPhotos = (newPhotos: GymPhoto[]) => {
    setState((prev) => prev ? { ...prev, gymPhotos: newPhotos } : null);
  };

  const updateAssets = (newAssets: Asset[]) => {
    setState((prev) => prev ? { ...prev, assets: newAssets } : null);
  };

  const updateSubscriptions = (newSubs: Subscription[]) => {
    setState((prev) => prev ? { ...prev, subscriptions: newSubs } : null);
  };

  const updateOrders = (newOrders: PurchaseOrder[]) => {
    setState((prev) => prev ? { ...prev, orders: newOrders } : null);
  };

  // Dispatchers for new AI-Notion features
  const updateVision = (newVision: VisionOS) => {
    setState((prev) => prev ? { ...prev, vision: newVision } : null);
  };

  const updateNotes = (newNotes: BrainNote[]) => {
    setState((prev) => prev ? { ...prev, notes: newNotes } : null);
  };

  const updateRituals = (newRituals: Record<string, DailyRituals>) => {
    setState((prev) => prev ? { ...prev, rituals: newRituals } : null);
  };

  const updateNutrition = (newNutrition: NutritionConfig) => {
    setState((prev) => prev ? { ...prev, nutrition: newNutrition } : null);
  };

  const updateWeeklyReviews = (newWeekly: Record<string, WeeklyReview>) => {
    setState((prev) => prev ? { ...prev, weeklyReviews: newWeekly } : null);
  };

  const updateMonthlyReviews = (newMonthly: Record<string, MonthlyReview>) => {
    setState((prev) => prev ? { ...prev, monthlyReviews: newMonthly } : null);
  };

  const updateQuarterlyReviews = (newQuarterly: Record<string, QuarterlyReview>) => {
    setState((prev) => prev ? { ...prev, quarterlyReviews: newQuarterly } : null);
  };

  const updateYearlyReviews = (newYearly: Record<string, YearlyReview>) => {
    setState((prev) => prev ? { ...prev, yearlyReviews: newYearly } : null);
  };

  const updateSalah = (newSalah: Record<string, SalahLog>) => {
    setState((prev) => prev ? { ...prev, salah: newSalah } : null);
  };

  const updateModules = (newModules: ModuleConfig) => {
    setState((prev) => prev ? { ...prev, modules: newModules } : null);
  };

  const updateHabits = (newHabits: Habit[]) => {
    setState((prev) => prev ? { ...prev, habits: newHabits } : null);
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
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric"
    }).toUpperCase();
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
            vision={state.vision}
            updateVision={updateVision}
            habits={state.habits || []}
            updateHabits={updateHabits}
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
          />
        );
      case "focus":
        return (
          <FocusView 
            tasks={state.tasks}
            updateTasks={updateTasks}
            activeDate={activeDate}
            focusConfig={state.focusConfig}
            updateFocusConfig={(config) => setState(prev => prev ? { ...prev, focusConfig: config } : null)}
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
      default:
        return (
          <DashboardView 
            tasks={state.tasks} 
            updateTasks={updateTasks} 
            activeDate={activeDate} 
            tomorrowDate={tomorrowDate}
            vision={state.vision}
            updateVision={updateVision}
            habits={state.habits || []}
            updateHabits={updateHabits}
          />
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#000000] text-zinc-50 font-mono">
      {/* Desktop Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentTime={currentTime} modules={state.modules} sleepConfig={state.sleepConfig} />

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        
        {/* Master LED Ticker Bar */}
        <div className="w-full bg-[#000000] border-b border-zinc-800 py-2.5 px-6 flex items-center justify-between z-20 text-[10px] font-mono text-zinc-400 select-none flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-bold text-zinc-550 tracking-widest uppercase">GOALS</span>
            <span className="bg-emerald-500 h-2 w-2 rounded-full animate-pulse" />
            <span className="text-zinc-200 transition-opacity duration-200 uppercase tracking-wider font-semibold">
              {pendingGoals.length > 0 ? pendingGoals[tickerIndex]?.text : "All goals done — solid day."}
            </span>
          </div>
          <div className="font-mono font-bold tracking-wider text-zinc-450">
            {completedCount}/{totalCount}
          </div>
        </div>

        {/* Global Desktop Header */}
        <header className="h-14 border-b border-zinc-800 bg-[#000000] px-6 flex items-center justify-between z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#0a0a0a] border border-zinc-800 text-zinc-400 uppercase tracking-widest">
              {activeTab} VIEW
            </span>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0a0a0a] border border-zinc-800 text-[9px] font-mono text-zinc-450 uppercase tracking-wider font-bold">
              <span>{formatHeaderDate()}</span>
            </div>
            
            {/* Quick User Profile & Settings */}
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-900">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-1.5 rounded bg-[#0a0a0a] border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors duration-150"
                title="System Settings"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
              <div className="w-6 h-6 rounded bg-[#0a0a0a] border border-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-xs select-none">
                MF
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Workspace */}
        <main className="flex-1 overflow-y-auto px-6 py-6 pb-24 md:pb-8 relative z-10 bg-[#000000]">
          <div className="max-w-6xl mx-auto">
            {renderActiveView()}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} modules={state.modules} />
      </div>

      {/* System Settings Overlay Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-[#000000] border border-zinc-800 rounded-md p-6 relative flex flex-col space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.9)] animate-scale-up text-zinc-50">
            {/* Close Button */}
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded border border-zinc-800 bg-[#0a0a0a] hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-colors duration-150"
              title="Close settings"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="space-y-1.5 border-b border-zinc-900 pb-4">
              <h2 className="text-xs font-bold tracking-widest text-zinc-50 uppercase flex items-center gap-2">
                <Settings className="h-4 w-4 text-zinc-400" />
                SYSTEM REGISTRY CONFIGURATION
              </h2>
              <p className="text-[10px] text-zinc-400 font-mono tracking-wide leading-relaxed">
                Toggle active system modules to reduce cognitive load and hide unused navigation routes.
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1 border-b border-zinc-900 pb-4">
              {[
                { key: "salah" as keyof ModuleConfig, label: "SALAH TRACKER", desc: "Spiritual compliance & daily prayer streak tracker" },
                { key: "gym" as keyof ModuleConfig, label: "WORKOUT TRACKER", desc: "Gym exercise databases, logs, and splits" },
                { key: "finance" as keyof ModuleConfig, label: "FINANCIAL LEDGER", desc: "Balance sheets, recurring subscriptions, and orders" },
                { key: "health" as keyof ModuleConfig, label: "HEALTH BIOMARKERS", desc: "Water advisor, vitamins list, and macro logs" },
                { key: "focus" as keyof ModuleConfig, label: "FOCUS ROOM", desc: "Pomodoro sessions manager & ambient background audio player" },
                { key: "brain" as keyof ModuleConfig, label: "SECOND BRAIN", desc: "Quick notes registry, ideas ledger, and category tags" },
                { key: "reviews" as keyof ModuleConfig, label: "REFLECTIONS CENTER", desc: "Daily startup/shutdown audits and multi-tier reviews" },
              ].map((item) => {
                const isActive = state.modules[item.key];
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      updateModules({
                        ...state.modules,
                        [item.key]: !isActive,
                      });
                    }}
                    className={`w-full flex items-start gap-3.5 p-3 rounded border text-left transition-all duration-150 ${
                      isActive
                        ? "bg-[#0a0a0a] border-zinc-800 text-zinc-50"
                        : "bg-black border-zinc-950 text-zinc-600 hover:border-zinc-900 hover:text-zinc-400"
                    }`}
                  >
                    {/* Custom Monochrome Checkbox */}
                    <div
                      className={`mt-0.5 w-4 h-4 rounded-[4px] border flex items-center justify-center flex-shrink-0 transition-colors duration-150 ${
                        isActive
                          ? "border-zinc-200 bg-zinc-100 text-black"
                          : "border-zinc-850 bg-black text-transparent"
                      }`}
                    >
                      {isActive && (
                        <svg className="w-2.5 h-2.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold tracking-wider font-mono uppercase">{item.label}</div>
                      <div className="text-[9px] text-zinc-500 font-mono leading-normal">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Awake Hour Start & End Settings */}
            <div className="space-y-3 border-b border-zinc-900 pb-4">
              <h3 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">AWAKE WINDOW CONFIGURATION</h3>
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[9px] text-zinc-500 font-mono uppercase font-bold">Awake Start Hour</label>
                  <select
                    value={state.sleepConfig?.awakeHourStart ?? 6}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setState(prev => prev ? {
                        ...prev,
                        sleepConfig: {
                          ...(prev.sleepConfig || { awakeHourStart: 6, awakeHourEnd: 22 }),
                          awakeHourStart: val
                        }
                      } : null);
                    }}
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded px-2.5 py-1.5 text-[10px] font-mono text-zinc-200 focus:outline-none focus:border-zinc-700"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-[9px] text-zinc-500 font-mono uppercase font-bold">Awake End Hour</label>
                  <select
                    value={state.sleepConfig?.awakeHourEnd ?? 22}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setState(prev => prev ? {
                        ...prev,
                        sleepConfig: {
                          ...(prev.sleepConfig || { awakeHourStart: 6, awakeHourEnd: 22 }),
                          awakeHourEnd: val
                        }
                      } : null);
                    }}
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded px-2.5 py-1.5 text-[10px] font-mono text-zinc-200 focus:outline-none focus:border-zinc-700"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Database Maintenance Export/Import */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">DATABASE MAINTENANCE</h3>
              <div className="flex gap-3">
                <button
                  onClick={handleExportBackup}
                  className="flex-1 py-2 bg-[#0a0a0a] hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded text-[9px] font-bold uppercase tracking-wider text-zinc-200 transition-colors duration-150 font-mono"
                >
                  Export Backup (JSON)
                </button>
                <label className="flex-1 py-2 bg-[#0a0a0a] hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded text-[9px] font-bold uppercase tracking-wider text-zinc-200 transition-colors duration-150 text-center cursor-pointer font-mono">
                  Import Backup (JSON)
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>
              <button
                onClick={async () => {
                  if (confirm("Are you sure you want to sign out? Unsaved local changes will sync first.")) {
                    await supabase.auth.signOut();
                  }
                }}
                className="w-full mt-2 py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-900/60 hover:border-red-900 text-red-500 rounded text-[9px] font-bold uppercase tracking-wider transition-colors duration-150 font-mono"
              >
                Sign Out / Deauthorize Session
              </button>
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-900 pt-4 flex justify-end">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-200 rounded-md text-[9px] font-bold uppercase tracking-wider transition-colors duration-150"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-scale-up {
          animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
