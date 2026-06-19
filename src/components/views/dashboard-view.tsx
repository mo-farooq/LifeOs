"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Heart, 
  Dumbbell, 
  Wallet, 
  ArrowUpRight, 
  Flame, 
  Clock,
  Sparkles,
  Zap,
  X,
  Plus,
  Loader2,
  CheckCircle2,
  Calendar
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
    { id: "1", text: "Complete UI shell integration of Vector-Verse OS", completed: false, queued: true, tomorrow: false },
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

    // Smart semantic prefix modifications
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
    { title: "Health Rate", value: "64 bpm", desc: "Resting rate optimal", icon: Heart, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    { title: "Calorie Burn", value: "380 kcal", desc: "Active metabolic burn", icon: Dumbbell, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { title: "Finance Reserve", value: "$12,450.80", desc: "+14.2% surplus ledger", icon: Wallet, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
  ];

  return (
    <div className="space-y-6 select-none">
      
      {/* 1. LED Goal Ticker Strip */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md px-4 py-3 flex items-center justify-between text-zinc-100 shadow-md">
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {pendingGoals.length > 0 ? (
            <>
              {/* Glowing active indicator */}
              <div className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest flex-shrink-0 mr-1.5">
                Active Goal:
              </span>
              <p className="text-xs text-zinc-200 font-medium tracking-wide truncate animate-fade-in transition-all duration-300">
                {pendingGoals[tickerIndex]?.text}
              </p>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <p className="text-xs text-emerald-400 font-semibold tracking-wide">
                All goals done — solid day. Ready for tomorrow.
              </p>
            </>
          )}
        </div>

        {/* Progress ratio badge */}
        <div className="text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-850 border border-zinc-800 text-zinc-400 ml-4 flex-shrink-0">
          {completedCount}/{totalCount} Completed
        </div>
      </div>

      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/60 to-zinc-950/60 p-6 md:p-8 backdrop-blur-md">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="h-24 w-24 text-purple-400" />
        </div>
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400">
            <Sparkles className="h-3 w-3 animate-spin" /> Vector-Verse OS v1.0
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-50 via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Welcome Back, Commander
          </h1>
          <p className="text-sm md:text-base text-zinc-400">
            All system diagnostics are green. Your personal dashboard is synched and up to date. Here is your daily summary.
          </p>
        </div>
      </div>

      {/* Quick Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="hover:border-zinc-700/80 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <span className="text-sm font-medium text-zinc-400">{stat.title}</span>
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.border} border`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                <p className="text-xs text-zinc-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  {stat.desc}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Grid: Left (Day Progress Ring) & Right (To-Do list) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* 2. Left Column: Day Progress Ring Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="flex flex-col items-center justify-between p-6">
            <div className="w-full text-left space-y-1">
              <CardTitle className="text-lg">Awake Cycle Tracker</CardTitle>
              <CardDescription>Awake window benchmark (8:00 AM - Midnight)</CardDescription>
            </div>
            
            {/* SVG Progress Ring */}
            <div className="relative flex items-center justify-center my-8">
              <div className="absolute inset-0 bg-zinc-900/10 blur-xl rounded-full" />
              
              <svg className="w-48 h-48 transform -rotate-90">
                {/* Track circle */}
                <circle
                  cx="96"
                  cy="96"
                  r="70"
                  className="stroke-zinc-900"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Active circle with time-of-day coloring */}
                <circle
                  cx="96"
                  cy="96"
                  r="70"
                  stroke={getRingColor()}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * awakePercentage) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Digital Clock & Awake window text */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold font-mono tracking-wider text-zinc-50">
                  {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
                </span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mt-1">
                  Day elapsed
                </span>
                <span className="text-lg font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mt-0.5">
                  {awakePercentage}%
                </span>
              </div>
            </div>

            <div className="w-full text-center py-2 px-3 rounded-xl border border-zinc-900 bg-zinc-900/20 text-xs text-zinc-400">
              ⚡ Status: Window ends at 12:00 AM Midnight
            </div>
          </Card>

          {/* Habit Streak completion log */}
          <Card className="bg-gradient-to-br from-zinc-950/60 to-purple-950/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-500 animate-pulse" /> Active Habit Grid
              </CardTitle>
              <CardDescription>Consistently logging habit completions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex justify-around">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => {
                  const completed = idx < 5; // mock up M-F completed
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      <span className="text-[10px] font-medium text-zinc-500">{day}</span>
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                        completed 
                          ? "bg-purple-500/20 border-purple-500 text-purple-400 font-bold text-xs" 
                          : "bg-transparent border-zinc-800 text-zinc-600 text-xs"
                      }`}>
                        {completed ? "✓" : "•"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. Right Column: To-Do lists */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Today To-Do List Card */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between border-b border-zinc-900/40 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                  Active Log
                </span>
                <CardTitle className="text-xl mt-0.5">{formatDate()}</CardTitle>
                <CardDescription>Manage and check off your goals for today</CardDescription>
              </div>

              {/* Day Streak badge */}
              <div className="flex flex-col items-end gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400">
                  🔥 6 Day Streak
                </span>
                <span className="text-xs text-zinc-500">
                  {completedCount}/{totalCount} completed
                </span>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6 space-y-4">
              {/* Task Row items */}
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {todayTasks.length > 0 ? (
                  todayTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-900 bg-zinc-900/10 hover:bg-zinc-900/30 hover:border-zinc-800/80 transition-all duration-200"
                    >
                      {/* Checkbox button */}
                      <button
                        onClick={() => toggleComplete(task.id)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                          task.completed 
                            ? "bg-purple-500 border-purple-600 text-zinc-950 font-bold" 
                            : "border-zinc-700 bg-zinc-900/40 hover:border-zinc-500"
                        }`}
                      >
                        {task.completed && <span className="text-[10px] text-zinc-950 font-extrabold">✓</span>}
                      </button>

                      {/* Text */}
                      <span className={`text-sm text-zinc-200 flex-1 transition-all ${
                        task.completed ? "line-through text-zinc-500" : ""
                      }`}>
                        {task.text}
                      </span>

                      {/* Queue toggle button */}
                      <button
                        onClick={() => toggleQueue(task.id)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          task.queued 
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-400" 
                            : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                        }`}
                        title="Toggle Queue Priority"
                      >
                        <Zap className={`h-4 w-4 ${task.queued ? "fill-amber-400/20" : ""}`} />
                      </button>

                      {/* Delete button (visible on hover) */}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 rounded-lg border border-transparent text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 opacity-0 group-hover:opacity-100 transition-all duration-150"
                        title="Delete Goal"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                    No active tasks for today. Add one below.
                  </div>
                )}
              </div>

              {/* Add Task Area */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-zinc-900/40">
                <input
                  type="text"
                  value={todayInput}
                  onChange={(e) => setTodayInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTodayTask()}
                  placeholder="Capture new active goal..."
                  className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm placeholder:text-zinc-500 text-zinc-100 outline-none focus:border-zinc-700 focus:bg-zinc-900/80 transition-all"
                />
                
                <div className="flex gap-2">
                  <button
                    onClick={handlePolish}
                    disabled={isPolishing || !todayInput.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-medium text-xs transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {isPolishing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400" /> Polishing...
                      </>
                    ) : (
                      <>
                        ✨ Polish
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleAddTodayTask}
                    className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-zinc-950 font-bold text-xs transition-all active:scale-95 shadow-md shadow-purple-500/10"
                  >
                    Add
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Tomorrow Card */}
          <Card className="border-dashed bg-zinc-950/20">
            <CardHeader className="pb-3 border-b border-zinc-900/40">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-zinc-400" /> Plan Tomorrow
              </CardTitle>
              <CardDescription className="text-xs">
                Queue tasks to be pushed into your active log tomorrow.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-4 space-y-4">
              {/* Tomorrow read-only list */}
              <div className="space-y-2 max-h-[180px] overflow-y-auto">
                {tomorrowTasks.length > 0 ? (
                  tomorrowTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl border border-zinc-900/60 bg-zinc-950/30 opacity-70"
                    >
                      {/* Locked checkbox */}
                      <div className="w-4 h-4 rounded border border-zinc-800 bg-zinc-900/20 flex items-center justify-center opacity-50 cursor-not-allowed">
                        <span className="text-[8px] text-transparent">•</span>
                      </div>
                      
                      {/* Text */}
                      <span className="text-xs text-zinc-300 flex-1">
                        {task.text}
                      </span>

                      {/* Delete button (visible on hover) */}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 rounded-lg border border-transparent text-zinc-600 hover:text-rose-400 hover:bg-zinc-900 opacity-0 group-hover:opacity-100 transition-all duration-150"
                        title="Delete Goal"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-[10px] text-zinc-600 border border-dashed border-zinc-900 rounded-xl">
                    No tomorrow plans queued.
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
                  className="flex-1 bg-zinc-900/40 border border-zinc-850 rounded-xl px-3.5 py-2 text-xs placeholder:text-zinc-600 text-zinc-200 outline-none focus:border-zinc-800 transition-all"
                />
                
                <button
                  onClick={handleAddTomorrowTask}
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 text-xs font-semibold transition-all active:scale-95"
                >
                  Plan
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
}
