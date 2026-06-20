"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Lock, Mail, Activity } from "lucide-react";

export default function AuthView() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Email and password fields are required.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
        alert("Sign up successful! You can now sign in or check your email for a confirmation link.");
        setMode("signin");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#000000] text-zinc-50 font-mono p-4">
      <div className="w-full max-w-sm bg-[#000000] border border-zinc-800 rounded-md p-6 flex flex-col space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.9)]">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex items-center justify-center p-2 rounded-md bg-[#0a0a0a] border border-zinc-800 text-zinc-200">
            <Activity className="h-5 w-5" />
          </div>
          <h1 className="text-sm font-bold tracking-widest text-zinc-50 uppercase">
            LIFE OS REGISTRY ACCESS
          </h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
            Authorize credentials to access personal databases
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold block">
              Security Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-600" />
              <input
                type="email"
                placeholder="key@lifeos.private"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-[#050505] border border-zinc-850 focus:border-zinc-700 rounded-md pl-9 pr-3 py-1.5 text-xs font-mono text-zinc-200 outline-none placeholder:text-zinc-800 transition-colors duration-150"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold block">
              Access Secret
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-600" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-[#050505] border border-zinc-850 focus:border-zinc-700 rounded-md pl-9 pr-3 py-1.5 text-xs font-mono text-zinc-200 outline-none placeholder:text-zinc-800 transition-colors duration-150"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded border border-red-950/60 bg-red-950/10 text-red-500 text-[10px] font-mono leading-relaxed">
              ERROR: {errorMsg.toUpperCase()}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-zinc-100 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 rounded-md font-mono font-bold text-[10px] tracking-widest uppercase transition-all duration-150 active:scale-[0.98] cursor-pointer flex items-center justify-center"
          >
            {loading ? (
              <span className="w-1.5 h-3.5 bg-zinc-950 animate-pulse" />
            ) : mode === "signin" ? (
              "Sign In"
            ) : (
              "Register Key"
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center pt-2 border-t border-zinc-900">
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setErrorMsg("");
            }}
            className="text-[9px] text-zinc-500 hover:text-zinc-300 uppercase tracking-widest font-bold transition-colors duration-150"
          >
            {mode === "signin" ? "Create New Security Key?" : "Use Existing Security Key?"}
          </button>
        </div>
      </div>
    </div>
  );
}
