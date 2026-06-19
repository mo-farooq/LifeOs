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
    { id: "dashboard" as NavTab, label: "Home", icon: LayoutDashboard, color: "text-blue-400" },
    { id: "health" as NavTab, label: "Health", icon: Heart, color: "text-rose-400" },
    { id: "gym" as NavTab, label: "Gym", icon: Dumbbell, color: "text-amber-400" },
    { id: "finance" as NavTab, label: "Finance", icon: Wallet, color: "text-emerald-400" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800 text-zinc-50 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 px-4 shadow-2xl">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 active:scale-95 relative group"
            >
              <div
                className={`p-1.5 rounded-lg transition-all duration-300 ${
                  isActive 
                    ? "bg-zinc-900 border border-zinc-800 scale-110 shadow-md shadow-black/40" 
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? item.color : "text-zinc-400"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-medium tracking-wide mt-1 transition-colors duration-200 ${
                  isActive ? "text-zinc-200 font-semibold" : "text-zinc-500"
                }`}
              >
                {item.label}
              </span>
              
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
