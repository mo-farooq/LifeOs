"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Heart, 
  Dumbbell, 
  Wallet, 
  Flame, 
  Zap,
  X,
  Loader2,
  Calendar,
  Check
} from "lucide-react";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  queued: boolean;
  date: string; // YYYY-MM-DD
}

export default function DashboardView() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Rollover and date logic
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

  // Task State (Initialized dynamically based on initial calculated dates)
  const [tasks, setTasks] = useState<Task[]>([]);

  // Input states
  const [todayInput, setTodayInput] = useState("");
  const [tomorrowInput, setTomorrowInput] = useState("");
  const [isPolishing, setIsPolishing] = useState(false);

  // LED Goal Ticker State
  const [tickerIndex, setTickerIndex] = useState(0);

  // Quick Finance State Mock
  const [balance, setBalance] = useState(12450.80);

  // Hydration safety & running clock
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize tasks state once mounted to prevent server/client mismatch
  useEffect(() => {
    if (mounted) {
      const initActive = getActiveDate(new Date());
      const initTomorrow = getTomorrowDate(initActive);
      setTasks([
        { id: "1", text: "Complete UI shell integration of Life OS", completed: false, queued: true, date: initActive },
        { id: "2", text: "Log nutritional intake & weight metrics", completed: true, queued: false, date: initActive },
        { id: "3", text: "Review weekly portfolio balance sheets", completed: false, queued: false, date: initActive },
        { id: "4", text: "Complete daily hypertrophic gym routine", completed: false, queued: true, date: initActive },
        { id: "5", text: "Setup sleep environment: dim lights & meditate", completed: false, queued: false, date: initActive },
        { id: "6", text: "Prepare healthy breakfast bowls for the week", completed: false, queued: false, date: initTomorrow },
        { id: "7", text: "Sync smart watch with dashboard databases", completed: false, queued: false, date: initTomorrow },
      ]);
    }
  }, [mounted]);

  // Filter Tasks by Active Dates
  const todayTasks = tasks.filter((t) => t.date === activeDate);
  const tomorrowTasks = tasks.filter((t) => t.date === tomorrowDate);
  const pendingGoals = todayTasks.filter((t) => !t.completed);
  const completedCount = todayTasks.filter((t) => t.completed).length;
  const totalCount = todayTasks.length;
  const uncheckedTodayTasks = todayTasks.filter(t => !t.completed);

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
    const hour = currentTime.getHours();
    const min = currentTime.getMinutes();
    const decimalTime = hour + min / 60;

    if (decimalTime < 8) return { percent: 0, sleeping: true };
    if (decimalTime >= 24) return { percent: 100, sleeping: true };

    const elapsed = decimalTime - 8;
    const total = 16; // 16 hours
    const percent = Math.min(Math.round((elapsed / total) * 100), 100);
    return { percent, sleeping: false };
  };

  const awakeStatus = getAwakeProgress();

  const getActivePhase = () => {
    const hour = currentTime.getHours();
    if (hour < 8) return "SLEEPING";
    if (hour >= 8 && hour < 12) return "MORNING";
    if (hour >= 12 && hour < 15) return "MIDDAY";
    if (hour >= 15 && hour < 18) return "AFTERNOON";
    if (hour >= 18 && hour < 21) return "EVENING";
    if (hour >= 21 && hour < 24) return "BEDTIME";
    return "SLEEPING";
  };

  const format12HourClock = () => {
    let hours = currentTime.getHours();
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  // Actions
  const toggleComplete = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const toggleQueue = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, queued: !t.queued } : t));
  };

  const updateTaskText = (id: string, text: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, text } : t));
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
      date: activeDate
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
      date: tomorrowDate
    };
    setTasks([...tasks, newTask]);
    setTomorrowInput("");
  };

  const pushRemainingToTomorrow = () => {
    setTasks(prev => prev.map(t => {
      if (t.date === activeDate && !t.completed) {
        return { ...t, date: tomorrowDate };
      }
      return t;
    }));
  };

  // AI Polish Input Mock
  const handlePolish = async () => {
    if (!todayInput.trim()) return;
    setIsPolishing(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    let text = todayInput.trim();
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

  const formatHeaderDate = () => {
    const d = new Date(activeDate);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric"
    }).toUpperCase();
  };

  if (!mounted) {
    return null;
  }

  // Health and Gym stats
  const stats = [
    { title: "VITALITY INDEX", value: "64 BPM", desc: "RESTING RATE OPTIMAL", icon: Heart },
    { title: "CALORIC INTAKE", value: "1840 KCAL", desc: "76% OF DAILY BUDGET", icon: Dumbbell },
    { title: "NET SAVINGS", value: "57.9%", desc: "SURPLUS LEDGER ACTIVE", icon: Wallet }
  ];

  return (
    <div className="space-y-4 select-none text-zinc-200">
      
      {/* Module 1 — The Ledger Ticker Strip */}
      <div className="rounded-md border border-zinc-800 bg-[#000000] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          <div className="bg-emerald-500 h-2 w-2 rounded-full flex-shrink-0" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 flex-shrink-0 font-bold">
            GOALS
          </span>
          <span className="text-zinc-800 font-mono text-xs flex-shrink-0">|</span>
          <div className="text-xs text-zinc-350 font-mono tracking-wide truncate flex-1">
            {pendingGoals.length > 0 ? (
              pendingGoals[tickerIndex]?.text
            ) : (
              "✓ All goals done — solid day."
            )}
          </div>
        </div>

        {/* Counter */}
        <div className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-zinc-800 bg-[#0a0a0a] text-zinc-400 ml-4 flex-shrink-0">
          {totalCount > 0 ? `${completedCount}/${totalCount}` : "-/-"}
        </div>
      </div>

      {/* Main Branding Header */}
      <div className="rounded-md border border-zinc-800 bg-[#0a0a0a] p-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#000000] border border-zinc-800 text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
            LIFE OS // MODULE // CORE
          </div>
          <h1 className="text-xl font-mono uppercase tracking-wider font-bold text-zinc-150">
            SYSTEM CONTROL
          </h1>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wide">
            Dynamic rollover: 06:00 AM • Active date target: {activeDate}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="bg-[#0a0a0a] border-zinc-800 rounded-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4 border-b-0">
                <span className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500">{stat.title}</span>
                <Icon className="h-3.5 w-3.5 text-zinc-500" />
              </CardHeader>
              <CardContent className="space-y-1 px-4 pb-4">
                <div className="text-xl font-mono font-bold tracking-tight text-zinc-100">{stat.value}</div>
                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{stat.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bento Layout Grid Overhaul (12-Column Grid) */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* Module 2 — The Analytical SVG Day Progress Ring (col-span-12 md:col-span-4 lg:col-span-3) */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 space-y-4">
          <Card className="flex flex-col items-center justify-between p-4 bg-[#0a0a0a] border-zinc-800 rounded-md">
            <div className="w-full text-left space-y-0.5">
              <span className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500">AWAKE MONITOR</span>
              <p className="text-[10px] font-mono text-zinc-550 uppercase">08:00 AM - 12:00 AM</p>
            </div>
            
            {/* SVG Progress Ring */}
            <div className="relative flex items-center justify-center my-6">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="56"
                  className="stroke-zinc-900"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                {!awakeStatus.sleeping && (
                  <circle
                    cx="72"
                    cy="72"
                    r="56"
                    className="stroke-zinc-100 transition-all duration-500 ease-in-out"
                    strokeWidth="3.5"
                    fill="transparent"
                    strokeDasharray={352}
                    strokeDashoffset={352 - (352 * awakeStatus.percent) / 100}
                    strokeLinecap="square"
                  />
                )}
              </svg>

              {/* Dynamic Center Text */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-lg font-mono font-bold tracking-tight text-zinc-50">
                  {format12HourClock()}
                </span>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-semibold mt-0.5">
                  {getActivePhase()}
                </span>
                <span className="text-xs font-mono font-bold text-zinc-300">
                  {awakeStatus.sleeping ? "😴 STILL SLEEPING" : `${awakeStatus.percent}%`}
                </span>
              </div>
            </div>

            <div className="w-full text-center py-1.5 px-3 border border-zinc-800 bg-[#000000] text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
              Rollover target {24 - currentTime.getHours() + 6}H remaining
            </div>
          </Card>

          {/* Active Habit Grid */}
          <Card className="bg-[#0a0a0a] border-zinc-800 p-4 space-y-3 rounded-md">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500">STREAK LOGS</span>
              <p className="text-[10px] font-mono text-zinc-500 uppercase">HABIT GRID COMPILATION</p>
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => {
                const completed = idx < 5;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-mono text-zinc-500">{day}</span>
                    <div 
                      className={`w-4 h-4 border transition-colors duration-150 flex items-center justify-center rounded-sm ${
                        completed 
                          ? "bg-zinc-100 border-zinc-200 text-zinc-950 font-mono text-[8px] font-bold" 
                          : "bg-transparent border-zinc-800"
                      }`}
                    >
                      {completed ? "✓" : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Module 3 — Today & Tomorrow Matrices (col-span-12 md:col-span-8 lg:col-span-6) */}
        <div className="col-span-12 md:col-span-8 lg:col-span-6 space-y-4">
          
          {/* Today Priority Card */}
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="flex flex-col border-b border-zinc-800 p-4 space-y-3">
              <div className="flex flex-row items-start justify-between w-full">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500">TODAY SPLIT REGISTER</span>
                  <CardTitle className="text-xs font-mono tracking-widest text-zinc-100">{formatHeaderDate()}</CardTitle>
                </div>

                {/* Day Streak badge */}
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[9px] font-mono uppercase tracking-widest font-semibold px-2 py-0.5 rounded border border-zinc-800 bg-[#000000] text-zinc-300 flex items-center gap-1">
                    🔥 6 DAY STREAK
                  </span>
                  <span className="text-[9px] font-mono text-zinc-550">
                    {completedCount}/{totalCount} COMPLETED
                  </span>
                </div>
              </div>

              {/* Segmented Progress Tracker Bar */}
              {todayTasks.length === 0 ? (
                <div className="w-full h-1 bg-zinc-900 rounded-sm" />
              ) : (
                <div className="flex gap-1 w-full h-1">
                  {todayTasks.map((t) => (
                    <div 
                      key={t.id} 
                      className={`flex-1 h-full rounded-sm transition-all duration-200 ${
                        t.completed ? "bg-zinc-100" : "bg-zinc-900"
                      }`} 
                    />
                  ))}
                </div>
              )}
            </CardHeader>
            
            <CardContent className="pt-4 space-y-3 p-4">
              {/* Task Row items */}
              <div className="space-y-0.5 max-h-[300px] overflow-y-auto pr-1">
                {todayTasks.length > 0 ? (
                  todayTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="group flex items-center gap-3 px-2 py-2 border-b border-zinc-900 bg-transparent hover:bg-[#0a0a0a] transition-all duration-150"
                    >
                      {/* Checkbox (ticked: solid white, black check icon) */}
                      <button
                        onClick={() => toggleComplete(task.id)}
                        className={`w-3.5 h-3.5 border transition-all duration-150 flex items-center justify-center rounded-sm ${
                          task.completed 
                            ? "bg-zinc-50 border-zinc-100 text-zinc-950 font-bold" 
                            : "border-zinc-800 bg-transparent hover:border-zinc-650"
                        }`}
                      >
                        {task.completed && <Check className="h-2.5 w-2.5 stroke-[3.5] text-zinc-950" />}
                      </button>

                      {/* Inline Editable Text Block */}
                      <input
                        type="text"
                        value={task.text}
                        onChange={(e) => updateTaskText(task.id, e.target.value)}
                        className={`flex-1 bg-transparent border-0 outline-none text-xs font-mono transition-all duration-150 focus:text-zinc-50 ${
                          task.completed ? "text-zinc-600 line-through opacity-40" : "text-zinc-300"
                        }`}
                      />

                      {/* Queue priority */}
                      <button
                        onClick={() => toggleQueue(task.id)}
                        className={`p-1 rounded transition-all duration-150 ${
                          task.queued 
                            ? "text-zinc-100" 
                            : "text-zinc-600 hover:text-zinc-300"
                        }`}
                        title="Priority Queue"
                      >
                        <Zap className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete button (revealed on hover) */}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 rounded text-zinc-600 hover:text-zinc-100 opacity-0 group-hover:opacity-100 transition-all duration-150"
                        title="Delete Goal"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-[9px] font-mono uppercase tracking-widest text-zinc-600 border border-dashed border-zinc-800 rounded">
                    No priorities cataloged.
                  </div>
                )}
              </div>

              {/* Add Task Area */}
              <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-zinc-800">
                <input
                  type="text"
                  value={todayInput}
                  onChange={(e) => setTodayInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTodayTask()}
                  placeholder="CAPTURE NEW PRIORITY LOG..."
                  className="flex-1 bg-transparent border border-zinc-800 rounded-md px-3 py-2 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-600 transition-all"
                />
                
                <div className="flex gap-2">
                  <button
                    onClick={handlePolish}
                    disabled={isPolishing || !todayInput.trim()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-zinc-800 bg-[#000000] hover:bg-[#0a0a0a] text-zinc-400 font-mono text-[9px] tracking-wider transition-all disabled:opacity-40"
                  >
                    {isPolishing ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin text-zinc-400" /> POLISHING...
                      </>
                    ) : (
                      <>
                        ✨ POLISH
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleAddTodayTask}
                    className="px-4 py-2 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-[10px] tracking-wider transition-all"
                  >
                    ADD
                  </button>
                </div>
              </div>

              {/* Push remaining goals button (visible only when unchecked goals exist) */}
              {uncheckedTodayTasks.length > 0 && (
                <button
                  onClick={pushRemainingToTomorrow}
                  className="w-full flex items-center justify-center gap-1.5 py-2 mt-2 rounded border border-zinc-800 bg-[#000000] hover:bg-[#0a0a0a] text-[9px] font-mono tracking-widest text-zinc-350 transition-all uppercase duration-150"
                >
                  Push Remaining Tasks to Tomorrow →
                </button>
              )}
            </CardContent>
          </Card>

          {/* Plan Tomorrow Card */}
          <Card className="bg-[#0a0a0a] border-zinc-800 border-dashed rounded-md">
            <CardHeader className="pb-2 border-b border-zinc-800 p-4">
              <div className="flex justify-between items-center w-full">
                <span className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500">PLAN TOMORROW</span>
                <span className="text-[8px] font-mono text-zinc-600 uppercase">Activates at 6 AM tomorrow</span>
              </div>
            </CardHeader>
            
            <CardContent className="pt-3 space-y-3 p-4">
              {/* Tomorrow read-only list */}
              <div className="space-y-1 max-h-[140px] overflow-y-auto">
                {tomorrowTasks.length > 0 ? (
                  tomorrowTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="group flex items-center gap-3 px-3 py-1.5 border-b border-zinc-800/40 bg-transparent opacity-60"
                    >
                      {/* Locked checkbox */}
                      <div className="w-3.5 h-3.5 border border-zinc-800 bg-transparent flex items-center justify-center opacity-30 cursor-not-allowed rounded-sm">
                        <span className="text-[6px] text-transparent">•</span>
                      </div>
                      
                      {/* Text (Inline editable still enabled, but checkboxes locked) */}
                      <input
                        type="text"
                        value={task.text}
                        onChange={(e) => updateTaskText(task.id, e.target.value)}
                        className="flex-1 bg-transparent border-0 outline-none text-xs font-mono text-zinc-400"
                      />

                      {/* Locked Queue Priority key */}
                      <button
                        disabled
                        className="p-1 rounded cursor-not-allowed opacity-30 text-zinc-600"
                      >
                        <Zap className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete button (still allowed to clear out planned items) */}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 rounded text-zinc-700 hover:text-zinc-150 opacity-0 group-hover:opacity-100 transition-all duration-150"
                        title="Delete Plan"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-3 text-[9px] font-mono uppercase tracking-widest text-zinc-650 border border-dashed border-zinc-800 rounded">
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
                  placeholder="QUEUE TOMORROW PLAN..."
                  className="flex-1 bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-700 transition-all"
                />
                
                <button
                  onClick={handleAddTomorrowTask}
                  className="px-3 py-1.5 rounded-md bg-[#000000] border border-zinc-800/80 hover:bg-[#0a0a0a] text-zinc-300 font-mono text-[9px] tracking-wider transition-all"
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
          <Card className="bg-[#0a0a0a] border-zinc-800 p-4 space-y-4 rounded-md">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500">LIQUID RESERVES</span>
              <p className="text-[10px] font-mono text-zinc-550 uppercase">TOTAL CAPITAL</p>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-mono font-bold tracking-tight text-zinc-50">
                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
              <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-mono uppercase">
                <span className="text-zinc-300 font-semibold">+12.4%</span>
                <span>VS LAST CYCLE</span>
              </div>
            </div>

            <button 
              onClick={() => setBalance(prev => prev + 1000)}
              className="w-full py-2 rounded-md border border-zinc-800 bg-[#000000] hover:bg-[#0a0a0a] text-[9px] font-mono font-semibold tracking-widest text-zinc-300 transition-all uppercase"
            >
              DEPOSIT $1,000
            </button>
          </Card>

          {/* Quick Stats list */}
          <Card className="bg-[#0a0a0a] border-zinc-800 p-4 space-y-3 rounded-md">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500">BUDGET LIMITS</span>
              <p className="text-[10px] font-mono text-zinc-550 uppercase">RECONCILED ALLOCATIONS</p>
            </div>

            <div className="space-y-3">
              {[
                { category: "Housing", spent: 100 },
                { category: "Groceries", spent: 68 },
                { category: "Subscriptions", spent: 45 }
              ].map((budget, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                    <span>{budget.category}</span>
                    <span className="font-semibold text-zinc-300">{budget.spent}%</span>
                  </div>
                  <div className="w-full bg-[#000000] border border-zinc-900 h-1.5 rounded-sm overflow-hidden">
                    <div 
                      className="h-full bg-zinc-200 transition-all duration-500"
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
