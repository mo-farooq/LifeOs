"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Dumbbell, 
  Flame, 
  Calendar, 
  Trophy, 
  Plus,
  X,
  TrendingUp,
  AlertTriangle,
  RotateCcw
} from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  gym: "comm" | "home" | "both";
  day: "push" | "pull" | "legs";
  repMin: number;
  repMax: number;
  step: number;
  startWeight: number;
  bw?: boolean;
}

interface SetLog {
  timestamp: number;
  weight: number;
  reps: number;
}

export default function GymView() {
  const [mounted, setMounted] = useState(false);

  // --- STATE ---
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [logsMap, setLogsMap] = useState<Record<string, SetLog[]>>({});
  const [filterGym, setFilterGym] = useState<"comm" | "home" | "both">("comm");
  const [filterDay, setFilterDay] = useState<"push" | "pull" | "legs">("push");
  const [selectedExId, setSelectedExId] = useState<string | null>(null);

  // Form Inputs
  const [logWeight, setLogWeight] = useState<number>(0);
  const [logReps, setLogReps] = useState<number>(8);

  const [newExName, setNewExName] = useState("");
  const [newExGym, setNewExGym] = useState<"comm" | "home" | "both">("comm");
  const [newExDay, setNewExDay] = useState<"push" | "pull" | "legs">("push");
  const [newExRepMin, setNewExRepMin] = useState(5);
  const [newExRepMax, setNewExRepMax] = useState(8);
  const [newExStep, setNewExStep] = useState(2.5);
  const [newExStartWeight, setNewExStartWeight] = useState(40);
  const [newExBw, setNewExBw] = useState(false);
  const [isAddingEx, setIsAddingEx] = useState(false);

  // Constants
  const DEFAULT_EXERCISES: Exercise[] = [
    { id: "seed_0", name: "Bench press", gym: "comm", day: "push", repMin: 5, repMax: 8, step: 2.5, startWeight: 60 },
    { id: "seed_1", name: "Overhead press", gym: "comm", day: "push", repMin: 5, repMax: 8, step: 2.5, startWeight: 35 },
    { id: "seed_2", name: "Tricep pushdown", gym: "comm", day: "push", repMin: 8, repMax: 12, step: 2.5, startWeight: 25 },
    { id: "seed_3", name: "Pull-ups", gym: "both", day: "pull", repMin: 5, repMax: 10, step: 1.0, startWeight: 0, bw: true },
    { id: "seed_4", name: "Barbell row", gym: "comm", day: "pull", repMin: 6, repMax: 10, step: 2.5, startWeight: 50 },
    { id: "seed_5", name: "Bicep curl", gym: "comm", day: "pull", repMin: 8, repMax: 12, step: 1.25, startWeight: 15 },
    { id: "seed_6", name: "Back squat", gym: "comm", day: "legs", repMin: 5, repMax: 8, step: 5.0, startWeight: 80 },
    { id: "seed_7", name: "Romanian deadlift", gym: "comm", day: "legs", repMin: 6, repMax: 10, step: 5.0, startWeight: 60 },
    { id: "seed_8", name: "Leg press", gym: "comm", day: "legs", repMin: 8, repMax: 12, step: 5.0, startWeight: 100 }
  ];

  // Lifecycle
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const savedState = localStorage.getItem("po_coach_v1");
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setExercises(parsed.exercises || DEFAULT_EXERCISES);
        setLogsMap(parsed.logs || {});
        setFilterGym(parsed.filterGym || "comm");
        setFilterDay(parsed.filterDay || "push");
        setSelectedExId(parsed.selectedExId || null);
      } else {
        setExercises(DEFAULT_EXERCISES);
        localStorage.setItem("po_coach_v1", JSON.stringify({
          exercises: DEFAULT_EXERCISES,
          logs: {},
          filterGym: "comm",
          filterDay: "push",
          selectedExId: null
        }));
      }
    }
  }, [mounted]);

  // Synchronize helper
  const syncState = (updatedExs: Exercise[], updatedLogs: Record<string, SetLog[]>, gym: typeof filterGym, day: typeof filterDay, currentExId: string | null) => {
    setExercises(updatedExs);
    setLogsMap(updatedLogs);
    setFilterGym(gym);
    setFilterDay(day);
    setSelectedExId(currentExId);
    localStorage.setItem("po_coach_v1", JSON.stringify({
      exercises: updatedExs,
      logs: updatedLogs,
      filterGym: gym,
      filterDay: day,
      selectedExId: currentExId
    }));
  };

  // Filter Exercises
  const filteredExercises = exercises.filter(
    (e) => (e.gym === filterGym || e.gym === "both") && e.day === filterDay
  );

  const activeEx = filteredExercises.find((e) => e.id === selectedExId) || filteredExercises[0] || null;

  // Sync log inputs on active exercise changes or prescription calculation
  useEffect(() => {
    if (activeEx) {
      const logs = logsMap[activeEx.id] || [];
      const rx = getPrescription(activeEx, logs);
      if (rx) {
        setLogWeight(rx.weight);
        setLogReps(rx.reps);
      } else {
        setLogWeight(activeEx.bw ? 0 : activeEx.startWeight);
        setLogReps(activeEx.repMin);
      }
    }
  }, [selectedExId, activeEx, logsMap]);

  // Helper calculation rounder
  const roundToStep = (val: number, step: number) => {
    return Math.round(val / step) * step;
  };

  // --- PRESCRIPTION ENGINE ---
  // Calculates weight & reps for next set based on previous logged session logs
  interface Prescription {
    type: "up" | "hold" | "down";
    weight: number;
    reps: number;
    tag: string;
    reason: string;
  }

  const getPrescription = (ex: Exercise, logs: SetLog[]): Prescription | null => {
    if (!logs || logs.length === 0) return null;
    const last = logs[logs.length - 1];
    const { weight, reps } = last;
    const { repMin, repMax, step, bw } = ex;
    
    // Default threshold is min of 8 or repMax
    const upgradeAt = Math.min(8, repMax);

    // Stuck check: count consecutive logs at this weight
    let stuckCount = 0;
    for (let i = logs.length - 1; i >= 0; i--) {
      if (logs[i].weight === weight) stuckCount++;
      else break;
    }

    // Bodyweight movements
    if (bw) {
      if (reps >= upgradeAt) {
        return {
          type: "up",
          weight: 0,
          reps: reps + 1,
          tag: "PUSH FOR MORE",
          reason: `${reps} reps recorded last session. Target is now ${reps + 1} reps.`
        };
      }
      if (reps >= repMin) {
        return {
          type: "hold",
          weight: 0,
          reps: reps + 1,
          tag: "ADD A REP",
          reason: `${reps} reps recorded last session. Push for ${reps + 1} next workout.`
        };
      }
      return {
        type: "hold",
        weight: 0,
        reps: repMin,
        tag: "REPEAT",
        reason: `${reps} reps fell short of target (${repMin}). Repeat set window.`
      };
    }

    // Stuck check trigger: 3 consecutive sets without progress -> Deload
    if (stuckCount >= 3 && reps < repMin) {
      const deloadWeight = roundToStep(weight * 0.9, step);
      return {
        type: "down",
        weight: deloadWeight,
        reps: repMax,
        tag: "DELOAD PRESCRIBED",
        reason: `Stuck at ${weight} units for ${stuckCount} sessions. Drop weight by 10% to reset form.`
      };
    }

    // Target rep threshold matched -> Add weight
    if (reps >= upgradeAt) {
      return {
        type: "up",
        weight: weight + step,
        reps: repMin,
        tag: "UPGRADE WEIGHT",
        reason: `Hit target ${reps} reps. Upgrade weight by +${step} units. Target ${repMin} reps.`
      };
    }

    // Inside target window -> Push reps
    if (reps >= repMin && reps < upgradeAt) {
      return {
        type: "hold",
        weight: weight,
        reps: reps + 1,
        tag: "ADD A REP",
        reason: `${reps} reps logged. Stay at ${weight} units and push for ${reps + 1} reps next session.`
      };
    }

    // Below rep target range -> Repeat
    return {
      type: "hold",
      weight: weight,
      reps: repMin,
      tag: "REPEAT WEIGHT",
      reason: `Logged ${reps} reps. Repeat ${weight} units until you can complete ${repMin}+ clean.`
    };
  };

  const rx = activeEx ? getPrescription(activeEx, logsMap[activeEx.id] || []) : null;

  // --- ACTIONS ---
  const handleLogSet = () => {
    if (!activeEx) return;

    const newLog: SetLog = {
      timestamp: Date.now(),
      weight: activeEx.bw ? 0 : logWeight,
      reps: logReps
    };

    const exLogs = logsMap[activeEx.id] || [];
    const updatedLogs = {
      ...logsMap,
      [activeEx.id]: [...exLogs, newLog]
    };

    syncState(exercises, updatedLogs, filterGym, filterDay, activeEx.id);
  };

  const handleDeleteLog = (timestamp: number) => {
    if (!activeEx) return;
    const exLogs = logsMap[activeEx.id] || [];
    const updatedLogs = {
      ...logsMap,
      [activeEx.id]: exLogs.filter(l => l.timestamp !== timestamp)
    };
    syncState(exercises, updatedLogs, filterGym, filterDay, activeEx.id);
  };

  const handleClearLogs = () => {
    if (!activeEx) return;
    const updatedLogs = {
      ...logsMap,
      [activeEx.id]: []
    };
    syncState(exercises, updatedLogs, filterGym, filterDay, activeEx.id);
  };

  const handleAddExercise = () => {
    if (!newExName.trim()) return;

    const newEx: Exercise = {
      id: "custom_ex_" + Date.now(),
      name: newExName.trim(),
      gym: newExGym,
      day: newExDay,
      repMin: newExRepMin,
      repMax: newExRepMax,
      step: newExStep,
      startWeight: newExStartWeight,
      bw: newExBw
    };

    const updated = [...exercises, newEx];
    syncState(updated, logsMap, filterGym, filterDay, newEx.id);

    // Clear and toggle
    setNewExName("");
    setIsAddingEx(false);
  };

  if (!mounted) {
    return null;
  }

  // Active exercises logs
  const activeLogs = activeEx ? (logsMap[activeEx.id] || []) : [];

  return (
    <div className="space-y-4 text-zinc-200">
      
      {/* Header with quick location & split selectors */}
      <div className="rounded-md border border-zinc-800 bg-[#0a0a0a] p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#000000] border border-zinc-800 text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
              WORKOUTS // COACH
            </div>
            <h1 className="text-xl font-mono uppercase tracking-wider font-bold text-zinc-150 flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-zinc-300" /> PROGRESSIVE OVERLOAD CONSOLE
            </h1>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wide">
              Calculate prescriptive weight increases and stuck deload benchmarks automatically.
            </p>
          </div>

          <button 
            onClick={() => setIsAddingEx(!isAddingEx)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-[10px] tracking-wider transition-all uppercase"
          >
            <Plus className="h-3.5 w-3.5" /> Add Exercise
          </button>
        </div>

        {/* Location & Day Selection (Monochrome buttons) */}
        <div className="flex flex-wrap gap-4 pt-1.5 border-t border-zinc-900">
          <div className="flex rounded-md border border-zinc-850 p-0.5 bg-[#000000]">
            {[
              { id: "comm" as const, label: "COMMERCIAL" },
              { id: "home" as const, label: "HOME" },
              { id: "both" as const, label: "BOTH" }
            ].map(g => (
              <button
                key={g.id}
                onClick={() => syncState(exercises, logsMap, g.id, filterDay, null)}
                className={`px-3 py-1 rounded text-[9px] font-mono font-semibold tracking-wider uppercase transition-colors ${
                  filterGym === g.id 
                    ? "bg-[#0a0a0a] border border-zinc-800 text-zinc-100" 
                    : "text-zinc-500 hover:text-zinc-350"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="flex rounded-md border border-zinc-850 p-0.5 bg-[#000000]">
            {[
              { id: "push" as const, label: "PUSH split" },
              { id: "pull" as const, label: "PULL split" },
              { id: "legs" as const, label: "LEGS split" }
            ].map(d => (
              <button
                key={d.id}
                onClick={() => syncState(exercises, logsMap, filterGym, d.id, null)}
                className={`px-3 py-1 rounded text-[9px] font-mono font-semibold tracking-wider uppercase transition-colors ${
                  filterDay === d.id 
                    ? "bg-[#0a0a0a] border border-zinc-800 text-zinc-100" 
                    : "text-zinc-500 hover:text-zinc-350"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add Exercise Panel */}
      {isAddingEx && (
        <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md p-4">
          <CardHeader className="p-0 pb-3 mb-3 border-b border-zinc-800">
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">EXERCISE WIZARD</span>
            <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase">Create New Movement</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-mono text-zinc-500 uppercase">Movement Name</label>
                <input
                  type="text"
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  placeholder="e.g. Incline Bench Press..."
                  className="w-full bg-transparent border border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-mono text-zinc-500 uppercase">Window Setup</label>
                <div className="flex gap-2">
                  <select
                    value={newExGym}
                    onChange={(e) => setNewExGym(e.target.value as any)}
                    className="flex-1 bg-[#000000] border border-zinc-800 rounded px-2 py-1.5 text-xs font-mono text-zinc-400 outline-none"
                  >
                    <option value="comm">COMMERCIAL</option>
                    <option value="home">HOME</option>
                    <option value="both">BOTH</option>
                  </select>
                  <select
                    value={newExDay}
                    onChange={(e) => setNewExDay(e.target.value as any)}
                    className="flex-1 bg-[#000000] border border-zinc-800 rounded px-2 py-1.5 text-xs font-mono text-zinc-400 outline-none"
                  >
                    <option value="push">PUSH</option>
                    <option value="pull">PULL</option>
                    <option value="legs">LEGS</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="space-y-1">
                <label className="text-[8px] font-mono text-zinc-500 uppercase">Min Reps</label>
                <input
                  type="number"
                  value={newExRepMin}
                  onChange={(e) => setNewExRepMin(Number(e.target.value))}
                  className="w-full bg-transparent border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-zinc-200 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-mono text-zinc-500 uppercase">Max Reps</label>
                <input
                  type="number"
                  value={newExRepMax}
                  onChange={(e) => setNewExRepMax(Number(e.target.value))}
                  className="w-full bg-transparent border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-zinc-200 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-mono text-zinc-500 uppercase">Step Increase</label>
                <input
                  type="number"
                  step="0.5"
                  value={newExStep}
                  onChange={(e) => setNewExStep(Number(e.target.value))}
                  className="w-full bg-transparent border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-zinc-200 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-mono text-zinc-500 uppercase">Start Weight</label>
                <input
                  type="number"
                  value={newExStartWeight}
                  onChange={(e) => setNewExStartWeight(Number(e.target.value))}
                  disabled={newExBw}
                  className="w-full bg-transparent border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-zinc-200 outline-none disabled:opacity-40"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="newExBw"
                checked={newExBw}
                onChange={(e) => setNewExBw(e.target.checked)}
                className="w-3.5 h-3.5 border border-zinc-800 rounded-sm bg-transparent"
              />
              <label htmlFor="newExBw" className="text-[9px] font-mono text-zinc-400 uppercase cursor-pointer">
                Bodyweight exercise (tracks reps only)
              </label>
            </div>
          </CardContent>
          <CardFooter className="p-0 pt-3 border-t border-zinc-900 mt-3 flex justify-end gap-2">
            <button
              onClick={() => setIsAddingEx(false)}
              className="px-3 py-1.5 rounded-md border border-zinc-800 bg-[#000000] text-zinc-400 hover:text-zinc-200 font-mono text-[9px] tracking-wider uppercase"
            >
              Cancel
            </button>
            <button
              onClick={handleAddExercise}
              className="px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-[9px] tracking-wider uppercase"
            >
              Save Exercise
            </button>
          </CardFooter>
        </Card>
      )}

      {/* Main Grid View */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* Left Side: Exercises List (col-span-12 lg:col-span-4) */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-4 border-b border-zinc-800">
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">PROGRAM MOVEMENTS</span>
              <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase">ACTIVE SPLIT LIST</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-1 max-h-[360px] overflow-y-auto pr-1">
                {filteredExercises.map((e) => {
                  const isActive = activeEx?.id === e.id;
                  const logs = logsMap[e.id] || [];
                  const lastLog = logs[logs.length - 1];

                  return (
                    <button
                      key={e.id}
                      onClick={() => syncState(exercises, logsMap, filterGym, filterDay, e.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-md border text-left transition-all ${
                        isActive 
                          ? "bg-[#000000] border-zinc-700 text-zinc-100" 
                          : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-[#000000]/30"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-mono font-semibold">{e.name}</p>
                        <p className="text-[9px] font-mono text-zinc-500 uppercase">
                          TARGET: {e.repMin}-{e.repMax} REPS
                        </p>
                      </div>

                      <div className="text-right">
                        {lastLog ? (
                          <>
                            <p className="text-xs font-mono font-bold text-zinc-300">
                              {e.bw ? "" : `${lastLog.weight} `}{e.bw ? `${lastLog.reps} Reps` : `× ${lastLog.reps}`}
                            </p>
                            <p className="text-[8px] font-mono text-zinc-600 uppercase">LOGGED</p>
                          </>
                        ) : (
                          <p className="text-[9px] font-mono text-zinc-600 uppercase">NO LOGS</p>
                        )}
                      </div>
                    </button>
                  );
                })}

                {filteredExercises.length === 0 && (
                  <div className="text-center py-6 text-[9px] font-mono uppercase tracking-widest text-zinc-650 border border-dashed border-zinc-800 rounded">
                    No movements in split.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Active Workout Panel (col-span-12 lg:col-span-8) */}
        <div className="col-span-12 lg:col-span-8">
          {activeEx ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Prescription Engine block */}
              <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md p-4 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="border-b border-zinc-800 pb-2 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">PRESCRIPTION METRIC</span>
                      <h3 className="text-xs font-mono font-bold text-zinc-100 uppercase">{activeEx.name}</h3>
                    </div>
                    {activeEx.bw && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-zinc-800 bg-[#000000] text-zinc-400">BODYWEIGHT</span>
                    )}
                  </div>

                  {/* Calculations details */}
                  <div className="space-y-2 font-mono text-[10px] text-zinc-500 uppercase tracking-widest pt-1">
                    <div className="flex justify-between">
                      <span>Target Reps:</span>
                      <span className="text-zinc-350">{activeEx.repMin}-{activeEx.repMax} Reps</span>
                    </div>
                    {!activeEx.bw && (
                      <>
                        <div className="flex justify-between">
                          <span>Increment Step:</span>
                          <span className="text-zinc-350">+{activeEx.step} units</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Starter Weight:</span>
                          <span className="text-zinc-350">{activeEx.startWeight} units</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Prescription Output block */}
                  <div className="border border-zinc-800 rounded bg-[#000000] p-3 space-y-2.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[8px] font-mono text-zinc-500 uppercase font-bold">PRESCRIBED SET</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-zinc-850 bg-zinc-950 text-zinc-300 font-bold">
                        {rx ? rx.tag : "FIRST SESSION"}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-xl font-mono font-bold text-zinc-50">
                        {rx ? (
                          activeEx.bw ? `${rx.reps} reps` : `${rx.weight} units × ${rx.reps} reps`
                        ) : (
                          activeEx.bw ? `${activeEx.repMin} reps` : `${activeEx.startWeight} units × ${activeEx.repMin} reps`
                        )}
                      </div>
                      <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mt-1">
                        {rx ? rx.reason : "Log your first set to start overload prescriptions."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Log form fields */}
                <div className="space-y-3 pt-3 border-t border-zinc-900">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[8px] font-mono text-zinc-500 uppercase">Weight</label>
                      <input 
                        type="number"
                        value={logWeight}
                        onChange={(e) => setLogWeight(Number(e.target.value))}
                        disabled={activeEx.bw}
                        className="w-full bg-transparent border border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono text-zinc-200 outline-none disabled:opacity-40"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-mono text-zinc-500 uppercase">Reps</label>
                      <input 
                        type="number"
                        value={logReps}
                        onChange={(e) => setLogReps(Number(e.target.value))}
                        className="w-full bg-transparent border border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono text-zinc-200 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleLogSet}
                    className="w-full py-2.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-[10px] tracking-wider uppercase transition-all"
                  >
                    Log Set Done
                  </button>
                </div>
              </Card>

              {/* History logs block */}
              <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md p-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="border-b border-zinc-800 pb-2 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">HISTORY LOGS</span>
                      <h3 className="text-xs font-mono font-bold text-zinc-100 uppercase">PERFORMANCE LEDGER</h3>
                    </div>

                    {activeLogs.length > 0 && (
                      <button 
                        onClick={handleClearLogs}
                        className="text-[8px] font-mono text-rose-500 hover:text-rose-400 uppercase tracking-widest flex items-center gap-1"
                      >
                        <RotateCcw className="h-3 w-3" /> Clear
                      </button>
                    )}
                  </div>

                  {/* Logs list */}
                  <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                    {activeLogs.map((log, idx) => (
                      <div 
                        key={log.timestamp} 
                        className="group flex justify-between items-center px-3 py-2 border border-zinc-900 bg-[#000000]/60 hover:bg-[#0a0a0a] rounded text-[10px] font-mono"
                      >
                        <div className="space-y-0.5">
                          <span className="text-zinc-500">#{activeLogs.length - idx}</span>
                          <span className="text-zinc-650 ml-1.5">
                            {new Date(log.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-250">
                            {activeEx.bw ? "" : `${log.weight} × `}{log.reps} reps
                          </span>
                          
                          <button 
                            onClick={() => handleDeleteLog(log.timestamp)}
                            className="text-zinc-600 hover:text-zinc-250 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}

                    {activeLogs.length === 0 && (
                      <div className="text-center py-8 text-[9px] font-mono uppercase tracking-widest text-zinc-650 border border-dashed border-zinc-800 rounded">
                        No history records registered.
                      </div>
                    )}
                  </div>
                </div>
              </Card>

            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-zinc-800 rounded-md bg-[#0a0a0a] text-[10px] font-mono uppercase tracking-widest text-zinc-600">
              No exercise selected. Select or add one.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
