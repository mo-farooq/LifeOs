"use client";

import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Heart, 
  Dumbbell, 
  Wallet, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from "lucide-react";

export type NavTab = "dashboard" | "health" | "gym" | "finance";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: "dashboard" as NavTab, label: "Dashboard", icon: LayoutDashboard, color: "text-blue-400" },
    { id: "health" as NavTab, label: "Health", icon: Heart, color: "text-rose-400" },
    { id: "gym" as NavTab, label: "Gym Workout", icon: Dumbbell, color: "text-amber-400" },
    { id: "finance" as NavTab, label: "Finance & Bills", icon: Wallet, color: "text-emerald-400" },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 border-r border-zinc-800 bg-zinc-950 text-zinc-50 transition-all duration-300 ease-in-out z-30 select-none ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-purple-400 shadow-inner">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-sm tracking-wider uppercase bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent truncate">
              Vector Verse
            </span>
          )}
        </div>

        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? "bg-zinc-900/80 border border-zinc-800/80 text-zinc-50 shadow-md shadow-black/20"
                  : "border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
              }`}
            >
              <div
                className={`flex items-center justify-center p-1 rounded-md transition-colors ${
                  isActive ? "bg-zinc-950 border border-zinc-800" : "group-hover:bg-zinc-900"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? item.color : "text-zinc-400 group-hover:text-zinc-200"
                  }`}
                />
              </div>

              {!isCollapsed && (
                <span className="text-sm font-medium tracking-wide transition-opacity duration-200">
                  {item.label}
                </span>
              )}

              {/* Collapsed Tooltip */}
              {isCollapsed && (
                <div className="absolute left-16 scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-150 origin-left bg-zinc-900 border border-zinc-800 text-zinc-50 text-xs font-semibold px-3 py-1.5 rounded-lg pointer-events-none shadow-xl z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}

              {/* Active Tab Accent Bar */}
              {isActive && (
                <span className="absolute right-3 w-1.5 h-6 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Toggle button when collapsed */}
      {isCollapsed && (
        <div className="p-4 border-t border-zinc-800/60 flex justify-center">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-2 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-colors"
            title="Expand Sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
