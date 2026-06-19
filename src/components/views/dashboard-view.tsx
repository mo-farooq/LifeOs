"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Heart, 
  Dumbbell, 
  Wallet, 
  ArrowUpRight, 
  Flame, 
  Clock,
  Sparkles
} from "lucide-react";

export default function DashboardView() {
  // Mock data for the dashboard overview
  const stats = [
    {
      title: "Health & Vitality",
      value: "92 bpm",
      desc: "Resting heart rate stable",
      icon: Heart,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20"
    },
    {
      title: "Gym Performance",
      value: "420 kcal",
      desc: "Active burn • 3/4 weekly sessions",
      icon: Dumbbell,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    },
    {
      title: "Finance & Wealth",
      value: "$12,450.80",
      desc: "Net surplus +14.2% this month",
      icon: Wallet,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    }
  ];

  const activities = [
    { type: "Gym", title: "Upper Body Hypertrophy", time: "2 hours ago", detail: "60 mins • Chest & Arms focus" },
    { type: "Finance", title: "Monthly Rent Paid", time: "6 hours ago", detail: "-$1,800.00 • Automatic Bank Transfer" },
    { type: "Health", title: "Sleep Goal Achieved", time: "Today, 7:30 AM", detail: "8h 12m • 82% Deep sleep score" }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/60 to-zinc-950/60 p-6 md:p-8 backdrop-blur-md">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="h-24 w-24 text-purple-400" />
        </div>
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400">
            <Sparkles className="h-3 w-3 animate-spin" /> Vector-Verse OS v1.0
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-50 via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Welcome Back, Commander
          </h1>
          <p className="text-sm md:text-base text-zinc-400">
            All system diagnostics are green. Your personal dashboard is synched and up to date. Here is your daily summary.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="hover:border-zinc-700/80 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <span className="text-sm font-medium text-zinc-400">{stat.title}</span>
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.border} border`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                <p className="text-xs text-zinc-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  {stat.desc}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Productivity/Overview Feed */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800/40 pb-4">
            <div>
              <CardTitle>System Activity Log</CardTitle>
              <CardDescription>Recent life logs recorded by your dashboard</CardDescription>
            </div>
            <button className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-medium">
              View All <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {activities.map((act, idx) => (
                <div key={idx} className="flex gap-4 relative group">
                  {idx !== activities.length - 1 && (
                    <span className="absolute left-4 top-8 bottom-0 w-[1px] bg-zinc-800 group-hover:bg-zinc-700 transition-colors" />
                  )}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-zinc-400">{act.type[0]}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <h4 className="text-sm font-semibold text-zinc-200">{act.title}</h4>
                      <span className="text-[10px] text-zinc-500 flex items-center gap-0.5">
                        <Clock className="h-3 w-3" /> {act.time}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">{act.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Calorie Focus widget */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-zinc-950/60 to-purple-950/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-500 animate-pulse" /> Active Streak
            </CardTitle>
            <CardDescription>Consistently logging habit completions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex justify-around">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => {
                const completed = idx < 5; // mock up M-F completed
                return (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-medium text-zinc-500">{day}</span>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                      completed 
                        ? "bg-purple-500/20 border-purple-500 text-purple-400 font-bold text-xs" 
                        : "bg-transparent border-zinc-800 text-zinc-600 text-xs"
                    }`}>
                      {completed ? "✓" : "•"}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-4 space-y-2">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Monthly Habit Completion</span>
                <span className="font-semibold text-zinc-200">76%</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full w-[76%]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
