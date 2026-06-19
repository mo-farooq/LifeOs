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
  Minus
} from "lucide-react";

export default function HealthView() {
  const [waterCups, setWaterCups] = useState(5);
  const targetWaterCups = 8;

  const healthMetrics = [
    {
      title: "HEART RATE VITALITY",
      value: "64 BPM",
      status: "OPTIMAL",
      statusColor: "text-zinc-300 bg-zinc-900 border-zinc-800",
      description: "Resting rate over 24h",
      icon: Heart
    },
    {
      title: "SLEEP RECOVERY",
      value: "8H 12M",
      status: "EXCELLENT",
      statusColor: "text-zinc-300 bg-zinc-900 border-zinc-800",
      description: "82% deep sleep score",
      icon: Moon
    },
    {
      title: "NUTRITION TRACKER",
      value: "1840 / 2400 KCAL",
      status: "76% TARGET",
      statusColor: "text-zinc-300 bg-zinc-900 border-zinc-800",
      description: "P: 140g / F: 65g / C: 180g",
      icon: Apple
    }
  ];

  return (
    <div className="space-y-4 text-zinc-200">
      {/* Header */}
      <div className="rounded-md border border-zinc-800 bg-[#0a0a0a] p-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
            METRICS // CONSOLE
          </div>
          <h1 className="text-xl font-mono uppercase tracking-wider font-bold text-zinc-100 flex items-center gap-2">
            <Activity className="h-5 w-5 text-zinc-300" /> HEALTH DIAGNOSTICS
          </h1>
          <p className="text-[11px] font-mono text-zinc-500">
            Monitor bio-metrics, recovery indices, and daily nutritional boundaries.
          </p>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {healthMetrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <Card key={i} className="bg-[#0a0a0a] border-zinc-800 rounded-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4 border-b-0">
                <span className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500">{metric.title}</span>
                <Icon className="h-3.5 w-3.5 text-zinc-500" />
              </CardHeader>
              <CardContent className="space-y-2 px-4 pb-4">
                <div className="text-xl font-mono font-bold tracking-tight text-zinc-50">{metric.value}</div>
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${metric.statusColor}`}>
                    {metric.status}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">{metric.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Hydration & Bio-metrics charts layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Hydration Widget */}
        <Card className="flex flex-col justify-between bg-[#0a0a0a] border-zinc-800 rounded-md">
          <CardHeader className="p-4">
            <span className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500 flex items-center gap-1.5">
              <Droplet className="h-3.5 w-3.5 text-zinc-400" /> HYDRATION TRACKER
            </span>
            <CardDescription className="text-[10px] font-mono text-zinc-500 uppercase mt-0.5">LOG DAILY WATER INTAKE BENCHMARKS</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center py-6 space-y-6 px-4">
            <div className="relative flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border border-zinc-800 flex flex-col items-center justify-center bg-[#000000]">
                <span className="text-2xl font-mono font-bold tracking-tighter text-zinc-100">{waterCups * 250} ML</span>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">
                  {waterCups} / {targetWaterCups} CUPS
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-xs space-y-1">
              <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase">
                <span>PROGRESS</span>
                <span>
                  {Math.round((waterCups / targetWaterCups) * 100)}%
                </span>
              </div>
              <div className="w-full bg-[#000000] border border-zinc-800 h-1.5 rounded-sm overflow-hidden">
                <div 
                  className="bg-zinc-200 h-full transition-all duration-300" 
                  style={{ width: `${Math.min((waterCups / targetWaterCups) * 100, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-2 py-3 border-t border-zinc-800 p-4">
            <button 
              onClick={() => setWaterCups(prev => Math.max(0, prev - 1))}
              className="p-1.5 rounded-md border border-zinc-800 bg-[#000000] hover:bg-[#0a0a0a] text-zinc-400 hover:text-zinc-250 transition-colors duration-150"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={() => setWaterCups(prev => prev + 1)}
              className="p-1.5 rounded-md border border-zinc-800 bg-[#000000] hover:bg-[#0a0a0a] text-zinc-300 hover:text-zinc-100 transition-colors duration-150 flex items-center gap-1 px-4 text-[10px] font-mono tracking-widest"
            >
              <Plus className="h-3.5 w-3.5 text-zinc-400" /> LOG CUP
            </button>
          </CardFooter>
        </Card>

        {/* Bio-metric Goals & Sleep Schedule */}
        <Card className="flex flex-col justify-between bg-[#0a0a0a] border-zinc-800 rounded-md">
          <CardHeader className="p-4">
            <span className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500 flex items-center gap-1.5">
              <Moon className="h-3.5 w-3.5 text-zinc-400" /> SLEEP SCHEDULE
            </span>
            <CardDescription className="text-[10px] font-mono text-zinc-500 uppercase mt-0.5">CIRCADIAN RECOVERY METRICS</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 justify-center flex flex-col p-4">
            <div className="border border-zinc-800 bg-[#000000] rounded-md p-4 space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Sleep Window</p>
                  <p className="text-xs font-mono font-semibold text-zinc-300">22:30 - 06:30</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Avg Duration</p>
                  <p className="text-xs font-mono font-semibold text-zinc-350">8H 00M</p>
                </div>
              </div>
              <div className="h-px bg-zinc-800" />
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Deep Sleep Ratio</p>
                  <p className="text-xs font-mono font-semibold text-zinc-300">22% (OPTIMAL)</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">REMs Cycle</p>
                  <p className="text-xs font-mono font-semibold text-zinc-300">4 CYCLES</p>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-zinc-800 p-3 text-center bg-[#000000]">
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wide">
                TIP: Maintain consistent sleep cycles to optimize overall focus.
              </p>
            </div>
          </CardContent>
          <CardFooter className="py-3 border-t border-zinc-800 p-4 justify-end">
            <button className="text-[9px] font-mono font-bold tracking-widest text-zinc-350 hover:text-zinc-100 uppercase">
              SYNCHRONIZE WEARABLE DEVICE →
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
