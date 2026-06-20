"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Zap,
  X,
  Loader2,
  Calendar,
  Check,
  LayoutGrid,
  List,
  Sparkles,
  ChevronRight,
  TrendingUp,
  BatteryCharging,
  Battery,
  AlertCircle
} from "lucide-react";
import { Task } from "@/types";

interface DashboardViewProps {
  tasks: Task[];
  updateTasks: (tasks: Task[]) => void;
  activeDate: string;
  tomorrowDate: string;
}

export default function DashboardView({ tasks, updateTasks, activeDate, tomorrowDate }: DashboardViewProps) {
  // Input states
  const [todayInput, setTodayInput] = useState("");
  const [todayEnergy, setTodayEnergy] = useState<"charging" | "draining">("charging");
  const [todayRevenue, setTodayRevenue] = useState<"high" | "low">("high");
  const [todayPriority, setTodayPriority] = useState(false);

  const [tomorrowInput, setTomorrowInput] = useState("");
  const [tomorrowEnergy, setTomorrowEnergy] = useState<"charging" | "draining">("charging");
  const [tomorrowRevenue, setTomorrowRevenue] = useState<"high" | "low">("high");
  const [tomorrowPriority, setTomorrowPriority] = useState(false);

  const [isPolishing, setIsPolishing] = useState(false);
  const [isGridView, setIsGridView] = useState(false); // Toggle DRIP Grid Matrix

  // Filter Tasks by Active Dates
  const todayTasks = tasks.filter((t) => t.date === activeDate);
  const tomorrowTasks = tasks.filter((t) => t.date === tomorrowDate);
  const completedCount = todayTasks.filter((t) => t.completed).length;
  const totalCount = todayTasks.length;

  // Task Actions
  const toggleComplete = (id: string) => {
    updateTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const togglePriority = (id: string) => {
    updateTasks(
      tasks.map((t) => (t.id === id ? { ...t, priority: !t.priority } : t))
    );
  };

  const updateTaskText = (id: string, text: string) => {
    updateTasks(
      tasks.map((t) => (t.id === id ? { ...t, text } : t))
    );
  };

  const deleteTask = (id: string) => {
    updateTasks(tasks.filter((t) => t.id !== id));
  };

  const handleAddTodayTask = () => {
    if (!todayInput.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: todayInput.trim(),
      completed: false,
      queued: false,
      date: activeDate,
      energy: todayEnergy,
      revenue: todayRevenue,
      priority: todayPriority
    };
    updateTasks([...tasks, newTask]);
    setTodayInput("");
    setTodayPriority(false);
  };

  const handleAddTomorrowTask = () => {
    if (!tomorrowInput.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: tomorrowInput.trim(),
      completed: false,
      queued: false,
      date: tomorrowDate,
      energy: tomorrowEnergy,
      revenue: tomorrowRevenue,
      priority: tomorrowPriority
    };
    updateTasks([...tasks, newTask]);
    setTomorrowInput("");
    setTomorrowPriority(false);
  };

  const pushRemainingToTomorrow = () => {
    updateTasks(
      tasks.map((t) => {
        if (t.date === activeDate && !t.completed) {
          return { ...t, date: tomorrowDate };
        }
        return t;
      })
    );
  };

  // AI Polish Handler (capitalizes and adds professional prefix)
  const handlePolish = async () => {
    if (!todayInput.trim()) return;
    setIsPolishing(true);

    // Simulate 1-second API call loading state
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

  // 4-Quadrant Filter Helpers
  const geniusTasks = todayTasks.filter(t => t.energy === "charging" && t.revenue === "high");
  const passionTasks = todayTasks.filter(t => t.energy === "charging" && t.revenue === "low");
  const leverageTasks = todayTasks.filter(t => t.energy === "draining" && t.revenue === "high");
  const delegateTasks = todayTasks.filter(t => t.energy === "draining" && t.revenue === "low");

  const renderTaskRow = (task: Task, isReadOnly = false) => {
    return (
      <div 
        key={task.id} 
        className={`group flex items-center gap-3 py-2.5 px-3 border-b border-zinc-900 bg-[#000000]/40 hover:bg-[#0a0a0a] transition-all rounded duration-150 animate-slide-in ${
          task.completed ? "opacity-40" : ""
        }`}
      >
        {/* Custom Checkbox */}
        <button
          onClick={() => !isReadOnly && toggleComplete(task.id)}
          disabled={isReadOnly}
          className={`w-4 h-4 border flex items-center justify-center rounded-sm transition-all duration-150 cursor-pointer ${
            task.completed 
              ? "bg-zinc-50 border-zinc-150 text-zinc-950 scale-105" 
              : "border-zinc-800 bg-transparent hover:border-zinc-650 hover:scale-105 active:scale-95"
          }`}
        >
          {task.completed && <Check className="h-3 w-3 stroke-[3.5] text-zinc-950 animate-check-tick" />}
        </button>

        {/* Task Text Input (Editable inline if not read-only) with animated line strike-through */}
        <div className="flex-grow relative min-w-0">
          <input
            type="text"
            value={task.text}
            disabled={isReadOnly}
            onChange={(e) => updateTaskText(task.id, e.target.value)}
            className={`w-full bg-transparent outline-none text-xs font-mono transition-all duration-150 ${
              task.completed ? "text-zinc-500" : "text-zinc-200 focus:text-zinc-50"
            }`}
          />
          {task.completed && (
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] bg-zinc-500 pointer-events-none origin-left animate-strike"
            />
          )}
        </div>

        {/* Task Metadata Indicator Pills */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-[8px] font-mono px-1 rounded border uppercase transition-colors duration-200 ${
            task.energy === "charging" 
              ? "border-emerald-900/30 text-emerald-500 bg-emerald-950/10" 
              : "border-zinc-850 text-zinc-550 bg-zinc-900/10"
          }`}>
            {task.energy}
          </span>
          <span className={`text-[8px] font-mono px-1 rounded border uppercase transition-colors duration-200 ${
            task.revenue === "high" 
              ? "border-amber-900/30 text-amber-500 bg-amber-950/10" 
              : "border-zinc-850 text-zinc-550 bg-zinc-900/10"
          }`}>
            {task.revenue}
          </span>
        </div>

        {/* Lightning Bolt Toggle */}
        <button
          onClick={() => !isReadOnly && togglePriority(task.id)}
          disabled={isReadOnly}
          className={`p-0.5 rounded transition-all duration-150 hover:bg-zinc-900 ${
            task.priority 
              ? "text-yellow-400 bg-yellow-950/20 scale-110" 
              : "text-zinc-700 hover:text-zinc-500"
          }`}
        >
          <Zap className={`h-3.5 w-3.5 ${task.priority ? "fill-yellow-400" : ""}`} />
        </button>

        {/* Delete Trigger */}
        {!isReadOnly && (
          <button
            onClick={() => deleteTask(task.id)}
            className="text-zinc-700 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-all duration-150 p-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  };

  const renderQuadrant = (title: string, subtitle: string, list: Task[], energyLabel: string, revenueLabel: string) => {
    return (
      <div className="border border-zinc-800 rounded-md p-4 bg-[#0a0a0a] flex flex-col h-full min-h-[180px] transition-all duration-300 hover:border-zinc-700">
        <div className="flex justify-between items-center mb-3 pb-1.5 border-b border-zinc-900 flex-shrink-0">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-200 uppercase">{title}</span>
            <p className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest font-bold">{subtitle}</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[8px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded uppercase font-bold">{energyLabel}</span>
            <span className="text-[8px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded uppercase font-bold">{revenueLabel}</span>
          </div>
        </div>
        <div className="flex-grow space-y-1.5 overflow-y-auto max-h-[220px]">
          {list.map(t => renderTaskRow(t))}
          {list.length === 0 && (
            <div className="h-full flex items-center justify-center py-6 text-center text-[9px] font-mono uppercase tracking-widest text-zinc-650 animate-pulse">
              Empty quadrant.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 text-zinc-200 font-mono">
      {/* CSS Keyframe Animations injection */}
      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes strike {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes checkTick {
          0% { transform: scale(0.6); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .animate-slide-in {
          animation: slideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-strike {
          animation: strike 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .animate-check-tick {
          animation: checkTick 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      {/* View Toggle Bar */}
      <div className="flex justify-between items-center bg-[#0a0a0a] border border-zinc-800 px-5 py-3 rounded-md animate-slide-in">
        <div className="space-y-0.5">
          <span className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500">TASK HUB</span>
          <h1 className="text-sm font-mono tracking-widest font-bold text-zinc-150 uppercase">THE DRIP MATRIX</h1>
        </div>

        {/* Toggle between standard list and 4-quadrant grid */}
        <div className="flex items-center border border-zinc-800 bg-[#000000] p-1 rounded-md">
          <button
            onClick={() => setIsGridView(false)}
            className={`px-3 py-1 text-[9px] font-mono font-bold tracking-wider uppercase rounded flex items-center gap-1.5 transition-all duration-150 ${
              !isGridView ? "bg-zinc-50 text-zinc-950" : "text-zinc-400 hover:text-zinc-255"
            }`}
          >
            <List className="h-3 w-3" /> List View
          </button>
          <button
            onClick={() => setIsGridView(true)}
            className={`px-3 py-1 text-[9px] font-mono font-bold tracking-wider uppercase rounded flex items-center gap-1.5 transition-all duration-150 ${
              isGridView ? "bg-zinc-50 text-zinc-950" : "text-zinc-400 hover:text-zinc-255"
            }`}
          >
            <LayoutGrid className="h-3 w-3" /> Grid Matrix
          </button>
        </div>
      </div>

      {/* Main Task List Area */}
      {!isGridView ? (
        <div className="space-y-4 animate-slide-in" style={{ animationDelay: "50ms" }}>
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold">TODAY</span>
                <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">ACTIVE EXECUTION BUFFER</CardTitle>
              </div>

              {/* Segmented Progress Tracker Bar */}
              <div className="w-full sm:w-48 space-y-1">
                <div className="flex justify-between text-[8px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                  <span>PROGRESS</span>
                  <span>{todayTasks.length > 0 ? `${completedCount}/${totalCount}` : "0/0"}</span>
                </div>
                {/* Horizontal dashes representation */}
                <div className="flex gap-1 w-full">
                  {todayTasks.map((t) => (
                    <div 
                      key={t.id} 
                      className={`h-1.5 flex-1 rounded-sm transition-all duration-500 ${
                        t.completed ? "bg-zinc-100" : "bg-zinc-850"
                      }`} 
                    />
                  ))}
                  {todayTasks.length === 0 && (
                    <div className="h-1.5 w-full rounded-sm bg-zinc-850 animate-pulse" />
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Task list list */}
              <div className="space-y-1">
                {todayTasks.map((t) => renderTaskRow(t))}
                {todayTasks.length === 0 && (
                  <div className="text-center py-6 text-[10px] font-mono uppercase tracking-widest text-zinc-600 border border-dashed border-zinc-850 rounded animate-pulse">
                    No active objectives registered for today.
                  </div>
                )}
              </div>

              {/* Add today task Form */}
              <div className="flex flex-col gap-2 pt-3 border-t border-zinc-900 mt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={todayInput}
                    onChange={(e) => setTodayInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTodayTask()}
                    placeholder="ENTER TODAY'S TASK..."
                    className="flex-1 bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-700 transition-all duration-150"
                  />
                  
                  {/* AI Polish Button */}
                  <button
                    onClick={handlePolish}
                    disabled={isPolishing || !todayInput.trim()}
                    className="px-3 rounded-md border border-zinc-800 bg-[#000000] hover:bg-[#0a0a0a] text-zinc-400 hover:text-zinc-250 disabled:opacity-40 flex items-center justify-center transition-all duration-150 active:scale-95"
                    title="Polish Task with AI"
                  >
                    {isPolishing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-zinc-450 hover:text-zinc-200" />
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    {/* Energy Selector */}
                    <div className="flex items-center gap-1 bg-[#000000] border border-zinc-900 p-0.5 rounded">
                      <button
                        onClick={() => setTodayEnergy("charging")}
                        className={`px-2 py-0.5 text-[8px] font-mono font-bold tracking-widest uppercase rounded-sm transition-all ${
                          todayEnergy === "charging" ? "bg-zinc-800 text-zinc-100 font-bold" : "text-zinc-650 hover:text-zinc-400"
                        }`}
                      >
                        Charging
                      </button>
                      <button
                        onClick={() => setTodayEnergy("draining")}
                        className={`px-2 py-0.5 text-[8px] font-mono font-bold tracking-widest uppercase rounded-sm transition-all ${
                          todayEnergy === "draining" ? "bg-zinc-800 text-zinc-100 font-bold" : "text-zinc-650 hover:text-zinc-400"
                        }`}
                      >
                        Draining
                      </button>
                    </div>

                    {/* Revenue Selector */}
                    <div className="flex items-center gap-1 bg-[#000000] border border-zinc-900 p-0.5 rounded">
                      <button
                        onClick={() => setTodayRevenue("high")}
                        className={`px-2 py-0.5 text-[8px] font-mono font-bold tracking-widest uppercase rounded-sm transition-all ${
                          todayRevenue === "high" ? "bg-zinc-800 text-zinc-100 font-bold" : "text-zinc-650 hover:text-zinc-400"
                        }`}
                      >
                        High Return
                      </button>
                      <button
                        onClick={() => setTodayRevenue("low")}
                        className={`px-2 py-0.5 text-[8px] font-mono font-bold tracking-widest uppercase rounded-sm transition-all ${
                          todayRevenue === "low" ? "bg-zinc-800 text-zinc-100 font-bold" : "text-zinc-650 hover:text-zinc-400"
                        }`}
                      >
                        Low Return
                      </button>
                    </div>

                    {/* Priority Toggle */}
                    <button
                      onClick={() => setTodayPriority(!todayPriority)}
                      className={`px-2 py-1 text-[8px] font-mono font-bold tracking-widest uppercase rounded border transition-all duration-150 active:scale-95 ${
                        todayPriority ? "border-yellow-900/40 text-yellow-500 bg-yellow-950/10 font-bold" : "border-zinc-900 text-zinc-500 hover:border-zinc-800"
                      }`}
                    >
                      Priority
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={pushRemainingToTomorrow}
                      disabled={todayTasks.filter(t => !t.completed).length === 0}
                      className="px-3 py-1.5 rounded-md border border-zinc-800 bg-[#000000] hover:bg-[#0a0a0a] text-zinc-450 hover:text-zinc-100 text-[9px] font-mono font-bold tracking-widest uppercase disabled:opacity-40 transition-all duration-150 active:scale-95 cursor-pointer"
                    >
                      Push Remaining
                    </button>
                    <button
                      onClick={handleAddTodayTask}
                      className="px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-[9px] tracking-widest uppercase transition-all duration-150 active:scale-95 cursor-pointer"
                    >
                      Add Today
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Grid 4-Quadrant Drip Matrix */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-in" style={{ animationDelay: "50ms" }}>
          {renderQuadrant("ZONE OF GENIUS", "CHARGING ENERGY // HIGH REVENUE", geniusTasks, "charging", "high")}
          {renderQuadrant("PASSIONS & GROWTH", "CHARGING ENERGY // LOW REVENUE", passionTasks, "charging", "low")}
          {renderQuadrant("HIGH LEVERAGE", "DRAINING ENERGY // HIGH REVENUE", leverageTasks, "draining", "high")}
          {renderQuadrant("DELEGATE / ELIMINATE", "DRAINING ENERGY // LOW REVENUE", delegateTasks, "draining", "low")}
        </div>
      )}

      {/* Plan Tomorrow Card */}
      <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md animate-slide-in" style={{ animationDelay: "100ms" }}>
        <CardHeader className="p-4 border-b border-zinc-800">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold">TOMORROW</span>
              <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">NEXT DAY STRATEGY BUFFER</CardTitle>
            </div>
            <div className="px-2.5 py-0.5 rounded border border-zinc-900 bg-[#000000] text-[8px] font-mono text-zinc-550 uppercase tracking-widest font-bold">
              ACTIVATES AT 6 AM TOMORROW
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 space-y-4">
          {/* Read Only Tasks list */}
          <div className="space-y-1">
            {tomorrowTasks.map((t) => renderTaskRow(t, true))}
            {tomorrowTasks.length === 0 && (
              <div className="text-center py-6 text-[10px] font-mono uppercase tracking-widest text-zinc-650 border border-dashed border-zinc-850 rounded animate-pulse">
                No next-day strategy registered.
              </div>
            )}
          </div>

          {/* Add tomorrow task form (unlocked inputs, but tasks rendered will be read-only in this screen context) */}
          <div className="flex flex-col gap-2 pt-3 border-t border-zinc-900 mt-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={tomorrowInput}
                onChange={(e) => setTomorrowInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTomorrowTask()}
                placeholder="ENTER TOMORROW'S TASK OBJECTIVE..."
                className="flex-1 bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-700 transition-all duration-150"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                {/* Energy */}
                <div className="flex items-center gap-1 bg-[#000000] border border-zinc-900 p-0.5 rounded">
                  <button
                    onClick={() => setTomorrowEnergy("charging")}
                    className={`px-2 py-0.5 text-[8px] font-mono font-bold tracking-widest uppercase rounded-sm transition-all ${
                      tomorrowEnergy === "charging" ? "bg-zinc-800 text-zinc-100 font-bold" : "text-zinc-650 hover:text-zinc-400"
                    }`}
                  >
                    Charging
                  </button>
                  <button
                    onClick={() => setTomorrowEnergy("draining")}
                    className={`px-2 py-0.5 text-[8px] font-mono font-bold tracking-widest uppercase rounded-sm transition-all ${
                      tomorrowEnergy === "draining" ? "bg-zinc-800 text-zinc-100 font-bold" : "text-zinc-650 hover:text-zinc-400"
                    }`}
                  >
                    Draining
                  </button>
                </div>

                {/* Revenue */}
                <div className="flex items-center gap-1 bg-[#000000] border border-zinc-900 p-0.5 rounded">
                  <button
                    onClick={() => setTomorrowRevenue("high")}
                    className={`px-2 py-0.5 text-[8px] font-mono font-bold tracking-widest uppercase rounded-sm transition-all ${
                      tomorrowRevenue === "high" ? "bg-zinc-800 text-zinc-100 font-bold" : "text-zinc-650 hover:text-zinc-400"
                    }`}
                  >
                    High
                  </button>
                  <button
                    onClick={() => setTomorrowRevenue("low")}
                    className={`px-2 py-0.5 text-[8px] font-mono font-bold tracking-widest uppercase rounded-sm transition-all ${
                      tomorrowRevenue === "low" ? "bg-zinc-800 text-zinc-100 font-bold" : "text-zinc-650 hover:text-zinc-400"
                    }`}
                  >
                    Low
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddTomorrowTask}
                className="px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-[9px] tracking-widest uppercase transition-all duration-150 active:scale-95 cursor-pointer"
              >
                Plan Tomorrow
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
