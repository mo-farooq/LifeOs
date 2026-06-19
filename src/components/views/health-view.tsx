"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Heart, 
  Moon, 
  Droplet, 
  Apple, 
  Activity, 
  Plus, 
  Minus,
  Sparkles
} from "lucide-react";

export default function HealthView() {
  const [waterCups, setWaterCups] = useState(5);
  const targetWaterCups = 8;

  const healthMetrics = [
    {
      title: "Heart Rate Vitality",
      value: "64 bpm",
      status: "Optimal",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      description: "Resting rate over the last 24h",
      icon: Heart,
      iconColor: "text-rose-400"
    },
    {
      title: "Sleep Recovery",
      value: "8h 12m",
      status: "Excellent",
      statusColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      description: "82% deep sleep score",
      icon: Moon,
      iconColor: "text-purple-400"
    },
    {
      title: "Nutrition Tracker",
      value: "1,840 / 2,400 kcal",
      status: "76% Target",
      statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      description: "Protein: 140g / Fat: 65g / Carbs: 180g",
      icon: Apple,
      iconColor: "text-amber-400"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50 flex items-center gap-2">
          <Activity className="h-6 w-6 text-rose-500" /> Health Diagnostics
        </h1>
        <p className="text-sm text-zinc-400">
          Monitor your bio-metrics, rest cycles, and nutritional benchmarks.
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {healthMetrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <Card key={i} className="hover:border-zinc-800 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-zinc-400">{metric.title}</CardTitle>
                <Icon className={`h-5 w-5 ${metric.iconColor}`} />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${metric.statusColor}`}>
                    {metric.status}
                  </span>
                  <span className="text-xs text-zinc-500">{metric.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Hydration & Bio-metrics charts layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hydration Widget */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-blue-400" /> Hydration Tracker
            </CardTitle>
            <CardDescription>Log your daily water consumption target</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center py-6 space-y-6">
            <div className="relative flex items-center justify-center">
              {/* Decorative Glow */}
              <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full" />
              <div className="w-36 h-36 rounded-full border-4 border-zinc-800 flex flex-col items-center justify-center z-10 bg-zinc-950/80">
                <span className="text-3xl font-extrabold text-blue-400">{waterCups * 250} ml</span>
                <span className="text-[10px] text-zinc-500 uppercase font-semibold mt-1">
                  {waterCups} of {targetWaterCups} Cups
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Progress</span>
                <span className="font-semibold text-zinc-200">
                  {Math.round((waterCups / targetWaterCups) * 100)}%
                </span>
              </div>
              <div className="w-full bg-zinc-900 border border-zinc-800/80 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-sky-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((waterCups / targetWaterCups) * 100, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4 py-4 border-t border-zinc-800/40">
            <button 
              onClick={() => setWaterCups(prev => Math.max(0, prev - 1))}
              className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setWaterCups(prev => prev + 1)}
              className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1.5 px-4"
            >
              <Plus className="h-4 w-4 text-blue-400" /> Log Cup
            </button>
          </CardFooter>
        </Card>

        {/* Bio-metric Goals & Sleep Schedule */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" /> Sleep Schedule
            </CardTitle>
            <CardDescription>Optimizing circadian rhythm tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 justify-center flex flex-col">
            <div className="border border-zinc-800 bg-zinc-900/30 rounded-xl p-4 space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <p className="text-xs text-zinc-500">Sleep Window</p>
                  <p className="text-sm font-semibold text-zinc-200">10:30 PM - 06:30 AM</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">Avg Duration</p>
                  <p className="text-sm font-semibold text-purple-400">8h 00m</p>
                </div>
              </div>
              <div className="h-px bg-zinc-800/80" />
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <p className="text-xs text-zinc-500">Deep Sleep Ratio</p>
                  <p className="text-sm font-semibold text-zinc-200">22% (Optimal)</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">REMs Cycle</p>
                  <p className="text-sm font-semibold text-zinc-200">4 Cycles</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-zinc-800 p-4 text-center bg-zinc-950/40">
              <p className="text-xs text-zinc-400">
                🚀 Tip: Going to sleep within your sleep window increases cognitive efficiency by 15% tomorrow.
              </p>
            </div>
          </CardContent>
          <CardFooter className="py-4 border-t border-zinc-800/40 justify-end">
            <button className="text-xs font-semibold text-purple-400 hover:text-purple-300">
              Synchronize Smart Watch →
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
