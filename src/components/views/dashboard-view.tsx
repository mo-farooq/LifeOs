"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Heart, 
  Dumbbell, 
  Wallet, 
  Flame, 
  Sparkles,
  Zap,
  X,
  Loader2,
  CheckCircle2,
  Calendar,
  DollarSign,
  ArrowUpRight
} from "lucide-react";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  queued: boolean;
  tomorrow: boolean;
}

export default function DashboardView() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Task State
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", text: "Complete UI shell integration of Life OS", completed: false, queued: true, tomorrow: false },
    { id: "2", text: "Log nutritional intake & weight metrics", completed: true, queued: false, tomorrow: false },
    { id: "3", text: "Review weekly portfolio balance sheets", completed: false, queued: false, tomorrow: false },
    { id: "4", text: "Complete daily hypertrophic gym routine", completed: false, queued: true, tomorrow: false },
    { id: "5", text: "Setup sleep environment: dim lights & meditate", completed: false, queued: false, tomorrow: false },
    { id: "6", text: "Prepare healthy breakfast bowls for the week", completed: false, queued: false, tomorrow: true },
    { id: "7", text: "Sync smart watch with dashboard databases", completed: false, queued: false, tomorrow: true },
  ]);

  // Input states
  const [todayInput, setTodayInput] = useState("");
  const [tomorrowInput, setTomorrowInput] = useState("");
  const [isPolishing, setIsPolishing] = useState(false);

  // LED Goal Ticker State
  const [tickerIndex, setTickerIndex] = useState(0);

  // Quick Finance State Mock
  const [balance, setBalance] = useState(12450.80);

  // Time & Awake calculations
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter Tasks
  const todayTasks = tasks.filter((t) => !t.tomorrow);
  const tomorrowTasks = tasks.filter((t) => t.tomorrow);
  const pendingGoals = todayTasks.filter((t) => !t.completed);
  const completedCount = todayTasks.filter((t) => t.completed).length;
  const totalCount = todayTasks.length;

  // Cycle Goal Ticker every 5 seconds
  useEffect(() => {
    if (pendingGoals.length === 0) return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % pendingGoals.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [pendingGoals.length]);

  // Reset ticker index if it overflows due to tasks being checked off
  useEffect(() => {
    if (tickerIndex >= pendingGoals.length && pendingGoals.length > 0) {
      setTickerIndex(0);
    }
  }, [pendingGoals.length, tickerIndex]);

  // Calculate awake window percent (8:00 AM to 12:00 AM Midnight = 16 hours)
  const getAwakeProgress = () => {
    const startHour = 8;
    const endHour = 24;
    const currentHour = currentTime.getHours();
    const currentMin = currentTime.getMinutes();
    const timeDecimal = currentHour + currentMin / 60;

    if (timeDecimal < startHour) return 0;
    if (timeDecimal >= endHour) return 100;

    const elapsed = timeDecimal - startHour;
    const total = endHour - startHour;
    return Math.round((elapsed / total) * 100);
  };

  const awakePercentage = getAwakeProgress();

  // Get active stroke color based on time of day
  const getRingColor = () => {
    const hour = currentTime.getHours();
    if (hour >= 8 && hour < 12) return "#f97316"; // Morning: Orange
    if (hour >= 12 && hour < 18) return "#eab308"; // Afternoon: Golden
    return "#3b82f6"; // Night: Blue/Indigo
  };

  // Actions
  const toggleComplete = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const toggleQueue = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, queued: !t.queued } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleAddTodayTask = () => {
    if (!todayInput.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: todayInput.trim(),
      completed: false,
      queued: false,
      tomorrow: false
    };
    setTasks([...tasks, newTask]);
    setTodayInput("");
  };

  const handleAddTomorrowTask = () => {
    if (!tomorrowInput.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: tomorrowInput.trim(),
      completed: false,
      queued: false,
      tomorrow: true
    };
    setTasks([...tasks, newTask]);
    setTomorrowInput("");
  };

  // AI Polish Input Mock
  const handlePolish = async () => {
    if (!todayInput.trim()) return;
    setIsPolishing(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    let text = todayInput.trim();
    // Capitalize first letter
    text = text.charAt(0).toUpperCase() + text.slice(1);

    const prefixes = [
      { match: /^do\s+/i, replace: "Complete " },
      { match: /^fix\s+/i, replace: "Debug and resolve " },
      { match: /^read\s+/i, replace: "Study and analyze " },
      { match: /^gym\s+/i, replace: "Execute gym workout " },
      { match: /^buy\s+/i, replace: "Procure " },
      { match: /^write\s+/i, replace: "Draft and document " },
      { match: /^call\s+/i, replace: "Conduct briefing with " },
      { match: /^email\s+/i, replace: "Compose correspondence to " }
    ];

    for (const prefix of prefixes) {
      if (prefix.match.test(text)) {
        text = text.replace(prefix.match, prefix.replace);
        break;
      }
    }

    setTodayInput(text);
    setIsPolishing(false);
  };

  // Format Current Date
  const formatDate = () => {
    return currentTime.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  if (!mounted) {
    return null; // Prevent layout shift during initial load
  }

  // Health and Gym stats
  const stats = [
    { title: "Vitality Index", value: "64 bpm", desc: "Resting rate optimal", icon: Heart, color: "text-zinc-400" },
    { title: "Caloric Intake", value: "1840 kcal", desc: "76% of daily budget", icon: Dumbbell, color: "text-zinc-400" },
    { title: "Net Savings", value: "57.9%", desc: "Surplus ledger active", icon: Wallet, color: "text-zinc-400" }
  ];

  return (
    <div className="space-y-6 select-none animate-fade-in text-zinc-200">
      
      {/* 1. The Goal Ticker (Premium LED Strip) */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-800/50 bg-[#121214]/50 backdrop-blur-md px-4 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          {pendingGoals.length > 0 ? (
            <>
              {/* Glowing active indicator dot */}
              <div className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/60 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500/80"></span>
              </div>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-500 flex-shrink-0">
                ACTIVE GOAL
              </span>
              <span className="text-zinc-600 font-mono text-xs flex-shrink-0">|</span>
              <p className="text-xs text-zinc-300 font-mono tracking-wide truncate transition-all duration-300">
                {pendingGoals[tickerIndex]?.text}
              </p>
            </>
          ) : (
            <>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/80 flex-shrink-0" />
              <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-500 flex-shrink-0">
                ALL GOALS DONE
              </span>
              <span className="text-zinc-600 font-mono text-xs flex-shrink-0">|</span>
              <p className="text-xs text-emerald-400/85 font-mono tracking-wide">
                All daily priorities complete.
              </p>
            </>
          )}
        </div>

        {/* Progress ratio badge */}
        <div className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-zinc-800/50 bg-[#121214] text-zinc-400 ml-4 flex-shrink-0">
          {completedCount}/{totalCount} DONE
        </div>
      </div>

      {/* Welcome Header - Refined Vercel Design */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-800/50 bg-[#121214] p-6">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <Sparkles className="h-20 w-20 text-zinc-400" />
        </div>
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800/50 text-[9px] font-bold tracking-widest text-zinc-400 uppercase">
            System Active
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Life OS Dashboard
          </h1>
          <p className="text-xs text-zinc-500 max-w-lg">
            Personal analytics, schedules, and daily metrics console. All systems fully synchronized.
          </p>
        </div>
      </div>

      {/* Stats Row - Flat and Minimalist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="bg-[#121214] border-zinc-800/50 hover:border-zinc-800 transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-5">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-500">{stat.title}</span>
                <Icon className="h-3.5 w-3.5 text-zinc-500" />
              </CardHeader>
              <CardContent className="space-y-1 px-5 pb-5">
                <div className="text-2xl font-mono font-bold tracking-tighter text-zinc-100">{stat.value}</div>
                <p className="text-[10px] text-zinc-500 font-mono">{stat.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bento Layout Grid Overhaul (12-Column Grid) */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* Day Progress Ring Card (col-span-12 md:col-span-4 lg:col-span-3) */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 space-y-4">
          <Card className="flex flex-col items-center justify-between p-5 bg-[#121214] border-zinc-800/50">
            <div className="w-full text-left space-y-0.5">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-500">Awake Cycle</span>
              <p className="text-xs text-zinc-400">8:00 AM - Midnight</p>
            </div>
            
            {/* SVG Progress Ring */}
            <div className="relative flex items-center justify-center my-6">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="62"
                  className="stroke-zinc-900"
                  strokeWidth="5"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="62"
                  stroke={getRingColor()}
                  strokeWidth="5"
                  fill="transparent"
                  strokeDasharray={390}
                  strokeDashoffset={390 - (390 * awakePercentage) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-in-out"
                />
              </svg>

              {/* Monospace Center Text */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-lg font-mono font-bold tracking-tighter text-zinc-100">
                  {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
                </span>
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold mt-0.5">
                  ELAPSED
                </span>
                <span className="text-sm font-mono font-bold text-zinc-300 mt-0.5">
                  {awakePercentage}%
                </span>
              </div>
            </div>

            <div className="w-full text-center py-2 px-3 rounded-lg border border-zinc-800/30 bg-zinc-900/10 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Windows Ends in {24 - currentTime.getHours()}h
            </div>
          </Card>

          {/* Active Habit Grid */}
          <Card className="bg-[#121214] border-zinc-800/50 p-5 space-y-4">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-500">HABIT COMPLETED</span>
              <p className="text-xs text-zinc-400">Streak logs</p>
            </div>
            
            <div className="grid grid-cols-7 gap-1.5 py-1">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => {
                const completed = idx < 5;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-mono text-zinc-500">{day}</span>
                    <div 
                      className={`w-5 h-5 rounded border transition-all duration-200 flex items-center justify-center ${
                        completed 
                          ? "bg-zinc-800 border-zinc-700/80 text-zinc-300 text-[10px] font-bold" 
                          : "bg-transparent border-zinc-900 text-zinc-600 text-[9px]"
                      }`}
                    >
                      {completed ? "✓" : "•"}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Today To-Do List (col-span-12 md:col-span-8 lg:col-span-6) */}
        <div className="col-span-12 md:col-span-8 lg:col-span-6 space-y-4">
          <Card className="bg-[#121214] border-zinc-800/50">
            <CardHeader className="flex flex-row items-start justify-between border-b border-zinc-900/30 pb-4 p-5">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-500">TODAY PRIORITY</span>
                <CardTitle className="text-base font-bold text-zinc-100">{formatDate()}</CardTitle>
              </div>

              {/* Day Streak badge */}
              <div className="flex flex-col items-end gap-1">
                <span className="text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded border border-amber-500/20 bg-amber-500/5 text-amber-400/90 flex items-center gap-1">
                  <Flame className="h-3 w-3 inline" /> 6 Day Streak
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {completedCount}/{totalCount} COMPLETED
                </span>
              </div>
            </CardHeader>
            
            <CardContent className="pt-5 space-y-4 px-5 pb-5">
              {/* Task Row items */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {todayTasks.length > 0 ? (
                  todayTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="group flex items-center gap-3 px-3.5 py-3 rounded-lg border border-zinc-900/40 bg-zinc-950/20 hover:border-zinc-800/50 hover:bg-zinc-900/10 transition-all duration-150 ease-in-out"
                    >
                      {/* Custom Flat Checkbox */}
                      <button
                        onClick={() => toggleComplete(task.id)}
                        className={`w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center ${
                          task.completed 
                            ? "bg-zinc-800 border-zinc-700 text-zinc-300" 
                            : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700"
                        }`}
                      >
                        {task.completed && <span className="text-[9px]">✓</span>}
                      </button>

                      {/* Text */}
                      <span className={`text-xs text-zinc-300 flex-1 transition-all ${
                        task.completed ? "line-through text-zinc-600" : ""
                      }`}>
                        {task.text}
                      </span>

                      {/* Queue priority */}
                      <button
                        onClick={() => toggleQueue(task.id)}
                        className={`p-1 rounded transition-all duration-150 ${
                          task.queued 
                            ? "text-amber-400" 
                            : "text-zinc-600 hover:text-zinc-300"
                        }`}
                        title="Toggle Queue Priority"
                      >
                        <Zap className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete button (visible on hover) */}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 rounded text-zinc-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all duration-150"
                        title="Delete Goal"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-[10px] uppercase tracking-wider text-zinc-600 border border-dashed border-zinc-900 rounded-xl">
                    No active tasks.
                  </div>
                )}
              </div>

              {/* Add Task Area */}
              <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-zinc-900/30">
                <input
                  type="text"
                  value={todayInput}
                  onChange={(e) => setTodayInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTodayTask()}
                  placeholder="Capture new active goal..."
                  className="flex-1 bg-zinc-900/20 border border-zinc-800/50 rounded-xl px-4 py-2.5 text-xs placeholder:text-zinc-600 text-zinc-200 outline-none focus:border-zinc-700 focus:bg-zinc-900/40 transition-all"
                />
                
                <div className="flex gap-2">
                  <button
                    onClick={handlePolish}
                    disabled={isPolishing || !todayInput.trim()}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-850 text-zinc-400 font-medium text-xs transition-all active:scale-95 disabled:opacity-40"
                  >
                    {isPolishing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400" /> POLISHING...
                      </>
                    ) : (
                      <>
                        ✨ POLISH
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleAddTodayTask}
                    className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs transition-all active:scale-95"
                  >
                    ADD
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Tomorrow Card */}
          <Card className="bg-[#121214] border-zinc-800/50 border-dashed">
            <CardHeader className="pb-3 border-b border-zinc-900/30 p-5">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-500">PLAN TOMORROW</span>
              </div>
            </CardHeader>
            
            <CardContent className="pt-4 space-y-4 px-5 pb-5">
              {/* Tomorrow read-only list */}
              <div className="space-y-2 max-h-[140px] overflow-y-auto">
                {tomorrowTasks.length > 0 ? (
                  tomorrowTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg border border-zinc-900/30 bg-zinc-950/20 opacity-60"
                    >
                      {/* Locked checkbox */}
                      <div className="w-3.5 h-3.5 rounded border border-zinc-900 bg-zinc-900/10 flex items-center justify-center opacity-40 cursor-not-allowed">
                        <span className="text-[8px] text-transparent">•</span>
                      </div>
                      
                      {/* Text */}
                      <span className="text-xs text-zinc-400 flex-1">
                        {task.text}
                      </span>

                      {/* Delete button (visible on hover) */}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 rounded text-zinc-700 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all duration-150"
                        title="Delete Goal"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-[10px] uppercase tracking-widest text-zinc-600 border border-dashed border-zinc-900/60 rounded-xl">
                    No tomorrow plans.
                  </div>
                )}
              </div>

              {/* Tomorrow Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tomorrowInput}
                  onChange={(e) => setTomorrowInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTomorrowTask()}
                  placeholder="Queue tomorrow plan..."
                  className="flex-1 bg-zinc-900/20 border border-zinc-800/50 rounded-xl px-3.5 py-2 text-xs placeholder:text-zinc-600 text-zinc-200 outline-none focus:border-zinc-750 transition-all"
                />
                
                <button
                  onClick={handleAddTomorrowTask}
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800/80 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-all active:scale-95"
                >
                  PLAN
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Finance Column (col-span-12 lg:col-span-3) */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          {/* Account Balance Widget */}
          <Card className="bg-[#121214] border-zinc-800/50 p-5 space-y-5">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-500">LIQUID LEDGER</span>
              <p className="text-xs text-zinc-400">Total Capital Balance</p>
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl font-mono font-bold tracking-tighter text-zinc-100">
                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                <span className="text-emerald-500 font-medium">+12.4%</span>
                <span>vs last cycle</span>
              </div>
            </div>

            <button 
              onClick={() => setBalance(prev => prev + 1000)}
              className="w-full py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-[10px] font-semibold tracking-widest text-zinc-300 transition-all active:scale-95 uppercase"
            >
              Deposit $1,000
            </button>
          </Card>

          {/* Quick Stats list */}
          <Card className="bg-[#121214] border-zinc-800/50 p-5 space-y-4">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-500">BUDGET ENVELOPES</span>
              <p className="text-xs text-zinc-400">Reconciled monthly limits</p>
            </div>

            <div className="space-y-3.5">
              {[
                { category: "Housing", spent: 100 },
                { category: "Groceries", spent: 68 },
                { category: "Subscriptions", spent: 45 }
              ].map((budget, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500 uppercase">
                    <span>{budget.category}</span>
                    <span className="font-semibold text-zinc-400">{budget.spent}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        budget.spent >= 90 
                          ? "bg-rose-500" 
                          : budget.spent >= 75 
                            ? "bg-amber-500" 
                            : "bg-zinc-400"
                      }`}
                      style={{ width: `${budget.spent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        
      </div>
    </div>
  );
}
