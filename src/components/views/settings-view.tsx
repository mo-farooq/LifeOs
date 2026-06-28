"use client";

import React from "react";
import { Settings, Database, Upload, Download, LogOut, Clock } from "lucide-react";
import { ModuleConfig, BlocksConfig, SleepConfig } from "@/types";

interface SettingsViewProps {
  modules: ModuleConfig;
  updateModules: (modules: ModuleConfig) => void;
  blocksConfig?: BlocksConfig;
  updateBlocksConfig: (blocksConfig: BlocksConfig) => void;
  sleepConfig?: SleepConfig;
  updateSleepConfig: (sleepConfig: SleepConfig) => void;
  handleExportBackup: () => void;
  handleImportBackup: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSignOut: () => void;
}

const defaultBlocksConfig: BlocksConfig = {
  macroMonitor: true,
  waterCoach: true,
  supplementStack: true,
  workoutSplit: true,
  photoMatrix: true,
  netWorthProgress: true,
  recurringSubs: true,
  purchaseOrders: true,
};

const defaultSleepConfig: SleepConfig = {
  awakeHourStart: 6,
  awakeHourEnd: 22,
};

export default function SettingsView({
  modules,
  updateModules,
  blocksConfig,
  updateBlocksConfig,
  sleepConfig,
  updateSleepConfig,
  handleExportBackup,
  handleImportBackup,
  onSignOut,
}: SettingsViewProps) {
  const activeBlocks = blocksConfig || defaultBlocksConfig;
  const activeSleep = sleepConfig || defaultSleepConfig;

  // Custom Monochrome Checkbox element
  const Checkbox = ({
    checked,
    onChange,
    disabled,
  }: {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
  }) => {
    return (
      <button
        type="button"
        onClick={disabled ? undefined : onChange}
        className={`w-5.5 h-5.5 rounded-[4px] border flex items-center justify-center transition-all duration-150 flex-shrink-0 ${
          checked
            ? "border-white bg-white text-black"
            : "border-zinc-700 bg-transparent text-transparent hover:border-zinc-500"
        } ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
        disabled={disabled}
      >
        {checked && (
          <svg className="w-3.5 h-3.5 stroke-[3.5] text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
    );
  };

  const handleParentToggle = (key: keyof ModuleConfig) => {
    const nextVal = !modules[key];
    const newModules = { ...modules, [key]: nextVal };

    // Apply nested changes in the blocksConfig
    const newBlocks = { ...activeBlocks };
    if (key === "health") {
      newBlocks.macroMonitor = nextVal;
      newBlocks.waterCoach = nextVal;
      newBlocks.supplementStack = nextVal;
    } else if (key === "gym") {
      newBlocks.workoutSplit = nextVal;
      newBlocks.photoMatrix = nextVal;
    } else if (key === "finance") {
      newBlocks.netWorthProgress = nextVal;
      newBlocks.recurringSubs = nextVal;
      newBlocks.purchaseOrders = nextVal;
    }

    updateModules(newModules);
    updateBlocksConfig(newBlocks);
  };

  const handleChildToggle = (key: keyof BlocksConfig, parentKey: keyof ModuleConfig) => {
    // If parent is OFF, do nothing (user can't toggle a hidden/inactive child)
    if (!modules[parentKey]) return;

    const nextVal = !activeBlocks[key];
    const newBlocks = { ...activeBlocks, [key]: nextVal };
    updateBlocksConfig(newBlocks);
  };

  return (
    <div className="space-y-12 text-zinc-50 max-w-5xl mx-auto py-6">
      {/* Header */}
      <div className="space-y-3 border-b border-zinc-800 pb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center p-2.5 rounded-md bg-[#0a0a0a] border border-zinc-800 text-zinc-200">
            <Settings className="h-5 w-5" />
          </div>
          <h1 className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold">
            SYSTEM REGISTRY & CONFIGURATION
          </h1>
        </div>
        <p className="text-xs text-zinc-400 font-mono tracking-wide leading-relaxed uppercase">
          Configure active system modules, personalize layout blocks, and manage localized registry storage.
        </p>
      </div>

      {/* Grid Settings Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-10">
        
        {/* Left Column: Dashboard Views Registry (Main & Indented Children) */}
        <div className="md:col-span-2 space-y-8">
          <div className="space-y-6">
            <div className="border-b border-zinc-850 pb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 font-bold">
                WORKSPACE DASHBOARD VIEWS
              </span>
            </div>

            <div className="space-y-8">
              {/* Health Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                  <div className="space-y-1">
                    <span className="text-sm font-bold font-mono tracking-widest uppercase text-zinc-200">
                      Health Dashboard
                    </span>
                    <p className="text-xs text-zinc-500 font-mono">
                      Water tracker, supplements checklist, and macro configuration logs.
                    </p>
                  </div>
                  <Checkbox 
                    checked={modules.health} 
                    onChange={() => handleParentToggle("health")} 
                  />
                </div>
                
                {/* Health Indented Children */}
                <div className={`pl-6 border-l border-zinc-900 space-y-3.5 transition-all duration-200 ${!modules.health ? "opacity-30 pointer-events-none" : ""}`}>
                  {[
                    { key: "macroMonitor" as const, label: "Nutritional Macro Tracker", desc: "Detailed caloric and macronutrient daily tracking" },
                    { key: "waterCoach" as const, label: "Daily Hydration Log", desc: "Intelligent substance-aware water intake counselor" },
                    { key: "supplementStack" as const, label: "Supplement Checklist", desc: "Daily micronutrients and vitamin stack tracker" }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-1">
                      <div className="space-y-1">
                        <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider font-semibold">
                          {item.label}
                        </span>
                        <p className="text-xs text-zinc-650 font-mono">{item.desc}</p>
                      </div>
                      <Checkbox 
                        checked={modules.health ? activeBlocks[item.key] : false} 
                        onChange={() => handleChildToggle(item.key, "health")}
                        disabled={!modules.health}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Gym Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                  <div className="space-y-1">
                    <span className="text-sm font-bold font-mono tracking-widest uppercase text-zinc-200">
                      Fitness & Workouts Dashboard
                    </span>
                    <p className="text-xs text-zinc-500 font-mono">
                      Routine builder, splits planner, exercise databases, and progression.
                    </p>
                  </div>
                  <Checkbox 
                    checked={modules.gym} 
                    onChange={() => handleParentToggle("gym")} 
                  />
                </div>
                
                {/* Gym Indented Children */}
                <div className={`pl-6 border-l border-zinc-900 space-y-3.5 transition-all duration-200 ${!modules.gym ? "opacity-30 pointer-events-none" : ""}`}>
                  {[
                    { key: "workoutSplit" as const, label: "Workout Split & Gym Routine Planner", desc: "Routine exercises database and current split planner" },
                    { key: "photoMatrix" as const, label: "Physical Progress Photos", desc: "Visual fitness journey and progress photos tracker" }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-1">
                      <div className="space-y-1">
                        <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider font-semibold">
                          {item.label}
                        </span>
                        <p className="text-xs text-zinc-650 font-mono">{item.desc}</p>
                      </div>
                      <Checkbox 
                        checked={modules.gym ? activeBlocks[item.key] : false} 
                        onChange={() => handleChildToggle(item.key, "gym")}
                        disabled={!modules.gym}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Finance Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                  <div className="space-y-1">
                    <span className="text-sm font-bold font-mono tracking-widest uppercase text-zinc-200">
                      Wealth & Finances Dashboard
                    </span>
                    <p className="text-xs text-zinc-500 font-mono">
                      Asset sheets, recurring auto-debits, and pending package trackers.
                    </p>
                  </div>
                  <Checkbox 
                    checked={modules.finance} 
                    onChange={() => handleParentToggle("finance")} 
                  />
                </div>
                
                {/* Finance Indented Children */}
                <div className={`pl-6 border-l border-zinc-900 space-y-3.5 transition-all duration-200 ${!modules.finance ? "opacity-30 pointer-events-none" : ""}`}>
                  {[
                    { key: "netWorthProgress" as const, label: "Net Worth & Assets Allocation", desc: "Asset ledger, liability tracker, and net worth charts" },
                    { key: "recurringSubs" as const, label: "Active Subscriptions Watcher", desc: "Watcher for active monthly recurring auto-debit payments" },
                    { key: "purchaseOrders" as const, label: "Package & Purchase Orders Tracker", desc: "Package shipping status and direct purchase order trackers" }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-1">
                      <div className="space-y-1">
                        <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider font-semibold">
                          {item.label}
                        </span>
                        <p className="text-xs text-zinc-650 font-mono">{item.desc}</p>
                      </div>
                      <Checkbox 
                        checked={modules.finance ? activeBlocks[item.key] : false} 
                        onChange={() => handleChildToggle(item.key, "finance")}
                        disabled={!modules.finance}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Standalone Modules List */}
              <div className="space-y-6 pt-8 border-t border-zinc-800">
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 font-bold">
                  STANDALONE WORKSPACE MODULES
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 md:gap-6">
                  {[
                    { key: "salah" as keyof ModuleConfig, label: "Salah Tracker", desc: "Prayer streak & daily compliance log" },
                    { key: "focus" as keyof ModuleConfig, label: "Focus Room", desc: "Pomodoro timers & ambient background music" },
                    { key: "brain" as keyof ModuleConfig, label: "Second Brain", desc: "Idea registers, wiki pages, and notebooks" },
                    { key: "reviews" as keyof ModuleConfig, label: "Reflections Center", desc: "Startup/shutdown checks & periodic reviews" }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-md border border-zinc-800 bg-[#040404]">
                      <div className="space-y-1 pr-2">
                        <span className="text-sm font-bold font-mono tracking-widest uppercase text-zinc-200">
                          {item.label}
                        </span>
                        <p className="text-xs text-zinc-500 font-mono leading-normal">{item.desc}</p>
                      </div>
                      <Checkbox 
                        checked={modules[item.key]} 
                        onChange={() => updateModules({ ...modules, [item.key]: !modules[item.key] })} 
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Sleep Window & DB Backups */}
        <div className="space-y-10">
          
          {/* Awake hour configuration card */}
          <div className="p-3.5 sm:p-5 md:p-6 border border-zinc-850 bg-black rounded-md space-y-6">
            <div className="flex items-center gap-2.5 border-b border-zinc-900 pb-3">
              <Clock className="h-4.5 w-4.5 text-zinc-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-450 font-bold">
                AWAKE WINDOW CONFIG
              </span>
            </div>

            <div className="space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-zinc-500 font-mono uppercase tracking-widest font-bold">
                  Awake Start Hour
                </label>
                <select
                  value={activeSleep.awakeHourStart}
                  onChange={(e) => {
                    updateSleepConfig({
                      ...activeSleep,
                      awakeHourStart: Number(e.target.value)
                    });
                  }}
                  className="w-full bg-[#0a0a0a] border border-zinc-800 rounded px-4 py-2.5 text-sm font-mono text-zinc-250 focus:outline-none focus:border-zinc-700"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i}>
                      {String(i).padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-zinc-500 font-mono uppercase tracking-widest font-bold">
                  Awake End Hour
                </label>
                <select
                  value={activeSleep.awakeHourEnd}
                  onChange={(e) => {
                    updateSleepConfig({
                      ...activeSleep,
                      awakeHourEnd: Number(e.target.value)
                    });
                  }}
                  className="w-full bg-[#0a0a0a] border border-zinc-800 rounded px-4 py-2.5 text-sm font-mono text-zinc-250 focus:outline-none focus:border-zinc-700"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i}>
                      {String(i).padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Database maintenance backup card */}
          <div className="p-3.5 sm:p-5 md:p-6 border border-zinc-850 bg-black rounded-md space-y-6">
            <div className="flex items-center gap-2.5 border-b border-zinc-900 pb-3">
              <Database className="h-4.5 w-4.5 text-zinc-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-455 font-bold">
                REGISTRY MAINTENANCE
              </span>
            </div>

            <div className="flex flex-col gap-3.5">
              <button
                onClick={handleExportBackup}
                className="w-full py-2.5 bg-[#0a0a0a] hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded text-xs font-bold uppercase tracking-wider text-zinc-200 transition-colors duration-150 font-mono flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Backup (JSON)
              </button>
              
              <label className="w-full py-2.5 bg-[#0a0a0a] hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded text-xs font-bold uppercase tracking-wider text-zinc-200 transition-colors duration-150 text-center cursor-pointer font-mono flex items-center justify-center gap-2">
                <Upload className="h-4 w-4" />
                Import Backup (JSON)
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Sign Out Card */}
          <div className="p-3.5 sm:p-5 md:p-6 border border-red-950/40 bg-black rounded-md space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-red-500 font-bold">
              CRITICAL ACTIONS
            </span>
            <button
              onClick={onSignOut}
              className="w-full py-2.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/60 hover:border-red-900 text-red-500 rounded text-xs font-bold uppercase tracking-wider transition-colors duration-150 font-mono flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out Session
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
