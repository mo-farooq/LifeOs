"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Wallet, 
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
    { name: "Salary Deposit", category: "INCOME", amount: "+$4,800.00", date: "June 15, 2026", type: "income" },
    { name: "Organic Grocery Store", category: "FOOD & DRINKS", amount: "-$142.30", date: "June 18, 2026", type: "expense" },
    { name: "Electricity Utility", category: "BILLS", amount: "-$85.00", date: "June 19, 2026", type: "expense" },
    { name: "Stock Investment Transfer", category: "INVESTING", amount: "-$500.00", date: "June 20, 2026", type: "expense" }
  ];

  const finances = [
    { title: "MONTHLY INCOME", value: "$8,200.00", icon: ArrowUpRight },
    { title: "MONTHLY EXPENSES", value: "$3,450.20", icon: ArrowDownRight },
    { title: "NET SAVED RATIO", value: "57.9%", icon: PiggyBank }
  ];

  return (
    <div className="space-y-4 text-zinc-200">
      {/* Header */}
      <div className="rounded-md border border-zinc-800 bg-[#0a0a0a] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
            Ledger // Ledger
          </div>
          <h1 className="text-xl font-mono uppercase tracking-wider font-bold text-zinc-100 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-zinc-300" /> WEALTH & FINANCIAL LEDGERS
          </h1>
          <p className="text-[11px] font-mono text-zinc-500">
            Keep track of monthly budgets, balances, and savings metrics.
          </p>
        </div>

        <button 
          onClick={() => setBalance(prev => prev + 1000)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-[10px] tracking-wider transition-all uppercase"
        >
          <Plus className="h-3.5 w-3.5" /> Quick Deposit ($1,000)
        </button>
      </div>

      {/* Account Balance Widget */}
      <div className="rounded-md border border-zinc-800 bg-[#0a0a0a] p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <p className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500">TOTAL LIQUID BALANCE</p>
            <h2 className="text-3xl font-mono font-bold tracking-tight text-zinc-50">
              ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 uppercase">
              <span className="text-zinc-350 font-semibold">+12.4%</span>
              <span>VS LAST CYCLE</span>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="px-3.5 py-2.5 rounded-md bg-[#000000] border border-zinc-800">
              <p className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500">Savings Target</p>
              <p className="text-sm font-mono font-bold text-zinc-200">$20,000.00</p>
            </div>
            <div className="px-3.5 py-2.5 rounded-md bg-[#000000] border border-zinc-800">
              <p className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500">Progress Ratio</p>
              <p className="text-sm font-mono font-bold text-zinc-100">62.3%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {finances.map((fin, i) => {
          const Icon = fin.icon;
          return (
            <Card key={i} className="bg-[#0a0a0a] border-zinc-800 rounded-md">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500">{fin.title}</p>
                  <p className="text-xl font-mono font-bold text-zinc-50">{fin.value}</p>
                </div>
                <div className="p-2 rounded-md bg-[#000000] border border-zinc-800">
                  <Icon className="h-4.5 w-4.5 text-zinc-500" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Transaction & Budget Details */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Transactions List */}
        <Card className="lg:col-span-3 bg-[#0a0a0a] border-zinc-800 rounded-md">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800 p-4">
            <div>
              <span className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500">TRANSACTION FEED</span>
              <h3 className="text-xs font-mono font-bold text-zinc-100 uppercase mt-0.5">Recent Ledgers</h3>
            </div>
            <button className="text-[9px] font-mono font-bold tracking-widest text-zinc-400 hover:text-zinc-100 uppercase transition-all duration-150">
              Export Statement
            </button>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {transactions.map((tx, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-md border border-zinc-800 bg-[#000000]/60 hover:bg-[#0a0a0a] transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md border border-zinc-800 bg-[#000000] text-zinc-500">
                      <Wallet className="h-3.5 w-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-mono font-semibold text-zinc-200">{tx.name}</p>
                      <p className="text-[9px] font-mono text-zinc-500 uppercase">{tx.category} • {tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-zinc-100">{tx.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Budget Goals Status */}
        <Card className="lg:col-span-2 flex flex-col justify-between bg-[#0a0a0a] border-zinc-800 rounded-md">
          <CardHeader className="p-4">
            <span className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500 flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-zinc-550" /> BUDGET ENVELOPES
            </span>
            <CardDescription className="text-[10px] font-mono text-zinc-500 uppercase mt-0.5">Envelope limits check</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 p-4">
            {[
              { category: "Housing", allocated: "$1,800.00", spent: 100 },
              { category: "Groceries & Food", allocated: "$600.00", spent: 68 },
              { category: "Subscriptions", allocated: "$300.00", spent: 45 },
              { category: "Transport", allocated: "$400.00", spent: 80 }
            ].map((budget, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                  <span>{budget.category}</span>
                  <span>{budget.spent}% spent of {budget.allocated}</span>
                </div>
                <div className="w-full bg-[#000000] border border-zinc-900 h-1.5 rounded-sm overflow-hidden">
                  <div 
                    className="h-full bg-zinc-200 transition-all duration-500"
                    style={{ width: `${budget.spent}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="py-3 border-t border-zinc-800 p-4">
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-550 uppercase tracking-wider">
              <CheckCircle2 className="h-3.5 w-3.5 text-zinc-400" />
              <span>All envelopes within limits.</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
