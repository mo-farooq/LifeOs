"use client";

import React, { useState, useEffect } from "react";
import Sidebar, { NavTab } from "@/components/navigation/sidebar";
import BottomNav from "@/components/navigation/bottom-nav";

// Views
import DashboardView from "@/components/views/dashboard-view";
import HealthView from "@/components/views/health-view";
import GymView from "@/components/views/gym-view";
import FinanceView from "@/components/views/finance-view";

import { LifeOSState, Task, CharacterStats, Skill, Supplement, WaterConfig, GymExercise, GymPhoto, Asset, Subscription, PurchaseOrder } from "@/types";

const LOCAL_STORAGE_KEY = "life_os_state_v3";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [state, setState] = useState<LifeOSState | null>(null);

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

  // Run clock
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
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
    orders: []
  });

  // Local storage loading
  useEffect(() => {
    if (mounted) {
      const actDate = getActiveDate(new Date());
      const tomDate = getTomorrowDate(actDate);
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        try {
          setState(JSON.parse(raw));
        } catch (e) {
          setState(getSeedState(actDate, tomDate));
        }
      } else {
        setState(getSeedState(actDate, tomDate));
      }
    }
  }, [mounted]);

  // Local storage saving
  useEffect(() => {
    if (state) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  // LED Ticker Bar state & logic
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

  // Adjust ticker index on tasks checks
  useEffect(() => {
    if (tickerIndex >= pendingGoals.length && pendingGoals.length > 0) {
      setTickerIndex(0);
    }
  }, [pendingGoals.length, tickerIndex]);

  if (!mounted || !state) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#000000] text-zinc-50 font-mono">
        <div className="flex flex-col items-center gap-3">
          <span className="w-1.5 h-6 bg-zinc-200 animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 animate-pulse font-semibold">
            INITIALIZING LIFE OS...
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
          />
        );
      default:
        return (
          <DashboardView 
            tasks={state.tasks} 
            updateTasks={updateTasks} 
            activeDate={activeDate} 
            tomorrowDate={tomorrowDate} 
          />
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#000000] text-zinc-50 font-mono">
      {/* Desktop Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentTime={currentTime} />

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        
        {/* Master LED Ticker Bar */}
        <div className="w-full bg-[#000000] border-b border-zinc-800 py-2.5 px-6 flex items-center justify-between z-20 text-[10px] font-mono text-zinc-400 select-none flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-bold text-zinc-500 tracking-widest uppercase">GOALS</span>
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
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0a0a0a] border border-zinc-800 text-[9px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
              <span>{formatHeaderDate()}</span>
            </div>
            
            {/* Quick User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-900">
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
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
