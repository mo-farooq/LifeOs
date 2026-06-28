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
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Activity,
  Target
} from "lucide-react";
import { Task, VisionOS, Habit, WaterConfig, NutritionConfig, SalahLog, Asset } from "@/types";

interface DashboardViewProps {
  tasks: Task[];
  updateTasks: (tasks: Task[]) => void;
  activeDate: string;
  tomorrowDate: string;
  vision: VisionOS;
  updateVision: (vision: VisionOS) => void;
  habits: Habit[];
  updateHabits: (habits: Habit[]) => void;
  focusSessionsLog: Record<string, number>;
  water: WaterConfig;
  nutrition: NutritionConfig;
  salah: Record<string, SalahLog>;
  assets?: Asset[];
  monthlyNetWorthHistory?: Record<string, number>;
}

export default function DashboardView({ 
  tasks, 
  updateTasks, 
  activeDate, 
  tomorrowDate,
  vision,
  updateVision,
  habits = [],
  updateHabits,
  focusSessionsLog = {},
  water,
  nutrition,
  salah = {},
  assets = [],
  monthlyNetWorthHistory = {}
}: DashboardViewProps) {
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
  const [activeSubView, setActiveSubView] = useState<"list" | "grid" | "history">("list");
  const [isVisionOpen, setIsVisionOpen] = useState(false); // Toggle Vision OS panel
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Habit Tracker States & Handlers
  const [newHabitName, setNewHabitName] = useState("");

  const toggleHabit = (id: string) => {
    const updated = habits.map((h) => {
      if (h.id === id) {
        const completedDates = { ...h.completedDates };
        if (completedDates[activeDate]) {
          delete completedDates[activeDate];
        } else {
          completedDates[activeDate] = true;
        }
        return { ...h, completedDates };
      }
      return h;
    });
    updateHabits(updated);
  };

  const handleAddHabit = () => {
    if (!newHabitName.trim()) return;
    const newHabit: Habit = {
      id: "hab_" + Date.now(),
      name: newHabitName.trim(),
      completedDates: {}
    };
    updateHabits([...habits, newHabit]);
    setNewHabitName("");
  };

  const handleDeleteHabit = (id: string) => {
    updateHabits(habits.filter((h) => h.id !== id));
  };

  const getLast7Days = () => {
    const list = [];
    const baseDate = new Date(activeDate);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const yyyymmdd = d.toISOString().split("T")[0];
      const weekday = d.toLocaleDateString("en-US", { weekday: "narrow" });
      list.push({ dateStr: yyyymmdd, label: weekday });
    }
    return list;
  };
  const last7Days = getLast7Days();

  const getLastNDays = (n: number) => {
    const list = [];
    const baseDate = new Date(activeDate);
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const yyyymmdd = d.toISOString().split("T")[0];
      const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
      list.push({ dateStr: yyyymmdd, label: weekday });
    }
    return list;
  };

  const get30DayCalendarGrid = () => {
    const last30 = getLastNDays(30);
    const firstDate = new Date(last30[0].dateStr);
    const dayOfWeek = firstDate.getDay();
    const padCount = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const paddedCells = [];
    for (let i = 0; i < padCount; i++) {
      paddedCells.push({ isPad: true, key: `pad-${i}`, rate: 0, completedCount: 0, totalHabits: 0, dateStr: "", label: "" });
    }

    last30.forEach((day) => {
      const totalHabits = habits.length;
      const completedCount = habits.filter(h => h.completedDates[day.dateStr]).length;
      const rate = totalHabits > 0 ? (completedCount / totalHabits) : 0;
      
      paddedCells.push({
        isPad: false,
        key: day.dateStr,
        dateStr: day.dateStr,
        label: day.label,
        completedCount,
        totalHabits,
        rate
      });
    });

    return paddedCells;
  };

  const getNetWorthHistory = () => {
    const bankTotal = assets.filter(a => a.category === "bank").reduce((sum, a) => sum + a.amount, 0);
    const stocksTotal = assets.filter(a => a.category === "stocks").reduce((sum, a) => sum + a.amount, 0);
    const cryptoTotal = assets.filter(a => a.category === "crypto").reduce((sum, a) => sum + a.amount, 0);
    const otherTotal = assets.filter(a => a.category === "other").reduce((sum, a) => sum + a.amount, 0);
    const netWorthTotal = bankTotal + stocksTotal + cryptoTotal + otherTotal;

    const defaultHistory: Record<string, number> = {
      "2026-01": 18500,
      "2026-02": 19800,
      "2026-03": 19200,
      "2026-04": 20600,
      "2026-05": 21200,
    };

    const monthNames = [
      "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
      "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
    ];
    const historyData = [];
    const currDate = new Date(activeDate);
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currDate.getFullYear(), currDate.getMonth() - i, 1);
      const key = d.toISOString().split("T")[0].substring(0, 7); // YYYY-MM
      
      const monthLabel = monthNames[d.getMonth()];
      const label = i === 0 ? `${monthLabel} (CURR)` : monthLabel;
      
      let amount = netWorthTotal;
      if (i === 0) {
        amount = netWorthTotal;
      } else if (monthlyNetWorthHistory && monthlyNetWorthHistory[key] !== undefined) {
        amount = monthlyNetWorthHistory[key];
      } else if (defaultHistory[key] !== undefined) {
        amount = defaultHistory[key];
      } else {
        amount = Math.max(0, netWorthTotal - i * 1000);
      }
      
      historyData.push({ month: label, amount });
    }
    return historyData;
  };

  const renderHistorySubView = () => {
    const last7 = getLastNDays(7);
    
    const salahData = last7.map(day => {
      const log = salah[day.dateStr];
      const val = log ? [log.fajr, log.dhuhr, log.asr, log.maghrib, log.isha].filter(Boolean).length : 0;
      return {
        label: day.label,
        value: val,
        target: 5,
        completed: val === 5
      };
    });

    const focusData = last7.map(day => {
      const val = focusSessionsLog[day.dateStr] || 0;
      return {
        label: day.label,
        value: val,
        target: 4,
        completed: val >= 4
      };
    });

    const weight = water?.weightKg || 70;
    const training = water?.trainingHrs || 0;
    const caffeine = water?.caffeineMg || 0;
    const meds = water?.activeMedsCount || 0;
    const targetWaterMl = (weight * 35) + (training * 500) + (caffeine * 1.5) + (meds * 250);
    const waterData = last7.map(day => {
      const val = water?.loggedTodayMl?.[day.dateStr] || 0;
      return {
        label: day.label,
        value: val,
        target: targetWaterMl,
        completed: val >= targetWaterMl
      };
    });

    const targetCal = nutrition?.targetCal || 2000;
    const caloriesData = last7.map(day => {
      const val = nutrition?.loggedCal?.[day.dateStr] || 0;
      return {
        label: day.label,
        value: val,
        target: targetCal,
        completed: val >= targetCal
      };
    });

    const gridCells = get30DayCalendarGrid();
    const weekdayLabels = ["M", "T", "W", "T", "F", "S", "S"];
    const netWorthHistory = getNetWorthHistory();

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in" style={{ animationDelay: "50ms" }}>
        
        {/* Habit Grid */}
        <div className="border border-zinc-800 rounded-md p-6 bg-[#0a0a0a] flex flex-col h-full transition-all duration-300 hover:border-zinc-700">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-900">
            <span className="text-xs font-mono font-bold tracking-widest text-zinc-300 uppercase">30-DAY HABIT CONSISTENCY</span>
          </div>
          
          <div className="flex flex-col items-center justify-center flex-grow py-3">
            <div className="grid grid-cols-7 gap-2.5 w-full max-w-[340px] mb-3 text-center">
              {weekdayLabels.map((lbl, idx) => (
                <span key={idx} className="text-xs font-mono text-zinc-500 font-bold uppercase">
                  {lbl}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2.5 w-full max-w-[340px]">
              {gridCells.map((cell) => {
                if (cell.isPad) {
                  return <div key={cell.key} className="w-10 h-10 rounded" />;
                }

                let bgClass = "bg-zinc-955 border border-zinc-900/50";
                if (cell.rate > 0 && cell.rate <= 0.25) {
                  bgClass = "bg-zinc-850 border border-zinc-800";
                } else if (cell.rate > 0.25 && cell.rate <= 0.5) {
                  bgClass = "bg-zinc-700 border border-zinc-650";
                } else if (cell.rate > 0.5 && cell.rate <= 0.75) {
                  bgClass = "bg-zinc-400 border border-zinc-350 text-zinc-955";
                } else if (cell.rate > 0.75) {
                  bgClass = "bg-zinc-100 border border-white text-zinc-955";
                }

                const tooltip = `${cell.dateStr}: ${cell.completedCount}/${cell.totalHabits} completed (${Math.round(cell.rate * 100)}%)`;

                return (
                  <div
                    key={cell.key}
                    className={`w-10 h-10 rounded flex items-center justify-center text-xs font-mono transition-all duration-200 hover:scale-110 cursor-pointer ${bgClass}`}
                    title={tooltip}
                  >
                    {cell.completedCount > 0 && (
                      <span className={cell.rate > 0.5 ? "text-zinc-950 font-bold" : "text-zinc-300 font-bold"}>
                        {cell.completedCount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="flex items-center gap-2 mt-5 text-xs font-mono text-zinc-500 uppercase tracking-wider font-bold">
              <span>Less</span>
              <div className="w-4 h-4 rounded bg-zinc-955 border border-zinc-900/50" />
              <div className="w-4 h-4 rounded bg-zinc-850 border border-zinc-800" />
              <div className="w-4 h-4 rounded bg-zinc-700 border border-zinc-650" />
              <div className="w-4 h-4 rounded bg-zinc-400 border border-zinc-350" />
              <div className="w-4 h-4 rounded bg-zinc-100 border border-white" />
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Salah Chart */}
        <TrendBarChart 
          title="SALAH DEVOTION TREND (7D)" 
          data={salahData} 
          yMax={5}
          unit=" prayers" 
        />

        {/* Focus Chart */}
        <TrendBarChart 
          title="POMODORO FOCUS TREND (7D)" 
          data={focusData} 
          unit=" sessions" 
        />

        {/* Water Chart */}
        <TrendBarChart 
          title="WATER HYDRATION TREND (7D)" 
          data={waterData} 
          unit="ml" 
        />

        {/* Calories Chart */}
        <TrendBarChart 
          title="NUTRITION CALORIES TREND (7D)" 
          data={caloriesData} 
          unit=" kcal" 
        />

        {/* Net Worth Progression */}
        <div className="border border-zinc-800 rounded-md p-6 bg-[#0a0a0a] flex flex-col justify-between transition-all duration-300 hover:border-zinc-700">
          <div>
            <div className="flex justify-between items-center mb-3 pb-1.5 border-b border-zinc-900">
              <span className="text-xs font-mono font-bold tracking-widest text-zinc-300 uppercase">NET WORTH PROGRESSION (6M)</span>
            </div>
            <div className="space-y-2 mt-2">
              {netWorthHistory.map((pt, idx) => (
                <div key={idx} className="flex justify-between items-center py-1.5 border-b border-zinc-900/50 last:border-b-0">
                  <span className="text-sm text-zinc-455 font-mono">{pt.month}</span>
                  <span className="text-sm text-zinc-100 font-mono font-bold">
                    ${pt.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs font-mono text-zinc-550 uppercase tracking-widest font-bold pt-2 mt-2 border-t border-zinc-900/50">
            Computed from active capital assets
          </div>
        </div>

      </div>
    );
  };

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

  const handleTaskDrop = (targetId: string) => {
    if (!draggedTaskId || draggedTaskId === targetId) return;

    const draggedIdx = tasks.findIndex(t => t.id === draggedTaskId);
    const targetIdx = tasks.findIndex(t => t.id === targetId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    const newTasks = [...tasks];
    const [draggedTask] = newTasks.splice(draggedIdx, 1);
    newTasks.splice(targetIdx, 0, draggedTask);

    updateTasks(newTasks);
    setDraggedTaskId(null);
  };

  const calculateHabitStreaks = (habit: Habit) => {
    const dates = Object.keys(habit.completedDates).filter(d => habit.completedDates[d]).sort();
    if (dates.length === 0) return { current: 0, max: 0 };
    
    let maxStreak = 0;
    let currentStreakAccum = 0;
    let prevDate: Date | null = null;
    
    dates.forEach((dateStr) => {
      const currDate = new Date(dateStr);
      if (prevDate === null) {
        currentStreakAccum = 1;
      } else {
        const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreakAccum += 1;
        } else if (diffDays > 1) {
          maxStreak = Math.max(maxStreak, currentStreakAccum);
          currentStreakAccum = 1;
        }
      }
      prevDate = currDate;
    });
    maxStreak = Math.max(maxStreak, currentStreakAccum);
    
    let currentStreak = 0;
    let checkDate = new Date(activeDate);
    while (true) {
      const yyyymmdd = checkDate.toISOString().split("T")[0];
      if (habit.completedDates[yyyymmdd]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (checkDate.toISOString().split("T")[0] === activeDate) {
          const yesterday = new Date(activeDate);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];
          if (habit.completedDates[yesterdayStr]) {
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }
    
    return { current: currentStreak, max: maxStreak };
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

  // AI Polish Handler
  const handlePolish = async () => {
    if (!todayInput.trim()) return;
    setIsPolishing(true);

    // Simulate 1-second delay
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
    const isDraggable = !isReadOnly && activeSubView === "list";
    return (
      <div 
        key={task.id} 
        draggable={isDraggable}
        onDragStart={(e) => {
          if (!isDraggable) return;
          setDraggedTaskId(task.id);
        }}
        onDragOver={(e) => {
          if (!isDraggable) return;
          e.preventDefault();
        }}
        onDrop={(e) => {
          if (!isDraggable) return;
          handleTaskDrop(task.id);
        }}
        className={`group flex items-center gap-3 py-3 px-4 border-b border-zinc-900 bg-[#000000]/40 hover:bg-[#0a0a0a] transition-all rounded duration-150 animate-slide-in ${
          task.completed ? "opacity-40" : ""
        } ${isDraggable ? "cursor-grab active:cursor-grabbing" : ""}`}
      >
        <button
          onClick={() => !isReadOnly && toggleComplete(task.id)}
          disabled={isReadOnly}
          className={`w-5 h-5 border flex items-center justify-center rounded-sm transition-all duration-150 cursor-pointer ${
            task.completed 
              ? "bg-zinc-50 border-zinc-150 text-zinc-950 scale-105" 
              : "border-zinc-800 bg-transparent hover:border-zinc-650 hover:scale-105 active:scale-95"
          }`}
        >
          {task.completed && <Check className="h-3.5 w-3.5 stroke-[3.5] text-zinc-950 animate-check-tick" />}
        </button>

        <div className="flex-grow relative min-w-0">
          <input
            type="text"
            value={task.text}
            disabled={isReadOnly}
            onChange={(e) => updateTaskText(task.id, e.target.value)}
            className={`w-full bg-transparent outline-none text-sm font-mono transition-all duration-150 ${
              task.completed ? "text-zinc-500" : "text-zinc-200 focus:text-zinc-50"
            }`}
          />
          {task.completed && (
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] bg-zinc-500 pointer-events-none origin-left animate-strike"
            />
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase transition-colors duration-200 ${
            task.energy === "charging" 
              ? "border-emerald-900/30 text-emerald-500 bg-emerald-950/10" 
              : "border-zinc-850 text-zinc-550 bg-zinc-900/10"
          }`}>
            {task.energy}
          </span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase transition-colors duration-200 ${
            task.revenue === "high" 
              ? "border-amber-900/30 text-amber-500 bg-amber-950/10" 
              : "border-zinc-850 text-zinc-550 bg-zinc-900/10"
          }`}>
            {task.revenue}
          </span>
        </div>

        <button
          onClick={() => !isReadOnly && togglePriority(task.id)}
          disabled={isReadOnly}
          className={`p-1 rounded transition-all duration-150 hover:bg-zinc-900 ${
            task.priority 
              ? "text-yellow-400 bg-yellow-950/20 scale-110" 
              : "text-zinc-700 hover:text-zinc-500"
          }`}
        >
          <Zap className={`h-4 w-4 ${task.priority ? "fill-yellow-400" : ""}`} />
        </button>

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
      <div className="border border-zinc-800 rounded-md p-6 bg-[#0a0a0a] flex flex-col h-full min-h-[180px] transition-all duration-300 hover:border-zinc-700">
        <div className="flex justify-between items-center mb-3 pb-1.5 border-b border-zinc-900 flex-shrink-0">
          <div className="space-y-0.5">
            <span className="text-xs font-mono font-bold tracking-widest text-zinc-200 uppercase">{title}</span>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">{subtitle}</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded uppercase font-bold">{energyLabel}</span>
            <span className="text-[10px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded uppercase font-bold">{revenueLabel}</span>
          </div>
        </div>
        <div className="flex-grow space-y-1.5 overflow-y-auto max-h-[220px]">
          {list.map(t => renderTaskRow(t))}
          {list.length === 0 && (
            <div className="h-full flex items-center justify-center py-6 text-center text-xs font-mono uppercase tracking-widest text-zinc-650 animate-pulse">
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
      <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center bg-[#0a0a0a] border border-zinc-800 px-6 py-4 rounded-md animate-slide-in">
        <div className="space-y-1">
          <span className="text-xs font-mono uppercase tracking-widest font-semibold text-zinc-550 font-bold">TASK HUB</span>
          <h1 className="text-base font-mono tracking-widest font-bold text-zinc-150 uppercase flex items-center gap-2.5">
            <Target className="h-5 w-5 text-zinc-300" /> THE DRIP MATRIX
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
          {/* Vision OS toggle */}
          <button
            onClick={() => setIsVisionOpen(!isVisionOpen)}
            className={`px-4.5 py-2 text-xs font-mono font-bold tracking-wider uppercase border border-zinc-800 rounded flex items-center gap-2 transition-all duration-150 bg-[#000000] ${
              isVisionOpen ? "text-zinc-100 border-zinc-650" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {isVisionOpen ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} VISION OS
          </button>

          {/* Layout Subview toggle */}
          <div className="flex flex-wrap items-center border border-zinc-800 bg-[#000000] p-1 rounded-md gap-1">
            <button
              onClick={() => setActiveSubView("list")}
              className={`px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase rounded flex items-center gap-2 transition-all duration-150 ${
                activeSubView === "list" ? "bg-zinc-50 text-zinc-950" : "text-zinc-455 hover:text-zinc-250"
              }`}
            >
              <List className="h-3.5 w-3.5" /> List View
            </button>
            <button
              onClick={() => setActiveSubView("grid")}
              className={`px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase rounded flex items-center gap-2 transition-all duration-150 ${
                activeSubView === "grid" ? "bg-zinc-50 text-zinc-950" : "text-zinc-455 hover:text-zinc-250"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Grid Matrix
            </button>
            <button
              onClick={() => setActiveSubView("history")}
              className={`px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase rounded flex items-center gap-2 transition-all duration-150 ${
                activeSubView === "history" ? "bg-zinc-50 text-zinc-950" : "text-zinc-455 hover:text-zinc-250"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" /> History & Trends
            </button>
          </div>
        </div>
      </div>

      {/* Vision OS Collapsible Panel (Identity-based Goals) */}
      {isVisionOpen && (
        <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md p-6 space-y-4 animate-slide-in">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-900">
            <User className="h-5 w-5 text-zinc-450" />
            <span className="text-xs font-mono font-bold tracking-widest text-zinc-200 uppercase">VISION OS & IDENTITY ENGINE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Identity Statement */}
            <div className="md:col-span-12 space-y-2">
              <label className="text-[11px] font-mono text-zinc-500 uppercase font-bold tracking-widest">Aspirational Identity Statement</label>
              <input
                type="text"
                value={vision.identity}
                onChange={(e) => updateVision({ ...vision, identity: e.target.value })}
                className="h-12 w-full bg-[#000000] border border-zinc-900 rounded-md px-4 text-sm font-mono text-zinc-200 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400 bg-black/40 transition-all focus:outline-none"
                placeholder="I am..."
              />
            </div>

            {/* Outcome Goal */}
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-mono text-zinc-500 uppercase font-bold tracking-widest">Outcome Goal (Outcome)</label>
              <textarea
                value={vision.outcomeGoal}
                onChange={(e) => updateVision({ ...vision, outcomeGoal: e.target.value })}
                rows={2}
                className="w-full bg-[#000000] border border-zinc-900 rounded-md px-4 py-2.5 text-sm font-mono text-zinc-200 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400 bg-black/40 transition-all focus:outline-none resize-none"
                placeholder="What is the result..."
              />
            </div>

            {/* Output Milestone */}
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-mono text-zinc-500 uppercase font-bold tracking-widest">Milestone Metric (Output)</label>
              <textarea
                value={vision.outputMilestone}
                onChange={(e) => updateVision({ ...vision, outputMilestone: e.target.value })}
                rows={2}
                className="w-full bg-[#000000] border border-zinc-900 rounded-md px-4 py-2.5 text-sm font-mono text-zinc-200 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400 bg-black/40 transition-all focus:outline-none resize-none"
                placeholder="What is the milestone..."
              />
            </div>

            {/* Input Habit */}
            <div className="md:col-span-4 space-y-2">
              <label className="text-[11px] font-mono text-zinc-500 uppercase font-bold tracking-widest">Daily Input Habit (Input)</label>
              <textarea
                value={vision.inputHabit}
                onChange={(e) => updateVision({ ...vision, inputHabit: e.target.value })}
                rows={2}
                className="w-full bg-[#000000] border border-zinc-900 rounded-md px-4 py-2.5 text-sm font-mono text-zinc-200 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400 bg-black/40 transition-all focus:outline-none resize-none"
                placeholder="What is the daily focus..."
              />
            </div>
          </div>
        </Card>
      )}

      {/* Layout Columns */}
      {activeSubView === "history" ? (
        renderHistorySubView()
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Task System (List/Grid + Tomorrow) */}
          <div className="lg:col-span-8 space-y-6">
            {activeSubView === "list" ? (
            <div className="space-y-6 animate-slide-in" style={{ animationDelay: "50ms" }}>
              <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
                <CardHeader className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-550 font-bold">TODAY</span>
                    <CardTitle className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-widest">ACTIVE EXECUTION BUFFER</CardTitle>
                  </div>

                  {/* Segmented Progress Tracker Bar */}
                  <div className="w-full sm:w-56 space-y-1.5">
                    <div className="flex justify-between text-xs font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                      <span>PROGRESS</span>
                      <span>{todayTasks.length > 0 ? `${completedCount}/${totalCount}` : "0/0"}</span>
                    </div>
                    <div className="flex gap-1 w-full">
                      {todayTasks.map((t) => (
                        <div 
                          key={t.id} 
                          className={`h-1.5 flex-1 rounded-sm transition-all duration-500 ${
                            t.completed ? "bg-zinc-100" : "bg-zinc-855"
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
                  <div className="space-y-1">
                    {todayTasks.map((t) => renderTaskRow(t))}
                    {todayTasks.length === 0 && (
                      <div className="text-center py-6 text-[10px] font-mono uppercase tracking-widest text-zinc-650 border border-dashed border-zinc-850 rounded animate-pulse">
                        No active objectives registered for today.
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3.5 pt-4 border-t border-zinc-900 mt-3">
                    <div className="flex gap-2.5">
                      <input
                        type="text"
                        value={todayInput}
                        onChange={(e) => setTodayInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddTodayTask()}
                        placeholder="ENTER TODAY'S TASK OBJECTIVE..."
                        className="h-12 flex-1 bg-transparent border border-zinc-800 rounded-md px-4 text-sm font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400 bg-black/40 transition-all focus:outline-none"
                      />
                      
                      <button
                        onClick={handlePolish}
                        disabled={isPolishing || !todayInput.trim()}
                        className="h-12 w-12 rounded-md border border-zinc-800 bg-[#000000] hover:bg-zinc-900/60 hover:border-zinc-700 text-zinc-400 hover:text-zinc-250 disabled:opacity-40 flex items-center justify-center transition-all duration-100 active:scale-[0.98] cursor-pointer flex-shrink-0"
                        title="Polish Task with AI"
                      >
                        {isPolishing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-zinc-450 hover:text-zinc-200" />
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <div className="flex items-center gap-1 bg-[#000000] border border-zinc-900 p-0.5 rounded">
                          <button
                            onClick={() => setTodayEnergy("charging")}
                            className={`px-2.5 py-1 text-[9px] font-mono font-bold tracking-widest uppercase rounded-sm transition-all duration-100 active:scale-[0.98] cursor-pointer ${
                              todayEnergy === "charging" ? "bg-zinc-800 text-zinc-100 font-bold" : "text-zinc-650 hover:text-zinc-400"
                            }`}
                          >
                            Charging
                          </button>
                          <button
                            onClick={() => setTodayEnergy("draining")}
                            className={`px-2.5 py-1 text-[9px] font-mono font-bold tracking-widest uppercase rounded-sm transition-all duration-100 active:scale-[0.98] cursor-pointer ${
                              todayEnergy === "draining" ? "bg-zinc-800 text-zinc-100 font-bold" : "text-zinc-650 hover:text-zinc-400"
                            }`}
                          >
                            Draining
                          </button>
                        </div>

                        <div className="flex items-center gap-1 bg-[#000000] border border-zinc-900 p-0.5 rounded">
                          <button
                            onClick={() => setTodayRevenue("high")}
                            className={`px-2.5 py-1 text-[9px] font-mono font-bold tracking-widest uppercase rounded-sm transition-all duration-100 active:scale-[0.98] cursor-pointer ${
                              todayRevenue === "high" ? "bg-zinc-800 text-zinc-100 font-bold" : "text-zinc-650 hover:text-zinc-400"
                            }`}
                          >
                            High Return
                          </button>
                          <button
                            onClick={() => setTodayRevenue("low")}
                            className={`px-2.5 py-1 text-[9px] font-mono font-bold tracking-widest uppercase rounded-sm transition-all duration-100 active:scale-[0.98] cursor-pointer ${
                              todayRevenue === "low" ? "bg-zinc-800 text-zinc-100 font-bold" : "text-zinc-650 hover:text-zinc-400"
                            }`}
                          >
                            Low Return
                          </button>
                        </div>

                        <button
                          onClick={() => setTodayPriority(!todayPriority)}
                          className={`px-2.5 py-1 text-[9px] font-mono font-bold tracking-widest uppercase rounded border transition-all duration-100 active:scale-[0.98] cursor-pointer ${
                            todayPriority ? "border-yellow-900/40 text-yellow-500 bg-yellow-950/10 font-bold" : "border-zinc-900 text-zinc-500 hover:border-zinc-800 hover:bg-zinc-900/60"
                          }`}
                        >
                          Priority
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={pushRemainingToTomorrow}
                          disabled={todayTasks.filter(t => !t.completed).length === 0}
                          className="h-12 px-5 rounded-md border border-zinc-800 bg-[#000000] hover:bg-zinc-900/60 hover:border-zinc-700 text-zinc-455 hover:text-zinc-100 text-xs font-mono font-bold tracking-widest uppercase disabled:opacity-40 transition-all duration-100 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                        >
                          Push Remaining
                        </button>
                        <button
                          onClick={handleAddTodayTask}
                          className="h-12 px-6 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-xs tracking-widest uppercase transition-all duration-100 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-in" style={{ animationDelay: "50ms" }}>
              {renderQuadrant("ZONE OF GENIUS", "CHARGING ENERGY // HIGH REVENUE", geniusTasks, "charging", "high")}
              {renderQuadrant("PASSIONS & GROWTH", "CHARGING ENERGY // LOW REVENUE", passionTasks, "charging", "low")}
              {renderQuadrant("HIGH LEVERAGE", "DRAINING ENERGY // HIGH REVENUE", leverageTasks, "draining", "high")}
              {renderQuadrant("DELEGATE / ELIMINATE", "DRAINING ENERGY // LOW REVENUE", delegateTasks, "draining", "low")}
            </div>
          )}

          {/* Plan Tomorrow Card */}
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md animate-slide-in" style={{ animationDelay: "100ms" }}>
            <CardHeader className="p-6 border-b border-zinc-800">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-555 font-bold">TOMORROW</span>
                  <CardTitle className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-widest">NEXT DAY STRATEGY BUFFER</CardTitle>
                </div>
                <div className="px-3.5 py-1 rounded border border-zinc-900 bg-[#000000] text-[10px] font-mono text-zinc-550 uppercase tracking-widest font-bold">
                  ACTIVATES AT 6 AM TOMORROW
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                {tomorrowTasks.map((t) => renderTaskRow(t, true))}
                {tomorrowTasks.length === 0 && (
                  <div className="text-center py-6 text-xs font-mono uppercase tracking-widest text-zinc-650 border border-dashed border-zinc-850 rounded animate-pulse">
                    No next-day strategy registered.
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3.5 pt-4 border-t border-zinc-900 mt-3">
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    value={tomorrowInput}
                    onChange={(e) => setTomorrowInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTomorrowTask()}
                    placeholder="ENTER TOMORROW'S TASK OBJECTIVE..."
                    className="h-12 flex-1 bg-transparent border border-zinc-800 rounded-md px-4 text-sm font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400 bg-black/40 transition-all focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex items-center gap-1 bg-[#000000] border border-zinc-900 p-0.5 rounded">
                      <button
                        onClick={() => setTomorrowEnergy("charging")}
                        className={`px-3 py-1.5 text-xs font-mono font-bold tracking-widest uppercase rounded-sm transition-all duration-100 active:scale-[0.98] cursor-pointer ${
                          tomorrowEnergy === "charging" ? "bg-zinc-800 text-zinc-100 font-bold" : "text-zinc-650 hover:text-zinc-400"
                        }`}
                      >
                        Charging
                      </button>
                      <button
                        onClick={() => setTomorrowEnergy("draining")}
                        className={`px-3 py-1.5 text-xs font-mono font-bold tracking-widest uppercase rounded-sm transition-all duration-100 active:scale-[0.98] cursor-pointer ${
                          tomorrowEnergy === "draining" ? "bg-zinc-800 text-zinc-100 font-bold" : "text-zinc-650 hover:text-zinc-400"
                        }`}
                      >
                        Draining
                      </button>
                    </div>

                    <div className="flex items-center gap-1 bg-[#000000] border border-zinc-900 p-0.5 rounded">
                      <button
                        onClick={() => setTomorrowRevenue("high")}
                        className={`px-3 py-1.5 text-xs font-mono font-bold tracking-widest uppercase rounded-sm transition-all duration-100 active:scale-[0.98] cursor-pointer ${
                          tomorrowRevenue === "high" ? "bg-zinc-800 text-zinc-100 font-bold" : "text-zinc-650 hover:text-zinc-400"
                        }`}
                      >
                        High
                      </button>
                      <button
                        onClick={() => setTomorrowRevenue("low")}
                        className={`px-3 py-1.5 text-xs font-mono font-bold tracking-widest uppercase rounded-sm transition-all duration-100 active:scale-[0.98] cursor-pointer ${
                          tomorrowRevenue === "low" ? "bg-zinc-800 text-zinc-100 font-bold" : "text-zinc-650 hover:text-zinc-400"
                        }`}
                      >
                        Low
                      </button>
                    </div>

                    <button
                      onClick={() => setTomorrowPriority(!tomorrowPriority)}
                      className={`px-3.5 py-2 text-xs font-mono font-bold tracking-widest uppercase rounded border transition-all duration-100 active:scale-[0.98] cursor-pointer ${
                        tomorrowPriority ? "border-yellow-900/40 text-yellow-500 bg-yellow-950/10 font-bold" : "border-zinc-900 text-zinc-500 hover:border-zinc-800 hover:bg-zinc-900/60"
                      }`}
                    >
                      Priority
                    </button>
                  </div>

                  <button
                    onClick={handleAddTomorrowTask}
                    className="h-12 px-6 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-xs tracking-widest uppercase transition-all duration-100 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    Plan Tomorrow
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Consistency Engine (Habit Tracker) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md animate-slide-in" style={{ animationDelay: "75ms" }}>
            <CardHeader className="p-6 border-b border-zinc-800">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-550 font-bold font-semibold">CONSISTENCY ENGINE</span>
                <CardTitle className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-widest">DAILY HABITS TRACKER</CardTitle>
              </div>

              {/* Progress Tracker Bar */}
              <div className="pt-3 space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                  <span>COMPLETION RATE</span>
                  <span>{habits.length > 0 ? `${Math.round((habits.filter(h => h.completedDates[activeDate]).length / habits.length) * 100)}%` : "0%"}</span>
                </div>
                <div className="w-full bg-[#000000] border border-zinc-850 h-1.5 rounded-sm overflow-hidden">
                  <div 
                    className="bg-zinc-200 h-full transition-all duration-500" 
                    style={{ 
                      width: `${habits.length > 0 ? (habits.filter(h => h.completedDates[activeDate]).length / habits.length) * 100 : 0}%` 
                    }} 
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {habits.map((habit) => {
                  const isCompletedToday = habit.completedDates[activeDate] || false;
                  const streaks = calculateHabitStreaks(habit);
                  return (
                    <div 
                      key={habit.id} 
                      className={`group border border-zinc-900 bg-[#000000]/60 hover:bg-[#0a0a0a] rounded px-4 py-3 flex flex-col justify-between gap-3 transition-colors ${
                        isCompletedToday ? "opacity-60" : ""
                      }`}
                    >
                      {/* Checkbox and Name */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleHabit(habit.id)}
                          className={`w-5 h-5 border flex items-center justify-center rounded-sm transition-all duration-150 cursor-pointer ${
                            isCompletedToday 
                              ? "bg-zinc-50 border-zinc-150 text-zinc-950 scale-105" 
                              : "border-zinc-800 bg-transparent hover:border-zinc-650 hover:scale-105 active:scale-95"
                          }`}
                        >
                          {isCompletedToday && <Check className="h-3.5 w-3.5 stroke-[3.5] text-zinc-950 animate-check-tick" />}
                        </button>
                        <span className={`text-sm font-mono font-semibold ${isCompletedToday ? "line-through text-zinc-500" : "text-zinc-200"}`}>
                          {habit.name}
                        </span>
                      </div>

                      {/* 7-day trace & delete */}
                      <div className="flex items-center justify-between gap-3.5 border-t border-zinc-955 pt-2.5 flex-shrink-0">
                        {/* 7 mini boxes + Streaks */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            {last7Days.map((day) => {
                              const isDone = habit.completedDates[day.dateStr] || false;
                              const isToday = day.dateStr === activeDate;
                              return (
                                <div 
                                  key={day.dateStr} 
                                  className="flex flex-col items-center gap-0.5"
                                  title={`${day.dateStr}: ${isDone ? "Completed" : "Not Completed"}`}
                                >
                                  <div 
                                    className={`w-3 h-3 border rounded-sm transition-colors ${
                                      isDone 
                                        ? "bg-zinc-250 border-zinc-250" 
                                        : isToday 
                                          ? "border-zinc-750 bg-transparent" 
                                          : "border-zinc-900 bg-transparent"
                                    }`} 
                                  />
                                  <span className={`text-[8px] font-mono leading-none ${isToday ? "text-zinc-350 font-bold" : "text-zinc-600"}`}>
                                    {day.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-555 uppercase tracking-widest font-bold select-none">
                            <span>STREAK <span className="text-zinc-350">{streaks.current}D</span></span>
                            <span className="text-zinc-800">//</span>
                            <span>MAX <span className="text-zinc-455">{streaks.max}D</span></span>
                          </div>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteHabit(habit.id)}
                          className="text-zinc-650 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-0.5 text-xs font-mono"
                          title="Delete habit"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}

                {habits.length === 0 && (
                  <div className="text-center py-6 text-xs font-mono uppercase tracking-widest text-zinc-650">
                    No habits registered.
                  </div>
                )}
              </div>
               {/* Add habit input form */}
              <div className="flex gap-2.5 pt-4 border-t border-zinc-900 mt-3">
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddHabit()}
                  placeholder="ENTER NEW HABIT..."
                  className="h-12 flex-1 bg-transparent border border-zinc-800 rounded-md px-4 text-sm font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400 bg-black/40 transition-all focus:outline-none"
                />
                <button
                  onClick={handleAddHabit}
                  className="h-12 px-6 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-xs tracking-widest uppercase transition-all duration-100 active:scale-[0.98] cursor-pointer flex-shrink-0 flex items-center justify-center gap-2"
                >
                  Add
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
      )}
    </div>
  );
}

interface ChartDataPoint {
  label: string;
  value: number;
  target?: number;
  completed: boolean;
}

interface TrendBarChartProps {
  title: string;
  data: ChartDataPoint[];
  yMax?: number;
  unit?: string;
}

function TrendBarChart({ title, data, yMax, unit = "" }: TrendBarChartProps) {
  const chartHeight = 85;
  const paddingBottom = 20;
  const paddingTop = 15;
  const height = chartHeight + paddingTop + paddingBottom;
  const width = 280;
  const barWidth = 24;
  const barSpacing = (width - data.length * barWidth) / (data.length + 1);

  const maxValue = yMax !== undefined 
    ? yMax 
    : Math.max(1, ...data.map(d => Math.max(d.value, d.target || 0)));

  return (
    <div className="border border-zinc-800 rounded-md p-6 bg-[#0a0a0a] flex flex-col h-full transition-all duration-300 hover:border-zinc-700">
      <div className="flex justify-between items-center mb-4 pb-1.5 border-b border-zinc-900">
        <span className="text-xs font-mono font-bold tracking-widest text-zinc-300 uppercase">{title}</span>
      </div>
      <div className="relative flex-grow flex items-end justify-center w-full min-h-[120px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {data.map((d, index) => {
            const x = barSpacing + index * (barWidth + barSpacing);
            const valueRatio = d.value / maxValue;
            const barHeight = Math.max(1, valueRatio * chartHeight);
            const barY = height - paddingBottom - barHeight;

            let targetY = null;
            if (d.target !== undefined) {
              const targetRatio = d.target / maxValue;
              targetY = height - paddingBottom - (targetRatio * chartHeight);
            }

            return (
              <g key={index} className="group/bar">
                <rect
                  x={x - barSpacing/2}
                  y={paddingTop}
                  width={barWidth + barSpacing}
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-pointer"
                />

                {targetY !== null && (
                  <line
                    x1={x - 2}
                    y1={targetY}
                    x2={x + barWidth + 2}
                    y2={targetY}
                    stroke="#3f3f46"
                    strokeDasharray="2,2"
                    strokeWidth="1.2"
                  />
                )}

                <rect
                  x={x}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  rx="1"
                  fill={d.completed ? "#f4f4f5" : "#27272a"}
                  className="transition-all duration-300 hover:opacity-85"
                />

                <title>{`${d.label}: ${d.value}${unit}${d.target ? ` / ${d.target}${unit}` : ""}`}</title>

                <text
                  x={x + barWidth/2}
                  y={height - 6}
                  textAnchor="middle"
                  fill="#71717a"
                  fontSize="10.5"
                  className="font-mono font-semibold"
                >
                  {d.label}
                </text>

                <text
                  x={x + barWidth/2}
                  y={barY - 4}
                  textAnchor="middle"
                  fill="#e4e4e7"
                  fontSize="10"
                  className="font-mono font-bold opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none"
                >
                  {d.value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
