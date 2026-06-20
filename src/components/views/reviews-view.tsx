"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckSquare, 
  Square, 
  Cpu, 
  Zap, 
  AlertTriangle,
  Calendar,
  Award,
  Flame,
  Droplet,
  Compass,
  Trophy,
  Save,
  Check,
  TrendingUp,
  Activity,
  UserCheck
} from "lucide-react";
import { 
  DailyRituals, 
  Task, 
  Supplement, 
  WaterConfig, 
  WeeklyReview, 
  MonthlyReview, 
  QuarterlyReview, 
  YearlyReview, 
  SalahLog,
  Skill
} from "@/types";

interface ReviewsViewProps {
  rituals: Record<string, DailyRituals>;
  updateRituals: (rituals: Record<string, DailyRituals>) => void;
  tasks: Task[];
  supplements: Supplement[];
  water: WaterConfig;
  activeDate: string;
  weeklyReviews: Record<string, WeeklyReview>;
  updateWeeklyReviews: (weekly: Record<string, WeeklyReview>) => void;
  monthlyReviews: Record<string, MonthlyReview>;
  updateMonthlyReviews: (monthly: Record<string, MonthlyReview>) => void;
  quarterlyReviews: Record<string, QuarterlyReview>;
  updateQuarterlyReviews: (quarterly: Record<string, QuarterlyReview>) => void;
  yearlyReviews: Record<string, YearlyReview>;
  updateYearlyReviews: (yearly: Record<string, YearlyReview>) => void;
  salah: Record<string, SalahLog>;
  skills: Skill[];
}

const defaultRituals: DailyRituals = {
  startupHydrate: false,
  startupReadVision: false,
  startupReviewAgenda: false,
  shutdownLogTasks: false,
  shutdownPlanTomorrow: false,
  shutdownCheckSupps: false,
  shutdownLogWillpower: 5
};

const defaultSalah: SalahLog = {
  fajr: false,
  dhuhr: false,
  asr: false,
  maghrib: false,
  isha: false
};

// Date helper functions
const getWeeklyKey = (dateStr: string) => {
  const date = new Date(dateStr);
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  const year = new Date(firstThursday).getFullYear();
  return `${year}-W${weekNum.toString().padStart(2, '0')}`;
};

const getMonthlyKey = (dateStr: string) => dateStr.substring(0, 7);

const getQuarterlyKey = (dateStr: string) => {
  const year = dateStr.substring(0, 4);
  const month = parseInt(dateStr.substring(5, 7), 10);
  const quarter = Math.ceil(month / 3);
  return `${year}-Q${quarter}`;
};

const getYearlyKey = (dateStr: string) => dateStr.substring(0, 4);

const getLastNDates = (startDateStr: string, n: number) => {
  const dates = [];
  const d = new Date(startDateStr);
  for (let i = 0; i < n; i++) {
    dates.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() - 1);
  }
  return dates;
};

