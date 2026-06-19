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
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-zinc-50 font-sans">
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
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-50 font-sans">
      {/* Desktop Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Decorative background glows */}
        <div className="absolute top-[-10%] left-[20%] w-[40rem] h-[40rem] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[10%] w-[30rem] h-[30rem] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

        {/* Global Desktop Header */}
        <header className="h-16 border-b border-zinc-900 bg-zinc-950/40 backdrop-blur-md px-6 flex items-center justify-between z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 capitalize">
              {activeTab} view
            </span>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-4">
            {/* Clock Widget */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 font-medium">
              <Calendar className="h-3.5 w-3.5 text-zinc-500" />
              <span>{currentTime || "00:00"}</span>
            </div>

            {/* Search Bar */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search Life OS..."
                className="w-48 lg:w-64 bg-zinc-900/50 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs placeholder:text-zinc-500 text-zinc-200 outline-none focus:border-zinc-700 focus:bg-zinc-900 transition-all"
              />
            </div>

            {/* Notifications */}
            <button className="p-2 rounded-xl border border-zinc-850 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full" />
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-900">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center border border-zinc-850 text-zinc-950 font-bold text-xs select-none">
                MF
              </div>
              <span className="hidden lg:inline text-xs font-semibold text-zinc-300">
                Farooq
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Content Workspace */}
        <main className="flex-1 overflow-y-auto px-6 py-6 pb-28 md:pb-8 relative z-10">
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
