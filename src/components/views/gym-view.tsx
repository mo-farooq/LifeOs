"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Dumbbell, 
  Flame, 
  Calendar, 
  Trophy, 
  ArrowRight,
  Plus
} from "lucide-react";

export default function GymView() {
  const [completedToday, setCompletedToday] = useState(false);

  const workouts = [
    { name: "Bench Press", sets: "4 Sets", reps: "8-10 Reps", weight: "185 lbs" },
    { name: "Incline DB Flyes", sets: "3 Sets", reps: "10-12 Reps", weight: "55 lbs" },
    { name: "Overhead Barbell Press", sets: "4 Sets", reps: "8 Reps", weight: "115 lbs" },
    { name: "Tricep Pushdowns", sets: "3 Sets", reps: "12-15 Reps", weight: "70 lbs" }
  ];

  const routineStats = [
    { title: "CURRENT STREAK", value: "6 DAYS", icon: Flame },
    { title: "TOTAL WORKOUTS", value: "48 SESSIONS", icon: Trophy },
    { title: "TARGET FOCUS", value: "PUSH (A)", icon: Dumbbell }
  ];

  return (
    <div className="space-y-4 text-zinc-200">
      {/* Header */}
      <div className="rounded-md border border-zinc-800 bg-[#0a0a0a] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
            Split // Planner
          </div>
          <h1 className="text-xl font-mono uppercase tracking-wider font-bold text-zinc-100 flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-zinc-300" /> GYM PERFORMANCE & ROUTINES
          </h1>
          <p className="text-[11px] font-mono text-zinc-500">
            Log lifting progress metrics, workout splits, and weekly completion tallies.
          </p>
        </div>
        
        <button 
          onClick={() => setCompletedToday(!completedToday)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-mono tracking-widest transition-all duration-150 uppercase ${
            completedToday 
              ? "bg-zinc-900 border-zinc-800 text-zinc-400" 
              : "bg-zinc-100 border-zinc-200 hover:bg-white text-zinc-950 font-bold"
          }`}
        >
          {completedToday ? "Workout Logged" : "Log Workout Done"}
        </button>
      </div>

      {/* Routine Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {routineStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="bg-[#0a0a0a] border-zinc-800 rounded-md">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500">{stat.title}</p>
                  <p className="text-xl font-mono font-bold text-zinc-50">{stat.value}</p>
                </div>
                <div className="p-2 rounded-md bg-[#000000] border border-zinc-800">
                  <Icon className="h-4.5 w-4.5 text-zinc-500" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Workout Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Daily Plan List */}
        <Card className="lg:col-span-3 bg-[#0a0a0a] border-zinc-800 rounded-md">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800 p-4">
            <div>
              <span className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500">TODAY SPLIT</span>
              <h3 className="text-xs font-mono font-bold text-zinc-100 uppercase mt-0.5">Push Day (A)</h3>
            </div>
            <button className="p-1 rounded-md border border-zinc-800 bg-[#000000] text-zinc-400 hover:text-zinc-250 transition-colors" title="Add Custom Exercise">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {workouts.map((work, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-md border border-zinc-800 bg-[#000000]/60 hover:bg-[#0a0a0a] transition-all">
                  <div className="space-y-0.5">
                    <p className="text-xs font-mono font-semibold text-zinc-200">{work.name}</p>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase">{work.sets} • {work.reps}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-zinc-200">{work.weight}</p>
                    <p className="text-[9px] font-mono text-zinc-650 uppercase">PREV: {work.weight}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Schedule & Weekly Breakdown */}
        <Card className="lg:col-span-2 flex flex-col justify-between bg-[#0a0a0a] border-zinc-800 rounded-md">
          <CardHeader className="p-4">
            <span className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-zinc-550" /> WEEKLY SPLIT
            </span>
            <CardDescription className="text-[10px] font-mono text-zinc-500 uppercase mt-0.5">Split schedule breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-4">
            <div className="space-y-1.5">
              {[
                { day: "MON", routine: "PUSH ROUTINE", active: true },
                { day: "TUE", routine: "PULL ROUTINE", active: false },
                { day: "WED", routine: "ACTIVE RECOVERY", active: false },
                { day: "THU", routine: "LEGS & CORE", active: false },
                { day: "FRI", routine: "ARM HYPERTROPHY", active: false }
              ].map((split, i) => (
                <div 
                  key={i} 
                  className={`flex justify-between items-center px-3 py-2 rounded border text-[10px] font-mono ${
                    split.active 
                      ? "bg-zinc-900 border-zinc-800 text-zinc-200 font-bold" 
                      : "bg-[#000000] border-zinc-900/60 text-zinc-500"
                  }`}
                >
                  <span>{split.day}</span>
                  <span>{split.routine}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="py-3 border-t border-zinc-800 p-4">
            <button className="w-full flex items-center justify-between text-[9px] font-mono font-bold tracking-widest text-zinc-350 hover:text-zinc-100 uppercase transition-all duration-150">
              MODIFY SPLIT PLANNER 
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