export default function ReviewsView({
  rituals,
  updateRituals,
  tasks,
  supplements,
  water,
  activeDate,
  weeklyReviews,
  updateWeeklyReviews,
  monthlyReviews,
  updateMonthlyReviews,
  quarterlyReviews,
  updateQuarterlyReviews,
  yearlyReviews,
  updateYearlyReviews,
  salah,
  skills
}: ReviewsViewProps) {
  // Navigation tabs state
  const [activeReviewTab, setActiveReviewTab] = useState<"daily" | "weekly" | "monthly" | "quarterly" | "yearly">("daily");

  // Key indexes
  const currentWeekKey = getWeeklyKey(activeDate);
  const currentMonthKey = getMonthlyKey(activeDate);
  const currentQuarterKey = getQuarterlyKey(activeDate);
  const currentYearKey = getYearlyKey(activeDate);

  // 1. Weekly Form States
  const weekData = weeklyReviews[currentWeekKey] || { wins: "", challenges: "", priority: "", checklist: {} };
  const [weekWins, setWeekWins] = useState("");
  const [weekChallenges, setWeekChallenges] = useState("");
  const [weekPriority, setWeekPriority] = useState("");

  useEffect(() => {
    const wk = weeklyReviews[currentWeekKey] || { wins: "", challenges: "", priority: "", checklist: {} };
    setWeekWins(wk.wins || "");
    setWeekChallenges(wk.challenges || "");
    setWeekPriority(wk.priority || "");
  }, [currentWeekKey, weeklyReviews]);

  // 2. Monthly Form States
  const monthData = monthlyReviews[currentMonthKey] || { milestones: "", adjustments: "", focusArea: "", satisfactionScore: 5 };
  const [monthMilestones, setMonthMilestones] = useState("");
  const [monthAdjustments, setMonthAdjustments] = useState("");
  const [monthFocus, setMonthFocus] = useState("");
  const [monthSatisfaction, setMonthSatisfaction] = useState(5);

  useEffect(() => {
    const md = monthlyReviews[currentMonthKey] || { milestones: "", adjustments: "", focusArea: "", satisfactionScore: 5 };
    setMonthMilestones(md.milestones || "");
    setMonthAdjustments(md.adjustments || "");
    setMonthFocus(md.focusArea || "");
    setMonthSatisfaction(md.satisfactionScore ?? 5);
  }, [currentMonthKey, monthlyReviews]);

  // 3. Quarterly Form States
  const quarterData = quarterlyReviews[currentQuarterKey] || { okrProgress: "", courseCorrections: "", highlights: "" };
  const [quarterOKR, setQuarterOKR] = useState("");
  const [quarterPivots, setQuarterPivots] = useState("");
  const [quarterHighlights, setQuarterHighlights] = useState("");

  useEffect(() => {
    const qd = quarterlyReviews[currentQuarterKey] || { okrProgress: "", courseCorrections: "", highlights: "" };
    setQuarterOKR(qd.okrProgress || "");
    setQuarterPivots(qd.courseCorrections || "");
    setQuarterHighlights(qd.highlights || "");
  }, [currentQuarterKey, quarterlyReviews]);

  // 4. Yearly Form States
  const yearData = yearlyReviews[currentYearKey] || { themeReview: "", lifeEvents: "", outlook: "" };
  const [yearTheme, setYearTheme] = useState("");
  const [yearLessons, setYearLessons] = useState("");
  const [yearOutlook, setYearOutlook] = useState("");

  useEffect(() => {
    const yd = yearlyReviews[currentYearKey] || { themeReview: "", lifeEvents: "", outlook: "" };
    setYearTheme(yd.themeReview || "");
    setYearLessons(yd.lifeEvents || "");
    setYearOutlook(yd.outlook || "");
  }, [currentYearKey, yearlyReviews]);

  // 5. Daily Ritual Toggles
  const activeRituals = rituals[activeDate] || defaultRituals;
  const toggleRitual = (key: keyof Omit<DailyRituals, "shutdownLogWillpower">) => {
    const updated = {
      ...rituals,
      [activeDate]: {
        ...activeRituals,
        [key]: !activeRituals[key]
      }
    };
    updateRituals(updated);
  };

  const handleWillpowerChange = (val: number) => {
    const updated = {
      ...rituals,
      [activeDate]: {
        ...activeRituals,
        shutdownLogWillpower: val
      }
    };
    updateRituals(updated);
  };

  // 6. Salah Actions
  const activeSalah = salah[activeDate] || defaultSalah;

  // Dynamic statistics calculator
  const compileAggregatedStats = (daysCount: number) => {
    const periodDates = getLastNDates(activeDate, daysCount);
    let totalT = 0;
    let compT = 0;
    let waterLogCount = 0;
    let waterTargetCount = 0;
    let suppsLogCount = 0;
    let suppsTargetCount = 0;
    let salahLogCount = 0;

    periodDates.forEach((dateStr) => {
      // Tasks
      const dayTasks = tasks.filter((t) => t.date === dateStr);
      totalT += dayTasks.length;
      compT += dayTasks.filter((t) => t.completed).length;

      // Water
      const baseW = water.weightKg * 35;
      const exW = water.trainingHrs * 500;
      const cafW = water.caffeineMg * 1.5;
      const medW = water.activeMedsCount * 250;
      const targetW = Math.round(baseW + exW + cafW + medW);
      const loggedW = water.loggedTodayMl[dateStr] || 0;
      waterTargetCount += targetW;
      waterLogCount += loggedW;

      // Supplements
      supplements.forEach((s) => {
        suppsTargetCount++;
        if (s.takenDates[dateStr]) suppsLogCount++;
      });

      // Salah
      const sal = salah[dateStr];
      if (sal) {
        salahLogCount += [sal.fajr, sal.dhuhr, sal.asr, sal.maghrib, sal.isha].filter(Boolean).length;
      }
    });

    const taskRate = totalT > 0 ? Math.round((compT / totalT) * 100) : 0;
    const waterRate = waterTargetCount > 0 ? Math.min(Math.round((waterLogCount / waterTargetCount) * 100), 100) : 0;
    const suppRate = suppsTargetCount > 0 ? Math.round((suppsLogCount / suppsTargetCount) * 100) : 0;
    const salahRate = periodDates.length > 0 ? Math.round((salahLogCount / (periodDates.length * 5)) * 100) : 0;

    return { taskRate, waterRate, suppRate, salahRate, completedTasks: compT, totalTasks: totalT, totalSalah: salahLogCount };
  };

  // Compile calculations for Daily AI Performance Report
  const todayTasks = tasks.filter((t) => t.date === activeDate);
  const completedTasks = todayTasks.filter((t) => t.completed).length;
  const totalTasks = todayTasks.length;
  const dailyTaskRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const takenSups = supplements.filter((s) => s.takenDates[activeDate]).length;
  const totalSups = supplements.length;
  const dailySupRate = totalSups > 0 ? Math.round((takenSups / totalSups) * 100) : 0;

  const baseW = water.weightKg * 35;
  const exW = water.trainingHrs * 500;
  const cafW = water.caffeineMg * 1.5;
  const medW = water.activeMedsCount * 250;
  const dailyTargetWater = Math.round(baseW + exW + cafW + medW);
  const dailyLoggedWater = water.loggedTodayMl[activeDate] || 0;
  const dailyWaterRate = dailyTargetWater > 0 ? Math.min(Math.round((dailyLoggedWater / dailyTargetWater) * 100), 100) : 0;

  const willpowerScore = activeRituals.shutdownLogWillpower; // 0-10
  const dailySalahLoggedCount = [activeSalah.fajr, activeSalah.dhuhr, activeSalah.asr, activeSalah.maghrib, activeSalah.isha].filter(Boolean).length;
  const dailySalahRate = Math.round((dailySalahLoggedCount / 5) * 100);

  const dailyPerformanceIndex = Math.round(
    dailyTaskRate * 0.35 +
    dailySupRate * 0.15 +
    dailyWaterRate * 0.15 +
    dailySalahRate * 0.15 +
    (willpowerScore * 10) * 0.2
  );

  const getDiagnosticMessage = (score: number) => {
    if (score >= 85) {
      return {
        status: "OPTIMAL PROTOCOL ADHERENCE",
        color: "text-emerald-400 border-emerald-950 bg-emerald-950/10",
        feedback: "EXCELLENT PROTOCOL ADHERENCE. Cognitive efficiency is high. Willpower is strong, and loops are fully resolved. Proceed to shutdown sequence."
      };
    } else if (score >= 60) {
      return {
        status: "MODERATE PROTOCOL COMPLIANCE",
        color: "text-zinc-350 border-zinc-900 bg-zinc-900/10",
        feedback: "AVERAGE PROTOCOL COMPLIANCE. Minor loops remain leaking. Hydration, supplements, or salah checks were missed. Course correct tomorrow."
      };
    } else {
      return {
        status: "COMPLIANCE FAILURE DETECTED",
        color: "text-red-400 border-red-955 bg-red-955/10",
        feedback: "CRITICAL COMPLIANCE FAILURE. Cognitive exhaustion or loop leak detected. Recommend running rest protocols immediately."
      };
    }
  };

  const dailyDiagnostic = getDiagnosticMessage(dailyPerformanceIndex);

  // 7. Save Actions for Review forms
  const handleSaveWeekly = () => {
    const updated = {
      ...weeklyReviews,
      [currentWeekKey]: {
        ...weekData,
        wins: weekWins,
        challenges: weekChallenges,
        priority: weekPriority
      }
    };
    updateWeeklyReviews(updated);
  };

  const toggleWeeklyChecklist = (itemKey: string) => {
    const updated = {
      ...weeklyReviews,
      [currentWeekKey]: {
        ...weekData,
        checklist: {
          ...weekData.checklist,
          [itemKey]: !weekData.checklist[itemKey]
        }
      }
    };
    updateWeeklyReviews(updated);
  };

  const handleSaveMonthly = () => {
    const updated = {
      ...monthlyReviews,
      [currentMonthKey]: {
        milestones: monthMilestones,
        adjustments: monthAdjustments,
        focusArea: monthFocus,
        satisfactionScore: monthSatisfaction
      }
    };
    updateMonthlyReviews(updated);
  };

  const handleSaveQuarterly = () => {
    const updated = {
      ...quarterlyReviews,
      [currentQuarterKey]: {
        okrProgress: quarterOKR,
        courseCorrections: quarterPivots,
        highlights: quarterHighlights
      }
    };
    updateQuarterlyReviews(updated);
  };

  const handleSaveYearly = () => {
    const updated = {
      ...yearlyReviews,
      [currentYearKey]: {
        themeReview: yearTheme,
        lifeEvents: yearLessons,
        outlook: yearOutlook
      }
    };
    updateYearlyReviews(updated);
  };



  // Compile averages for Weekly/Monthly statistics
  const weeklyStats = compileAggregatedStats(7);
  const monthlyStats = compileAggregatedStats(30);

  return (
    <div className="space-y-4 text-zinc-200">
      {/* Sub-tab Navigation Matrix */}
      <div className="flex border-b border-zinc-900 pb-1.5 gap-2 overflow-x-auto select-none">
        {(["daily", "weekly", "monthly", "quarterly", "yearly"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveReviewTab(tab)}
            className={`px-3 py-1.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeReviewTab === tab
                ? "bg-zinc-100 text-zinc-950 border border-zinc-200"
                : "border border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-[#0a0a0a]"
            }`}
          >
            {tab} Review
          </button>
        ))}
      </div>

      <div className="animate-page-fade">
        {/* ==================== 1. DAILY REVIEW ==================== */}
        {activeReviewTab === "daily" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Startup/Shutdown Checklists */}
            <div className="lg:col-span-6 space-y-4">
              <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
                <CardHeader className="p-4 border-b border-zinc-800">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">MORNING SEQUENCE</span>
                  <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">STARTUP CHECKLIST</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div onClick={() => toggleRitual("startupHydrate")} className="flex items-center gap-3 p-2.5 rounded border border-zinc-900 bg-[#000000]/60 hover:bg-[#0a0a0a] cursor-pointer transition-colors">
                    {activeRituals.startupHydrate ? <CheckSquare className="h-4 w-4 text-zinc-200" /> : <Square className="h-4 w-4 text-zinc-650" />}
                    <div className="space-y-0.5">
                      <span className={`text-xs font-semibold ${activeRituals.startupHydrate ? "line-through text-zinc-500" : "text-zinc-250"}`}>Execute hydration cycle</span>
                      <p className="text-[8.5px] font-mono text-zinc-555 uppercase tracking-wide">Log initial 500ml water from coach recommendation.</p>
                    </div>
                  </div>
                  <div onClick={() => toggleRitual("startupReadVision")} className="flex items-center gap-3 p-2.5 rounded border border-zinc-900 bg-[#000000]/60 hover:bg-[#0a0a0a] cursor-pointer transition-colors">
                    {activeRituals.startupReadVision ? <CheckSquare className="h-4 w-4 text-zinc-200" /> : <Square className="h-4 w-4 text-zinc-650" />}
                    <div className="space-y-0.5">
                      <span className={`text-xs font-semibold ${activeRituals.startupReadVision ? "line-through text-zinc-500" : "text-zinc-250"}`}>Synchronize Vision & Goals</span>
                      <p className="text-[8.5px] font-mono text-zinc-555 uppercase tracking-wide">Read outcome and input goals on dashboard.</p>
                    </div>
                  </div>
                  <div onClick={() => toggleRitual("startupReviewAgenda")} className="flex items-center gap-3 p-2.5 rounded border border-zinc-900 bg-[#000000]/60 hover:bg-[#0a0a0a] cursor-pointer transition-colors">
                    {activeRituals.startupReviewAgenda ? <CheckSquare className="h-4 w-4 text-zinc-200" /> : <Square className="h-4 w-4 text-zinc-650" />}
                    <div className="space-y-0.5">
                      <span className={`text-xs font-semibold ${activeRituals.startupReviewAgenda ? "line-through text-zinc-500" : "text-zinc-250"}`}>Align schedule agenda</span>
                      <p className="text-[8.5px] font-mono text-zinc-555 uppercase tracking-wide">Check today's task priority buffers.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
                <CardHeader className="p-4 border-b border-zinc-800">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">EVENING SEQUENCE</span>
                  <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">SHUTDOWN CHECKLIST</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div onClick={() => toggleRitual("shutdownLogTasks")} className="flex items-center gap-3 p-2.5 rounded border border-zinc-900 bg-[#000000]/60 hover:bg-[#0a0a0a] cursor-pointer transition-colors">
                    {activeRituals.shutdownLogTasks ? <CheckSquare className="h-4 w-4 text-zinc-200" /> : <Square className="h-4 w-4 text-zinc-650" />}
                    <div className="space-y-0.5">
                      <span className={`text-xs font-semibold ${activeRituals.shutdownLogTasks ? "line-through text-zinc-500" : "text-zinc-250"}`}>Log/resolve active task buffers</span>
                      <p className="text-[8.5px] font-mono text-zinc-555 uppercase tracking-wide">Ensure completed tasks are checked off.</p>
                    </div>
                  </div>
                  <div onClick={() => toggleRitual("shutdownPlanTomorrow")} className="flex items-center gap-3 p-2.5 rounded border border-zinc-900 bg-[#000000]/60 hover:bg-[#0a0a0a] cursor-pointer transition-colors">
                    {activeRituals.shutdownPlanTomorrow ? <CheckSquare className="h-4 w-4 text-zinc-200" /> : <Square className="h-4 w-4 text-zinc-650" />}
                    <div className="space-y-0.5">
                      <span className={`text-xs font-semibold ${activeRituals.shutdownPlanTomorrow ? "line-through text-zinc-500" : "text-zinc-250"}`}>Queue tomorrow's priority agenda</span>
                      <p className="text-[8.5px] font-mono text-zinc-555 uppercase tracking-wide">Pre-populate the next date tasks list.</p>
                    </div>
                  </div>
                  <div onClick={() => toggleRitual("shutdownCheckSupps")} className="flex items-center gap-3 p-2.5 rounded border border-zinc-900 bg-[#000000]/60 hover:bg-[#0a0a0a] cursor-pointer transition-colors">
                    {activeRituals.shutdownCheckSupps ? <CheckSquare className="h-4 w-4 text-zinc-200" /> : <Square className="h-4 w-4 text-zinc-650" />}
                    <div className="space-y-0.5">
                      <span className={`text-xs font-semibold ${activeRituals.shutdownCheckSupps ? "line-through text-zinc-500" : "text-zinc-250"}`}>Verify supplements dispatcher</span>
                      <p className="text-[8.5px] font-mono text-zinc-555 uppercase tracking-wide">Verify daily stack dosage compliance.</p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-zinc-900 pt-3">
                    <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-wider font-bold text-zinc-450">
                      <span>LOG DAILY WILLPOWER STATE</span>
                      <span>{willpowerScore} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={willpowerScore}
                      onChange={(e) => handleWillpowerChange(Number(e.target.value))}
                      className="w-full accent-zinc-250 h-1 bg-[#000000] border border-zinc-900 rounded-lg cursor-pointer"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daily AI Performance Report */}
            <div className="lg:col-span-6 space-y-4">
              <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
                <CardHeader className="p-4 border-b border-zinc-800">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">ANALYTICS SYSTEM</span>
                  <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest flex items-center justify-between">
                    <span>AI PERFORMANCE REPORT</span>
                    <span className="flex items-center gap-1 text-[8.5px] text-zinc-450 tracking-wider">
                      <Cpu className="h-3.5 w-3.5" /> AGENT ENGINE
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="flex flex-col items-center justify-center p-4 border border-zinc-900 bg-[#000000]/60 rounded-md gap-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-zinc-400" />
                      <span className="text-2xl font-bold font-mono tracking-tighter text-zinc-150">
                        {dailyPerformanceIndex} <span className="text-zinc-500 text-sm">/ 100 INDEX</span>
                      </span>
                    </div>
                    <div className="w-full max-w-sm space-y-1">
                      <div className="flex justify-between text-[8px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                        <span>DAILY COMPLIANCE LIMIT</span>
                        <span>{dailyPerformanceIndex}%</span>
                      </div>
                      <div className="w-full bg-[#000000] border border-zinc-850 h-1.5 rounded-sm overflow-hidden">
                        <div className="bg-zinc-200 h-full transition-all duration-500" style={{ width: `${dailyPerformanceIndex}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className={`p-3 border rounded text-[10px] font-mono leading-relaxed uppercase ${dailyDiagnostic.color}`}>
                    <div className="font-bold flex items-center gap-1.5 mb-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>{dailyDiagnostic.status}</span>
                    </div>
                    <p className="text-[9.5px] text-zinc-350 leading-relaxed font-semibold lowercase tracking-wide first-letter:uppercase">
                      {dailyDiagnostic.feedback}
                    </p>
                  </div>

                  <div className="space-y-2 border-t border-zinc-900 pt-3">
                    <span className="text-[9px] font-mono uppercase tracking-widest font-bold text-zinc-500 block">METRIC AUDITS</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="border border-zinc-900 bg-[#000000]/40 p-2.5 rounded flex justify-between items-center">
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-mono text-zinc-550 uppercase tracking-wider">GOALS DONE</span>
                          <p className="text-xs font-bold font-mono text-zinc-200">{completedTasks}/{totalTasks}</p>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-400 font-bold bg-[#000000] border border-zinc-850 px-1.5 py-0.5 rounded">{dailyTaskRate}%</span>
                      </div>
                      <div className="border border-zinc-900 bg-[#000000]/40 p-2.5 rounded flex justify-between items-center">
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-mono text-zinc-555 uppercase tracking-wider">SUPPS TAKE</span>
                          <p className="text-xs font-bold font-mono text-zinc-200">{takenSups}/{totalSups}</p>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-400 font-bold bg-[#000000] border border-zinc-850 px-1.5 py-0.5 rounded">{dailySupRate}%</span>
                      </div>
                      <div className="border border-zinc-900 bg-[#000000]/40 p-2.5 rounded flex justify-between items-center">
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-mono text-zinc-555 uppercase tracking-wider">WATER COCH</span>
                          <p className="text-xs font-bold font-mono text-zinc-200">{dailyLoggedWater}/{dailyTargetWater}ml</p>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-400 font-bold bg-[#000000] border border-zinc-850 px-1.5 py-0.5 rounded">{dailyWaterRate}%</span>
                      </div>
                      <div className="border border-zinc-900 bg-[#000000]/40 p-2.5 rounded flex justify-between items-center">
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-mono text-zinc-555 uppercase tracking-wider">PRAYERS LOG</span>
                          <p className="text-xs font-bold font-mono text-zinc-200">{dailySalahLoggedCount}/5</p>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-400 font-bold bg-[#000000] border border-zinc-850 px-1.5 py-0.5 rounded">{dailySalahRate}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ==================== 2. WEEKLY REVIEW ==================== */}
        {activeReviewTab === "weekly" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Weekly Reflection Form */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
                <CardHeader className="p-4 border-b border-zinc-800 flex justify-between flex-row items-center gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">WEEKLY LEDGER ({currentWeekKey})</span>
                    <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">RETROSPECTIVE REFLECTIONS</CardTitle>
                  </div>
                  <button
                    onClick={handleSaveWeekly}
                    className="px-3 py-1 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-[9.5px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    <Save className="h-3.5 w-3.5 stroke-[2.5]" /> Save
                  </button>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">KEY WINS & HIGHLIGHTS</label>
                    <textarea
                      placeholder="DOCUMENT SIGNIFICANT BREAKTHROUGHS..."
                      value={weekWins}
                      onChange={(e) => setWeekWins(e.target.value)}
                      className="w-full h-20 bg-[#000000] border border-zinc-850 rounded p-3 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700 placeholder:text-zinc-850 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">CHALLENGES & BOTTLENECKS</label>
                    <textarea
                      placeholder="IDENTIFY LEAKS IN EFFICIENCY..."
                      value={weekChallenges}
                      onChange={(e) => setWeekChallenges(e.target.value)}
                      className="w-full h-20 bg-[#000000] border border-zinc-850 rounded p-3 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700 placeholder:text-zinc-850 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">CORE FOCUS FOR NEXT CYCLE</label>
                    <textarea
                      placeholder="ESTABLISH PRIORITY OBJECTIVES..."
                      value={weekPriority}
                      onChange={(e) => setWeekPriority(e.target.value)}
                      className="w-full h-20 bg-[#000000] border border-zinc-850 rounded p-3 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700 placeholder:text-zinc-850 resize-none leading-relaxed"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Checklist & Statistics */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
                <CardHeader className="p-4 border-b border-zinc-800">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">WEEKLY ROUTINES</span>
                  <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">MAINTENANCE AUDITS</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {[
                    { key: "auditFinance", label: "Perform financial ledger audit" },
                    { key: "inboxZero", label: "Clear correspondence (Inbox Zero)" },
                    { key: "workspaceDeclutter", label: "Declutter physical & digital workspace" },
                    { key: "studyReviews", label: "Review brain memory reserves & OKRs" }
                  ].map((item) => {
                    const isChecked = weekData.checklist?.[item.key] || false;
                    return (
                      <div
                        key={item.key}
                        onClick={() => toggleWeeklyChecklist(item.key)}
                        className="flex items-center gap-3 p-2.5 rounded border border-zinc-900 bg-[#000000]/60 hover:bg-[#0a0a0a] cursor-pointer transition-colors"
                      >
                        {isChecked ? <CheckSquare className="h-4 w-4 text-zinc-200" /> : <Square className="h-4 w-4 text-zinc-650" />}
                        <span className={`text-xs font-semibold ${isChecked ? "line-through text-zinc-500" : "text-zinc-250"}`}>
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
                <CardHeader className="p-4 border-b border-zinc-800">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">7-DAY METRIC SUMMARY</span>
                  <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">AGGREGATED AVERAGES</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-2">
                    {[
                      { label: "GOAL RESOLUTIONS", val: weeklyStats.taskRate },
                      { label: "WATER TARGET SATURATION", val: weeklyStats.waterRate },
                      { label: "SUPPLEMENT COMPLIANCE", val: weeklyStats.suppRate },
                      { label: "SALAH LOGGED RATE", val: weeklyStats.salahRate }
                    ].map((st) => (
                      <div key={st.label} className="space-y-1">
                        <div className="flex justify-between text-[8px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                          <span>{st.label}</span>
                          <span className="text-zinc-350">{st.val}%</span>
                        </div>
                        <div className="w-full bg-[#000000] border border-zinc-850 h-1.5 rounded-sm overflow-hidden">
                          <div className="bg-zinc-200 h-full transition-all duration-500" style={{ width: `${st.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ==================== 3. MONTHLY REVIEW ==================== */}
        {activeReviewTab === "monthly" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Monthly Reflection Form */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
                <CardHeader className="p-4 border-b border-zinc-800 flex justify-between flex-row items-center gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">MONTHLY LEDGER ({currentMonthKey})</span>
                    <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">HIGH-LEVEL RETROSPECTIVE</CardTitle>
                  </div>
                  <button
                    onClick={handleSaveMonthly}
                    className="px-3 py-1 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-[9.5px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    <Save className="h-3.5 w-3.5 stroke-[2.5]" /> Save
                  </button>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">CORE MILESTONES ACHIEVED</label>
                    <textarea
                      placeholder="LIST MAJOR TARGET RESOLUTIONS..."
                      value={monthMilestones}
                      onChange={(e) => setMonthMilestones(e.target.value)}
                      className="w-full h-24 bg-[#000000] border border-zinc-850 rounded p-3 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700 placeholder:text-zinc-850 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">HABIT ADJUSTMENTS & COURSE CORRECTIONS</label>
                    <textarea
                      placeholder="IDENTIFY NEEDED PROTOCOL ADJUSTMENTS..."
                      value={monthAdjustments}
                      onChange={(e) => setMonthAdjustments(e.target.value)}
                      className="w-full h-24 bg-[#000000] border border-zinc-850 rounded p-3 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700 placeholder:text-zinc-850 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">PRIMARY FOCUS AREA FOR NEXT MONTH</label>
                    <textarea
                      placeholder="SPECIFY STRATEGIC TARGETS..."
                      value={monthFocus}
                      onChange={(e) => setMonthFocus(e.target.value)}
                      className="w-full h-20 bg-[#000000] border border-zinc-850 rounded p-3 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700 placeholder:text-zinc-850 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-2 border-t border-zinc-900 pt-3">
                    <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-wider font-bold text-zinc-450">
                      <span>LIFESTYLE SATISFACTION LEVEL</span>
                      <span>{monthSatisfaction} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={monthSatisfaction}
                      onChange={(e) => setMonthSatisfaction(Number(e.target.value))}
                      className="w-full accent-zinc-250 h-1 bg-[#000000] border border-zinc-900 rounded-lg cursor-pointer"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Statistics */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
                <CardHeader className="p-4 border-b border-zinc-800">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">30-DAY METRIC SUMMARY</span>
                  <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">AGGREGATED AVERAGES</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-2">
                    {[
                      { label: "GOAL RESOLUTIONS", val: monthlyStats.taskRate },
                      { label: "WATER TARGET SATURATION", val: monthlyStats.waterRate },
                      { label: "SUPPLEMENT COMPLIANCE", val: monthlyStats.suppRate },
                      { label: "SALAH LOGGED RATE", val: monthlyStats.salahRate }
                    ].map((st) => (
                      <div key={st.label} className="space-y-1">
                        <div className="flex justify-between text-[8px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                          <span>{st.label}</span>
                          <span className="text-zinc-350">{st.val}%</span>
                        </div>
                        <div className="w-full bg-[#000000] border border-zinc-850 h-1.5 rounded-sm overflow-hidden">
                          <div className="bg-zinc-200 h-full transition-all duration-500" style={{ width: `${st.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ==================== 4. QUARTERLY REVIEW ==================== */}
        {activeReviewTab === "quarterly" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Quarterly Reflection Form */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
                <CardHeader className="p-4 border-b border-zinc-800 flex justify-between flex-row items-center gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">QUARTERLY LEDGER ({currentQuarterKey})</span>
                    <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">OKR AUDITING SHEET</CardTitle>
                  </div>
                  <button
                    onClick={handleSaveQuarterly}
                    className="px-3 py-1 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-[9.5px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    <Save className="h-3.5 w-3.5 stroke-[2.5]" /> Save
                  </button>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">OKR PROGRESSION AUDIT</label>
                    <textarea
                      placeholder="STUDY CURRENT ACTIVE SKILLS PROGESS COMPLIANCE..."
                      value={quarterOKR}
                      onChange={(e) => setQuarterOKR(e.target.value)}
                      className="w-full h-28 bg-[#000000] border border-zinc-850 rounded p-3 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700 placeholder:text-zinc-850 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">PIVOTS & ROADMAP COURSE CORRECTIONS</label>
                    <textarea
                      placeholder="DOCUMENT CHANGES IN GOALS AND SKILLS PRIORITIES..."
                      value={quarterPivots}
                      onChange={(e) => setQuarterPivots(e.target.value)}
                      className="w-full h-28 bg-[#000000] border border-zinc-850 rounded p-3 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700 placeholder:text-zinc-850 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">QUARTERLY HIGHLIGHTS</label>
                    <textarea
                      placeholder="LIST MAJOR ACHIEVEMENTS OVER THE LAST 90 DAYS..."
                      value={quarterHighlights}
                      onChange={(e) => setQuarterHighlights(e.target.value)}
                      className="w-full h-20 bg-[#000000] border border-zinc-850 rounded p-3 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700 placeholder:text-zinc-850 resize-none leading-relaxed"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* OKR Skill Tracker References */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
                <CardHeader className="p-4 border-b border-zinc-800">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">ACTIVE DEVELOPMENT PATHS</span>
                  <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">OKR SKILLS REGISTER</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3.5">
                  <div className="space-y-2">
                    {skills.map((skill) => {
                      const pct = Math.min(Math.round((skill.currentProgress / skill.targetProgress) * 100), 100);
                      return (
                        <div key={skill.id} className="border border-zinc-900 bg-[#000000]/60 rounded p-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-zinc-200">{skill.name}</span>
                            <span className="text-[9px] font-mono font-bold text-zinc-400">{skill.currentProgress} / {skill.targetProgress}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="w-full bg-[#000000] border border-zinc-850 h-1.5 rounded-sm overflow-hidden">
                              <div className="bg-zinc-200 h-full transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="flex justify-between text-[7.5px] font-mono text-zinc-555 uppercase tracking-wide font-bold">
                              <span>{skill.keyResult}</span>
                              <span>{pct}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {skills.length === 0 && (
                      <div className="text-center py-4 text-[9px] font-mono uppercase tracking-widest text-zinc-650">No development skills in database.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ==================== 5. YEARLY REVIEW ==================== */}
        {activeReviewTab === "yearly" && (
          <div className="max-w-3xl mx-auto space-y-4">
            <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
              <CardHeader className="p-4 border-b border-zinc-800 flex justify-between flex-row items-center gap-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">ANNUAL REVIEW ({currentYearKey})</span>
                  <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">ANNUAL THEME AUDITING</CardTitle>
                </div>
                <button
                  onClick={handleSaveYearly}
                  className="px-3 py-1 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-[9.5px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  <Save className="h-3.5 w-3.5 stroke-[2.5]" /> Save
                </button>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">ANNUAL THEME EVALUATION</label>
                  <textarea
                    placeholder="EVALUATE THE PRINCIPLES AND FOCUS GUIDING THE YEAR..."
                    value={yearTheme}
                    onChange={(e) => setYearTheme(e.target.value)}
                    className="w-full h-32 bg-[#000000] border border-zinc-850 rounded p-3 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700 placeholder:text-zinc-850 resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">MAJOR BREAKTHROUGHS & CORE LESSONS</label>
                  <textarea
                    placeholder="STUDY THE SIGNIFICANT STRUGGLES AND OUTCOMES OF THIS ANNUM..."
                    value={yearLessons}
                    onChange={(e) => setYearLessons(e.target.value)}
                    className="w-full h-32 bg-[#000000] border border-zinc-850 rounded p-3 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700 placeholder:text-zinc-850 resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">STRATEGIC OUTLOOK FOR THE NEXT CYCLE</label>
                  <textarea
                    placeholder="DEFINE THE GUIDING PRINCIPLE AND NEXT OBJECTIVES..."
                    value={yearOutlook}
                    onChange={(e) => setYearOutlook(e.target.value)}
                    className="w-full h-24 bg-[#000000] border border-zinc-850 rounded p-3 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700 placeholder:text-zinc-850 resize-none leading-relaxed"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}


      </div>
    </div>
  );
}
