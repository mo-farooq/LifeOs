"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Dumbbell, 
  Flame, 
  Calendar, 
  Trophy, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
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
    { title: "Current Streak", value: "6 Days", icon: Flame, color: "text-amber-500" },
    { title: "Total Workouts", value: "48 Sessions", icon: Trophy, color: "text-yellow-500" },
    { title: "Target Focus", value: "Push (A)", icon: Dumbbell, color: "text-blue-500" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50 flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-amber-500" /> Gym Performance & Workouts
          </h1>
          <p className="text-sm text-zinc-400">
            Log your lifting metrics, streaks, and muscle building metrics.
          </p>
        </div>
        
        <button 
          onClick={() => setCompletedToday(!completedToday)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-300 ${
            completedToday 
              ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
              : "bg-amber-500 text-zinc-950 border-amber-600 hover:bg-amber-400 active:scale-95 shadow-md shadow-amber-500/10"
          }`}
        >
          {completedToday ? (
            <>
              <CheckCircle2 className="h-4.5 w-4.5" /> Workout Logged Today!
            </>
          ) : (
            <>
              <Flame className="h-4.5 w-4.5" /> Log Workout Done
            </>
          )}
        </button>
      </div>

      {/* Routine Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {routineStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i}>
              <CardContent className="pt-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-zinc-50">{stat.value}</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Workout Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Daily Plan List */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800/40 pb-4">
            <div>
              <CardTitle>Push Day (A)</CardTitle>
              <CardDescription>Targeting Chest, Shoulders, and Triceps</CardDescription>
            </div>
            <button className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 transition-colors" title="Add Custom Exercise">
              <Plus className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {workouts.map((work, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/20 transition-all">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-zinc-200">{work.name}</p>
                    <p className="text-xs text-zinc-500">{work.sets} • {work.reps}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-400">{work.weight}</p>
                    <p className="text-[10px] text-zinc-600">Prev: {work.weight}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Schedule & Weekly Breakdown */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-500" /> Weekly Split
            </CardTitle>
            <CardDescription>Your current gym program calendar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { day: "Monday", routine: "Push Routine", active: true },
                { day: "Tuesday", routine: "Pull Routine", active: false },
                { day: "Wednesday", routine: "Active Recovery", active: false },
                { day: "Thursday", routine: "Legs & Core Routine", active: false },
                { day: "Friday", routine: "Arm Hypertrophy", active: false }
              ].map((split, i) => (
                <div 
                  key={i} 
                  className={`flex justify-between items-center px-4 py-2.5 rounded-xl border text-xs ${
                    split.active 
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400 font-semibold" 
                      : "bg-zinc-900/30 border-zinc-900 text-zinc-400"
                  }`}
                >
                  <span>{split.day}</span>
                  <span>{split.routine}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="py-4 border-t border-zinc-800/40">
            <button className="w-full flex items-center justify-between text-xs text-amber-500 hover:text-amber-400 font-semibold group">
              Modify Split Planner 
              <ArrowRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1" />
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
