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
import { CharacterStats, Skill, Supplement, WaterConfig } from "@/types";

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
  currentTime
}: HealthViewProps) {
  // Input states for adding
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillKeyResult, setNewSkillKeyResult] = useState("");
  const [newSkillTarget, setNewSkillTarget] = useState<number | "">("");

  const [newSupName, setNewSupName] = useState("");
  const [newSupDose, setNewSupDose] = useState("");
  const [newSupWindow, setNewSupWindow] = useState<"morning" | "lunch" | "evening">("morning");

  // Edit states
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editSkillProgress, setEditSkillProgress] = useState<number | "">("");

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

  // Stats Actions (clamp between 0-10)
  const adjustStat = (field: keyof CharacterStats, amount: number) => {
    const val = stats[field];
    const nextVal = Math.min(Math.max(val + amount, 0), 10);
    updateStats({
      ...stats,
      [field]: nextVal
    });
  };

  // Skill Actions
  const handleAddSkill = () => {
    if (!newSkillName.trim() || !newSkillKeyResult.trim() || newSkillTarget === "") return;
    const newSkill: Skill = {
      id: "sk_" + Date.now(),
      name: newSkillName.trim(),
      keyResult: newSkillKeyResult.trim(),
      currentProgress: 0,
      targetProgress: Number(newSkillTarget)
    };
    updateSkills([...skills, newSkill]);
    setNewSkillName("");
    setNewSkillKeyResult("");
    setNewSkillTarget("");
  };

  const handleDeleteSkill = (id: string) => {
    updateSkills(skills.filter(s => s.id !== id));
  };

  const handleCommitSkillProgress = (id: string) => {
    if (editSkillProgress === "") return;
    const progress = Math.min(Math.max(Number(editSkillProgress), 0), 99999);
    updateSkills(
      skills.map(s => s.id === id ? { ...s, currentProgress: progress } : s)
    );
    setEditingSkillId(null);
    setEditSkillProgress("");
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

  // Radar chart coordinates (Center 40,40 Radius 30)
  const W_y = 40 - 3 * stats.willpower;
  const F_x = 40 + 3 * stats.focus;
  const C_y = 40 + 3 * stats.clarity;
  const E_x = 40 - 3 * stats.energy;

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
          
          {/* Character Stats & Radar Matrix */}
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-4 border-b border-zinc-800">
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">CHARACTER CORE</span>
              <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">COGNITIVE BIOMARKERS</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              {/* Double sub-panel split: left sliders, right SVG radar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                
                {/* Sliders (7 cols) */}
                <div className="sm:col-span-7 space-y-3.5">
                  {/* WILLPOWER */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-mono uppercase font-semibold text-zinc-400">
                      <span>WILLPOWER</span>
                      <span className="font-bold text-zinc-250">{stats.willpower}/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-grow bg-[#000000] border border-zinc-850 h-2 rounded-sm overflow-hidden">
                        <div className="bg-zinc-200 h-full transition-all duration-500" style={{ width: `${stats.willpower * 10}%` }} />
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button onClick={() => adjustStat("willpower", -1)} className="px-1.5 py-0.5 rounded border border-zinc-800 bg-[#000000] hover:bg-[#0a0a0a] text-[10px] font-bold font-mono active:scale-90 transition-transform">-</button>
                        <button onClick={() => adjustStat("willpower", 1)} className="px-1.5 py-0.5 rounded border border-zinc-800 bg-[#000000] hover:bg-[#0a0a0a] text-[10px] font-bold font-mono active:scale-90 transition-transform">+</button>
                      </div>
                    </div>
                  </div>

                  {/* FOCUS */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-mono uppercase font-semibold text-zinc-400">
                      <span>FOCUS METRIC</span>
                      <span className="font-bold text-zinc-250">{stats.focus}/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-grow bg-[#000000] border border-zinc-850 h-2 rounded-sm overflow-hidden">
                        <div className="bg-zinc-200 h-full transition-all duration-500" style={{ width: `${stats.focus * 10}%` }} />
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button onClick={() => adjustStat("focus", -1)} className="px-1.5 py-0.5 rounded border border-zinc-800 bg-[#000000] hover:bg-[#0a0a0a] text-[10px] font-bold font-mono active:scale-90 transition-transform">-</button>
                        <button onClick={() => adjustStat("focus", 1)} className="px-1.5 py-0.5 rounded border border-zinc-800 bg-[#000000] hover:bg-[#0a0a0a] text-[10px] font-bold font-mono active:scale-90 transition-transform">+</button>
                      </div>
                    </div>
                  </div>

                  {/* CLARITY */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-mono uppercase font-semibold text-zinc-400">
                      <span>CLARITY LEVEL</span>
                      <span className="font-bold text-zinc-250">{stats.clarity}/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-grow bg-[#000000] border border-zinc-850 h-2 rounded-sm overflow-hidden">
                        <div className="bg-zinc-200 h-full transition-all duration-500" style={{ width: `${stats.clarity * 10}%` }} />
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button onClick={() => adjustStat("clarity", -1)} className="px-1.5 py-0.5 rounded border border-zinc-800 bg-[#000000] hover:bg-[#0a0a0a] text-[10px] font-bold font-mono active:scale-90 transition-transform">-</button>
                        <button onClick={() => adjustStat("clarity", 1)} className="px-1.5 py-0.5 rounded border border-zinc-800 bg-[#000000] hover:bg-[#0a0a0a] text-[10px] font-bold font-mono active:scale-90 transition-transform">+</button>
                      </div>
                    </div>
                  </div>

                  {/* ENERGY */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-mono uppercase font-semibold text-zinc-400">
                      <span>ADAPTOGEN ENERGY</span>
                      <span className="font-bold text-zinc-250">{stats.energy}/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-grow bg-[#000000] border border-zinc-850 h-2 rounded-sm overflow-hidden">
                        <div className="bg-zinc-200 h-full transition-all duration-500" style={{ width: `${stats.energy * 10}%` }} />
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button onClick={() => adjustStat("energy", -1)} className="px-1.5 py-0.5 rounded border border-zinc-800 bg-[#000000] hover:bg-[#0a0a0a] text-[10px] font-bold font-mono active:scale-90 transition-transform">-</button>
                        <button onClick={() => adjustStat("energy", 1)} className="px-1.5 py-0.5 rounded border border-zinc-800 bg-[#000000] hover:bg-[#0a0a0a] text-[10px] font-bold font-mono active:scale-90 transition-transform">+</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SVG Radar Chart (5 cols) */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-zinc-900 pt-4 sm:pt-0 sm:pl-4">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 80 80">
                      {/* Grid reference backgrounds */}
                      {/* Max level 10 */}
                      <polygon points="40,10 70,40 40,70 10,40" className="fill-none stroke-zinc-850 stroke-[0.5]" />
                      {/* Mid level 5 */}
                      <polygon points="40,25 55,40 40,55 25,40" className="fill-none stroke-zinc-900 stroke-[0.5]" />
                      
                      {/* Axes */}
                      <line x1="40" y1="10" x2="40" y2="70" className="stroke-zinc-900 stroke-[0.5] stroke-dashed" />
                      <line x1="10" y1="40" x2="70" y2="40" className="stroke-zinc-900 stroke-[0.5] stroke-dashed" />
                      
                      {/* Axis Label placements */}
                      <text x="40" y="8" className="text-[5px] fill-zinc-550 font-mono text-center uppercase font-bold" textAnchor="middle">Will</text>
                      <text x="73" y="42" className="text-[5px] fill-zinc-550 font-mono uppercase font-bold" textAnchor="start">Foc</text>
                      <text x="40" y="78" className="text-[5px] fill-zinc-550 font-mono uppercase font-bold" textAnchor="middle">Clar</text>
                      <text x="7" y="42" className="text-[5px] fill-zinc-550 font-mono uppercase font-bold" textAnchor="end">Eng</text>

                      {/* Stat area polygon with smooth transition */}
                      <polygon
                        points={`40,${W_y} ${F_x},40 40,${C_y} ${E_x},40`}
                        className="fill-zinc-100/[0.08] stroke-zinc-200 stroke-[1.5] transition-all duration-500"
                      />

                      {/* Individual nodes */}
                      <circle cx="40" cy={W_y} r="1.5" className="fill-zinc-100 transition-all duration-500" />
                      <circle cx={F_x} cy="40" r="1.5" className="fill-zinc-100 transition-all duration-500" />
                      <circle cx="40" cy={C_y} r="1.5" className="fill-zinc-100 transition-all duration-500" />
                      <circle cx={E_x} cy="40" r="1.5" className="fill-zinc-100 transition-all duration-500" />
                    </svg>
                  </div>
                  <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest font-bold mt-1">COGNITIVE RADAR</span>
                </div>

              </div>

            </CardContent>
          </Card>

          {/* Skill Tree Matrix */}
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-4 border-b border-zinc-800">
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">TALENT PATHS</span>
              <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">SKILL DEVELOPMENT TREE</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              {/* Skill rows list */}
              <div className="space-y-2">
                {skills.map((skill) => (
                  <div key={skill.id} className="group border border-zinc-900 bg-[#000000]/60 hover:bg-[#0a0a0a] rounded px-3 py-2 flex items-center justify-between text-xs transition-colors">
                    <div className="space-y-0.5 flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-200">{skill.name}</span>
                        <span className="text-[8px] font-mono bg-zinc-900 text-zinc-500 border border-zinc-850 px-1 rounded uppercase tracking-wide">OKR</span>
                      </div>
                      <p className="text-[9px] font-mono text-zinc-555 uppercase tracking-wide">{skill.keyResult}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {editingSkillId === skill.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={editSkillProgress}
                            onChange={(e) => setEditSkillProgress(e.target.value === "" ? "" : Number(e.target.value))}
                            className="w-16 bg-transparent border border-zinc-800 rounded text-right px-2 py-0.5 text-xs font-mono"
                            placeholder="Val"
                            autoFocus
                          />
                          <button
                            onClick={() => handleCommitSkillProgress(skill.id)}
                            className="px-2 py-0.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-[9px] font-mono font-bold uppercase"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <span 
                          onClick={() => {
                            setEditingSkillId(skill.id);
                            setEditSkillProgress(skill.currentProgress);
                          }}
                          className="font-mono text-zinc-300 font-bold hover:text-zinc-100 cursor-pointer"
                        >
                          {skill.currentProgress} / {skill.targetProgress}
                        </span>
                      )}

                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="text-zinc-650 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                
                {skills.length === 0 && (
                  <div className="text-center py-4 text-[9px] font-mono uppercase tracking-widest text-zinc-650">No development skills logged.</div>
                )}
              </div>

              {/* Add Skill form */}
              <div className="flex flex-col gap-2 pt-3 border-t border-zinc-900 mt-2">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="NEW SKILL NAME..."
                  className="bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-700 transition-all"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillKeyResult}
                    onChange={(e) => setNewSkillKeyResult(e.target.value)}
                    placeholder="KEY RESULT TARGET..."
                    className="flex-1 bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-700 transition-all"
                  />
                  <input
                    type="number"
                    value={newSkillTarget}
                    onChange={(e) => setNewSkillTarget(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="TARGET..."
                    className="w-20 bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-700 transition-all"
                  />
                  <button
                    onClick={handleAddSkill}
                    className="px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-[9px] tracking-widest uppercase transition-all"
                  >
                    Add
                  </button>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Column: Supplements & Water Calculator */}
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
                  <div className="w-full bg-[#000000] border border-zinc-850 h-1.5 rounded-sm overflow-hidden">
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
                      className="w-full bg-[#000000] border border-zinc-850 rounded px-2 py-1 text-xs font-mono text-zinc-200 outline-none focus:border-zinc-700"
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

      </div>
    </div>
  );
}
