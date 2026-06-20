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
  MapPin
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

  return (
    <div className="space-y-4 text-zinc-200">
      
      {/* Gym Settings & splits Selection Header */}
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

          <div className="flex flex-wrap items-center gap-3 bg-[#000000] border border-zinc-900 p-1 rounded-md">
            {/* Gym Location Selector */}
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

            {/* Split selector */}
            <div className="flex items-center gap-1">
              {(["push", "pull", "legs", "rest"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => updateGymSettings({ gymSplit: s })}
                  className={`px-3 py-1 text-[9.5px] font-mono font-bold tracking-wider uppercase rounded transition-all duration-150 ${
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
        
        {/* Left Column: Workout Routine List (8 cols) */}
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
              <div className="space-y-3.5">
                {gymExercises.map((ex) => {
                  const loggedW = loggingWeights[ex.id] ?? ex.weight;
                  const loggedR = loggingReps[ex.id] ?? ex.reps;
                  const isUpgraded = ex.reps >= ex.targetReps;

                  return (
                    <div key={ex.id} className="group border border-zinc-900 bg-[#000000]/60 p-4 rounded-md flex flex-col gap-3">
                      <div className="flex justify-between items-start border-b border-zinc-900 pb-2">
                        <div className="space-y-0.5">
                          <h3 className="text-xs font-bold font-mono text-zinc-150 uppercase tracking-wide">{ex.name}</h3>
                          <div className="flex items-center gap-2 text-[8px] font-mono text-zinc-500 uppercase">
                            <span>CURRENT SET: <span className="font-bold text-zinc-300 font-mono">{ex.weight}kg × {ex.reps} reps</span></span>
                            <span>Target: <span className="font-bold text-zinc-400 font-mono">{ex.targetReps} reps</span></span>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleDeleteExercise(ex.id)}
                          className="text-zinc-650 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>

                      {/* Progressive Overload prescriptions */}
                      {isUpgraded && (
                        <div className="flex items-center gap-2 bg-emerald-950/15 border border-emerald-900/40 rounded px-2.5 py-1.5 text-[9px] font-mono text-emerald-500 uppercase font-semibold">
                          <Award className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>Overload Target Met! Upgrade weight by +2kg next session (Prescribed: {ex.weight}kg)</span>
                        </div>
                      )}

                      {/* Logging input row */}
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
                          className="px-3.5 py-1.5 bg-zinc-50 hover:bg-white text-zinc-950 rounded text-[9.5px] font-mono font-bold tracking-widest uppercase transition-all"
                        >
                          Log Set
                        </button>
                      </div>

                      {/* Render history logs */}
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
                  <div className="text-center py-6 text-[10px] font-mono uppercase tracking-widest text-zinc-600 border border-dashed border-zinc-850 rounded">
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
                  className="px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-[9px] tracking-widest uppercase transition-all mt-1"
                >
                  Add Exercise
                </button>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Column: Comparative Progress Photos Panel (4 cols) */}
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
                  <div key={photo.id} className="group border border-zinc-900 bg-[#000000]/60 p-2.5 rounded relative flex flex-col gap-2">
                    <img 
                      src={photo.url} 
                      alt={photo.label}
                      className="w-full h-28 object-cover rounded bg-zinc-950 border border-zinc-900 grayscale brightness-75 contrast-125"
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
                  <div className="text-center py-6 text-[9px] font-mono uppercase tracking-widest text-zinc-650 border border-dashed border-zinc-850 rounded">
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
                    className="px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-[9px] tracking-widest uppercase transition-all"
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
