"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Heart, 
  Dumbbell, 
  Wallet 
} from "lucide-react";
import { NavTab } from "./sidebar";

interface BottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const navItems = [
    { id: "dashboard" as NavTab, label: "DASHBOARD", icon: LayoutDashboard },
    { id: "health" as NavTab, label: "HEALTH", icon: Heart },
    { id: "gym" as NavTab, label: "WORKOUT", icon: Dumbbell },
    { id: "finance" as NavTab, label: "FINANCE", icon: Wallet },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#000000] border-t border-zinc-800 text-zinc-50 pb-[calc(env(safe-area-inset-bottom)+0.25rem)] pt-1.5 px-3">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center py-1 px-2.5 rounded transition-all duration-150 relative group"
            >
              <div
                className={`p-1 rounded-md transition-all duration-150 ${
                  isActive 
                    ? "bg-[#0a0a0a] border border-zinc-800 text-zinc-100" 
                    : "text-zinc-500 hover:text-zinc-350"
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 ${
                    isActive ? "text-zinc-100" : "text-zinc-500"
                  }`}
                />
              </div>
              <span
                className={`text-[8px] font-mono tracking-widest mt-1 transition-colors duration-150 ${
                  isActive ? "text-zinc-200 font-bold" : "text-zinc-500"
                }`}
              >
                {item.label}
              </span>
              
              {isActive && (
                <span className="absolute top-0 w-6 h-[1.5px] rounded bg-zinc-200" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
