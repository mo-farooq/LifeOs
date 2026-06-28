"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Check, 
  Flame, 
  Trophy, 
  Compass, 
  Award 
} from "lucide-react";
import { SalahLog } from "@/types";

interface SalahViewProps {
  salah: Record<string, SalahLog>;
  updateSalah: (salah: Record<string, SalahLog>) => void;
  activeDate: string;
}

const defaultSalah: SalahLog = {
  fajr: false,
  dhuhr: false,
  asr: false,
  maghrib: false,
  isha: false
};

export default function SalahView({ salah, updateSalah, activeDate }: SalahViewProps) {
  const activeSalah = salah[activeDate] || defaultSalah;

  const toggleSalah = (prayer: keyof SalahLog) => {
    const updated = {
      ...salah,
      [activeDate]: {
        ...activeSalah,
        [prayer]: !activeSalah[prayer]
      }
    };
    updateSalah(updated);
  };

  // Salah Streaks dynamic calculator
  const getSalahStreaks = () => {
    let currentPerfectStreak = 0;
    let maxPerfectStreak = 0;
    let currentActiveStreak = 0;
    let maxActiveStreak = 0;

    let checkDate = new Date(activeDate);
    let perfectBroken = false;
    let activeBroken = false;

    // Scan backward 365 days
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split("T")[0];
      const log = salah[dateStr];

      if (!log) {
        if (i === 0) {
          // If today is not logged, do not break the current streak immediately, skip to yesterday
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        perfectBroken = true;
        activeBroken = true;
      } else {
        const completedCount = [log.fajr, log.dhuhr, log.asr, log.maghrib, log.isha].filter(Boolean).length;
        
        if (completedCount === 5) {
          if (!perfectBroken) currentPerfectStreak++;
        } else {
          perfectBroken = true;
        }

        if (completedCount >= 1) {
          if (!activeBroken) currentActiveStreak++;
        } else {
          activeBroken = true;
        }
      }

      if (perfectBroken && activeBroken) break;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Scan forward to find historically maximum streaks
    const sortedDates = Object.keys(salah).sort();
    let tempPerfect = 0;
    let tempActive = 0;

    sortedDates.forEach((dateStr) => {
      const log = salah[dateStr];
      const completedCount = [log.fajr, log.dhuhr, log.asr, log.maghrib, log.isha].filter(Boolean).length;

      if (completedCount === 5) {
        tempPerfect++;
        if (tempPerfect > maxPerfectStreak) maxPerfectStreak = tempPerfect;
      } else {
        tempPerfect = 0;
      }

      if (completedCount >= 1) {
        tempActive++;
        if (tempActive > maxActiveStreak) maxActiveStreak = tempActive;
      } else {
        tempActive = 0;
      }
    });

    if (currentPerfectStreak > maxPerfectStreak) maxPerfectStreak = currentPerfectStreak;
    if (currentActiveStreak > maxActiveStreak) maxActiveStreak = currentActiveStreak;

    return {
      currentPerfect: currentPerfectStreak,
      maxPerfect: maxPerfectStreak,
      currentActive: currentActiveStreak,
      maxActive: maxActiveStreak
    };
  };

  const streaks = getSalahStreaks();

  // Salah dynamic Level calculator
  const totalSalahLogged = Object.values(salah).reduce((acc, log) => {
    return acc + [log.fajr, log.dhuhr, log.asr, log.maghrib, log.isha].filter(Boolean).length;
  }, 0);

  const getSalahLevel = (totalCount: number) => {
    if (totalCount <= 50) {
      return { level: 1, name: "NOVICE MUSALLI", nextTarget: 50, percent: Math.round((totalCount / 50) * 100) };
    } else if (totalCount <= 150) {
      return { level: 2, name: "STEADY DEVOTEE", nextTarget: 150, percent: Math.round(((totalCount - 50) / 100) * 100) };
    } else if (totalCount <= 500) {
      return { level: 3, name: "FAITHFUL WARDEN", nextTarget: 500, percent: Math.round(((totalCount - 150) / 350) * 100) };
    } else {
      return { level: 4, name: "SPIRITUAL SENTINEL", nextTarget: 9999, percent: 100 };
    }
  };

  const lvl = getSalahLevel(totalSalahLogged);

  // Salah Badges calculator
  const checkBadgeFajrPioneer = () => {
    let count = 0;
    let checkDate = new Date(activeDate);
    for (let i = 0; i < 7; i++) {
      const dateStr = checkDate.toISOString().split("T")[0];
      const log = salah[dateStr];
      if (log?.fajr) count++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return count === 7;
  };

  const checkBadgeFirstRow = () => {
    let count = 0;
    let checkDate = new Date(activeDate);
    for (let i = 0; i < 7; i++) {
      const dateStr = checkDate.toISOString().split("T")[0];
      const log = salah[dateStr];
      if (log && log.fajr && log.dhuhr && log.asr && log.maghrib && log.isha) count++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return count === 7;
  };

  const checkBadgeNightVigil = () => {
    let count = 0;
    let checkDate = new Date(activeDate);
    for (let i = 0; i < 7; i++) {
      const dateStr = checkDate.toISOString().split("T")[0];
      const log = salah[dateStr];
      if (log?.isha) count++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return count === 7;
  };

  const badgeFajrPioneer = checkBadgeFajrPioneer();
  const badgeFirstRow = checkBadgeFirstRow();
  const badgeNightVigil = checkBadgeNightVigil();

  const getCalendarDates = () => {
    const dates = [];
    const d = new Date(activeDate);
    d.setDate(d.getDate() - 29); // 30 days including today
    for (let i = 0; i < 30; i++) {
      dates.push(d.toISOString().split("T")[0]);
      d.setDate(d.getDate() + 1);
    }
    return dates;
  };

  const calendarDates = getCalendarDates();

  return (
    <div className="space-y-4 text-zinc-200">
      <style jsx global>{`
        @keyframes pageFade {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-page-fade {
          animation: pageFade 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-zinc-900 animate-page-fade">
        <div>
          <h1 className="text-sm font-bold font-mono text-zinc-100 uppercase tracking-widest">Salah Tracker</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-4 md:gap-6 animate-page-fade">
        {/* Left Column: Prayer Checklists */}
        <div className="lg:col-span-7 space-y-2 sm:space-y-4">
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-3 sm:p-4 border-b border-zinc-800">
              <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">Today's Prayers</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 space-y-3">
              {[
                { key: "fajr" as keyof SalahLog, label: "Fajr (Dawn Prayer)" },
                { key: "dhuhr" as keyof SalahLog, label: "Dhuhr (Midday Prayer)" },
                { key: "asr" as keyof SalahLog, label: "Asr (Afternoon Prayer)" },
                { key: "maghrib" as keyof SalahLog, label: "Maghrib (Sunset Prayer)" },
                { key: "isha" as keyof SalahLog, label: "Isha (Night Prayer)" }
              ].map((pr) => {
                const isChecked = activeSalah[pr.key] || false;
                return (
                  <div
                    key={pr.key}
                    onClick={() => toggleSalah(pr.key)}
                    className={`flex items-center justify-between p-3 rounded border transition-all cursor-pointer select-none ${
                      isChecked 
                        ? "bg-zinc-900/20 border-zinc-300 opacity-90" 
                        : "bg-[#000000]/60 border-zinc-900 hover:bg-[#0a0a0a]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 border flex items-center justify-center rounded-sm transition-all ${
                        isChecked ? "bg-zinc-100 border-zinc-200 text-zinc-950" : "border-zinc-850 bg-transparent"
                      }`}>
                        {isChecked && <Check className="h-3 w-3 stroke-[3.5]" />}
                      </div>
                      <span className={`text-xs font-bold ${isChecked ? "text-zinc-200" : "text-zinc-500"}`}>
                        {pr.label}
                      </span>
                    </div>
                    <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest font-bold">
                      {isChecked ? "COMPLIED" : "PENDING"}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Gamified Level Progress */}
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-4 border-b border-zinc-800">
              <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest flex items-center justify-between">
                <span>Your Rank</span>
                <span className="text-[9px] text-zinc-400 font-bold bg-[#000000] border border-zinc-850 px-1.5 py-0.5 rounded">LVL {lvl.level}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-col items-center justify-center p-3 border border-zinc-900 bg-[#000000]/60 rounded-md gap-1.5">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4.5 w-4.5 text-zinc-450" />
                  <span className="text-sm font-bold font-mono tracking-wider text-zinc-200">{lvl.name}</span>
                </div>
                <div className="w-full max-w-sm space-y-1">
                  <div className="flex justify-between text-[7.5px] font-mono text-zinc-550 uppercase tracking-wider font-semibold">
                    <span>CUMULATIVE PRAYERS: {totalSalahLogged}</span>
                    <span>{lvl.percent}% TO NEXT RANK</span>
                  </div>
                  <div className="w-full bg-[#000000] border border-zinc-850 h-1.5 rounded-sm overflow-hidden">
                    <div className="bg-zinc-200 h-full transition-all duration-500" style={{ width: `${lvl.percent}%` }} />
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="space-y-2.5">
                <span className="text-[8px] font-mono text-zinc-550 uppercase tracking-widest font-bold block">UNLOCKED SPECIAL BADGES</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className={`border p-2.5 rounded flex flex-col items-center justify-center text-center gap-1.5 transition-all ${
                    badgeFajrPioneer 
                      ? "bg-zinc-950/20 border-zinc-300 text-zinc-100 shadow-[0_0_8px_rgba(255,255,255,0.1)]" 
                      : "bg-[#000000]/30 border-zinc-900 opacity-40 text-zinc-650"
                  }`}>
                    <Compass className="h-4 w-4" />
                    <span className="text-[7.5px] font-mono font-bold tracking-wider">FAJR PIONEER</span>
                  </div>

                  <div className={`border p-2.5 rounded flex flex-col items-center justify-center text-center gap-1.5 transition-all ${
                    badgeFirstRow 
                      ? "bg-zinc-950/20 border-zinc-300 text-zinc-100 shadow-[0_0_8px_rgba(255,255,255,0.1)]" 
                      : "bg-[#000000]/30 border-zinc-900 opacity-40 text-zinc-650"
                  }`}>
                    <Trophy className="h-4 w-4" />
                    <span className="text-[7.5px] font-mono font-bold tracking-wider">FIRST ROW</span>
                  </div>

                  <div className={`border p-2.5 rounded flex flex-col items-center justify-center text-center gap-1.5 transition-all ${
                    badgeNightVigil 
                      ? "bg-zinc-950/20 border-zinc-300 text-zinc-100 shadow-[0_0_8px_rgba(255,255,255,0.1)]" 
                      : "bg-[#000000]/30 border-zinc-900 opacity-40 text-zinc-655"
                  }`}>
                    <Award className="h-4 w-4" />
                    <span className="text-[7.5px] font-mono font-bold tracking-wider">NIGHT VIGIL</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Streaks & GitHub Contribution Grid */}
        <div className="lg:col-span-5 space-y-2 sm:space-y-4">
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-3 sm:p-4 border-b border-zinc-800">
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">GAMIFIED STREAKS</span>
              <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">CONSISTENCY COUNTERS</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="border border-zinc-900 bg-[#000000]/60 p-3 rounded-md space-y-1.5">
                  <span className="text-[8px] font-mono text-zinc-550 uppercase tracking-wider block font-bold">ACTIVE STREAK</span>
                  <div className="flex items-center justify-center gap-1">
                    <Flame className="h-5 w-5 text-zinc-400" />
                    <span className="text-xl font-bold font-mono tracking-tight text-zinc-100">{streaks.currentActive}d</span>
                  </div>
                  <span className="text-[7.5px] font-mono text-zinc-600 block">MAX STREAK: {streaks.maxActive}d</span>
                </div>

                <div className="border border-zinc-900 bg-[#000000]/60 p-3 rounded-md space-y-1.5">
                  <span className="text-[8px] font-mono text-zinc-550 uppercase tracking-wider block font-bold">PERFECT (5/5) STREAK</span>
                  <div className="flex items-center justify-center gap-1">
                    <Trophy className="h-4.5 w-4.5 text-zinc-350" />
                    <span className="text-xl font-bold font-mono tracking-tight text-zinc-100">{streaks.currentPerfect}d</span>
                  </div>
                  <span className="text-[7.5px] font-mono text-zinc-650 block">MAX STREAK: {streaks.maxPerfect}d</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grid view */}
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-3 sm:p-4 border-b border-zinc-800">
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">PRAYER HISTORY</span>
              <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">30-DAY COMPLIANCE GRID</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 space-y-3.5">
              <div className="grid grid-cols-6 gap-1.5 p-3 border border-zinc-900 bg-[#000000]/60 rounded-md w-fit mx-auto animate-page-fade">
                {calendarDates.map((dateStr) => {
                  const log = salah[dateStr];
                  const count = log ? [log.fajr, log.dhuhr, log.asr, log.maghrib, log.isha].filter(Boolean).length : 0;
                  
                  let opacityClass = "bg-zinc-950 border border-zinc-900";
                  if (count === 1) opacityClass = "bg-zinc-550/15 border border-zinc-850";
                  if (count === 2) opacityClass = "bg-zinc-550/30 border border-zinc-800";
                  if (count === 3) opacityClass = "bg-zinc-550/50 border border-zinc-700";
                  if (count === 4) opacityClass = "bg-zinc-550/75 border border-zinc-600";
                  if (count === 5) opacityClass = "bg-zinc-100 border border-zinc-400 shadow-[0_0_8px_rgba(255,255,255,0.15)] animate-pulse";

                  return (
                    <div
                      key={dateStr}
                      title={`${dateStr}: ${count}/5 prayers`}
                      className={`w-6 h-6 rounded-sm ${opacityClass} flex flex-col items-center justify-center text-[7px] font-mono text-zinc-550 font-bold select-none cursor-help`}
                    >
                      {dateStr.substring(8, 10)}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center text-[7.5px] font-mono text-zinc-555 font-bold uppercase tracking-wider px-2">
                <span>30 DAYS AGO</span>
                <div className="flex items-center gap-1 select-none">
                  <span>LESS</span>
                  <span className="w-2.5 h-2.5 bg-zinc-950 border border-zinc-900 rounded-sm" />
                  <span className="w-2.5 h-2.5 bg-zinc-550/15 border border-zinc-850 rounded-sm" />
                  <span className="w-2.5 h-2.5 bg-zinc-550/50 border border-zinc-750 rounded-sm" />
                  <span className="w-2.5 h-2.5 bg-zinc-100 border border-zinc-400 rounded-sm" />
                  <span>MORE</span>
                </div>
                <span>TODAY</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
