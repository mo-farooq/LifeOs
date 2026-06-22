"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Music, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Compass, 
  Flame, 
  Coffee,
  BrainCircuit
} from "lucide-react";
import { Task, FocusConfig } from "@/types";

interface FocusViewProps {
  tasks: Task[];
  updateTasks: (tasks: Task[]) => void;
  activeDate: string;
  focusConfig?: FocusConfig;
  updateFocusConfig: (config: FocusConfig) => void;
  focusSessionsLog: Record<string, number>;
  updateFocusSessionsLog: (log: Record<string, number>) => void;
}

type TimerMode = "focus" | "short" | "long";

interface SoundPreset {
  id: string;
  name: string;
  genre: string;
  bpm: number;
  url: string;
}

const SOUND_PRESETS: SoundPreset[] = [
  { id: "lofi", name: "Midnight Coffee", genre: "Lo-Fi Beats", bpm: 82, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: "rain", name: "Cyber Tokyo Rain", genre: "Ambient Noise", bpm: 0, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: "synth", name: "Grid Runner", genre: "Retro Synthwave", bpm: 110, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { id: "noise", name: "White Noise Core", genre: "Deep Static", bpm: 0, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" }
];

export default function FocusView({
  tasks,
  updateTasks,
  activeDate,
  focusConfig,
  updateFocusConfig,
  focusSessionsLog = {},
  updateFocusSessionsLog
}: FocusViewProps) {
  // Timer States
  const [mode, setMode] = useState<TimerMode>("focus");
  const [focusDuration, setFocusDuration] = useState(focusConfig?.focusDuration ?? 25);
  const [shortDuration, setShortDuration] = useState(focusConfig?.shortDuration ?? 5);
  const [longDuration, setLongDuration] = useState(focusConfig?.longDuration ?? 15);
  const [timeLeft, setTimeLeft] = useState((focusConfig?.focusDuration ?? 25) * 60);
  const [isRunning, setIsRunning] = useState(false);

  const completedSessions = focusSessionsLog[activeDate] || 0;

  // Task linking
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");

  // Sound States
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync active audio playback
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (activeSoundId) {
      const preset = SOUND_PRESETS.find(s => s.id === activeSoundId);
      if (preset) {
        const audio = new Audio(preset.url);
        audio.loop = true;
        audio.volume = isMuted ? 0 : volume / 100;
        audio.play().catch((err) => {
          console.warn("Autoplay block or audio load failure:", err);
        });
        audioRef.current = audio;
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [activeSoundId]);

  // Sync volume and mute states
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Handle timer tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  // Synchronize durations when database config changes
  useEffect(() => {
    if (focusConfig) {
      setFocusDuration(focusConfig.focusDuration);
      setShortDuration(focusConfig.shortDuration);
      setLongDuration(focusConfig.longDuration);
      
      if (!isRunning) {
        if (mode === "focus") setTimeLeft(focusConfig.focusDuration * 60);
        else if (mode === "short") setTimeLeft(focusConfig.shortDuration * 60);
        else if (mode === "long") setTimeLeft(focusConfig.longDuration * 60);
      }
    }
  }, [focusConfig, isRunning, mode]);

  const handleFocusDurationChange = (val: number) => {
    const minVal = Math.max(1, val);
    updateFocusConfig({
      focusDuration: minVal,
      shortDuration,
      longDuration
    });
  };

  const handleShortDurationChange = (val: number) => {
    const minVal = Math.max(1, val);
    updateFocusConfig({
      focusDuration,
      shortDuration: minVal,
      longDuration
    });
  };

  const handleLongDurationChange = (val: number) => {
    const minVal = Math.max(1, val);
    updateFocusConfig({
      focusDuration,
      shortDuration,
      longDuration: minVal
    });
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (mode === "focus") {
      const nextLog = {
        ...focusSessionsLog,
        [activeDate]: (focusSessionsLog[activeDate] || 0) + 1
      };
      updateFocusSessionsLog(nextLog);
      
      // Auto-complete linked task if present
      if (selectedTaskId) {
        const updatedTasks = tasks.map((t) => 
          t.id === selectedTaskId ? { ...t, completed: true } : t
        );
        updateTasks(updatedTasks);
        setSelectedTaskId("");
      }
      
      // Auto switch to short break
      setMode("short");
      setTimeLeft(shortDuration * 60);
    } else {
      setMode("focus");
      setTimeLeft(focusDuration * 60);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === "focus") setTimeLeft(focusDuration * 60);
    else if (mode === "short") setTimeLeft(shortDuration * 60);
    else setTimeLeft(longDuration * 60);
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === "focus") setTimeLeft(focusDuration * 60);
    else if (newMode === "short") setTimeLeft(shortDuration * 60);
    else setTimeLeft(longDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get active tasks for current date to link
  const todayTasks = tasks.filter((t) => t.date === activeDate && !t.completed);

  const totalModeSeconds = mode === "focus" 
    ? focusDuration * 60 
    : mode === "short" 
      ? shortDuration * 60 	
      : longDuration * 60;
  const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const secs = (timeLeft % 60).toString().padStart(2, "0");

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
        @keyframes equalizerBar {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .eq-bar {
          animation: equalizerBar 1.2s ease-in-out infinite;
        }
        .eq-bar-1 { animation-delay: 0.1s; }
        .eq-bar-2 { animation-delay: 0.3s; }
        .eq-bar-3 { animation-delay: 0.6s; }
        .eq-bar-4 { animation-delay: 0.2s; }
        .eq-bar-5 { animation-delay: 0.4s; }
      `}</style>

      {/* View Title */}
      <div className="flex justify-between items-center pb-2 border-b border-zinc-900 animate-page-fade">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-555 font-bold">COGNITIVE TUNNEL</span>
          <h1 className="text-sm font-bold font-mono text-zinc-100 uppercase tracking-widest">FOCUS ROOM & AUDIO CONTROL</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">COMPLETED SESSIONS:</span>
          <span className="font-mono text-xs font-bold text-zinc-150 px-2 py-0.5 rounded bg-[#0a0a0a] border border-zinc-800">{completedSessions}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-page-fade">
        {/* Left Column: Pomodoro Engine */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-4 border-b border-zinc-800">
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">SESSION COORDINATOR</span>
              <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest flex items-center justify-between">
                <span>POMODORO COUNTDOWN</span>
                <span className="text-[10px] text-zinc-500 font-bold lowercase tracking-wider font-normal">
                  {mode === "focus" ? "focus session" : mode === "short" ? "short break" : "long break"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center justify-center space-y-6">
              {/* Mode selector tab matrix */}
              <div className="grid grid-cols-3 gap-1.5 w-full max-w-md border border-zinc-900 p-1 bg-[#000000]/60 rounded-md">
                <button
                  onClick={() => switchMode("focus")}
                  className={`py-1.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                    mode === "focus"
                      ? "bg-zinc-100 text-zinc-950"
                      : "text-zinc-450 hover:text-zinc-250 hover:bg-[#0a0a0a]"
                  }`}
                >
                  Focus ({focusDuration}m)
                </button>
                <button
                  onClick={() => switchMode("short")}
                  className={`py-1.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                    mode === "short"
                      ? "bg-zinc-100 text-zinc-950"
                      : "text-zinc-450 hover:text-zinc-250 hover:bg-[#0a0a0a]"
                  }`}
                >
                  Short ({shortDuration}m)
                </button>
                <button
                  onClick={() => switchMode("long")}
                  className={`py-1.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
                    mode === "long"
                      ? "bg-zinc-100 text-zinc-950"
                      : "text-zinc-450 hover:text-zinc-250 hover:bg-[#0a0a0a]"
                  }`}
                >
                  Long ({longDuration}m)
                </button>
              </div>

              {/* Monospace Countdown string with Blinking Colon and Breathing Scale */}
              <div className="flex flex-col items-center justify-center py-6 select-none">
                <span 
                  className={`text-7xl sm:text-8xl font-mono font-bold tracking-tighter text-zinc-100 flex items-center transition-transform duration-500 ${
                    isRunning ? "scale-[1.02]" : "scale-100"
                  }`}
                >
                  <span>{mins}</span>
                  <span className={`${isRunning ? "animate-pulse text-zinc-400 opacity-60 mx-1" : "text-zinc-100 mx-1"}`}>:</span>
                  <span>{secs}</span>
                </span>
                
                {/* Visual state progress line (symmetric shrinking to the middle) */}
                <div className="w-64 bg-zinc-900 h-1 rounded-sm mt-4 overflow-hidden flex justify-center">
                  <div 
                    className={`bg-zinc-100 h-full ${
                      isRunning ? "transition-[width] duration-1000 ease-linear" : "transition-none"
                    }`}
                    style={{ 
                      width: `${(timeLeft / totalModeSeconds) * 100}%` 
                    }}
                  />
                </div>
              </div>

              {/* Task Connector selector */}
              {mode === "focus" && (
                <div className="w-full max-w-md space-y-1">
                  <label className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-semibold block">
                    LINK TO RUNNING TASK
                  </label>
                  <select
                    value={selectedTaskId}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                    className="w-full bg-[#000000] border border-zinc-800 rounded px-3 py-2 text-xs font-mono text-zinc-350 outline-none focus:border-zinc-700"
                  >
                    <option value="">-- ACTIVE GOAL FREE RUN --</option>
                    {todayTasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        [{t.priority ? "H" : "L"}] {t.text}
                      </option>
                    ))}
                  </select>
                  {selectedTaskId && (
                    <p className="text-[8.5px] font-mono text-zinc-550 uppercase tracking-wide">
                      SUCCESS PARAMETER: completing countdown automatically resolves the selected goal.
                    </p>
                  )}
                </div>
              )}

              {/* Duration Customization settings row */}
              <div className="w-full max-w-md pt-2.5 border-t border-zinc-900 space-y-2">
                <label className="text-[8px] font-mono text-zinc-550 uppercase tracking-widest font-bold block text-center">
                  ADJUST MODE DURATIONS (MINUTES)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-wide block text-center">Focus</span>
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={focusDuration}
                      onChange={(e) => handleFocusDurationChange(Number(e.target.value))}
                      className="w-full bg-[#000000] border border-zinc-850 hover:border-zinc-800 rounded px-2.5 py-1 text-xs font-mono text-zinc-250 outline-none focus:border-zinc-700 text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-wide block text-center">Short Break</span>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={shortDuration}
                      onChange={(e) => handleShortDurationChange(Number(e.target.value))}
                      className="w-full bg-[#000000] border border-zinc-850 hover:border-zinc-800 rounded px-2.5 py-1 text-xs font-mono text-zinc-250 outline-none focus:border-zinc-700 text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-wide block text-center">Long Break</span>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={longDuration}
                      onChange={(e) => handleLongDurationChange(Number(e.target.value))}
                      className="w-full bg-[#000000] border border-zinc-850 hover:border-zinc-800 rounded px-2.5 py-1 text-xs font-mono text-zinc-250 outline-none focus:border-zinc-700 text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons Matrix */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={resetTimer}
                  className="p-2.5 border border-zinc-850 bg-[#000000] hover:bg-[#0a0a0a] text-zinc-400 rounded transition-colors active:scale-95"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                <button
                  onClick={toggleTimer}
                  className="px-8 py-3 bg-zinc-100 hover:bg-white text-zinc-950 rounded-md font-mono font-bold text-xs tracking-widest uppercase transition-all active:scale-95 flex items-center gap-2"
                >
                  {isRunning ? (
                    <>
                      <Pause className="h-4.5 w-4.5 fill-zinc-950 text-zinc-950" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4.5 w-4.5 fill-zinc-950 text-zinc-950" /> Focus
                    </>
                  )}
                </button>

                <button
                  onClick={handleTimerComplete}
                  className="p-2.5 border border-zinc-850 bg-[#000000] hover:bg-[#0a0a0a] text-zinc-400 rounded transition-colors active:scale-95"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Audio Console */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-4 border-b border-zinc-800">
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">AMBIENT AUDIOS</span>
              <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">LO-FI DECK EMULATOR</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              {/* Sound list items */}
              <div className="space-y-1.5">
                {SOUND_PRESETS.map((sound) => {
                  const isCurrent = activeSoundId === sound.id;
                  return (
                    <div
                      key={sound.id}
                      onClick={() => setActiveSoundId(isCurrent ? null : sound.id)}
                      className={`group border rounded p-3 flex items-center justify-between cursor-pointer transition-all ${
                        isCurrent 
                          ? "bg-zinc-900/30 border-zinc-300" 
                          : "bg-[#000000]/60 border-zinc-900 hover:bg-[#0a0a0a]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded bg-zinc-900 border border-zinc-850 ${isCurrent ? "text-zinc-100 border-zinc-650" : "text-zinc-550"}`}>
                          <Music className="h-3.5 w-3.5" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-zinc-200">{sound.name}</p>
                          <div className="flex items-center gap-2 text-[8px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                            <span>{sound.genre}</span>
                            {sound.bpm > 0 && <span>● {sound.bpm} BPM</span>}
                          </div>
                        </div>
                      </div>

                      {/* Playing animations */}
                      {isCurrent ? (
                        <div className="flex items-end gap-0.5 h-4 w-6 pr-1">
                          <span className="w-[2px] bg-zinc-200 eq-bar eq-bar-1" />
                          <span className="w-[2px] bg-zinc-200 eq-bar eq-bar-2" />
                          <span className="w-[2px] bg-zinc-200 eq-bar eq-bar-3" />
                          <span className="w-[2px] bg-zinc-200 eq-bar eq-bar-4" />
                          <span className="w-[2px] bg-zinc-200 eq-bar eq-bar-5" />
                        </div>
                      ) : (
                        <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          LOAD DECK
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Volume Slider Controllers */}
              <div className="pt-3 border-t border-zinc-900 space-y-3.5">
                <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-wider text-zinc-450 font-bold">
                  <span className="flex items-center gap-1.5">
                    {isMuted || volume === 0 ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                    <span>OUTPUT AMPLITUDE</span>
                  </span>
                  <span>{isMuted ? "MUTED" : `${volume}%`}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => {
                      setVolume(Number(e.target.value));
                      setIsMuted(false);
                    }}
                    className="flex-1 accent-zinc-200 h-1 bg-[#000000] border border-zinc-900 rounded-lg cursor-pointer"
                  />
                  
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase rounded border transition-colors ${
                      isMuted
                        ? "bg-red-950/20 border-red-900/60 text-red-500"
                        : "border-zinc-850 bg-[#000000] hover:bg-[#0a0a0a] text-zinc-400"
                    }`}
                  >
                    {isMuted ? "Unmute" : "Mute"}
                  </button>
                </div>
              </div>

              {/* Status Warning */}
              <div className="text-[8.5px] font-mono text-zinc-555 uppercase tracking-wide leading-relaxed border-t border-zinc-900/50 pt-2.5">
                <span className="font-bold text-zinc-400">AUDIO ENGINE STATE:</span> Audio streams are simulated. Ensure browser system settings permit media playbacks.
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
