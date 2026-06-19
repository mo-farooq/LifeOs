"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  PiggyBank,
  CheckCircle2,
  CalendarDays
} from "lucide-react";

export default function FinanceView() {
  const [balance, setBalance] = useState(12450.80);

  const transactions = [
    { name: "Salary Deposit", category: "Income", amount: "+$4,800.00", date: "June 15, 2026", type: "income" },
    { name: "Organic Grocery Store", category: "Food & Drinks", amount: "-$142.30", date: "June 18, 2026", type: "expense" },
    { name: "Electricity Utility", category: "Bills", amount: "-$85.00", date: "June 19, 2026", type: "expense" },
    { name: "Stock Investment Transfer", category: "Investing", amount: "-$500.00", date: "June 20, 2026", type: "expense" }
  ];

  const finances = [
    { title: "Monthly Income", value: "$8,200.00", icon: ArrowUpRight, color: "text-emerald-400" },
    { title: "Monthly Expenses", value: "$3,450.20", icon: ArrowDownRight, color: "text-rose-400" },
    { title: "Net Saved Ratio", value: "57.9%", icon: PiggyBank, color: "text-blue-400" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50 flex items-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-400" /> Wealth & Financial Ledgers
          </h1>
          <p className="text-sm text-zinc-400">
            Keep track of your monthly budget, balances, and savings goals.
          </p>
        </div>

        <button 
          onClick={() => setBalance(prev => prev + 1000)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-semibold transition-all active:scale-95 shadow-md shadow-emerald-500/10"
        >
          <Plus className="h-4 w-4" /> Quick Deposit ($1,000)
        </button>
      </div>

      {/* Account Balance Widget */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/60 to-zinc-950/60 p-6 md:p-8 backdrop-blur-md">
        <div className="absolute inset-0 bg-emerald-500/5 blur-2xl rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Liquid Balance</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-50">
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="flex items-center gap-0.5 text-emerald-400 font-medium">
                <TrendingUp className="h-3 w-3" /> +12.4%
              </span>
              <span>vs Last Month</span>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Active Savings Target</p>
              <p className="text-sm font-bold text-zinc-200">$20,000.00</p>
            </div>
            <div className="px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Savings Progress</p>
              <p className="text-sm font-bold text-emerald-400">62.3%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {finances.map((fin, i) => {
          const Icon = fin.icon;
          return (
            <Card key={i}>
              <CardContent className="pt-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{fin.title}</p>
                  <p className="text-2xl font-bold text-zinc-50">{fin.value}</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <Icon className={`h-6 w-6 ${fin.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Transaction & Budget Details */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Transactions List */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800/40 pb-4">
            <div>
              <CardTitle>Recent Ledgers</CardTitle>
              <CardDescription>Daily cash inflows and outflows</CardDescription>
            </div>
            <button className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
              Export Statement
            </button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {transactions.map((tx, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${
                      tx.type === "income" 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}>
                      <Wallet className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-zinc-200">{tx.name}</p>
                      <p className="text-[10px] text-zinc-500">{tx.category} • {tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      tx.type === "income" ? "text-emerald-400" : "text-zinc-200"
                    }`}>{tx.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Budget Goals Status */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-emerald-400" /> Budget Envelopes
            </CardTitle>
            <CardDescription>Envelope allocations for June 2026</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { category: "Housing", allocated: "$1,800.00", spent: 100 },
              { category: "Groceries & Food", allocated: "$600.00", spent: 68 },
              { category: "Entertainment & Subscriptions", allocated: "$300.00", spent: 45 },
              { category: "Transport", allocated: "$400.00", spent: 80 }
            ].map((budget, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span className="font-medium text-zinc-300">{budget.category}</span>
                  <span>{budget.spent}% spent of {budget.allocated}</span>
                </div>
                <div className="w-full bg-zinc-900 border border-zinc-850 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      budget.spent >= 90 
                        ? "bg-rose-500" 
                        : budget.spent >= 75 
                          ? "bg-amber-500" 
                          : "bg-emerald-500"
                    }`}
                    style={{ width: `${budget.spent}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="py-4 border-t border-zinc-800/40">
            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>All budgets within safety margins.</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
