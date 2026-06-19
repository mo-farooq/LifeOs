"use client";

import React, { useState, useEffect } from "react";
import Sidebar, { NavTab } from "@/components/navigation/sidebar";
import BottomNav from "@/components/navigation/bottom-nav";

// Views
import DashboardView from "@/components/views/dashboard-view";
import HealthView from "@/components/views/health-view";
import GymView from "@/components/views/gym-view";
import FinanceView from "@/components/views/finance-view";

// Header widgets
import { Bell, Search, Calendar, User, Zap } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // Fix hydration issues
  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#09090b] text-zinc-50 font-sans">
        <div className="flex flex-col items-center gap-3">
          <Zap className="h-8 w-8 text-purple-500 animate-bounce" />
          <span className="text-xs uppercase tracking-widest text-zinc-500 animate-pulse font-semibold">
            Initializing Life OS...
          </span>
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "health":
        return <HealthView />;
      case "gym":
        return <GymView />;
      case "finance":
        return <FinanceView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#000000] text-zinc-50 font-sans">
      {/* Desktop Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Global Desktop Header */}
        <header className="h-16 border-b border-zinc-800 bg-[#000000] px-6 flex items-center justify-between z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#0a0a0a] border border-zinc-800 text-zinc-400 uppercase tracking-widest">
              {activeTab} VIEW
            </span>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-4">
            {/* Clock Widget */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#0a0a0a] border border-zinc-800 text-[10px] font-mono text-zinc-400">
              <Calendar className="h-3.5 w-3.5 text-zinc-500" />
              <span>{currentTime || "00:00"}</span>
            </div>

            {/* Search Bar */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="SEARCH LIFE OS..."
                className="w-48 lg:w-64 bg-transparent border border-zinc-800 rounded-md py-1.5 pl-9 pr-4 text-xs font-mono placeholder:text-zinc-650 text-zinc-200 outline-none focus:border-zinc-700 transition-all duration-150"
              />
            </div>

            {/* Notifications */}
            <button className="p-1.5 rounded-md border border-zinc-800 hover:bg-[#0a0a0a] text-zinc-400 hover:text-zinc-200 transition-all duration-150 relative">
              <Bell className="h-3.5 w-3.5" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-zinc-400 rounded-full" />
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
              <div className="w-7 h-7 rounded-md bg-[#0a0a0a] border border-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-xs select-none">
                MF
              </div>
              <span className="hidden lg:inline text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                FAROOQ
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Content Workspace */}
        <main className="flex-1 overflow-y-auto px-6 py-6 pb-28 md:pb-8 relative z-10 bg-[#000000]">
          <div className="max-w-6xl mx-auto">
            {renderActiveView()}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
