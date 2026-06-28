"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Dumbbell, 
  Plus, 
  Minus,
  X,
  TrendingUp,
  Camera,
  Calendar,
  AlertCircle,
  Award,
  Settings,
  MapPin,
  LineChart,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { GymExercise, GymPhoto, BlocksConfig } from "@/types";

interface GymViewProps {
  gymType: "home" | "commercial" | "both";
  gymSplit: "push" | "pull" | "legs" | "rest";
  updateGymSettings: (fields: { gymType?: "home" | "commercial" | "both"; gymSplit?: "push" | "pull" | "legs" | "rest" }) => void;
  gymExercises: GymExercise[];
  updateGymExercises: (exercises: GymExercise[]) => void;
  gymPhotos: GymPhoto[];
  updateGymPhotos: (photos: GymPhoto[]) => void;
  activeDate: string;
  blocksConfig?: BlocksConfig;
}

export default function GymView({
  gymType,
  gymSplit,
  updateGymSettings,
  gymExercises,
  updateGymExercises,
  gymPhotos,
  updateGymPhotos,
  activeDate,
  blocksConfig
}: GymViewProps) {
  const showWorkoutSplit = blocksConfig?.workoutSplit ?? true;
  const showPhotoMatrix = blocksConfig?.photoMatrix ?? true;

  const leftSpan = !showPhotoMatrix ? "lg:col-span-12" : "lg:col-span-8";
  const rightSpan = !showWorkoutSplit ? "lg:col-span-12" : "lg:col-span-4";
  // Input helpers for adding exercises
  const [newExName, setNewExName] = useState("");
  const [newExWeight, setNewExWeight] = useState<number | "">("");
  const [newExReps, setNewExReps] = useState<number | "">("");
  const [newExTarget, setNewExTarget] = useState<number | "">("");

  // Photo helpers
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoLabel, setNewPhotoLabel] = useState("");

  // Active Session & Rest states
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionElapsedTime, setSessionElapsedTime] = useState(0);
  const [sessionSets, setSessionSets] = useState<Record<string, Array<{ weight: number; reps: number; done: boolean }>>>({});
  const [restTimer, setRestTimer] = useState<number | null>(null);

  // Focus selection state for active exercise detail overlay
  const [activeExercise, setActiveExercise] = useState<GymExercise | null>(null);

  // Handle ESC key press to exit exercise detail view
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveExercise(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Resolve the current active exercise from the latest gymExercises list state
  const currentExercise = activeExercise 
    ? gymExercises.find(ex => ex.id === activeExercise.id) || activeExercise
    : null;

  // Live Workout timer effect
  React.useEffect(() => {
    let intervalId: any;
    if (isSessionActive && sessionStartTime !== null) {
      intervalId = setInterval(() => {
        setSessionElapsedTime(Math.round((Date.now() - sessionStartTime) / 1000));
      }, 1000);
    } else {
      setSessionElapsedTime(0);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isSessionActive, sessionStartTime]);

  // Countdown rest timer effect
  React.useEffect(() => {
    let intervalId: any;
    if (restTimer !== null && restTimer > 0) {
      intervalId = setInterval(() => {
        setRestTimer((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
      }, 1000);
    } else if (restTimer === 0) {
      setRestTimer(null);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [restTimer]);

  const formatElapsedTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // PR & 1RM Calculations
  const calculatePR = (ex: GymExercise) => {
    let maxWeight = 0;
    ex.history.forEach((h) => {
      if (h.sets && h.sets.length > 0) {
        h.sets.forEach((s) => {
          if (s.weight > maxWeight) maxWeight = s.weight;
        });
      } else {
        if (h.weight > maxWeight) maxWeight = h.weight;
      }
    });
    if (ex.reps > 0 && ex.weight > maxWeight) {
      maxWeight = ex.weight;
    }
    return maxWeight;
  };

  const calculate1RM = (ex: GymExercise) => {
    let max1RM = 0;
    const calcSingle1RM = (weight: number, reps: number) => {
      if (reps <= 0) return 0;
      return Math.round(weight * (1 + reps / 30));
    };
    ex.history.forEach((h) => {
      if (h.sets && h.sets.length > 0) {
        h.sets.forEach((s) => {
          const oneRM = calcSingle1RM(s.weight, s.reps);
          if (oneRM > max1RM) max1RM = oneRM;
        });
      } else {
        const oneRM = calcSingle1RM(h.weight, h.reps);
        if (oneRM > max1RM) max1RM = oneRM;
      }
    });
    if (ex.reps > 0) {
      const current1RM = calcSingle1RM(ex.weight, ex.reps);
      if (current1RM > max1RM) max1RM = current1RM;
    }
    return max1RM;
  };

  // Workout Session Engine
  const startWorkout = () => {
    const initialSets: Record<string, Array<{ weight: number; reps: number; done: boolean }>> = {};
    gymExercises.forEach((ex) => {
      const prevSession = ex.history[0];
      const setsArr = Array.from({ length: 4 }).map((_, i) => {
        let weight = ex.weight;
        let reps = ex.targetReps || ex.reps || 8;
        if (prevSession) {
          if (prevSession.sets && prevSession.sets[i]) {
            weight = prevSession.sets[i].weight;
            reps = prevSession.sets[i].reps;
          } else {
            weight = prevSession.weight;
            reps = prevSession.reps;
          }
        }
        return { weight, reps, done: false };
      });
      initialSets[ex.id] = setsArr;
    });
    setSessionSets(initialSets);
    setIsSessionActive(true);
    setSessionStartTime(Date.now());
    setSessionElapsedTime(0);
    setRestTimer(null);
  };

  const finishWorkout = () => {
    const updatedExercises = gymExercises.map((ex) => {
      const setsForEx = sessionSets[ex.id];
      if (!setsForEx) return ex;

      const completedSets = setsForEx.filter((s) => s.done);
      if (completedSets.length === 0) return ex;

      const maxWeight = Math.max(...completedSets.map((s) => s.weight));
      const correspondingReps = completedSets.find((s) => s.weight === maxWeight)?.reps || completedSets[0].reps;
      
      const hitTarget = completedSets.some((s) => s.reps >= ex.targetReps);
      let nextWeight = ex.weight;
      if (hitTarget) {
        nextWeight = maxWeight + 2;
      } else {
        nextWeight = maxWeight;
      }

      const newHistoryItem = {
        date: activeDate,
        weight: maxWeight,
        reps: correspondingReps,
        sets: completedSets.map((s) => ({ weight: s.weight, reps: s.reps })),
      };

      const newHistory = [newHistoryItem, ...ex.history].slice(0, 8);
      return {
        ...ex,
        weight: nextWeight,
        reps: correspondingReps,
        history: newHistory,
      };
    });

    updateGymExercises(updatedExercises);
    setIsSessionActive(false);
    setSessionStartTime(null);
    setSessionElapsedTime(0);
    setRestTimer(null);
    alert("Workout session completed! Data saved successfully.");
  };

  const handleToggleSetDone = (exId: string, setIdx: number) => {
    setSessionSets((prev) => {
      const exsSets = prev[exId] ? [...prev[exId]] : [];
      if (exsSets.length === 0) return prev;
      const setObj = { ...exsSets[setIdx] };
      const nextDone = !setObj.done;
      setObj.done = nextDone;
      exsSets[setIdx] = setObj;

      if (nextDone) {
        setRestTimer(90);
      }
      return { ...prev, [exId]: exsSets };
    });
  };

  const handleUpdateSetWeight = (exId: string, setIdx: number, val: number) => {
    setSessionSets((prev) => {
      const exsSets = prev[exId] ? [...prev[exId]] : [];
      if (exsSets.length === 0) return prev;
      exsSets[setIdx] = { ...exsSets[setIdx], weight: val };
      return { ...prev, [exId]: exsSets };
    });
  };

  const handleUpdateSetReps = (exId: string, setIdx: number, val: number) => {
    setSessionSets((prev) => {
      const exsSets = prev[exId] ? [...prev[exId]] : [];
      if (exsSets.length === 0) return prev;
      exsSets[setIdx] = { ...exsSets[setIdx], reps: val };
      return { ...prev, [exId]: exsSets };
    });
  };

  const getPreviousSetDetails = (ex: GymExercise, setIdx: number) => {
    const prevSession = ex.history[0];
    if (!prevSession) return "—";
    if (prevSession.sets && prevSession.sets[setIdx]) {
      return `${prevSession.sets[setIdx].weight}kg × ${prevSession.sets[setIdx].reps}`;
    }
    if (setIdx === 0) {
      return `${prevSession.weight}kg × ${prevSession.reps}`;
    }
    return "—";
  };

  const getPreviewSets = (ex: GymExercise) => {
    const prevSession = ex.history[0];
    return Array.from({ length: 4 }).map((_, i) => {
      let weight = ex.weight;
      let reps = ex.targetReps || ex.reps || 8;
      if (prevSession) {
        if (prevSession.sets && prevSession.sets[i]) {
          weight = prevSession.sets[i].weight;
          reps = prevSession.sets[i].reps;
        } else {
          weight = prevSession.weight;
          reps = prevSession.reps;
        }
      }
      return { weight, reps, done: false };
    });
  };

  // Exercise Actions
  const handleAddExercise = () => {
    if (!newExName.trim() || newExWeight === "" || newExReps === "" || newExTarget === "") return;
    const newId = "ex_" + Date.now();
    const newEx: GymExercise = {
      id: newId,
      name: newExName.trim(),
      weight: Number(newExWeight),
      reps: Number(newExReps),
      targetReps: Number(newExTarget),
      history: []
    };
    if (isSessionActive) {
      setSessionSets((prev) => ({
        ...prev,
        [newId]: Array.from({ length: 4 }).map(() => ({
          weight: Number(newExWeight),
          reps: Number(newExTarget),
          done: false,
        })),
      }));
    }
    updateGymExercises([...gymExercises, newEx]);
    setNewExName("");
    setNewExWeight("");
    setNewExReps("");
    setNewExTarget("");
  };

  const handleDeleteExercise = (id: string) => {
    updateGymExercises(gymExercises.filter(ex => ex.id !== id));
    if (activeExercise?.id === id) {
      setActiveExercise(null);
    }
  };

  // Photo actions
  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim() || !newPhotoLabel.trim()) return;
    const newPhoto: GymPhoto = {
      id: "ph_" + Date.now(),
      date: activeDate,
      url: newPhotoUrl.trim(),
      label: newPhotoLabel.trim()
    };
    updateGymPhotos([...gymPhotos, newPhoto]);
    setNewPhotoUrl("");
    setNewPhotoLabel("");
  };

  const handleDeletePhoto = (id: string) => {
    updateGymPhotos(gymPhotos.filter(p => p.id !== id));
  };

  const getHistory1RM = (h: any) => {
    if (h.sets && h.sets.length > 0) {
      return Math.max(...h.sets.map((s: any) => Math.round(s.weight * (1 + s.reps / 30))));
    }
    return Math.round(h.weight * (1 + h.reps / 30));
  };

  const getHistoryPeakWeight = (h: any) => {
    if (h.sets && h.sets.length > 0) {
      return Math.max(...h.sets.map((s: any) => s.weight));
    }
    return h.weight;
  };

  const getHistorySetsCompleted = (h: any) => {
    return h.sets ? h.sets.length : 1;
  };

  // Pure SVG Trend Line generator for 1RM over time
  const render1RMChart = (ex: GymExercise) => {
    const dataPoints = [
      ...ex.history.map(h => ({
        date: h.date,
        oneRM: getHistory1RM(h)
      }))
    ].reverse(); // Sort oldest to newest

    if (dataPoints.length < 2) {
      return (
        <div className="py-8 text-center text-xs font-mono text-zinc-500 uppercase tracking-widest border border-dashed border-zinc-800 rounded">
          More historical data required to render 1RM performance trend.
        </div>
      );
    }

    const width = 500;
    const height = 180;
    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const drawWidth = width - paddingLeft - paddingRight;
    const drawHeight = height - paddingTop - paddingBottom;

    const oneRMs = dataPoints.map(d => d.oneRM);
    const min1RM = Math.max(0, Math.min(...oneRMs) * 0.95);
    const max1RM = Math.max(...oneRMs) * 1.05;
    const diff = max1RM - min1RM || 1;

    // Calculate coordinates
    const pointsCoords = dataPoints.map((dp, idx) => {
      const x = paddingLeft + (idx / (dataPoints.length - 1)) * drawWidth;
      const y = paddingTop + drawHeight - ((dp.oneRM - min1RM) / diff) * drawHeight;
      return { x, y, val: dp.oneRM, label: dp.date.slice(5) }; // MM-DD
    });

    let pathD = `M ${pointsCoords[0].x} ${pointsCoords[0].y}`;
    for (let i = 1; i < pointsCoords.length; i++) {
      pathD += ` L ${pointsCoords[i].x} ${pointsCoords[i].y}`;
    }

    return (
      <div className="bg-[#080808] border border-zinc-800 rounded-md p-4 space-y-3 relative overflow-hidden">
        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-450 uppercase tracking-wider font-semibold">
          <span>1RM PERFORMANCE TREND (EST. 1RM OVER TIME)</span>
          <span>PEAK 1RM: {Math.max(...oneRMs)} kg</span>
        </div>
        
        <div className="w-full overflow-x-auto">
          <svg className="w-full min-w-[400px] h-44" viewBox={`0 0 ${width} ${height}`}>
            {/* Horizontal Grid lines */}
            <line x1={paddingLeft} y1={paddingTop} x2={width - paddingRight} y2={paddingTop} className="stroke-zinc-900 stroke-[1]" />
            <line x1={paddingLeft} y1={paddingTop + drawHeight / 2} x2={width - paddingRight} y2={paddingTop + drawHeight / 2} className="stroke-zinc-900 stroke-[1]" />
            <line x1={paddingLeft} y1={paddingTop + drawHeight} x2={width - paddingRight} y2={paddingTop + drawHeight} className="stroke-zinc-800/80 stroke-[1]" />

            {/* Y Axis Labels */}
            <text x={paddingLeft - 8} y={paddingTop + 4} className="text-[9px] fill-zinc-550 font-mono font-bold" textAnchor="end">{Math.round(max1RM)}</text>
            <text x={paddingLeft - 8} y={paddingTop + drawHeight / 2 + 4} className="text-[9px] fill-zinc-555 font-mono font-bold" textAnchor="end">{Math.round((max1RM + min1RM) / 2)}</text>
            <text x={paddingLeft - 8} y={paddingTop + drawHeight + 4} className="text-[9px] fill-zinc-555 font-mono font-bold" textAnchor="end">{Math.round(min1RM)}</text>

            {/* Trend Line Path */}
            <path
              d={pathD}
              className="fill-none stroke-zinc-200 stroke-[2] transition-all duration-500"
            />

            {/* Data Point Nodes */}
            {pointsCoords.map((pt, idx) => (
              <g key={idx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  className="fill-black stroke-zinc-200 stroke-[1.5]"
                />
                {/* Node values */}
                <text
                  x={pt.x}
                  y={pt.y - 8}
                  className="text-[8.5px] fill-zinc-300 font-mono font-bold"
                  textAnchor="middle"
                >
                  {pt.val}
                </text>
                {/* X axis labels (date) */}
                <text
                  x={pt.x}
                  y={height - 8}
                  className="text-[8px] fill-zinc-550 font-mono font-semibold"
                  textAnchor="middle"
                >
                  {pt.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 text-zinc-200">
      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .animate-pulse-slow {
          animation: pulseSlow 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {/* Automated Rest Timer Banner */}
      {restTimer !== null && (
        <div className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur border border-zinc-800 rounded-md p-3.5 shadow-xl flex items-center justify-between text-zinc-200 font-mono text-xs animate-slide-in">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold tracking-widest text-zinc-300 uppercase">
              RESTING: <span className="text-emerald-400 font-mono font-bold animate-pulse-slow">{formatTime(restTimer)}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRestTimer((prev) => (prev !== null ? prev + 30 : 30))}
              className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-700 rounded text-xs font-bold font-mono tracking-wider text-zinc-350 active:scale-95 transition-all"
            >
              +30S
            </button>
            <button
              onClick={() => setRestTimer(null)}
              className="px-3.5 py-1.5 bg-red-955/20 hover:bg-red-955/40 border border-red-900 rounded text-xs font-bold font-mono tracking-wider text-red-500 active:scale-95 transition-all"
            >
              SKIP
            </button>
          </div>
        </div>
      )}
      
      {/* Gym Settings Selection Header */}
      <div className="rounded-md border border-zinc-800 bg-[#0a0a0a] p-3.5 sm:p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-4 md:gap-6">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#000000] border border-zinc-800 text-xs font-mono tracking-widest text-zinc-500 uppercase font-semibold">
              PRESCRIPTION ENGINE
            </span>
            <h1 className="text-base font-mono tracking-widest font-bold text-zinc-150 uppercase flex items-center gap-2.5">
              <Dumbbell className="h-5 w-5" /> GYM SCHEDULE & WORKOUT CONFIG
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 bg-[#000000] border border-zinc-905 p-1.5 rounded-md">
            {/* Location */}
            <div className="flex items-center gap-2 border-r border-zinc-900 pr-3">
              <MapPin className="h-4 w-4 text-zinc-500" />
              <select
                value={gymType}
                onChange={(e) => updateGymSettings({ gymType: e.target.value as any })}
                className="bg-[#000000] text-xs font-mono text-zinc-300 outline-none border-none cursor-pointer font-bold uppercase"
              >
                <option value="both">BOTH GYMS</option>
                <option value="home">HOME CAGE</option>
                <option value="commercial">COMMERCIAL</option>
              </select>
            </div>

            {/* Split */}
            <div className="flex items-center gap-1.5">
              {(["push", "pull", "legs", "rest"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => updateGymSettings({ gymSplit: s })}
                  className={`px-4 py-1.5 text-xs font-mono font-bold tracking-wider uppercase rounded transition-all duration-150 active:scale-95 ${
                    gymSplit === s ? "bg-zinc-50 text-zinc-950" : "text-zinc-550 hover:text-zinc-350"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Exercises & Photos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-4 md:gap-6">
        
        {/* Left Column: Exercises */}
        {showWorkoutSplit && (
          <div className={`${leftSpan} space-y-2 sm:space-y-4 md:space-y-6`}>
            <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-3.5 sm:p-5 md:p-6 border-b border-zinc-800">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-550 font-bold">ROUTINE TRACKER</span>
                  <CardTitle className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-widest">
                    ACTIVE {gymSplit} EXERCISES
                  </CardTitle>
                </div>
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider font-bold">
                  {gymExercises.length} Total Exercises
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-5 md:p-6 space-y-6">

              {/* Live Workout Session Banner */}
              <div className="border border-zinc-900 bg-[#000000] p-4.5 rounded-md flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 font-bold">WORKOUT SESSION</span>
                  {isSessionActive ? (
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-ping" />
                      <span className="text-sm font-mono font-bold text-[#10b981]">
                        ACTIVE: {formatElapsedTime(sessionElapsedTime)}
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm font-mono font-bold text-zinc-400">INACTIVE</div>
                  )}
                </div>
                {isSessionActive ? (
                  <button
                    onClick={finishWorkout}
                    className="px-5 py-2.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/60 hover:border-red-900 text-red-500 rounded text-xs font-mono font-bold tracking-widest uppercase active:scale-95 transition-all cursor-pointer font-bold"
                  >
                    Finish Workout
                  </button>
                ) : (
                  <button
                    disabled={gymSplit === "rest"}
                    onClick={startWorkout}
                    className="px-5 py-2.5 bg-zinc-50 hover:bg-white text-zinc-950 rounded text-xs font-mono font-bold tracking-widest uppercase active:scale-95 transition-all cursor-pointer font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Start Workout
                  </button>
                )}
              </div>
              
              {/* List Exercises (Basic Clickable Cards Profile) */}
              <div className="space-y-4">
                {gymExercises.map((ex) => {
                  const isUpgraded = isSessionActive 
                    ? sessionSets[ex.id]?.some(s => s.done && s.reps >= ex.targetReps)
                    : ex.reps >= ex.targetReps;

                  return (
                    <div 
                      key={ex.id} 
                      onClick={() => setActiveExercise(ex)}
                      className="group border border-zinc-900 bg-[#000000]/60 p-4 rounded-md flex flex-col gap-2 transition-all hover:border-zinc-700 hover:bg-zinc-900/10 cursor-pointer animate-slide-in animate-fade-in"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <h3 className="text-sm font-bold font-mono text-zinc-150 uppercase tracking-wide group-hover:text-white transition-colors">
                              {ex.name}
                            </h3>
                            <span className="text-[10px] text-zinc-500 font-mono tracking-wider">
                              [PR: {calculatePR(ex)}KG // 1RM: {calculate1RM(ex)}KG]
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 uppercase">
                            <span>CURRENT: <span className="font-bold text-zinc-200">{ex.weight}kg × {ex.reps} reps</span></span>
                            <span>TARGET: <span className="font-bold text-zinc-400">{ex.targetReps} reps</span></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isUpgraded && (
                            <span className="px-2 py-0.5 bg-emerald-950/20 border border-emerald-900/60 rounded text-[9px] font-mono text-emerald-400 uppercase font-semibold">
                              TARGET MET
                            </span>
                          )}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteExercise(ex.id);
                            }}
                            className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-sm font-bold font-mono"
                            title="Delete exercise"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {gymExercises.length === 0 && (
                  <div className="text-center py-6 text-xs font-mono uppercase tracking-widest text-zinc-500 border border-dashed border-zinc-800 rounded animate-pulse">
                    No active gym split logs.
                  </div>
                )}
              </div>

              {/* Add Exercise form */}
              <div className="flex flex-col gap-2.5 pt-4 border-t border-zinc-900 mt-3">
                <input
                  type="text"
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  placeholder="EXERCISE NAME (e.g. Overhead Press)..."
                  className="h-12 bg-transparent border border-zinc-800 rounded-md px-4 text-sm font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400 bg-black/40 transition-all focus:outline-none"
                />
                <div className="grid grid-cols-3 gap-2.5">
                  <input
                    type="number"
                    value={newExWeight}
                    onChange={(e) => setNewExWeight(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="WEIGHT (KG)..."
                    className="h-12 bg-transparent border border-zinc-800 rounded-md px-4 text-sm font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400 bg-black/40 transition-all focus:outline-none"
                  />
                  <input
                    type="number"
                    value={newExReps}
                    onChange={(e) => setNewExReps(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="REPS..."
                    className="h-12 bg-transparent border border-zinc-800 rounded-md px-4 text-sm font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400 bg-black/40 transition-all focus:outline-none"
                  />
                  <input
                    type="number"
                    value={newExTarget}
                    onChange={(e) => setNewExTarget(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="TARGET REPS..."
                    className="h-12 bg-transparent border border-zinc-800 rounded-md px-4 text-sm font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400 bg-black/40 transition-all focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleAddExercise}
                  className="h-12 w-full rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-xs tracking-widest uppercase transition-all duration-100 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  Add Exercise
                </button>
              </div>

            </CardContent>
          </Card>
          </div>
        )}

        {/* Right Column: Comparative Progress Photos Panel */}
        {showPhotoMatrix && (
          <div className={`${rightSpan} space-y-2 sm:space-y-4 md:space-y-6`}>
            <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-3.5 sm:p-5 md:p-6 border-b border-zinc-800">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">VISUAL COMPARISON</span>
              <CardTitle className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-widest">
                PROGRESS PHOTOS MATRIX
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-5 md:p-6 space-y-6">
              
              {/* Comparative side-by-side list */}
              <div className="grid grid-cols-1 gap-3.5 max-h-[300px] overflow-y-auto pr-1">
                {gymPhotos.map((photo) => (
                  <div key={photo.id} className="group border border-zinc-900 bg-[#000000]/60 p-3.5 rounded relative flex flex-col gap-2 transition-all hover:border-zinc-805 animate-slide-in">
                    <img 
                      src={photo.url} 
                      alt={photo.label}
                      className="w-full h-28 object-cover rounded bg-zinc-955 border border-zinc-900 grayscale brightness-75 contrast-125 transition-all duration-300 group-hover:grayscale-0 group-hover:brightness-90"
                    />
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-bold text-zinc-300 uppercase tracking-wider">{photo.label}</span>
                      <span className="text-zinc-550 flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" /> {photo.date}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-4 right-4 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {gymPhotos.length === 0 && (
                  <div className="text-center py-6 text-xs font-mono uppercase tracking-widest text-zinc-550 border border-dashed border-zinc-850 rounded animate-pulse">
                    No visual logs.
                  </div>
                )}
              </div>

              {/* Add photo mockup input form */}
              <div className="flex flex-col gap-2.5 pt-4 border-t border-zinc-900 mt-3">
                <span className="text-[11px] font-mono uppercase tracking-widest font-semibold text-zinc-500">MOCK UPLOAD PANEL</span>
                <input
                  type="text"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="ENTER IMAGE URL..."
                  className="h-12 w-full bg-transparent border border-zinc-800 rounded-md px-4 text-sm font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400 bg-black/40 transition-all focus:outline-none"
                />
                <input
                  type="text"
                  value={newPhotoLabel}
                  onChange={(e) => setNewPhotoLabel(e.target.value)}
                  placeholder="LABEL (e.g. Current)..."
                  className="h-12 w-full bg-transparent border border-zinc-800 rounded-md px-4 text-sm font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400 bg-black/40 transition-all focus:outline-none"
                />
                <button
                  onClick={handleAddPhoto}
                  className="h-12 w-full rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-xs tracking-widest uppercase transition-all duration-100 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  Add Photo
                </button>
              </div>

            </CardContent>
          </Card>
          </div>
        )}

      </div>

      {/* Fullscreen Exercise Detail Overlay View */}
      {currentExercise && (
        <div className="fixed inset-0 bg-black z-50 p-6 md:p-8 overflow-y-auto flex flex-col gap-6 animate-slide-in">
          {/* Overlay Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-6 gap-4">
            <div className="space-y-1">
              <button
                onClick={() => setActiveExercise(null)}
                className="text-xs font-mono font-bold tracking-widest text-zinc-500 hover:text-zinc-300 uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                [ ESC // BACK TO ROUTINE ]
              </button>
              <h2 className="text-xl md:text-2xl font-mono font-bold text-white uppercase tracking-widest flex items-center gap-3 mt-2">
                <Dumbbell className="h-6 w-6 text-zinc-400" />
                {currentExercise.name}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-zinc-400 uppercase tracking-wider">
                <span>PR: <span className="text-zinc-200 font-bold">{calculatePR(currentExercise)}KG</span></span>
                <span className="text-zinc-700">//</span>
                <span>EST. 1RM: <span className="text-zinc-200 font-bold">{calculate1RM(currentExercise)}KG</span></span>
                <span className="text-zinc-700">//</span>
                <span>CURRENT SET: <span className="text-zinc-200 font-bold">{currentExercise.weight}kg × {currentExercise.reps} reps</span></span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isSessionActive ? (
                <div className="flex items-center gap-4 bg-zinc-950 border border-zinc-850 p-2.5 px-4 rounded-md">
                  <div className="text-left">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">SESSION TIME</span>
                    <span className="text-sm font-mono font-bold text-emerald-400 animate-pulse">
                      {formatElapsedTime(sessionElapsedTime)}
                    </span>
                  </div>
                  <button
                    onClick={finishWorkout}
                    className="px-4 py-2 bg-red-955/20 hover:bg-red-955/40 border border-red-900 text-red-500 rounded text-xs font-mono font-bold tracking-widest uppercase active:scale-95 transition-all cursor-pointer"
                  >
                    Finish Session
                  </button>
                </div>
              ) : (
                <button
                  disabled={gymSplit === "rest"}
                  onClick={startWorkout}
                  className="px-5 py-3 bg-zinc-150 hover:bg-white text-zinc-950 rounded text-xs font-mono font-bold tracking-widest uppercase active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Start Workout
                </button>
              )}
            </div>
          </div>

          {/* Detail Canvas Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
            {/* Panel 1: Active Entry Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-mono font-bold text-zinc-300 uppercase tracking-wider">
                  Panel 1 // Active Entry Grid
                </h3>
                {isSessionActive && (
                  <span className="text-xs font-mono text-zinc-500">
                    Adjust parameters to log active sets
                  </span>
                )}
              </div>

              {!isSessionActive ? (
                <div className="bg-zinc-955/50 border border-zinc-900 rounded-lg p-8 text-center space-y-4">
                  <AlertCircle className="h-8 w-8 text-zinc-500 mx-auto" />
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-mono font-bold text-zinc-300 uppercase">Workout Session Inactive</h4>
                    <p className="text-xs font-mono text-zinc-500">You must start a workout session to log active sets, adjust parameters, and track progressive overload.</p>
                  </div>
                  <button
                    disabled={gymSplit === "rest"}
                    onClick={startWorkout}
                    className="px-6 py-3 bg-zinc-150 hover:bg-white text-zinc-950 rounded font-mono font-bold text-xs tracking-widest uppercase active:scale-95 transition-all cursor-pointer disabled:opacity-35"
                  >
                    Start Workout Session
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const activeSets = sessionSets[currentExercise.id] || [];
                    return activeSets.map((set, setIdx) => {
                      const isDone = set.done;
                      const previousDetail = getPreviousSetDetails(currentExercise, setIdx);
                      return (
                        <div
                          key={setIdx}
                          className={`border rounded-lg p-4 bg-zinc-955 transition-all ${
                            isDone ? "border-emerald-900 bg-emerald-950/5" : "border-zinc-900"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                                isDone ? "bg-emerald-950 text-emerald-400" : "bg-zinc-900 text-zinc-450"
                              }`}>
                                SET {setIdx + 1}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-500 uppercase">
                                PREV: {previousDetail}
                              </span>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => handleToggleSetDone(currentExercise.id, setIdx)}
                              className={`px-3 py-1.5 rounded font-mono text-xs font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                                isDone
                                  ? "bg-emerald-500 border-emerald-400 text-black font-extrabold"
                                  : "bg-transparent border-zinc-800 text-zinc-300 hover:border-zinc-600"
                              }`}
                            >
                              {isDone ? "✓ DONE" : "MARK DONE"}
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            {/* Weight Adjuster with large touch targets */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">WEIGHT (KG)</span>
                              <div className="flex items-center bg-black border border-zinc-800 rounded">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSetWeight(currentExercise.id, setIdx, Math.max(0, (set.weight || 0) - 2.5))}
                                  className="px-3.5 py-2.5 text-zinc-400 hover:text-white border-r border-zinc-800 font-mono font-bold active:scale-90 transition-transform cursor-pointer"
                                >
                                  -2.5
                                </button>
                                <input
                                  type="number"
                                  value={set.weight ?? ""}
                                  onChange={(e) => handleUpdateSetWeight(currentExercise.id, setIdx, Number(e.target.value))}
                                  className="w-full bg-transparent text-center font-mono text-sm text-zinc-200 outline-none focus:text-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSetWeight(currentExercise.id, setIdx, (set.weight || 0) + 2.5)}
                                  className="px-3.5 py-2.5 text-zinc-400 hover:text-white border-l border-zinc-800 font-mono font-bold active:scale-90 transition-transform cursor-pointer"
                                >
                                  +2.5
                                </button>
                              </div>
                            </div>

                            {/* Reps Adjuster with large touch targets */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">REPS</span>
                              <div className="flex items-center bg-black border border-zinc-800 rounded">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSetReps(currentExercise.id, setIdx, Math.max(0, (set.reps || 0) - 1))}
                                  className="px-4 py-2.5 text-zinc-400 hover:text-white border-r border-zinc-800 font-mono font-bold active:scale-90 transition-transform cursor-pointer"
                                >
                                  -1
                                </button>
                                <input
                                  type="number"
                                  value={set.reps ?? ""}
                                  onChange={(e) => handleUpdateSetReps(currentExercise.id, setIdx, Number(e.target.value))}
                                  className="w-full bg-transparent text-center font-mono text-sm text-zinc-200 outline-none focus:text-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSetReps(currentExercise.id, setIdx, (set.reps || 0) + 1)}
                                  className="px-4 py-2.5 text-zinc-400 hover:text-white border-l border-zinc-800 font-mono font-bold active:scale-90 transition-transform cursor-pointer"
                                >
                                  +1
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>

            {/* Panel 2: Analytics Matrix */}
            <div className="space-y-8">
              {/* Top Section: 1RM Chart */}
              <div className="space-y-3">
                <h3 className="text-sm font-mono font-bold text-zinc-300 uppercase tracking-wider">
                  Panel 2 // Analytics Matrix
                </h3>
                {render1RMChart(currentExercise)}
              </div>

              {/* Bottom Section: High legibility clean data table */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-zinc-450 uppercase tracking-wider font-semibold block">
                  HISTORICAL DATA MATRIX
                </span>
                <div className="border border-zinc-850 rounded-md overflow-hidden bg-zinc-950">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="border-b border-zinc-850 bg-zinc-900/40 text-zinc-400 font-bold uppercase tracking-wider">
                        <th className="p-3">DATE</th>
                        <th className="p-3 text-center">SETS COMPLETED</th>
                        <th className="p-3 text-center">PEAK WEIGHT</th>
                        <th className="p-3 text-center">PEAK 1RM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/30">
                      {currentExercise.history.map((hist, hidx) => {
                        const setsCompleted = getHistorySetsCompleted(hist);
                        const peakWeight = getHistoryPeakWeight(hist);
                        const peak1RM = getHistory1RM(hist);
                        return (
                          <tr 
                            key={hidx} 
                            className="hover:bg-zinc-900/30 transition-colors odd:bg-transparent even:bg-zinc-900/20"
                          >
                            <td className="p-3 text-zinc-400">{hist.date}</td>
                            <td className="p-3 text-center text-zinc-300 font-semibold">{setsCompleted}</td>
                            <td className="p-3 text-center text-zinc-350">{peakWeight} kg</td>
                            <td className="p-3 text-center text-zinc-100 font-bold">{peak1RM} kg</td>
                          </tr>
                        );
                      })}
                      {currentExercise.history.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-zinc-650 uppercase tracking-widest font-mono text-[10px]">
                            No historical sessions logged.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
