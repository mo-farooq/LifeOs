"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Heart, 
  Moon, 
  Droplet, 
  Apple, 
  Activity, 
  Plus, 
  Minus,
  X,
  PlusCircle,
  AlertTriangle,
  Flame,
  Check
} from "lucide-react";

interface Supplement {
  id: string;
  name: string;
  dose: string;
  window: "morning" | "lunch" | "evening" | "anytime";
  note: string;
}

interface ActiveSubstance {
  id: string;
  name: string;
  dose: number;
  unit: string;
  mlPerUnit: number;
}

export default function HealthView() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Rollover logic (6 AM)
  const getActiveDate = (time: Date) => {
    const d = new Date(time);
    if (d.getHours() < 6) {
      d.setDate(d.getDate() - 1);
    }
    return d.toISOString().split("T")[0];
  };

  const activeDate = getActiveDate(currentTime);

  // --- STATE ---
  // Supplement Stack State
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [takenMap, setTakenMap] = useState<Record<string, number>>({}); // id: timestamp
  const [runningLowList, setRunningLowList] = useState<string[]>([]); // array of IDs

  // Water Coach Calculator State
  const [weightKg, setWeightKg] = useState(75);
  const [exerciseHrsWk, setExerciseHrsWk] = useState(5);
  const [caffeineMg, setCaffeineMg] = useState(150);
  const [loggedCups, setLoggedCups] = useState(4); // 1 cup = 250ml
  const [substances, setSubstances] = useState<ActiveSubstance[]>([]);

  // UI inputs
  const [newSuppName, setNewSuppName] = useState("");
  const [newSuppDose, setNewSuppDose] = useState("");
  const [newSuppWindow, setNewSuppWindow] = useState<"morning" | "lunch" | "evening" | "anytime">("anytime");
  const [newSuppNote, setNewSuppNote] = useState("");

  const [selectedSubstanceId, setSelectedSubstanceId] = useState("");
  const [customDose, setCustomDose] = useState<number | "">("");

  // Presets
  const STACK_WINDOWS = [
    { key: "morning" as const, title: "MORNING", time: "7–10 AM", cutoffHour: 10, icon: "🌅" },
    { key: "lunch" as const, title: "LUNCH", time: "12–2 PM", cutoffHour: 14, icon: "🍽️" },
    { key: "evening" as const, title: "EVENING", time: "9–11 PM", cutoffHour: 23, icon: "🌙" },
    { key: "anytime" as const, title: "ANYTIME", time: "NO FIXED WINDOW", cutoffHour: null, icon: "⏱️" }
  ];

  const SUPPLEMENT_DB = [
    { name: "Creatine monohydrate", dose: "5g", window: "anytime", note: "Pulls water into muscle cells" },
    { name: "Beta-alanine", dose: "3g", window: "morning", note: "Pre-workout amino" },
    { name: "Vitamin D3", dose: "5000 IU", window: "lunch", note: "Fat-soluble — take with meal" },
    { name: "Magnesium glycinate", dose: "300mg", window: "evening", note: "Take before bed for sleep" },
    { name: "Omega-3 (Fish oil)", dose: "2g", window: "lunch", note: "Supports joints and brain" },
    { name: "L-theanine", dose: "200mg", window: "morning", note: "Stacks with caffeine 2:1" },
    { name: "Zinc", dose: "15mg", window: "evening", note: "Immune support" }
  ];

  const SUBSTANCE_DB = [
    { id: "adderall", name: "Adderall", unit: "mg", defaultDose: 20, mlPerUnit: 25 },
    { id: "concerta", name: "Concerta", unit: "mg", defaultDose: 36, mlPerUnit: 13.9 },
    { id: "vyvanse", name: "Vyvanse", unit: "mg", defaultDose: 50, mlPerUnit: 10 },
    { id: "caffeine_extra", name: "Extra Caffeine", unit: "mg", defaultDose: 100, mlPerUnit: 1.5 },
    { id: "creatine_h2o", name: "Creatine", unit: "g", defaultDose: 5, mlPerUnit: 80 },
    { id: "alcohol", name: "Alcohol", unit: "drinks", defaultDose: 1, mlPerUnit: 400 },
    { id: "nicotine", name: "Nicotine", unit: "pouches", defaultDose: 4, mlPerUnit: 62.5 }
  ];

  // Lifecycle
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Hydration safety defaults loading
  useEffect(() => {
    if (mounted) {
      // Load standard defaults or localStorage keys
      const savedSupps = localStorage.getItem("stack:items");
      if (savedSupps) {
        setSupplements(JSON.parse(savedSupps));
      } else {
        const defaults: Supplement[] = [
          { id: "m1", name: "Vitamin D3", dose: "5000 IU", window: "lunch", note: "Take with fats" },
          { id: "m2", name: "L-theanine", dose: "200mg", window: "morning", note: "Stack with coffee" },
          { id: "m3", name: "Magnesium glycinate", dose: "300mg", window: "evening", note: "Sleep helper" },
          { id: "m4", name: "Creatine monohydrate", dose: "5g", window: "anytime", note: "Power and recovery" }
        ];
        setSupplements(defaults);
        localStorage.setItem("stack:items", JSON.stringify(defaults));
      }

      const savedTaken = localStorage.getItem(`stack:taken:${activeDate}`);
      if (savedTaken) {
        setTakenMap(JSON.parse(savedTaken));
      }

      const savedLow = localStorage.getItem("stack:low");
      if (savedLow) {
        setRunningLowList(JSON.parse(savedLow));
      }

      const savedWaterState = localStorage.getItem("po_water_state");
      if (savedWaterState) {
        const ws = JSON.parse(savedWaterState);
        setWeightKg(ws.weight || 75);
        setExerciseHrsWk(ws.exercise || 5);
        setCaffeineMg(ws.caffeine || 150);
        setLoggedCups(ws.cups || 4);
        setSubstances(ws.substances || []);
      } else {
        const defaultsSubs = [
          { id: "creatine_h2o", name: "Creatine", dose: 5, unit: "g", mlPerUnit: 80 },
          { id: "nicotine", name: "Nicotine", dose: 3, unit: "pouches", mlPerUnit: 62.5 }
        ];
        setSubstances(defaultsSubs);
      }
    }
  }, [mounted, activeDate]);

  // Sync to localStorage helpers
  const saveSupps = (items: Supplement[]) => {
    setSupplements(items);
    localStorage.setItem("stack:items", JSON.stringify(items));
  };

  const saveLow = (list: string[]) => {
    setRunningLowList(list);
    localStorage.setItem("stack:low", JSON.stringify(list));
  };

  const saveWaterState = (weight: number, exercise: number, caffeine: number, cups: number, subs: ActiveSubstance[]) => {
    localStorage.setItem("po_water_state", JSON.stringify({
      weight, exercise, caffeine, cups, substances: subs
    }));
  };

  // --- ACTIONS ---
  const toggleTaken = (id: string) => {
    const updated = { ...takenMap };
    if (updated[id]) {
      delete updated[id];
    } else {
      updated[id] = Date.now();
    }
    setTakenMap(updated);
    localStorage.setItem(`stack:taken:${activeDate}`, JSON.stringify(updated));
  };

  const toggleLow = (id: string) => {
    let updated: string[];
    if (runningLowList.includes(id)) {
      updated = runningLowList.filter(x => x !== id);
    } else {
      updated = [...runningLowList, id];
    }
    saveLow(updated);
  };

  const deleteSupplement = (id: string) => {
    const updatedSupps = supplements.filter(s => s.id !== id);
    saveSupps(updatedSupps);
    
    const updatedTaken = { ...takenMap };
    delete updatedTaken[id];
    setTakenMap(updatedTaken);
    localStorage.setItem(`stack:taken:${activeDate}`, JSON.stringify(updatedTaken));

    saveLow(runningLowList.filter(x => x !== id));
  };

  const handleAddSupplement = () => {
    if (!newSuppName.trim()) return;
    const newSupp: Supplement = {
      id: "supp_" + Date.now() + "_" + Math.random().toString(36).slice(2, 5),
      name: newSuppName.trim(),
      dose: newSuppDose.trim(),
      window: newSuppWindow,
      note: newSuppNote.trim()
    };
    const updated = [...supplements, newSupp];
    saveSupps(updated);

    // Clear inputs
    setNewSuppName("");
    setNewSuppDose("");
    setNewSuppNote("");
  };

  // Water substances actions
  const handleAddSubstance = () => {
    const preset = SUBSTANCE_DB.find(s => s.id === selectedSubstanceId);
    if (!preset) return;

    // Check duplication
    if (substances.some(s => s.id === preset.id)) return;

    const dose = customDose !== "" ? Number(customDose) : preset.defaultDose;
    const activeSub: ActiveSubstance = {
      id: preset.id,
      name: preset.name,
      dose,
      unit: preset.unit,
      mlPerUnit: preset.mlPerUnit
    };

    const updated = [...substances, activeSub];
    setSubstances(updated);
    saveWaterState(weightKg, exerciseHrsWk, caffeineMg, loggedCups, updated);

    // Reset selectors
    setSelectedSubstanceId("");
    setCustomDose("");
  };

  const handleDeleteSubstance = (id: string) => {
    const updated = substances.filter(s => s.id !== id);
    setSubstances(updated);
    saveWaterState(weightKg, exerciseHrsWk, caffeineMg, loggedCups, updated);
  };

  // Target Water calculations
  const calculateTargetMl = () => {
    const base = weightKg * 35;
    const exercise = (exerciseHrsWk / 7) * 500;
    const caffeine = Math.max(0, caffeineMg - 200) * 1.5;
    const subs = substances.reduce((sum, s) => sum + s.dose * s.mlPerUnit, 0);
    return Math.round(base + exercise + caffeine + subs);
  };

  const targetMl = calculateTargetMl();
  const targetCups = Math.max(1, Math.round(targetMl / 250));

  const logCupChange = (amount: number) => {
    const updated = Math.max(0, loggedCups + amount);
    setLoggedCups(updated);
    saveWaterState(weightKg, exerciseHrsWk, caffeineMg, updated, substances);
  };

  if (!mounted) {
    return null;
  }

  const totalSuppCount = supplements.length;
  const takenSuppCount = supplements.filter(s => takenMap[s.id]).length;
  const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;

  return (
    <div className="space-y-4 text-zinc-200">
      
      {/* Header */}
      <div className="rounded-md border border-zinc-800 bg-[#0a0a0a] p-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#000000] border border-zinc-800 text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
            LIFE OS // MODULE // HEALTH
          </div>
          <h1 className="text-xl font-mono uppercase tracking-wider font-bold text-zinc-150 flex items-center gap-2">
            <Activity className="h-5 w-5 text-zinc-300" /> HEALTH & VITALS CONSOLE
          </h1>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wide">
            Track daily supplement intakes, target water coach metrics, and active logs.
          </p>
        </div>
      </div>

      {/* Main Split Grid (Bento columns) */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* Left Side: Supplement Stack (col-span-12 lg:col-span-7) */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-4 border-b border-zinc-800">
              <div className="flex flex-row justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">SUPPLEMENT STACK</span>
                  <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase">DAILY STACK REGISTER</CardTitle>
                </div>
                <div className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded border border-zinc-800 bg-[#000000] text-zinc-400">
                  {takenSuppCount}/{totalSuppCount} TAKEN
                </div>
              </div>

              {/* Segmented/Flat Progress Bar */}
              <div className="w-full bg-[#000000] border border-zinc-900 h-1.5 rounded-sm overflow-hidden mt-3">
                <div 
                  className="bg-zinc-200 h-full transition-all duration-300" 
                  style={{ width: `${totalSuppCount === 0 ? 0 : (takenSuppCount / totalSuppCount) * 100}%` }}
                />
              </div>
            </CardHeader>
            
            <CardContent className="p-4 space-y-4">
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {STACK_WINDOWS.map((win) => {
                  const winItems = supplements.filter((s) => s.window === win.key);
                  if (winItems.length === 0) return null;

                  return (
                    <div key={win.key} className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-900 pb-1 mt-1">
                        <span>{win.icon}</span>
                        <span className="font-bold text-zinc-400">{win.title}</span>
                        <span>{win.time}</span>
                      </div>

                      {winItems.map((item) => {
                        const isTaken = !!takenMap[item.id];
                        const isLow = runningLowList.includes(item.id);
                        const isPastCutoff = win.cutoffHour !== null && currentHour > win.cutoffHour;
                        const isMissed = !isTaken && isPastCutoff;

                        return (
                          <div 
                            key={item.id} 
                            className={`group flex items-center gap-3 px-3 py-2 border border-zinc-900/60 rounded-md transition-all ${
                              isTaken 
                                ? "bg-[#0a0a0a] border-zinc-900 opacity-60" 
                                : isMissed 
                                  ? "bg-rose-950/10 border-rose-900/40" 
                                  : "bg-transparent hover:bg-[#0a0a0a]"
                            }`}
                          >
                            {/* Checkbox (ticked: solid white, black check icon) */}
                            <button
                              onClick={() => toggleTaken(item.id)}
                              className={`w-3.5 h-3.5 border transition-all flex items-center justify-center rounded-sm ${
                                isTaken 
                                  ? "bg-zinc-50 border-zinc-100 text-zinc-950 font-bold" 
                                  : "border-zinc-800 bg-transparent hover:border-zinc-650"
                              }`}
                            >
                              {isTaken && <Check className="h-2.5 w-2.5 stroke-[3.5] text-zinc-950" />}
                            </button>

                            <div className="flex-1 space-y-0.5">
                              <p className={`text-xs font-mono font-semibold ${isTaken ? "text-zinc-500 line-through" : "text-zinc-200"}`}>
                                {item.name} {item.dose && <span className="text-zinc-500 font-mono">({item.dose})</span>}
                              </p>
                              {item.note && (
                                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wide">{item.note}</p>
                              )}
                            </div>

                            {/* Low status pill trigger */}
                            <button
                              onClick={() => toggleLow(item.id)}
                              className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-colors duration-150 ${
                                isLow 
                                  ? "border-amber-500/20 bg-amber-500/5 text-amber-400 font-bold" 
                                  : "border-zinc-800 text-zinc-500 hover:text-zinc-350"
                              }`}
                            >
                              {isLow ? "LOW" : "↓ LOW"}
                            </button>

                            {/* Delete on hover */}
                            <button
                              onClick={() => deleteSupplement(item.id)}
                              className="p-1 rounded text-zinc-600 hover:text-zinc-100 opacity-0 group-hover:opacity-100 transition-all duration-150"
                              title="Delete Supplement"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                {totalSuppCount === 0 && (
                  <div className="text-center py-6 text-[9px] font-mono uppercase tracking-widest text-zinc-600 border border-dashed border-zinc-800 rounded">
                    No supplements cataloged.
                  </div>
                )}
              </div>

              {/* Add Supplement Row */}
              <div className="flex flex-col gap-2 pt-3 border-t border-zinc-800 mt-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newSuppName}
                    onChange={(e) => setNewSuppName(e.target.value)}
                    placeholder="SUPPLEMENT NAME..."
                    className="bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-600 transition-all"
                  />
                  <input
                    type="text"
                    value={newSuppDose}
                    onChange={(e) => setNewSuppDose(e.target.value)}
                    placeholder="DOSE (e.g. 5g, 500mg)..."
                    className="bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-600 transition-all"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={newSuppWindow}
                    onChange={(e) => setNewSuppWindow(e.target.value as any)}
                    className="bg-[#000000] border border-zinc-800 rounded-md px-2 py-1 text-xs font-mono text-zinc-400 outline-none focus:border-zinc-650"
                  >
                    <option value="morning">MORNING</option>
                    <option value="lunch">LUNCH</option>
                    <option value="evening">EVENING</option>
                    <option value="anytime">ANYTIME</option>
                  </select>
                  <input
                    type="text"
                    value={newSuppNote}
                    onChange={(e) => setNewSuppNote(e.target.value)}
                    placeholder="NOTE/INSTRUCTION..."
                    className="bg-transparent border border-zinc-800 rounded-md px-3 py-1 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-600 col-span-2"
                  />
                </div>
                <button
                  onClick={handleAddSupplement}
                  className="w-full py-2.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-[10px] tracking-wider transition-all uppercase mt-1"
                >
                  Add Supplement
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Substance-Aware Water Coach (col-span-12 lg:col-span-5) */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-4 border-b border-zinc-800">
              <span className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500 flex items-center gap-1.5">
                <Droplet className="h-3.5 w-3.5 text-zinc-400" /> WATER COACH CALCULATOR
              </span>
              <CardDescription className="text-[10px] font-mono text-zinc-550 uppercase mt-0.5">Substance-driven target engine</CardDescription>
            </CardHeader>
            
            <CardContent className="p-4 space-y-4">
              {/* Dynamic Target breakdown */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest border border-zinc-800 p-3 rounded-md bg-[#000000]">
                <div>Base Intake:</div>
                <div className="text-right text-zinc-350">{weightKg * 35} ml</div>
                <div>Exercise Addon:</div>
                <div className="text-right text-zinc-350">+{Math.round((exerciseHrsWk / 7) * 500)} ml</div>
                <div>Caffeine Offset:</div>
                <div className="text-right text-zinc-350">+{Math.max(0, caffeineMg - 200) * 1.5} ml</div>
                <div>Substance Bumps:</div>
                <div className="text-right text-zinc-350">+{substances.reduce((sum, s) => sum + s.dose * s.mlPerUnit, 0)} ml</div>
                <div className="col-span-2 h-px bg-zinc-800 my-1" />
                <div className="font-bold text-zinc-300">Target Volume:</div>
                <div className="text-right font-bold text-zinc-200">{targetMl} ml</div>
              </div>

              {/* Counter Wheel visual */}
              <div className="flex flex-col items-center justify-center py-2 space-y-4">
                <div className="w-28 h-28 rounded-full border border-zinc-800 flex flex-col items-center justify-center bg-[#000000]">
                  <span className="text-xl font-mono font-bold tracking-tighter text-zinc-100">{loggedCups * 250} ML</span>
                  <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">
                    {loggedCups} / {targetCups} CUPS
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-xs space-y-1">
                  <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase">
                    <span>PROGRESS</span>
                    <span>{Math.round((loggedCups / targetCups) * 100)}%</span>
                  </div>
                  <div className="w-full bg-[#000000] border border-zinc-800 h-1 rounded-sm overflow-hidden">
                    <div 
                      className="bg-zinc-200 h-full transition-all duration-300" 
                      style={{ width: `${Math.min((loggedCups / targetCups) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Incrementor */}
                <div className="flex justify-center gap-2 w-full pt-1">
                  <button 
                    onClick={() => logCupChange(-1)}
                    className="p-1 rounded-md border border-zinc-800 bg-[#000000] hover:bg-[#0a0a0a] text-zinc-400 hover:text-zinc-250 transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => logCupChange(1)}
                    className="p-1 rounded-md border border-zinc-800 bg-[#000000] hover:bg-[#0a0a0a] text-zinc-300 hover:text-zinc-100 transition-colors flex items-center gap-1.5 px-3 text-[9px] font-mono tracking-widest uppercase"
                  >
                    <Plus className="h-3.5 w-3.5 text-zinc-400" /> LOG CUP
                  </button>
                </div>
              </div>

              {/* Calculator Settings Inputs */}
              <div className="space-y-2 border-t border-zinc-800 pt-3">
                <span className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500">CALCULATOR ADJUSTMENTS</span>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-zinc-500 uppercase">WEIGHT (KG)</label>
                    <input 
                      type="number"
                      value={weightKg}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setWeightKg(v);
                        saveWaterState(v, exerciseHrsWk, caffeineMg, loggedCups, substances);
                      }}
                      className="w-full bg-transparent border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-zinc-500 uppercase">EXERCISE (H/W)</label>
                    <input 
                      type="number"
                      value={exerciseHrsWk}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setExerciseHrsWk(v);
                        saveWaterState(weightKg, v, caffeineMg, loggedCups, substances);
                      }}
                      className="w-full bg-transparent border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono text-zinc-500 uppercase">CAFFEINE (MG)</label>
                    <input 
                      type="number"
                      value={caffeineMg}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setCaffeineMg(v);
                        saveWaterState(weightKg, exerciseHrsWk, v, loggedCups, substances);
                      }}
                      className="w-full bg-transparent border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>
              </div>

              {/* Substances logs */}
              <div className="space-y-2 border-t border-zinc-800 pt-3">
                <span className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500">DEHYDRATING SUBSTANCES</span>
                
                {/* Active substances list */}
                <div className="space-y-1">
                  {substances.map((sub) => (
                    <div key={sub.id} className="flex justify-between items-center px-2 py-1 rounded bg-[#000000] border border-zinc-900 text-[10px] font-mono">
                      <span className="text-zinc-350">{sub.name} ({sub.dose}{sub.unit})</span>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500">+{sub.dose * sub.mlPerUnit} ml H₂O</span>
                        <button 
                          onClick={() => handleDeleteSubstance(sub.id)}
                          className="text-zinc-500 hover:text-zinc-300"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                  {substances.length === 0 && (
                    <div className="text-center py-2 text-[9px] font-mono text-zinc-600 uppercase">No active substances logged.</div>
                  )}
                </div>

                {/* Add Substance Selector */}
                <div className="flex gap-2 pt-1.5">
                  <select
                    value={selectedSubstanceId}
                    onChange={(e) => setSelectedSubstanceId(e.target.value)}
                    className="flex-1 bg-[#000000] border border-zinc-800 rounded-md px-2 py-1 text-xs font-mono text-zinc-400 outline-none focus:border-zinc-650"
                  >
                    <option value="">SELECT SUBSTANCE...</option>
                    {SUBSTANCE_DB.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.unit})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={customDose}
                    onChange={(e) => setCustomDose(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="DOSE..."
                    className="w-16 bg-transparent border border-zinc-800 rounded-md px-2 py-1 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-600"
                  />
                  <button
                    onClick={handleAddSubstance}
                    disabled={!selectedSubstanceId}
                    className="px-3 py-1 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-[9px] tracking-wider uppercase disabled:opacity-40"
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
