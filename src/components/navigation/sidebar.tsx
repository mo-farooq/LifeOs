"use client";

import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Heart, 
  Dumbbell, 
  Wallet, 
  ChevronLeft, 
  ChevronRight,
  Activity
} from "lucide-react";

export type NavTab = "dashboard" | "health" | "gym" | "finance";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: "dashboard" as NavTab, label: "DASHBOARD", icon: LayoutDashboard },
    { id: "health" as NavTab, label: "HEALTH", icon: Heart },
    { id: "gym" as NavTab, label: "WORKOUT", icon: Dumbbell },
    { id: "finance" as NavTab, label: "FINANCE", icon: Wallet },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 border-r border-zinc-800 bg-[#000000] text-zinc-50 transition-all duration-200 z-30 select-none ${
        isCollapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-800">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex items-center justify-center p-1.5 rounded-md bg-[#0a0a0a] border border-zinc-800 text-zinc-200">
            <Activity className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <span className="font-mono text-xs uppercase tracking-widest font-bold text-zinc-50 select-none">
              LIFE OS
            </span>
          )}
        </div>

        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded-md border border-zinc-800 bg-[#0a0a0a] hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-colors duration-150"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-all duration-150 group relative ${
                isActive
                  ? "bg-[#0a0a0a] border border-zinc-800 text-zinc-50"
                  : "border border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-[#0a0a0a]/50"
              }`}
            >
              <div className="flex items-center justify-center">
                <Icon
                  className={`h-4 w-4 transition-colors duration-150 ${
                    isActive ? "text-zinc-50" : "text-zinc-500 group-hover:text-zinc-350"
                  }`}
                />
              </div>

              {!isCollapsed && (
                <span className="text-[10px] font-mono font-semibold tracking-widest transition-opacity duration-150">
                  {item.label}
                </span>
              )}

              {/* Collapsed Tooltip */}
              {isCollapsed && (
                <div className="absolute left-14 scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-150 origin-left bg-[#0a0a0a] border border-zinc-800 text-zinc-50 text-[9px] font-mono tracking-widest px-2.5 py-1 rounded pointer-events-none z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}

              {/* Muted indicator dot */}
              {isActive && (
                <span className="absolute right-3.5 w-1.5 h-1.5 rounded-full bg-zinc-100" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Toggle button when collapsed */}
      {isCollapsed && (
        <div className="p-3 border-t border-zinc-800 flex justify-center">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-1.5 rounded-md border border-zinc-800 bg-[#0a0a0a] hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-colors duration-150"
            title="Expand Sidebar"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </aside>
  );
}
