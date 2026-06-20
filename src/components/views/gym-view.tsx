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
import { GymExercise, GymPhoto } from "@/types";

interface GymViewProps {
  gymType: "home" | "commercial" | "both";
  gymSplit: "push" | "pull" | "legs" | "rest";
  updateGymSettings: (fields: { gymType?: "home" | "commercial" | "both"; gymSplit?: "push" | "pull" | "legs" | "rest" }) => void;
  gymExercises: GymExercise[];
  updateGymExercises: (exercises: GymExercise[]) => void;
  gymPhotos: GymPhoto[];
  updateGymPhotos: (photos: GymPhoto[]) => void;
  activeDate: string;
}

export default function GymView({
  gymType,
  gymSplit,
  updateGymSettings,
  gymExercises,
  updateGymExercises,
  gymPhotos,
  updateGymPhotos,
  activeDate
}: GymViewProps) {
  // Input helpers for adding exercises
  const [newExName, setNewExName] = useState("");
  const [newExWeight, setNewExWeight] = useState<number | "">("");
  const [newExReps, setNewExReps] = useState<number | "">("");
  const [newExTarget, setNewExTarget] = useState<number | "">("");

  // Photo helpers
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoLabel, setNewPhotoLabel] = useState("");

  // Log active state
  const [loggingWeights, setLoggingWeights] = useState<Record<string, number>>({});
  const [loggingReps, setLoggingReps] = useState<Record<string, number>>({});

  // Collapse states for charts
  const [expandedCharts, setExpandedCharts] = useState<Record<string, boolean>>({});

  // Exercise Actions
  const handleAddExercise = () => {
    if (!newExName.trim() || newExWeight === "" || newExReps === "" || newExTarget === "") return;
    const newEx: GymExercise = {
      id: "ex_" + Date.now(),
      name: newExName.trim(),
      weight: Number(newExWeight),
      reps: Number(newExReps),
      targetReps: Number(newExTarget),
      history: []
    };
    updateGymExercises([...gymExercises, newEx]);
    setNewExName("");
    setNewExWeight("");
    setNewExReps("");
    setNewExTarget("");
  };

  const handleDeleteExercise = (id: string) => {
    updateGymExercises(gymExercises.filter(ex => ex.id !== id));
  };

  const handleLogSet = (id: string) => {
    const logW = loggingWeights[id] ?? 0;
    const logR = loggingReps[id] ?? 0;
    if (logW <= 0 || logR <= 0) return;

    const updated = gymExercises.map((ex) => {
      if (ex.id === id) {
        // Save current into history and set new values
        const newHistory = [
          { date: activeDate, weight: ex.weight, reps: ex.reps },
          ...ex.history
        ].slice(0, 8); // Keep 8 historical entries max

        // Apply weight upgrade if reps >= targetReps is hit
        let nextWeight = logW;
        if (logR >= ex.targetReps) {
          nextWeight = logW + 2; // Progressive overload increase by +2kg next session
        }

        return {
          ...ex,
          weight: nextWeight,
          reps: logR,
          history: newHistory
        };
      }
      return ex;
    });

    updateGymExercises(updated);
    
    // Clear log input states
    setLoggingWeights(prev => { const c = { ...prev }; delete c[id]; return c; });
    setLoggingReps(prev => { const c = { ...prev }; delete c[id]; return c; });
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
      `}</style>
      
      {/* Gym Settings Selection Header */}
      <div className="rounded-md border border-zinc-800 bg-[#0a0a0a] p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#000000] border border-zinc-800 text-[9px] font-mono tracking-widest text-zinc-500 uppercase font-semibold">
              PRESCRIPTION ENGINE
            </span>
            <h1 className="text-sm font-mono tracking-widest font-bold text-zinc-150 uppercase flex items-center gap-2">
              <Dumbbell className="h-4.5 w-4.5" /> GYM SCHEDULE & WORKOUT CONFIG
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-[#000000] border border-zinc-905 p-1 rounded-md">
            {/* Location */}
            <div className="flex items-center gap-1.5 border-r border-zinc-900 pr-2">
              <MapPin className="h-3 w-3 text-zinc-500" />
              <select
                value={gymType}
                onChange={(e) => updateGymSettings({ gymType: e.target.value as any })}
                className="bg-[#000000] text-[9.5px] font-mono text-zinc-300 outline-none border-none cursor-pointer font-bold uppercase"
              >
                <option value="both">BOTH GYMS</option>
                <option value="home">HOME CAGE</option>
                <option value="commercial">COMMERCIAL</option>
              </select>
            </div>

            {/* Split */}
            <div className="flex items-center gap-1">
              {(["push", "pull", "legs", "rest"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => updateGymSettings({ gymSplit: s })}
                  className={`px-3 py-1 text-[9.5px] font-mono font-bold tracking-wider uppercase rounded transition-all duration-150 active:scale-95 ${
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Exercises */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-4 border-b border-zinc-800">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold">ROUTINE TRACKER</span>
                  <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">
                    ACTIVE {gymSplit} EXERCISES
                  </CardTitle>
                </div>
                <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-bold">
                  {gymExercises.length} Total Exercises
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              {/* List Exercises */}
              <div className="space-y-4">
                {gymExercises.map((ex) => {
                  const loggedW = loggingWeights[ex.id] ?? ex.weight;
                  const loggedR = loggingReps[ex.id] ?? ex.reps;
                  const isUpgraded = ex.reps >= ex.targetReps;
                  const isChartOpen = expandedCharts[ex.id] || false;

                  return (
                    <div key={ex.id} className="group border border-zinc-900 bg-[#000000]/60 p-4 rounded-md flex flex-col gap-3 transition-all hover:border-zinc-800">
                      <div className="flex justify-between items-start border-b border-zinc-900 pb-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2.5">
                            <h3 className="text-xs font-bold font-mono text-zinc-150 uppercase tracking-wide">{ex.name}</h3>
                            <button
                              onClick={() => toggleChart(ex.id)}
                              className="text-zinc-500 hover:text-zinc-300 transition-colors p-0.5"
                              title="Toggle volume progression chart"
                            >
                              <LineChart className={`h-3.5 w-3.5 ${isChartOpen ? "text-zinc-250" : ""}`} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-[8px] font-mono text-zinc-500 uppercase">
                            <span>CURRENT SET: <span className="font-bold text-zinc-300 font-mono">{ex.weight}kg × {ex.reps} reps</span></span>
                            <span>Target: <span className="font-bold text-zinc-450 font-mono">{ex.targetReps} reps</span></span>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleDeleteExercise(ex.id)}
                          className="text-zinc-650 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                        >
                          ×
                        </button>
                      </div>

                      {/* Progressive Overload prescription alert */}
                      {isUpgraded && (
                        <div className="flex items-center gap-2 bg-emerald-950/15 border border-emerald-900/40 rounded px-2.5 py-1.5 text-[9px] font-mono text-emerald-500 uppercase font-semibold animate-slide-in">
                          <Award className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>Overload Target Met! Upgrade weight by +2kg next session (Prescribed: {ex.weight}kg)</span>
                        </div>
                      )}

                      {/* Expandable trend chart */}
                      {isChartOpen && renderTrendChart(ex)}

                      {/* Logging inputs */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-1.5 bg-[#000000] border border-zinc-900 rounded-md px-2 py-1">
                            <span className="text-[8px] font-mono text-zinc-600 uppercase font-bold">KG</span>
                            <input
                              type="number"
                              placeholder={ex.weight.toString()}
                              value={loggingWeights[ex.id] ?? ""}
                              onChange={(e) => setLoggingWeights({ ...loggingWeights, [ex.id]: Number(e.target.value) })}
                              className="w-full bg-transparent text-xs font-mono outline-none text-zinc-200"
                            />
                          </div>
                          <div className="flex items-center gap-1.5 bg-[#000000] border border-zinc-900 rounded-md px-2 py-1">
                            <span className="text-[8px] font-mono text-zinc-600 uppercase font-bold">REPS</span>
                            <input
                              type="number"
                              placeholder={ex.reps.toString()}
                              value={loggingReps[ex.id] ?? ""}
                              onChange={(e) => setLoggingReps({ ...loggingReps, [ex.id]: Number(e.target.value) })}
                              className="w-full bg-transparent text-xs font-mono outline-none text-zinc-200"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => handleLogSet(ex.id)}
                          className="px-3.5 py-1.5 bg-zinc-50 hover:bg-white text-zinc-950 rounded text-[9.5px] font-mono font-bold tracking-widest uppercase transition-all duration-150 active:scale-95 cursor-pointer"
                        >
                          Log Set
                        </button>
                      </div>

                      {/* History badges */}
                      {ex.history.length > 0 && (
                        <div className="space-y-1 mt-1">
                          <span className="text-[8px] font-mono text-zinc-600 uppercase font-semibold tracking-wider">LOG HISTORY:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {ex.history.map((hist, hidx) => (
                              <div key={hidx} className="bg-[#000000] border border-zinc-950 px-2 py-0.5 rounded text-[8px] font-mono text-zinc-400">
                                {hist.date}: {hist.weight}kg × {hist.reps}r
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {gymExercises.length === 0 && (
                  <div className="text-center py-6 text-[10px] font-mono uppercase tracking-widest text-zinc-600 border border-dashed border-zinc-850 rounded animate-pulse">
                    No active gym split logs.
                  </div>
                )}
              </div>

              {/* Add Exercise form */}
              <div className="flex flex-col gap-2 pt-3 border-t border-zinc-900 mt-2">
                <input
                  type="text"
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  placeholder="EXERCISE NAME (e.g. Overhead Press)..."
                  className="bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-700 transition-all"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    value={newExWeight}
                    onChange={(e) => setNewExWeight(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="WEIGHT (KG)..."
                    className="bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-700 transition-all"
                  />
                  <input
                    type="number"
                    value={newExReps}
                    onChange={(e) => setNewExReps(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="REPS..."
                    className="bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-700 transition-all"
                  />
                  <input
                    type="number"
                    value={newExTarget}
                    onChange={(e) => setNewExTarget(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="TARGET REPS..."
                    className="bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-700 transition-all"
                  />
                </div>
                <button
                  onClick={handleAddExercise}
                  className="px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-[9px] tracking-widest uppercase transition-all duration-150 active:scale-95 mt-1 cursor-pointer"
                >
                  Add Exercise
                </button>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Column: Comparative Progress Photos Panel */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-4 border-b border-zinc-800">
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">VISUAL COMPARISON</span>
              <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">
                PROGRESS PHOTOS MATRIX
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              {/* Comparative side-by-side list */}
              <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {gymPhotos.map((photo) => (
                  <div key={photo.id} className="group border border-zinc-900 bg-[#000000]/60 p-2.5 rounded relative flex flex-col gap-2 transition-all hover:border-zinc-805 animate-slide-in">
                    <img 
                      src={photo.url} 
                      alt={photo.label}
                      className="w-full h-28 object-cover rounded bg-zinc-950 border border-zinc-900 grayscale brightness-75 contrast-125 transition-all duration-300 group-hover:grayscale-0 group-hover:brightness-90"
                    />
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="font-bold text-zinc-300 uppercase tracking-wider">{photo.label}</span>
                      <span className="text-zinc-550 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {photo.date}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-4 right-4 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {gymPhotos.length === 0 && (
                  <div className="text-center py-6 text-[9px] font-mono uppercase tracking-widest text-zinc-650 border border-dashed border-zinc-850 rounded animate-pulse">
                    No visual logs.
                  </div>
                )}
              </div>

              {/* Add photo mockup input form */}
              <div className="flex flex-col gap-2 pt-3 border-t border-zinc-900 mt-2">
                <span className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500">MOCK UPLOAD PANEL</span>
                <input
                  type="text"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="IMAGE URL..."
                  className="bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-[10px] font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-700 transition-all"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPhotoLabel}
                    onChange={(e) => setNewPhotoLabel(e.target.value)}
                    placeholder="LABEL (e.g. Current)..."
                    className="flex-grow bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-700 transition-all"
                  />
                  <button
                    onClick={handleAddPhoto}
                    className="px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-[9px] tracking-widest uppercase transition-all duration-150 active:scale-95"
                  >
                    Add
                  </button>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
