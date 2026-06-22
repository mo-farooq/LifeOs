"use client";

import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Heart, 
  Dumbbell, 
  Wallet,
  Zap,
  Brain,
  BookOpen,
  Compass,
  Menu,
  X,
  Settings
} from "lucide-react";
import { ModuleConfig } from "@/types";
import { NavTab } from "./sidebar";

interface BottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  modules: ModuleConfig;
}

export default function BottomNav({ activeTab, setActiveTab, modules }: BottomNavProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Main 3 visible tabs
  const mainNavItems = [
    { id: "dashboard" as NavTab, label: "MAIN", icon: LayoutDashboard },
    { id: "gym" as NavTab, label: "GYM", icon: Dumbbell },
    { id: "salah" as NavTab, label: "SLH", icon: Compass },
  ].filter(item => item.id === "dashboard" || modules[item.id as keyof ModuleConfig]);

  // Hidden tabs that go into the "MORE" drawer
  const moreNavItems = [
    { id: "health" as NavTab, label: "HEALTH", icon: Heart, desc: "Biomarkers & Macros" },
    { id: "finance" as NavTab, label: "FINANCE", icon: Wallet, desc: "Ledger & Subscriptions" },
    { id: "focus" as NavTab, label: "FOCUS ROOM", icon: Zap, desc: "Pomodoro & Lo-Fi" },
    { id: "brain" as NavTab, label: "SECOND BRAIN", icon: Brain, desc: "Notes & Ideas" },
    { id: "reviews" as NavTab, label: "REFLECTIONS", icon: BookOpen, desc: "Daily Audits & AI Report" },
    { id: "settings" as NavTab, label: "SETTINGS", icon: Settings, desc: "System Config & Backups" },
  ].filter(item => item.id === "settings" || modules[item.id as keyof ModuleConfig]);

  const visibleTabIds = ["dashboard", "gym", "salah"];
  const isMoreActive = !visibleTabIds.includes(activeTab);

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#000000] border-t border-zinc-800 text-zinc-550 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-2.5 px-6">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          {/* Main 3 tabs */}
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !isMoreOpen;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMoreOpen(false);
                }}
                className="flex flex-col items-center justify-center py-1.5 px-2 rounded transition-all duration-150 relative group flex-grow"
              >
                <div
                  className={`p-1.5 rounded transition-all duration-150 ${
                    isActive 
                      ? "bg-[#0a0a0a] border border-zinc-800 text-zinc-100" 
                      : "text-zinc-550 hover:text-zinc-350"
                  }`}
                >
                  <Icon className="h-5.5 w-5.5" />
                </div>
                <span
                  className={`text-[9px] font-mono tracking-wider mt-0.5 transition-colors duration-150 ${
                    isActive ? "text-zinc-200 font-bold" : "text-zinc-550"
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute top-0 w-6 h-[1px] rounded bg-zinc-200" />
                )}
              </button>
            );
          })}

          {/* MORE Button */}
          {moreNavItems.length > 0 && (
            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className="flex flex-col items-center justify-center py-1.5 px-2 rounded transition-all duration-150 relative group flex-grow"
            >
              <div
                className={`p-1.5 rounded transition-all duration-150 ${
                  isMoreActive || isMoreOpen
                    ? "bg-[#0a0a0a] border border-zinc-800 text-zinc-100" 
                    : "text-zinc-550 hover:text-zinc-350"
                }`}
              >
                {isMoreOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
              </div>
              <span
                className={`text-[9px] font-mono tracking-wider mt-0.5 transition-colors duration-150 ${
                  isMoreActive || isMoreOpen ? "text-zinc-200 font-bold" : "text-zinc-550"
                }`}
              >
                MORE
              </span>
              {isMoreActive && !isMoreOpen && (
                <span className="absolute top-0 w-6 h-[1px] rounded bg-zinc-200" />
              )}
            </button>
          )}
        </div>
      </nav>

      {/* MORE Bottom Sheet Drawer */}
      {(isMoreOpen && moreNavItems.length > 0) && (
        <div 
          className="md:hidden fixed inset-0 z-30 bg-[#000000]/80 transition-opacity animate-fade-in pb-[calc(56px+env(safe-area-inset-bottom))]" 
          onClick={() => setIsMoreOpen(false)}
        >
          <div 
            className="fixed bottom-[calc(56px+env(safe-area-inset-bottom))] left-0 right-0 bg-[#0a0a0a] border-t border-zinc-800 rounded-t-xl p-4 pb-6 space-y-4 animate-slide-up shadow-[0_-8px_30px_rgb(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle decoration */}
            <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto" />
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold">NAVIGATION UTILITY</span>
              <span className="text-[8px] font-mono text-zinc-550 uppercase tracking-widest font-bold">SELECT ROUTE</span>
            </div>

            {/* Grid list of hidden tabs */}
            <div className="grid grid-cols-1 gap-2">
              {moreNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMoreOpen(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded border text-left transition-all ${
                      isActive
                        ? "bg-zinc-900/30 border-zinc-300 text-zinc-50"
                        : "bg-[#000000]/60 border-zinc-900 hover:bg-[#0a0a0a] text-zinc-450 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded bg-zinc-900 border ${isActive ? "border-zinc-700 text-zinc-150" : "border-zinc-850 text-zinc-500"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold font-mono tracking-wider">{item.label}</p>
                        <p className="text-[8px] font-mono text-zinc-555 uppercase tracking-wide">{item.desc}</p>
                      </div>
                    </div>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-zinc-100 animate-pulse" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Embedded CSS Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
}
