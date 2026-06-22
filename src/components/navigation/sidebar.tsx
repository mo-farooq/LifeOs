"use client";

import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Heart, 
  Dumbbell, 
  Wallet, 
  ChevronLeft, 
  ChevronRight,
  Activity,
  Zap,
  Brain,
  BookOpen,
  Compass,
  Settings
} from "lucide-react";

import { ModuleConfig, SleepConfig } from "@/types";

export type NavTab = "dashboard" | "health" | "gym" | "finance" | "focus" | "brain" | "reviews" | "salah" | "settings";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentTime: Date;
  modules: ModuleConfig;
  sleepConfig: SleepConfig;
}

export default function Sidebar({ activeTab, setActiveTab, currentTime, modules, sleepConfig }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeModules = [
    { id: "dashboard" as NavTab, label: "DASHBOARD", icon: LayoutDashboard },
    { id: "health" as NavTab, label: "HEALTH", icon: Heart },
    { id: "gym" as NavTab, label: "WORKOUT", icon: Dumbbell },
    { id: "finance" as NavTab, label: "FINANCE", icon: Wallet },
    { id: "focus" as NavTab, label: "FOCUS ROOM", icon: Zap },
    { id: "brain" as NavTab, label: "SECOND BRAIN", icon: Brain },
    { id: "reviews" as NavTab, label: "REFLECTIONS", icon: BookOpen },
    { id: "salah" as NavTab, label: "SALAH TRACKER", icon: Compass },
  ].filter(item => item.id === "dashboard" || modules[item.id as keyof ModuleConfig]);

  const navItems = [
    ...activeModules,
    { id: "settings" as NavTab, label: "SETTINGS", icon: Settings }
  ];

  // Awake Progress calculations
  const getAwakeProgress = () => {
    const start = sleepConfig?.awakeHourStart ?? 6;
    const end = sleepConfig?.awakeHourEnd ?? 22;
    
    const hour = currentTime.getHours();
    const min = currentTime.getMinutes();
    const decimalTime = hour + min / 60;

    let isAwake = false;
    let elapsed = 0;
    let total = 0;

    if (start < end) {
      total = end - start;
      if (decimalTime >= start && decimalTime < end) {
        isAwake = true;
        elapsed = decimalTime - start;
      }
    } else if (start > end) {
      total = (24 - start) + end;
      if (decimalTime >= start || decimalTime < end) {
        isAwake = true;
        elapsed = decimalTime >= start ? (decimalTime - start) : ((24 - start) + decimalTime);
      }
    } else {
      total = 24;
      isAwake = true;
      elapsed = (decimalTime - start + 24) % 24;
    }

    if (!isAwake) {
      return { percent: 0, sleeping: true };
    }

    const percent = Math.min(Math.round((elapsed / total) * 100), 100);
    return { percent, sleeping: false };
  };

  const awakeStatus = getAwakeProgress();

  const getActivePhase = () => {
    if (awakeStatus.sleeping) return "SLEEPING";
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return "MORNING";
    if (hour >= 12 && hour < 15) return "MIDDAY";
    if (hour >= 15 && hour < 18) return "AFTERNOON";
    if (hour >= 18 && hour < 22) return "EVENING";
    return "BEDTIME";
  };

  const format12HourClock = () => {
    let hours = currentTime.getHours();
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  // SVG calculations for Ring
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (awakeStatus.percent / 100) * circumference;

  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 border-r border-zinc-800 bg-[#000000] text-zinc-50 transition-all duration-200 z-30 select-none ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-20 px-5 border-b border-zinc-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center p-2 rounded-md bg-[#0a0a0a] border border-zinc-800 text-zinc-200">
            <Activity className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <span className="font-mono text-sm uppercase tracking-widest font-bold text-zinc-50 select-none">
              LIFE OS
            </span>
          )}
        </div>

        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-md border border-zinc-800 bg-[#0a0a0a] hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-colors duration-150"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-grow px-3 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-150 group relative ${
                isActive
                  ? "bg-[#0a0a0a] border border-zinc-800 text-zinc-50"
                  : "border border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-[#0a0a0a]/50"
              }`}
            >
              <div className="flex items-center justify-center">
                <Icon
                  className={`h-5 w-5 transition-colors duration-150 ${
                    isActive ? "text-zinc-50" : "text-zinc-500 group-hover:text-zinc-350"
                  }`}
                />
              </div>

              {!isCollapsed && (
                <span className="text-xs font-mono font-semibold tracking-widest transition-opacity duration-150">
                  {item.label}
                </span>
              )}

              {/* Collapsed Tooltip */}
              {isCollapsed && (
                <div className="absolute left-16 scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-150 origin-left bg-[#0a0a0a] border border-zinc-800 text-xs font-mono tracking-widest px-3 py-1.5 rounded pointer-events-none z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}

              {/* Muted indicator dot */}
              {isActive && (
                <span className="absolute right-4 w-1.5 h-1.5 rounded-full bg-zinc-100" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Mechanical SVG Awake Progress Ring Section */}
      {!isCollapsed && (
        <div className="p-6 border-t border-zinc-900 bg-[#000000] flex flex-col items-center gap-4">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="absolute w-full h-full -rotate-90 origin-center" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-zinc-900 fill-none stroke-[3]"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-zinc-100 fill-none stroke-[3] transition-all duration-500"
                strokeDasharray={circumference}
                strokeDashoffset={awakeStatus.sleeping ? circumference : strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            
            <div className="text-center z-10 flex flex-col items-center justify-center space-y-1.5">
              <span className="text-sm font-mono font-bold tracking-tight text-zinc-100">
                {awakeStatus.sleeping ? "0%" : `${awakeStatus.percent}%`}
              </span>
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
                {getActivePhase()}
              </span>
              <span className="text-xs font-mono text-zinc-300 font-bold whitespace-nowrap">
                {format12HourClock()}
              </span>
            </div>
          </div>
          <div className="text-center">
            <span className="text-[9.5px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
              {awakeStatus.sleeping ? "AWAKE WINDOW DEACTIVATED" : "AWAKE WINDOW ACTIVE"}
            </span>
          </div>
        </div>
      )}

      {/* Footer Toggle button when collapsed */}
      {isCollapsed && (
        <div className="p-4 border-t border-zinc-800 flex justify-center">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-2 rounded-md border border-zinc-800 bg-[#0a0a0a] hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-colors duration-150"
            title="Expand Sidebar"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      )}
    </aside>
  );
}
