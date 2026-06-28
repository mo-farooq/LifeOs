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

  // Collapse states for charts
  const [expandedCharts, setExpandedCharts] = useState<Record<string, boolean>>({});

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

  const toggleChart = (id: string) => {
    setExpandedCharts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Pure SVG Trend Line generator
  const renderTrendChart = (ex: GymExercise) => {
    // Collect all history plus the current set as data points
    const dataPoints = [
      ...ex.history.map(h => ({ date: h.date, volume: h.weight * h.reps })),
      { date: activeDate, volume: ex.weight * ex.reps }
    ].reverse(); // Sort chronologically (oldest to newest)

    if (dataPoints.length < 2) {
      return (
        <div className="py-4 text-center text-[9px] font-mono text-zinc-600 uppercase tracking-widest border border-dashed border-zinc-900 rounded">
          More historical data required to render overload trend.
        </div>
      );
    }

    const width = 360;
    const height = 100;
    const paddingLeft = 40;
    const paddingRight = 15;
    const paddingTop = 15;
    const paddingBottom = 20;

    const drawWidth = width - paddingLeft - paddingRight;
    const drawHeight = height - paddingTop - paddingBottom;

    const volumes = dataPoints.map(d => d.volume);
    const minVol = Math.max(0, Math.min(...volumes) * 0.95);
    const maxVol = Math.max(...volumes) * 1.05;
    const volDiff = maxVol - minVol || 1;

    // Calculate chart coordinates
    const pointsCoords = dataPoints.map((dp, idx) => {
      const x = paddingLeft + (idx / (dataPoints.length - 1)) * drawWidth;
      const y = paddingTop + drawHeight - ((dp.volume - minVol) / volDiff) * drawHeight;
      return { x, y, val: dp.volume, label: dp.date.slice(5) }; // MM-DD
    });

    let pathD = `M ${pointsCoords[0].x} ${pointsCoords[0].y}`;
    for (let i = 1; i < pointsCoords.length; i++) {
      pathD += ` L ${pointsCoords[i].x} ${pointsCoords[i].y}`;
    }

    return (
      <div className="bg-[#000000] border border-zinc-900 rounded-md p-3.5 space-y-2 relative overflow-hidden animate-slide-in">
        <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
          <span>PROGRESSIVE VOLUME TREND (WEIGHT × REPS)</span>
          <span>CURR: {ex.weight * ex.reps} kg·reps</span>
        </div>
        
        <div className="w-full overflow-x-auto pr-1">
          <svg className="w-full min-w-[340px] h-28" viewBox={`0 0 ${width} ${height}`}>
            {/* Horizontal Grid lines */}
            <line x1={paddingLeft} y1={paddingTop} x2={width - paddingRight} y2={paddingTop} className="stroke-zinc-950 stroke-[1]" />
            <line x1={paddingLeft} y1={paddingTop + drawHeight / 2} x2={width - paddingRight} y2={paddingTop + drawHeight / 2} className="stroke-zinc-950 stroke-[1]" />
            <line x1={paddingLeft} y1={paddingTop + drawHeight} x2={width - paddingRight} y2={paddingTop + drawHeight} className="stroke-zinc-900 stroke-[1]" />

            {/* Y Axis Labels */}
            <text x={paddingLeft - 8} y={paddingTop + 3} className="text-[7.5px] fill-zinc-550 font-mono font-bold" textAnchor="end">{Math.round(maxVol)}</text>
            <text x={paddingLeft - 8} y={paddingTop + drawHeight / 2 + 3} className="text-[7.5px] fill-zinc-550 font-mono font-bold" textAnchor="end">{Math.round((maxVol + minVol) / 2)}</text>
            <text x={paddingLeft - 8} y={paddingTop + drawHeight + 3} className="text-[7.5px] fill-zinc-550 font-mono font-bold" textAnchor="end">{Math.round(minVol)}</text>

            {/* Trend Line Path */}
            <path
              d={pathD}
              className="fill-none stroke-zinc-100 stroke-[2] transition-all duration-500"
            />

            {/* Data Point Nodes */}
            {pointsCoords.map((pt, idx) => (
              <g key={idx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="2.5"
                  className="fill-zinc-950 stroke-zinc-200 stroke-[1.5] cursor-pointer hover:scale-125 transition-transform"
                />
                {/* Node tooltips value text */}
                <text
                  x={pt.x}
                  y={pt.y - 7}
                  className="text-[6.5px] fill-zinc-250 font-mono font-bold text-center"
                  textAnchor="middle"
                >
                  {pt.val}
                </text>
                {/* X axis labels (date) */}
                <text
                  x={pt.x}
                  y={height - 4}
                  className="text-[6.5px] fill-zinc-550 font-mono font-semibold"
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
      <div className="rounded-md border border-zinc-800 bg-[#0a0a0a] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Exercises */}
        {showWorkoutSplit && (
          <div className={`${leftSpan} space-y-6`}>
            <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-6 border-b border-zinc-800">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 font-bold">ROUTINE TRACKER</span>
                  <CardTitle className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-widest">
                    ACTIVE {gymSplit} EXERCISES
                  </CardTitle>
                </div>
                <div className="text-xs font-mono text-zinc-550 uppercase tracking-wider font-bold">
                  {gymExercises.length} Total Exercises
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">

              {/* Live Workout Session Banner */}
              <div className="border border-zinc-900 bg-[#000000] p-4.5 rounded-md flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-550 font-bold">WORKOUT SESSION</span>
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
              
              {/* List Exercises */}
              <div className="space-y-6">
                {gymExercises.map((ex) => {
                  const isUpgraded = isSessionActive 
                    ? sessionSets[ex.id]?.some(s => s.done && s.reps >= ex.targetReps)
                    : ex.reps >= ex.targetReps;
                  const isChartOpen = expandedCharts[ex.id] || false;
                  const activeSets = sessionSets[ex.id] || getPreviewSets(ex);

                  return (
                    <div key={ex.id} className="group border border-zinc-900 bg-[#000000]/60 p-6 rounded-md flex flex-col gap-3 transition-all hover:border-zinc-800 animate-slide-in">
                      <div className="flex justify-between items-start border-b border-zinc-900 pb-2.5">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <h3 className="text-sm font-bold font-mono text-zinc-150 uppercase tracking-wide">{ex.name}</h3>
                            <span className="text-xs text-zinc-500 font-mono tracking-wider">
                              [PR: {calculatePR(ex)}KG // 1RM: {calculate1RM(ex)}KG]
                            </span>
                            <button
                              onClick={() => toggleChart(ex.id)}
                              className="text-zinc-500 hover:text-zinc-350 transition-colors p-0.5 animate-fade-in"
                              title="Toggle volume progression chart"
                            >
                              <LineChart className={`h-4 w-4 ${isChartOpen ? "text-zinc-250" : ""}`} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2.5 text-xs font-mono text-zinc-550 uppercase">
                            <span>CURRENT SET: <span className="font-bold text-zinc-300 font-mono">{ex.weight}kg × {ex.reps} reps</span></span>
                            <span>Target: <span className="font-bold text-zinc-455 font-mono">{ex.targetReps} reps</span></span>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleDeleteExercise(ex.id)}
                          className="text-zinc-655 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-sm font-bold"
                        >
                          ×
                        </button>
                      </div>

                      {/* Progressive Overload prescription alert */}
                      {isUpgraded && (
                        <div className="flex items-center gap-2.5 bg-emerald-950/15 border border-emerald-900/40 rounded px-3 py-2 text-xs font-mono text-emerald-500 uppercase font-semibold animate-slide-in">
                          <Award className="h-4 w-4 flex-shrink-0" />
                          <span>Overload Target Met! Upgrade weight by +2kg next session (Prescribed: {ex.weight}kg)</span>
                        </div>
                      )}

                      {/* Expandable trend chart */}
                      {isChartOpen && renderTrendChart(ex)}

                      {/* Multi-Set table */}
                      <div className="overflow-x-auto border border-zinc-900 rounded-md bg-[#000000]/30 p-3.5">
                        <table className="w-full text-left border-collapse text-xs font-mono">
                          <thead>
                            <tr className="border-b border-zinc-900 text-zinc-500">
                              <th className="py-1 px-1 font-bold uppercase tracking-wider text-[10px] text-zinc-600">SET</th>
                              <th className="py-1 px-1 font-bold uppercase tracking-wider text-[10px] text-zinc-600">PREVIOUS</th>
                              <th className="py-1 px-1 font-bold uppercase tracking-wider text-[10px] text-zinc-600 w-24">KG</th>
                              <th className="py-1 px-1 font-bold uppercase tracking-wider text-[10px] text-zinc-600 w-24">REPS</th>
                              <th className="py-1 px-1 font-bold uppercase tracking-wider text-[10px] text-center text-zinc-600 w-20">STATUS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeSets.map((set, setIdx) => {
                              const isDone = set.done;
                              const previousDetail = getPreviousSetDetails(ex, setIdx);
                              return (
                                <tr key={setIdx} className={`border-b border-zinc-950 last:border-0 ${isDone ? "opacity-30" : ""}`}>
                                  <td className="py-2.5 px-1.5 text-zinc-550 font-bold">{setIdx + 1}</td>
                                  <td className="py-2.5 px-1.5 text-zinc-600">{previousDetail}</td>
                                  <td className="py-1 px-1">
                                    <input
                                      type="number"
                                      disabled={isDone || !isSessionActive}
                                      value={set.weight || ""}
                                      placeholder={ex.weight.toString()}
                                      onChange={(e) => handleUpdateSetWeight(ex.id, setIdx, Number(e.target.value))}
                                      className="w-20 bg-[#000000] border border-zinc-900 disabled:border-transparent disabled:bg-transparent rounded px-2.5 py-1.5 text-center text-sm text-zinc-200 focus:border-zinc-700 outline-none transition-all"
                                    />
                                  </td>
                                  <td className="py-1 px-1">
                                    <input
                                      type="number"
                                      disabled={isDone || !isSessionActive}
                                      value={set.reps || ""}
                                      placeholder={ex.targetReps.toString()}
                                      onChange={(e) => handleUpdateSetReps(ex.id, setIdx, Number(e.target.value))}
                                      className="w-20 bg-[#000000] border border-zinc-900 disabled:border-transparent disabled:bg-transparent rounded px-2.5 py-1.5 text-center text-sm text-zinc-200 focus:border-zinc-700 outline-none transition-all"
                                    />
                                  </td>
                                  <td className="py-1 px-1 text-center flex justify-center items-center">
                                    <button
                                      type="button"
                                      disabled={!isSessionActive}
                                      onClick={() => handleToggleSetDone(ex.id, setIdx)}
                                      className={`w-5.5 h-5.5 rounded-sm border flex items-center justify-center transition-all ${
                                        isDone
                                          ? "bg-zinc-50 border-zinc-150 text-black"
                                          : "bg-transparent border-zinc-800 hover:border-zinc-600 text-transparent"
                                      } ${!isSessionActive ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                                    >
                                      {isDone && (
                                        <svg className="w-3.5 h-3.5 stroke-[4.0] text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* History badges */}
                      {ex.history.length > 0 && (
                        <div className="space-y-1.5 mt-1.5">
                          <span className="text-xs font-mono text-zinc-650 uppercase font-semibold tracking-wider">LOG HISTORY:</span>
                          <div className="flex flex-wrap gap-2">
                            {ex.history.map((hist, hidx) => (
                              <div key={hidx} className="bg-[#000000] border border-zinc-955 px-3 py-1 rounded text-xs font-mono text-zinc-400">
                                {hist.date}: {hist.weight}kg × {hist.reps}r
                                {hist.sets && (
                                  <span className="text-zinc-600 ml-1.5">
                                    ({hist.sets.map(s => `${s.weight}x${s.reps}`).join(", ")})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {gymExercises.length === 0 && (
                  <div className="text-center py-6 text-xs font-mono uppercase tracking-widest text-zinc-650 border border-dashed border-zinc-850 rounded animate-pulse">
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
          <div className={`${rightSpan} space-y-6`}>
            <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-6 border-b border-zinc-800">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">VISUAL COMPARISON</span>
              <CardTitle className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-widest">
                PROGRESS PHOTOS MATRIX
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
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
                  <div className="text-center py-6 text-xs font-mono uppercase tracking-widest text-zinc-650 border border-dashed border-zinc-850 rounded animate-pulse">
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
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    value={newPhotoLabel}
                    onChange={(e) => setNewPhotoLabel(e.target.value)}
                    placeholder="LABEL (e.g. Current)..."
                    className="h-12 flex-grow bg-transparent border border-zinc-800 rounded-md px-4 text-sm font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400 bg-black/40 transition-all focus:outline-none"
                  />
                  <button
                    onClick={handleAddPhoto}
                    className="h-12 px-6 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-xs tracking-widest uppercase transition-all duration-100 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 flex-shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>

            </CardContent>
          </Card>
          </div>
        )}

      </div>
    </div>
  );
}
