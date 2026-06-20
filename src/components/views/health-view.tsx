"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Heart, 
  Moon, 
  Droplet, 
  Activity, 
  Plus, 
  Minus,
  X,
  PlusCircle,
  AlertTriangle,
  Flame,
  Check,
  RefreshCw,
  Sliders,
  Sparkles,
  TrendingUp,
  BrainCircuit
} from "lucide-react";
import { CharacterStats, Skill, Supplement, WaterConfig, NutritionConfig } from "@/types";

interface HealthViewProps {
  stats: CharacterStats;
  updateStats: (stats: CharacterStats) => void;
  skills: Skill[];
  updateSkills: (skills: Skill[]) => void;
  supplements: Supplement[];
  updateSupplements: (sups: Supplement[]) => void;
  water: WaterConfig;
  updateWater: (water: WaterConfig) => void;
  activeDate: string;
  currentTime: Date;
  nutrition: NutritionConfig;
  updateNutrition: (nutrition: NutritionConfig) => void;
}

export default function HealthView({
  stats,
  updateStats,
  skills,
  updateSkills,
  supplements,
  updateSupplements,
  water,
  updateWater,
  activeDate,
  currentTime,
  nutrition,
  updateNutrition
}: HealthViewProps) {
  const [newSupName, setNewSupName] = useState("");
  const [newSupDose, setNewSupDose] = useState("");
  const [newSupWindow, setNewSupWindow] = useState<"morning" | "lunch" | "evening">("morning");

  // Nutrition states
  const [logCalInput, setLogCalInput] = useState<number | "">("");
  const [logProtInput, setLogProtInput] = useState<number | "">("");
  const [logCarbInput, setLogCarbInput] = useState<number | "">("");
  const [logFatInput, setLogFatInput] = useState<number | "">("");

  const [editingNutritionTargets, setEditingNutritionTargets] = useState(false);
  const [targetCalInput, setTargetCalInput] = useState<number | "">(nutrition?.targetCal || 2000);
  const [targetProtInput, setTargetProtInput] = useState<number | "">(nutrition?.targetProt || 150);
  const [targetCarbInput, setTargetCarbInput] = useState<number | "">(nutrition?.targetCarb || 200);
  const [targetFatInput, setTargetFatInput] = useState<number | "">(nutrition?.targetFat || 65);

  const handleLogNutrition = (cal: number, prot: number, carb: number, fat: number) => {
    const updated = {
      ...nutrition,
      loggedCal: { ...nutrition.loggedCal, [activeDate]: Math.max((nutrition.loggedCal[activeDate] || 0) + cal, 0) },
      loggedProt: { ...nutrition.loggedProt, [activeDate]: Math.max((nutrition.loggedProt[activeDate] || 0) + prot, 0) },
      loggedCarb: { ...nutrition.loggedCarb, [activeDate]: Math.max((nutrition.loggedCarb[activeDate] || 0) + carb, 0) },
      loggedFat: { ...nutrition.loggedFat, [activeDate]: Math.max((nutrition.loggedFat[activeDate] || 0) + fat, 0) }
    };
    updateNutrition(updated);
  };

  const handleCustomLog = () => {
    const cal = Number(logCalInput) || 0;
    const prot = Number(logProtInput) || 0;
    const carb = Number(logCarbInput) || 0;
    const fat = Number(logFatInput) || 0;
    if (cal === 0 && prot === 0 && carb === 0 && fat === 0) return;
    handleLogNutrition(cal, prot, carb, fat);
    setLogCalInput("");
    setLogProtInput("");
    setLogCarbInput("");
    setLogFatInput("");
  };

  const handleUpdateTargets = () => {
    updateNutrition({
      ...nutrition,
      targetCal: Number(targetCalInput) || 2000,
      targetProt: Number(targetProtInput) || 150,
      targetCarb: Number(targetCarbInput) || 200,
      targetFat: Number(targetFatInput) || 65
    });
    setEditingNutritionTargets(false);
  };

  const handleResetNutrition = () => {
    const updated = {
      ...nutrition,
      loggedCal: { ...nutrition.loggedCal, [activeDate]: 0 },
      loggedProt: { ...nutrition.loggedProt, [activeDate]: 0 },
      loggedCarb: { ...nutrition.loggedCarb, [activeDate]: 0 },
      loggedFat: { ...nutrition.loggedFat, [activeDate]: 0 }
    };
    updateNutrition(updated);
  };

  // Supplement cutoff checks
  const isWindowMissed = (window: "morning" | "lunch" | "evening", isTaken: boolean) => {
    if (isTaken) return false;
    const currentHour = currentTime.getHours();
    if (window === "morning" && currentHour >= 10) return true;
    if (window === "lunch" && currentHour >= 14) return true;
    if (window === "evening" && currentHour >= 23) return true;
    return false;
  };

  const missedSups = supplements.filter((s) => {
    const isTaken = s.takenDates[activeDate] || false;
    return isWindowMissed(s.window, isTaken);
  });

  // Supplement Actions
  const toggleSupplementTaken = (id: string) => {
    const updated = supplements.map((s) => {
      if (s.id === id) {
        const isTaken = s.takenDates[activeDate] || false;
        return {
          ...s,
          takenDates: {
            ...s.takenDates,
            [activeDate]: !isTaken
          }
        };
      }
      return s;
    });
    updateSupplements(updated);
  };

  const toggleSupplementLow = (id: string) => {
    const updated = supplements.map((s) => s.id === id ? { ...s, low: !s.low } : s);
    updateSupplements(updated);
  };

  const handleAddSupplement = () => {
    if (!newSupName.trim() || !newSupDose.trim()) return;
    const newSup: Supplement = {
      id: "sup_" + Date.now(),
      name: newSupName.trim(),
      dose: newSupDose.trim(),
      window: newSupWindow,
      low: false,
      takenDates: {}
    };
    updateSupplements([...supplements, newSup]);
    setNewSupName("");
    setNewSupDose("");
  };

  const handleDeleteSupplement = (id: string) => {
    updateSupplements(supplements.filter(s => s.id !== id));
  };


  // Water Coach Math
  const getWaterTargetMl = () => {
    const base = water.weightKg * 35;
    const exercise = water.trainingHrs * 500;
    const caffeine = water.caffeineMg * 1.5;
    const meds = water.activeMedsCount * 250;
    return Math.round(base + exercise + caffeine + meds);
  };

  const targetWaterMl = getWaterTargetMl();
  const loggedWaterMl = water.loggedTodayMl[activeDate] || 0;
  const waterPercent = Math.min(Math.round((loggedWaterMl / targetWaterMl) * 100), 100);

  const handleLogWater = (amountMl: number) => {
    const updatedLogs = {
      ...water.loggedTodayMl,
      [activeDate]: Math.max((water.loggedTodayMl[activeDate] || 0) + amountMl, 0)
    };
    updateWater({
      ...water,
      loggedTodayMl: updatedLogs
    });
  };

  // Nutrition Math
  const targetCal = nutrition?.targetCal || 2200;
  const targetProt = nutrition?.targetProt || 150;
  const targetCarb = nutrition?.targetCarb || 220;
  const targetFat = nutrition?.targetFat || 70;

  const loggedCal = nutrition?.loggedCal[activeDate] || 0;
  const loggedProt = nutrition?.loggedProt[activeDate] || 0;
  const loggedCarb = nutrition?.loggedCarb[activeDate] || 0;
  const loggedFat = nutrition?.loggedFat[activeDate] || 0;

  const calPercent = Math.min(Math.round((loggedCal / targetCal) * 100), 100);
  const protPercent = Math.min(Math.round((loggedProt / targetProt) * 100), 100);
  const carbPercent = Math.min(Math.round((loggedCarb / targetCarb) * 100), 100);
  const fatPercent = Math.min(Math.round((loggedFat / targetFat) * 100), 100);



  return (
    <div className="space-y-4 text-zinc-200">
      <style jsx global>{`
        @keyframes pageFade {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-page-fade {
          animation: pageFade 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      {/* Supplement Warning Banner */}
      {missedSups.length > 0 && (
        <div className="bg-red-950/20 border border-red-900/50 rounded-md p-3.5 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-4.5 w-4.5 text-red-500 stroke-[2.5]" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-bold tracking-widest text-red-400 uppercase">NASDAQ SUPPS DISPATCH WARNING</span>
              <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-wide">
                Supplements missed in scheduling window: {missedSups.map(s => `${s.name} (${s.window})`).join(", ")}
              </p>
            </div>
          </div>
          <span className="text-[9px] font-mono bg-red-900/40 text-red-200 px-2 py-0.5 rounded border border-red-800 uppercase font-bold tracking-wider">
            MISSED WINDOW
          </span>
        </div>
      )}

      {/* Main Grid Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-page-fade">
        
        {/* Left Column: Character Stats & Skills */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Supplement Dispatcher */}
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-4 border-b border-zinc-800">
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">SCHEDULING DISPATCHER</span>
              <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">DAILY SUPPLEMENT STACK</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              {/* List supplement rows */}
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {supplements.map((item) => {
                  const isTaken = item.takenDates[activeDate] || false;
                  const isMissed = isWindowMissed(item.window, isTaken);

                  return (
                    <div 
                      key={item.id} 
                      className={`group flex items-center justify-between px-3 py-2 border rounded text-xs font-mono transition-all duration-150 ${
                        isTaken 
                          ? "bg-[#000000]/60 border-zinc-900 opacity-50" 
                          : isMissed 
                            ? "bg-red-955/15 border-red-900/30 text-red-200" 
                            : "bg-[#000000]/60 border-zinc-900 hover:bg-[#0a0a0a]"
                      }`}
                    >
                      {/* Check box (custom monochrome) */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleSupplementTaken(item.id)}
                          className={`w-3.5 h-3.5 border flex items-center justify-center rounded-sm transition-all ${
                            isTaken 
                              ? "bg-zinc-50 border-zinc-100 text-zinc-950" 
                              : "border-zinc-800 bg-transparent hover:border-zinc-650"
                          }`}
                        >
                          {isTaken && <Check className="h-2.5 w-2.5 stroke-[3.5] text-zinc-950" />}
                        </button>
                        <div className="space-y-0.5">
                          <p className={`text-xs font-semibold ${isTaken ? "line-through text-zinc-500" : "text-zinc-200"}`}>
                            {item.name} <span className="text-[10px] text-zinc-500">({item.dose})</span>
                          </p>
                          <div className="flex items-center gap-2 text-[8px] font-mono text-zinc-500 uppercase tracking-wide">
                            <span>Window: {item.window}</span>
                            {isMissed && <span className="text-red-500 font-bold animate-pulse">● MISSED</span>}
                          </div>
                        </div>
                      </div>

                      {/* Right-side toggles and deletes */}
                      <div className="flex items-center gap-3">
                        {/* Running Low toggle */}
                        <button
                          onClick={() => toggleSupplementLow(item.id)}
                          className={`text-[8.5px] font-mono px-2 py-0.5 rounded border transition-colors ${
                            item.low 
                              ? "border-red-900/40 text-red-500 bg-red-950/15 font-bold" 
                              : "border-zinc-900 text-zinc-550 hover:text-zinc-400"
                          }`}
                        >
                          {item.low ? "LOW" : "OK"}
                        </button>

                        <button 
                          onClick={() => handleDeleteSupplement(item.id)}
                          className="text-zinc-650 hover:text-zinc-350 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
                {supplements.length === 0 && (
                  <div className="text-center py-4 text-[9px] font-mono uppercase tracking-widest text-zinc-650">No supplements in dispatcher database.</div>
                )}
              </div>

              {/* Add Supplement Form */}
              <div className="flex flex-col gap-2 pt-3 border-t border-zinc-900 mt-2">
                <input
                  type="text"
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  placeholder="SUPPLEMENT NAME..."
                  className="bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-700 transition-all"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSupDose}
                    onChange={(e) => setNewSupDose(e.target.value)}
                    placeholder="DOSE (e.g. 500mg)..."
                    className="flex-1 bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-700 transition-all"
                  />
                  <select
                    value={newSupWindow}
                    onChange={(e) => setNewSupWindow(e.target.value as any)}
                    className="bg-[#000000] border border-zinc-800 rounded px-2 py-1.5 text-xs font-mono text-zinc-450 outline-none"
                  >
                    <option value="morning">MORNING (7-10 AM)</option>
                    <option value="lunch">LUNCH (12-2 PM)</option>
                    <option value="evening">EVENING (9-11 PM)</option>
                  </select>
                  <button
                    onClick={handleAddSupplement}
                    className="px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-[9px] tracking-widest uppercase transition-all"
                  >
                    Add
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Water Coach Calculator Widget */}
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-4 border-b border-zinc-800 flex justify-between flex-row items-center gap-3">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">COACHING ADVISORY</span>
                <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">SUBSTANCE-AWARE WATER COACH</CardTitle>
              </div>
              
              {/* Quick logs buttons at header layer */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleLogWater(250)}
                  className="px-2 py-1 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-[9.5px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95"
                >
                  <Plus className="h-3 w-3 stroke-[2.5]" /> 250ML
                </button>
                <button
                  onClick={() => handleLogWater(-250)}
                  className="p-1 border border-zinc-800 bg-[#000000] hover:bg-[#0a0a0a] text-zinc-450 rounded transition-colors active:scale-95"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              {/* Water logging stats */}
              <div className="flex flex-col items-center justify-center p-4 border border-zinc-900 bg-[#000000]/60 rounded-md gap-2">
                <div className="flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-zinc-450 animate-bounce" />
                  <span className="text-xl font-bold font-mono tracking-tight text-zinc-100">
                    {loggedWaterMl} ml / <span className="text-zinc-500">{targetWaterMl} ml</span>
                  </span>
                </div>
                <div className="w-full max-w-sm space-y-1">
                  <div className="flex justify-between text-[8px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                    <span>PROGRESS RATE</span>
                    <span>{waterPercent}%</span>
                  </div>
                  <div className="w-full bg-[#000000] border border-zinc-855 h-1.5 rounded-sm overflow-hidden">
                    <div className="bg-zinc-200 h-full transition-all duration-500" style={{ width: `${waterPercent}%` }} />
                  </div>
                </div>
              </div>

              {/* Settings Configuration parameters */}
              <div className="space-y-3 border-t border-zinc-900 pt-3">
                <span className="text-[9px] font-mono uppercase tracking-widest font-bold text-zinc-500 flex items-center gap-1">
                  <Sliders className="h-3 w-3" /> COACH PARAMETERS
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {/* Weight */}
                  <div className="space-y-0.5">
                    <label className="text-[7.5px] font-mono text-zinc-550 uppercase font-bold">WEIGHT (KG)</label>
                    <input
                      type="number"
                      value={water.weightKg}
                      onChange={(e) => updateWater({ ...water, weightKg: Number(e.target.value) })}
                      className="w-full bg-[#000000] border border-zinc-850 rounded px-2 py-1 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700"
                    />
                  </div>
                  
                  {/* Age */}
                  <div className="space-y-0.5">
                    <label className="text-[7.5px] font-mono text-zinc-555 uppercase font-bold">AGE (YRS)</label>
                    <input
                      type="number"
                      value={water.age}
                      onChange={(e) => updateWater({ ...water, age: Number(e.target.value) })}
                      className="w-full bg-[#000000] border border-zinc-850 rounded px-2 py-1 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700"
                    />
                  </div>

                  {/* Training hours */}
                  <div className="space-y-0.5">
                    <label className="text-[7.5px] font-mono text-zinc-555 uppercase font-bold">TRAIN (HRS/D)</label>
                    <input
                      type="number"
                      value={water.trainingHrs}
                      step="0.5"
                      onChange={(e) => updateWater({ ...water, trainingHrs: Number(e.target.value) })}
                      className="w-full bg-[#000000] border border-zinc-850 rounded px-2 py-1 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700"
                    />
                  </div>

                  {/* Caffeine */}
                  <div className="space-y-0.5">
                    <label className="text-[7.5px] font-mono text-zinc-555 uppercase font-bold">CAFFEINE (MG)</label>
                    <input
                      type="number"
                      value={water.caffeineMg}
                      onChange={(e) => updateWater({ ...water, caffeineMg: Number(e.target.value) })}
                      className="w-full bg-[#000000] border border-zinc-855 rounded px-2 py-1 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700"
                    />
                  </div>

                  {/* Active Meds */}
                  <div className="space-y-0.5 col-span-2 sm:col-span-1">
                    <label className="text-[7.5px] font-mono text-zinc-555 uppercase font-bold">MEDS/DEHYD</label>
                    <input
                      type="number"
                      value={water.activeMedsCount}
                      onChange={(e) => updateWater({ ...water, activeMedsCount: Number(e.target.value) })}
                      className="w-full bg-[#000000] border border-zinc-850 rounded px-2 py-1 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>

                <div className="text-[8.5px] font-mono text-zinc-555 uppercase tracking-wide leading-relaxed border-t border-zinc-900/50 pt-2.5">
                  <span className="font-bold text-zinc-400">MATH MECHANICS:</span> base 35ml/kg + 500ml/hr exercise + 1.5ml/mg caffeine + 250ml/active dehydrator.
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Column: Metabolic Ledger */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Nutritional Macro Monitor Widget */}
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-4 border-b border-zinc-800 flex justify-between flex-row items-center gap-3">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">METABOLIC LEDGER</span>
                <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">NUTRITIONAL MACRO MONITOR</CardTitle>
              </div>
              <button
                onClick={() => {
                  if (editingNutritionTargets) {
                    handleUpdateTargets();
                  } else {
                    setTargetCalInput(targetCal);
                    setTargetProtInput(targetProt);
                    setTargetCarbInput(targetCarb);
                    setTargetFatInput(targetFat);
                    setEditingNutritionTargets(true);
                  }
                }}
                className="px-2 py-1 border border-zinc-850 bg-[#000000] hover:bg-[#0a0a0a] text-zinc-400 rounded text-[9.5px] font-mono font-bold uppercase transition-colors active:scale-95"
              >
                {editingNutritionTargets ? "Save Targets" : "Edit Targets"}
              </button>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {editingNutritionTargets ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border border-zinc-900 bg-[#000000]/60 p-3 rounded-md">
                  <div className="space-y-0.5">
                    <label className="text-[7.5px] font-mono text-zinc-550 uppercase font-bold">TARGET CALORIES</label>
                    <input
                      type="number"
                      value={targetCalInput}
                      onChange={(e) => setTargetCalInput(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full bg-[#000000] border border-zinc-855 rounded px-2 py-1 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[7.5px] font-mono text-zinc-550 uppercase font-bold">TARGET PRO (G)</label>
                    <input
                      type="number"
                      value={targetProtInput}
                      onChange={(e) => setTargetProtInput(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full bg-[#000000] border border-zinc-855 rounded px-2 py-1 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[7.5px] font-mono text-zinc-555 uppercase font-bold">TARGET CARB (G)</label>
                    <input
                      type="number"
                      value={targetCarbInput}
                      onChange={(e) => setTargetCarbInput(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full bg-[#000000] border border-zinc-855 rounded px-2 py-1 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[7.5px] font-mono text-zinc-555 uppercase font-bold">TARGET FAT (G)</label>
                    <input
                      type="number"
                      value={targetFatInput}
                      onChange={(e) => setTargetFatInput(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full bg-[#000000] border border-zinc-855 rounded px-2 py-1 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Calorie Progress Ring or Bar */}
                  <div className="flex flex-col items-center justify-center p-4 border border-zinc-900 bg-[#000000]/60 rounded-md gap-2">
                    <div className="flex items-center gap-2">
                      <Flame className="h-5 w-5 text-zinc-450 animate-pulse" />
                      <span className="text-xl font-bold font-mono tracking-tight text-zinc-100">
                        {loggedCal} kcal / <span className="text-zinc-500">{targetCal} kcal</span>
                      </span>
                    </div>
                    <div className="w-full max-w-sm space-y-1">
                      <div className="flex justify-between text-[8px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                        <span>ENERGY SATURATION</span>
                        <span>{calPercent}%</span>
                      </div>
                      <div className="w-full bg-[#000000] border border-zinc-850 h-1.5 rounded-sm overflow-hidden">
                        <div className="bg-zinc-200 h-full transition-all duration-500" style={{ width: `${calPercent}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Macronutrient breakdown */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Protein */}
                    <div className="border border-zinc-900 bg-[#000000]/40 p-2 rounded space-y-1">
                      <div className="flex justify-between text-[8px] font-mono text-zinc-550 uppercase tracking-wider font-bold">
                        <span>PRO</span>
                        <span className="text-zinc-350">{loggedProt}g / {targetProt}g</span>
                      </div>
                      <div className="w-full bg-[#000000] border border-zinc-850 h-1 rounded-sm overflow-hidden">
                        <div className="bg-zinc-200 h-full transition-all duration-500" style={{ width: `${protPercent}%` }} />
                      </div>
                      <div className="text-right text-[8px] font-mono text-zinc-550 font-bold">{protPercent}%</div>
                    </div>

                    {/* Carbs */}
                    <div className="border border-zinc-900 bg-[#000000]/40 p-2 rounded space-y-1">
                      <div className="flex justify-between text-[8px] font-mono text-zinc-555 uppercase tracking-wider font-bold">
                        <span>CARB</span>
                        <span className="text-zinc-350">{loggedCarb}g / {targetCarb}g</span>
                      </div>
                      <div className="w-full bg-[#000000] border border-zinc-850 h-1 rounded-sm overflow-hidden">
                        <div className="bg-zinc-200 h-full transition-all duration-500" style={{ width: `${carbPercent}%` }} />
                      </div>
                      <div className="text-right text-[8px] font-mono text-zinc-555 font-bold">{carbPercent}%</div>
                    </div>

                    {/* Fat */}
                    <div className="border border-zinc-900 bg-[#000000]/40 p-2 rounded space-y-1">
                      <div className="flex justify-between text-[8px] font-mono text-zinc-555 uppercase tracking-wider font-bold">
                        <span>FAT</span>
                        <span className="text-zinc-350">{loggedFat}g / {targetFat}g</span>
                      </div>
                      <div className="w-full bg-[#000000] border border-zinc-850 h-1 rounded-sm overflow-hidden">
                        <div className="bg-zinc-200 h-full transition-all duration-500" style={{ width: `${fatPercent}%` }} />
                      </div>
                      <div className="text-right text-[8px] font-mono text-zinc-555 font-bold">{fatPercent}%</div>
                    </div>
                  </div>
                </>
              )}

              {/* Log panel */}
              <div className="space-y-3 border-t border-zinc-900 pt-3">
                <span className="text-[9px] font-mono uppercase tracking-widest font-bold text-zinc-500 flex items-center gap-1">
                  <PlusCircle className="h-3.5 w-3.5" /> LOG INTENDED NUTRITION
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div className="space-y-0.5">
                    <label className="text-[7.5px] font-mono text-zinc-550 uppercase font-bold">CALORIES</label>
                    <input
                      type="number"
                      placeholder="kcal"
                      value={logCalInput}
                      onChange={(e) => setLogCalInput(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full bg-[#000000] border border-zinc-855 rounded px-2 py-1 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[7.5px] font-mono text-zinc-550 uppercase font-bold">PRO (G)</label>
                    <input
                      type="number"
                      placeholder="grams"
                      value={logProtInput}
                      onChange={(e) => setLogProtInput(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full bg-[#000000] border border-zinc-855 rounded px-2 py-1 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[7.5px] font-mono text-zinc-555 uppercase font-bold">CARB (G)</label>
                    <input
                      type="number"
                      placeholder="grams"
                      value={logCarbInput}
                      onChange={(e) => setLogCarbInput(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full bg-[#000000] border border-zinc-855 rounded px-2 py-1 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[7.5px] font-mono text-zinc-555 uppercase font-bold">FAT (G)</label>
                    <input
                      type="number"
                      placeholder="grams"
                      value={logFatInput}
                      onChange={(e) => setLogFatInput(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full bg-[#000000] border border-zinc-855 rounded px-2 py-1 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleCustomLog}
                      className="w-full h-8 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-[9.5px] font-mono font-bold uppercase tracking-wider transition-colors"
                    >
                      LOG
                    </button>
                  </div>
                </div>

                {/* Pre-calculated entries */}
                <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-zinc-900/50">
                  <button
                    onClick={() => handleLogNutrition(250, 30, 3, 2)}
                    className="px-2 py-1 border border-zinc-905 bg-[#000000]/60 hover:bg-[#0a0a0a] text-[8.5px] font-mono text-zinc-400 rounded uppercase font-bold transition-all active:scale-95"
                  >
                    + SHAKE (30g P, 250 kcal)
                  </button>
                  <button
                    onClick={() => handleLogNutrition(650, 45, 75, 18)}
                    className="px-2 py-1 border border-zinc-905 bg-[#000000]/60 hover:bg-[#0a0a0a] text-[8.5px] font-mono text-zinc-400 rounded uppercase font-bold transition-all active:scale-95"
                  >
                    + MEAL (45g P, 650 kcal)
                  </button>
                  <button
                    onClick={() => handleLogNutrition(150, 1, 35, 0)}
                    className="px-2 py-1 border border-zinc-905 bg-[#000000]/60 hover:bg-[#0a0a0a] text-[8.5px] font-mono text-zinc-400 rounded uppercase font-bold transition-all active:scale-95"
                  >
                    + SNACK (35g C, 150 kcal)
                  </button>
                  <button
                    onClick={handleResetNutrition}
                    className="ml-auto px-2 py-1 border border-zinc-905 bg-red-950/10 hover:bg-red-950/20 text-[8.5px] font-mono text-red-400 rounded uppercase font-bold transition-all active:scale-95"
                  >
                    RESET
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
