"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  X,
  TrendingUp,
  RefreshCw,
  Calendar,
  Layers,
  ArrowRight,
  ShoppingBag,
  Bell,
  Check,
  TrendingDown,
  DollarSign
} from "lucide-react";
import { Asset, Subscription, PurchaseOrder } from "@/types";

interface FinanceViewProps {
  assets: Asset[];
  updateAssets: (assets: Asset[]) => void;
  subscriptions: Subscription[];
  updateSubscriptions: (subs: Subscription[]) => void;
  orders: PurchaseOrder[];
  updateOrders: (orders: PurchaseOrder[]) => void;
  activeDate: string;
}

export default function FinanceView({
  assets,
  updateAssets,
  subscriptions,
  updateSubscriptions,
  orders,
  updateOrders,
  activeDate
}: FinanceViewProps) {
  // Input states for adding
  const [newAssetName, setNewAssetName] = useState("");
  const [newAssetAmount, setNewAssetAmount] = useState<number | "">("");
  const [newAssetCategory, setNewAssetCategory] = useState<"bank" | "stocks" | "crypto" | "other">("bank");

  const [newSubName, setNewSubName] = useState("");
  const [newSubCost, setNewSubCost] = useState<number | "">("");
  const [newSubPeriod, setNewSubPeriod] = useState<"monthly" | "yearly">("monthly");
  const [newSubRenewal, setNewSubRenewal] = useState("");
  const [newSubLinkedAsset, setNewSubLinkedAsset] = useState("");

  const [newOrderName, setNewOrderName] = useState("");
  const [newOrderCost, setNewOrderCost] = useState<number | "">("");
  const [newOrderLinkedAsset, setNewOrderLinkedAsset] = useState("");

  // Editing state helpers
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editAssetVal, setEditAssetVal] = useState("");

  // Interactive hover states for Donut
  const [hoveredCategory, setHoveredCategory] = useState<"bank" | "stocks" | "crypto" | "other" | null>(null);

  // Subtotal Calculators
  const bankTotal = assets.filter(a => a.category === "bank").reduce((sum, a) => sum + a.amount, 0);
  const stocksTotal = assets.filter(a => a.category === "stocks").reduce((sum, a) => sum + a.amount, 0);
  const cryptoTotal = assets.filter(a => a.category === "crypto").reduce((sum, a) => sum + a.amount, 0);
  const otherTotal = assets.filter(a => a.category === "other").reduce((sum, a) => sum + a.amount, 0);
  const netWorthTotal = bankTotal + stocksTotal + cryptoTotal + otherTotal;

  // Donut chart math
  const radius = 30;
  const circ = 2 * Math.PI * radius; // ~188.5
  
  const bankPct = netWorthTotal ? (bankTotal / netWorthTotal) * 100 : 0;
  const stocksPct = netWorthTotal ? (stocksTotal / netWorthTotal) * 100 : 0;
  const cryptoPct = netWorthTotal ? (cryptoTotal / netWorthTotal) * 100 : 0;
  const otherPct = netWorthTotal ? (otherTotal / netWorthTotal) * 100 : 0;

  // Subscription warnings calculations (due in 3 days)
  const isSubscriptionWarning = (subDateStr: string) => {
    if (!subDateStr) return false;
    const subDate = new Date(subDateStr);
    const currDate = new Date(activeDate);
    const diffTime = subDate.getTime() - currDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  // Asset Actions
  const handleAddAsset = () => {
    if (!newAssetName.trim() || newAssetAmount === "") return;
    const newAs: Asset = {
      id: "as_" + Date.now(),
      name: newAssetName.trim(),
      category: newAssetCategory,
      amount: Number(newAssetAmount)
    };
    updateAssets([...assets, newAs]);
    setNewAssetName("");
    setNewAssetAmount("");
  };

  const handleDeleteAsset = (id: string) => {
    updateAssets(assets.filter(a => a.id !== id));
  };

  const handleEditAssetCommit = (id: string) => {
    if (!editAssetVal.trim()) return;
    
    // Parse expression (+500 / -200)
    const currentAsset = assets.find(a => a.id === id);
    if (!currentAsset) return;

    let finalVal = currentAsset.amount;
    const expr = editAssetVal.trim();
    if (expr.startsWith("+")) {
      const addon = Number(expr.slice(1));
      if (!Number.isNaN(addon)) finalVal += addon;
    } else if (expr.startsWith("-")) {
      const sub = Number(expr.slice(1));
      if (!Number.isNaN(sub)) finalVal = Math.max(0, finalVal - sub);
    } else {
      const val = Number(expr);
      if (!Number.isNaN(val)) finalVal = val;
    }

    updateAssets(
      assets.map(a => a.id === id ? { ...a, amount: finalVal } : a)
    );
    setEditingAssetId(null);
    setEditAssetVal("");
  };

  // Purchase Deduction Action
  const handleLogPurchase = () => {
    if (!newOrderName.trim() || newOrderCost === "" || !newOrderLinkedAsset) return;
    const costVal = Number(newOrderCost);
    if (Number.isNaN(costVal)) return;

    // Deduct amount from linked asset
    const updatedAssets = assets.map((asset) => {
      if (asset.id === newOrderLinkedAsset) {
        return {
          ...asset,
          amount: Math.max(0, asset.amount - costVal)
        };
      }
      return asset;
    });

    // Create purchase order entry
    const newOrder: PurchaseOrder = {
      id: "ord_" + Date.now(),
      name: newOrderName.trim(),
      cost: costVal,
      date: activeDate,
      linkedAssetId: newOrderLinkedAsset
    };

    updateAssets(updatedAssets);
    updateOrders([newOrder, ...orders]);

    setNewOrderName("");
    setNewOrderCost("");
    setNewOrderLinkedAsset("");
  };

  const handleDeleteOrder = (id: string) => {
    updateOrders(orders.filter(o => o.id !== id));
  };

  // Subscription Actions
  const handleAddSubscription = () => {
    if (!newSubName.trim() || newSubCost === "" || !newSubRenewal || !newSubLinkedAsset) return;
    const newSub: Subscription = {
      id: "sub_" + Date.now(),
      name: newSubName.trim(),
      cost: Number(newSubCost),
      period: newSubPeriod,
      nextRenewalDate: newSubRenewal,
      linkedAssetId: newSubLinkedAsset
    };
    updateSubscriptions([...subscriptions, newSub]);
    setNewSubName("");
    setNewSubCost("");
    setNewSubRenewal("");
    setNewSubLinkedAsset("");
  };

  const handleDeleteSubscription = (id: string) => {
    updateSubscriptions(subscriptions.filter(s => s.id !== id));
  };

  // Log Expense Macro (deducts sub cost and advances renewal date by 1 month)
  const handleLogSubExpense = (sub: Subscription) => {
    const updatedAssets = assets.map((asset) => {
      if (asset.id === sub.linkedAssetId) {
        return {
          ...asset,
          amount: Math.max(0, asset.amount - sub.cost)
        };
      }
      return asset;
    });

    const renewal = new Date(sub.nextRenewalDate);
    renewal.setMonth(renewal.getMonth() + 1);
    const nextRenewalStr = renewal.toISOString().split("T")[0];

    const updatedSubs = subscriptions.map((s) => {
      if (s.id === sub.id) {
        return {
          ...s,
          nextRenewalDate: nextRenewalStr
        };
      }
      return s;
    });

    const newOrder: PurchaseOrder = {
      id: "ord_sub_" + Date.now(),
      name: `Sub: ${sub.name}`,
      cost: sub.cost,
      date: activeDate,
      linkedAssetId: sub.linkedAssetId
    };

    updateAssets(updatedAssets);
    updateSubscriptions(updatedSubs);
    updateOrders([newOrder, ...orders]);
  };

  const formatMoney = (amount: number) => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Historical Net Worth Area Chart Renderer
  const renderHistoricalChart = () => {
    // Generate historical points, integrating current live Net Worth as the last point
    const historyData = [
      { date: "JAN", amount: 18400 },
      { date: "FEB", amount: 19800 },
      { date: "MAR", amount: 19200 },
      { date: "APR", amount: 20600 },
      { date: "MAY", amount: 21200 },
      { date: "JUN (CURR)", amount: netWorthTotal }
    ];

    const width = 500;
    const height = 90;
    const paddingLeft = 45;
    const paddingRight = 15;
    const paddingTop = 10;
    const paddingBottom = 15;

    const drawWidth = width - paddingLeft - paddingRight;
    const drawHeight = height - paddingTop - paddingBottom;

    const amountsList = historyData.map(d => d.amount);
    const minAmt = Math.min(...amountsList) * 0.95;
    const maxAmt = Math.max(...amountsList) * 1.05;
    const amtDiff = maxAmt - minAmt || 1;

    // Map Coordinates
    const points = historyData.map((dp, idx) => {
      const x = paddingLeft + (idx / (historyData.length - 1)) * drawWidth;
      const y = paddingTop + drawHeight - ((dp.amount - minAmt) / amtDiff) * drawHeight;
      return { x, y, val: dp.amount, label: dp.date };
    });

    // Generate Line Path
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    // Generate Area Fill Path
    const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + drawHeight} L ${points[0].x} ${paddingTop + drawHeight} Z`;

    return (
      <div className="w-full overflow-x-auto select-none mt-2 pr-1">
        <svg className="w-full min-w-[450px] h-24" viewBox={`0 0 ${width} ${height}`}>
          {/* Grid lines */}
          <line x1={paddingLeft} y1={paddingTop} x2={width - paddingRight} y2={paddingTop} className="stroke-zinc-950 stroke-[0.5]" />
          <line x1={paddingLeft} y1={paddingTop + drawHeight / 2} x2={width - paddingRight} y2={paddingTop + drawHeight / 2} className="stroke-zinc-950 stroke-[0.5]" />
          <line x1={paddingLeft} y1={paddingTop + drawHeight} x2={width - paddingRight} y2={paddingTop + drawHeight} className="stroke-zinc-900 stroke-[1]" />

          {/* Y Axis labels */}
          <text x={paddingLeft - 8} y={paddingTop + 3} className="text-[7px] fill-zinc-550 font-mono font-bold" textAnchor="end">{formatMoney(maxAmt).split(".")[0]}</text>
          <text x={paddingLeft - 8} y={paddingTop + drawHeight / 2 + 3} className="text-[7px] fill-zinc-550 font-mono font-bold" textAnchor="end">{formatMoney((maxAmt + minAmt) / 2).split(".")[0]}</text>
          <text x={paddingLeft - 8} y={paddingTop + drawHeight + 3} className="text-[7px] fill-zinc-550 font-mono font-bold" textAnchor="end">{formatMoney(minAmt).split(".")[0]}</text>

          {/* Area under the line */}
          <path d={areaD} className="fill-zinc-100/[0.03] transition-all duration-500" />
          
          {/* Outline Line */}
          <path d={pathD} className="fill-none stroke-zinc-200 stroke-[1.5] transition-all duration-500" />

          {/* Value nodes and dates */}
          {points.map((pt, idx) => (
            <g key={idx}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="2.5"
                className="fill-zinc-950 stroke-zinc-200 stroke-[1.5] cursor-pointer hover:scale-125 transition-transform"
              />
              <text x={pt.x} y={pt.y - 7} className="text-[6.5px] fill-zinc-350 font-mono font-bold" textAnchor="middle">{formatMoney(pt.val).split(".")[0]}</text>
              <text x={pt.x} y={height - 3} className="text-[6.5px] fill-zinc-550 font-mono font-semibold" textAnchor="middle">{pt.label}</text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

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
      
      {/* Net Worth Summary Panel */}
      <div className="rounded-md border border-zinc-800 bg-[#0a0a0a] p-5 animate-page-fade">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-0.5 w-full md:w-auto">
            <span className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500">LIQUID LEDGER</span>
            <h2 className="text-3xl font-mono font-bold tracking-tight text-zinc-50">
              {formatMoney(netWorthTotal)}
            </h2>
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 uppercase tracking-wide">
              <TrendingUp className="h-3.5 w-3.5 text-zinc-400" />
              <span>Global reserves tracking active</span>
            </div>
            
            {/* Embedded area chart */}
            {renderHistoricalChart()}
          </div>

          {/* SVG concentric Donut chart with interactive hover */}
          {netWorthTotal > 0 && (
            <div className="flex items-center gap-5 bg-[#000000] border border-zinc-900 px-5 py-4 rounded-md">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="-rotate-90 w-full h-full" viewBox="0 0 80 80">
                  {/* Bank slice */}
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    className={`stroke-zinc-150 fill-none transition-all duration-300 cursor-pointer ${
                      hoveredCategory === "bank" ? "stroke-[8] scale-105" : "stroke-[6]"
                    }`}
                    strokeDasharray={`${(bankPct / 100) * circ} ${circ}`}
                    strokeDashoffset="0"
                    onMouseEnter={() => setHoveredCategory("bank")}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                  {/* Stocks slice */}
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    className={`stroke-zinc-400 fill-none transition-all duration-300 cursor-pointer ${
                      hoveredCategory === "stocks" ? "stroke-[8] scale-105" : "stroke-[6]"
                    }`}
                    strokeDasharray={`${(stocksPct / 100) * circ} ${circ}`}
                    strokeDashoffset={`-${(bankPct / 100) * circ}`}
                    onMouseEnter={() => setHoveredCategory("stocks")}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                  {/* Crypto slice */}
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    className={`stroke-zinc-650 fill-none transition-all duration-300 cursor-pointer ${
                      hoveredCategory === "crypto" ? "stroke-[8] scale-105" : "stroke-[6]"
                    }`}
                    strokeDasharray={`${(cryptoPct / 100) * circ} ${circ}`}
                    strokeDashoffset={`-${((bankPct + stocksPct) / 100) * circ}`}
                    onMouseEnter={() => setHoveredCategory("crypto")}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                  {/* Other slice */}
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    className={`stroke-zinc-800 fill-none transition-all duration-300 cursor-pointer ${
                      hoveredCategory === "other" ? "stroke-[8] scale-105" : "stroke-[6]"
                    }`}
                    strokeDasharray={`${(otherPct / 100) * circ} ${circ}`}
                    strokeDashoffset={`-${((bankPct + stocksPct + cryptoPct) / 100) * circ}`}
                    onMouseEnter={() => setHoveredCategory("other")}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                </svg>

                {/* Concentric center text details */}
                <div className="absolute text-center z-10 flex flex-col items-center justify-center">
                  <span className="text-[9px] font-mono font-bold tracking-tight text-zinc-100">
                    {hoveredCategory === "bank" ? `${Math.round(bankPct)}%` :
                     hoveredCategory === "stocks" ? `${Math.round(stocksPct)}%` :
                     hoveredCategory === "crypto" ? `${Math.round(cryptoPct)}%` :
                     hoveredCategory === "other" ? `${Math.round(otherPct)}%` : "NW"}
                  </span>
                  <span className="text-[6.5px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
                    {hoveredCategory || "STACK"}
                  </span>
                </div>
              </div>

              {/* Legends list */}
              <div className="flex flex-col gap-1 text-[8.5px] font-mono">
                <div 
                  className={`flex items-center gap-2 p-1 rounded transition-colors duration-150 ${hoveredCategory === "bank" ? "bg-zinc-950 border border-zinc-900" : ""}`}
                  onMouseEnter={() => setHoveredCategory("bank")}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-150" />
                  <span className="text-zinc-400 uppercase">BANK: {Math.round(bankPct)}%</span>
                </div>
                <div 
                  className={`flex items-center gap-2 p-1 rounded transition-colors duration-150 ${hoveredCategory === "stocks" ? "bg-zinc-950 border border-zinc-900" : ""}`}
                  onMouseEnter={() => setHoveredCategory("stocks")}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                  <span className="text-zinc-400 uppercase">STOCKS: {Math.round(stocksPct)}%</span>
                </div>
                <div 
                  className={`flex items-center gap-2 p-1 rounded transition-colors duration-150 ${hoveredCategory === "crypto" ? "bg-zinc-950 border border-zinc-900" : ""}`}
                  onMouseEnter={() => setHoveredCategory("crypto")}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-650" />
                  <span className="text-zinc-400 uppercase">CRYPTO: {Math.round(cryptoPct)}%</span>
                </div>
                <div 
                  className={`flex items-center gap-2 p-1 rounded transition-colors duration-150 ${hoveredCategory === "other" ? "bg-zinc-950 border border-zinc-900" : ""}`}
                  onMouseEnter={() => setHoveredCategory("other")}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                  <span className="text-zinc-400 uppercase">OTHER: {Math.round(otherPct)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main split view grids */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-page-fade" style={{ animationDelay: "50ms" }}>
        
        {/* Left Column: Asset Allocations */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Asset reserves card */}
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-4 border-b border-zinc-800">
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">CAPITAL RESERVES</span>
              <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">
                NET WORTH ASSET ALLOCATIONS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              <div className="space-y-1">
                {assets.map((item) => (
                  <div key={item.id} className="group flex justify-between items-center px-3 py-2 border border-zinc-900 bg-[#000000]/60 hover:bg-[#0a0a0a] rounded text-xs font-mono transition-colors duration-150">
                    <div className="space-y-0.5">
                      <span className="text-zinc-200 font-semibold">{item.name}</span>
                      <p className="text-[8px] font-mono text-zinc-550 uppercase tracking-widest">{item.category}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {editingAssetId === item.id ? (
                        <input
                          type="text"
                          value={editAssetVal}
                          onChange={(e) => setEditAssetVal(e.target.value)}
                          onBlur={() => handleEditAssetCommit(item.id)}
                          onKeyDown={(e) => e.key === "Enter" && handleEditAssetCommit(item.id)}
                          className="bg-[#000000] border border-zinc-800 rounded text-right outline-none text-zinc-200 w-24 py-0.5 px-2 font-bold"
                          placeholder="+500 or -200"
                          autoFocus
                        />
                      ) : (
                        <span 
                          onClick={() => {
                            setEditingAssetId(item.id);
                            setEditAssetVal(item.amount.toString());
                          }}
                          className="font-bold text-zinc-150 hover:text-zinc-50 cursor-pointer font-mono"
                          title="Edit balance (supports math expressions like +500)"
                        >
                          {formatMoney(item.amount)}
                        </span>
                      )}

                      <button
                        onClick={() => handleDeleteAsset(item.id)}
                        className="text-zinc-650 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                {assets.length === 0 && (
                  <div className="text-center py-4 text-[9px] font-mono uppercase tracking-widest text-zinc-650">Empty asset registry.</div>
                )}
              </div>

              {/* Add asset form */}
              <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-zinc-900 mt-2">
                <select
                  value={newAssetCategory}
                  onChange={(e) => setNewAssetCategory(e.target.value as any)}
                  className="bg-[#000000] border border-zinc-800 rounded px-2 py-1.5 text-xs font-mono text-zinc-400 outline-none"
                >
                  <option value="bank">BANK</option>
                  <option value="stocks">STOCKS</option>
                  <option value="crypto">CRYPTO</option>
                  <option value="other">OTHER</option>
                </select>
                <input
                  type="text"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  placeholder="ASSET NAME..."
                  className="flex-1 bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-700 transition-all"
                />
                <input
                  type="number"
                  value={newAssetAmount}
                  onChange={(e) => setNewAssetAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="AMOUNT..."
                  className="w-24 bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-700 transition-all"
                />
                <button
                  onClick={handleAddAsset}
                  className="px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-[9px] tracking-widest uppercase transition-all"
                >
                  Add
                </button>
              </div>

            </CardContent>
          </Card>

          {/* Balance Deduction Purchase Form */}
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-4 border-b border-zinc-800">
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">DEBIT LEDGER ENGINE</span>
              <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">
                LOG ORDER PURCHASE (DIRECT BALANCE DEDUCTION)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <input
                  type="text"
                  placeholder="PURCHASE ITEM NAME (e.g. Mechanical Keyboard)..."
                  value={newOrderName}
                  onChange={(e) => setNewOrderName(e.target.value)}
                  className="sm:col-span-6 bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-700 transition-all"
                />
                <input
                  type="number"
                  placeholder="COST..."
                  value={newOrderCost}
                  onChange={(e) => setNewOrderCost(e.target.value === "" ? "" : Number(e.target.value))}
                  className="sm:col-span-3 bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-700 transition-all"
                />
                <select
                  value={newOrderLinkedAsset}
                  onChange={(e) => setNewOrderLinkedAsset(e.target.value)}
                  className="sm:col-span-3 bg-[#000000] border border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono text-zinc-400 outline-none focus:border-zinc-700"
                >
                  <option value="">DEDUCT FROM...</option>
                  {assets.filter(a => a.category === "bank" || a.category === "crypto").map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({formatMoney(asset.amount)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleLogPurchase}
                  disabled={!newOrderName.trim() || newOrderCost === "" || !newOrderLinkedAsset}
                  className="px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-[9px] tracking-widest uppercase transition-all disabled:opacity-40"
                >
                  Deduct and Log Order
                </button>
              </div>

              {/* Purchase history list */}
              {orders.length > 0 && (
                <div className="space-y-1.5 border-t border-zinc-900 pt-3">
                  <span className="text-[8px] font-mono text-zinc-650 uppercase font-semibold">TRANSACTION PURCHASE LOGS:</span>
                  <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                    {orders.map((ord) => {
                      const linked = assets.find(a => a.id === ord.linkedAssetId);
                      return (
                        <div key={ord.id} className="flex justify-between items-center px-2 py-1 rounded bg-[#000000] border border-zinc-955 text-[10px] font-mono">
                          <div className="space-y-0.5">
                            <span className="text-zinc-300 font-bold">{ord.name}</span>
                            <p className="text-[7.5px] text-zinc-550 uppercase">Deducted from {linked?.name || "Asset"}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-red-500 font-bold">-{formatMoney(ord.cost)}</span>
                            <button 
                              onClick={() => handleDeleteOrder(ord.id)}
                              className="text-zinc-700 hover:text-zinc-500"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* Right Column: Subscriptions */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-4 border-b border-zinc-800">
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">AUTO-DEBITS</span>
              <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-widest">
                RECURRING SUBSCRIPTIONS WARNING
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              {/* List subscriptions with warnings */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {subscriptions.map((sub) => {
                  const isWarning = isSubscriptionWarning(sub.nextRenewalDate);
                  const linked = assets.find(a => a.id === sub.linkedAssetId);

                  return (
                    <div 
                      key={sub.id} 
                      className={`group flex flex-col gap-2 p-3 border rounded text-xs font-mono transition-all duration-150 ${
                        isWarning 
                          ? "bg-red-955/15 border-red-900/40 text-red-200 animate-pulse" 
                          : "bg-[#000000]/60 border-zinc-900 hover:bg-[#0a0a0a]"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <span className="font-bold text-zinc-200 uppercase tracking-wide">{sub.name}</span>
                          <div className="flex items-center gap-1.5 text-[8.5px] font-mono text-zinc-500 uppercase tracking-wide">
                            <span>Cost: {formatMoney(sub.cost)}/{sub.period === "monthly" ? "mo" : "yr"}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteSubscription(sub.id)}
                          className="text-zinc-650 hover:text-zinc-350 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>

                      {/* Warning indicator + macro script */}
                      <div className="flex justify-between items-center border-t border-zinc-900/60 pt-2 mt-0.5">
                        <div className="flex flex-col text-[8.5px] font-mono">
                          <span className="text-zinc-550">RENEW DATE:</span>
                          <span className={`${isWarning ? "text-red-500 font-bold" : "text-zinc-400"}`}>
                            {sub.nextRenewalDate} {isWarning && "(DUE)"}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => handleLogSubExpense(sub)}
                          className="px-2.5 py-1 bg-zinc-50 hover:bg-white text-zinc-950 rounded text-[8.5px] font-mono font-bold uppercase tracking-wider transition-all duration-150 active:scale-95 cursor-pointer"
                        >
                          Log Expense
                        </button>
                      </div>
                    </div>
                  );
                })}

                {subscriptions.length === 0 && (
                  <div className="text-center py-4 text-[9px] font-mono uppercase tracking-widest text-zinc-650 border border-dashed border-zinc-850 rounded">
                    No active auto-debits cataloged.
                  </div>
                )}
              </div>

              {/* Add Subscription Form */}
              <div className="flex flex-col gap-2 pt-3 border-t border-zinc-900 mt-2">
                <span className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500">REGISTER NEW AUTO-DEBIT</span>
                <input
                  type="text"
                  placeholder="SUBSCRIPTION SERVICE (e.g. Netflix)..."
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-700 transition-all"
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="COST..."
                    value={newSubCost}
                    onChange={(e) => setNewSubCost(e.target.value === "" ? "" : Number(e.target.value))}
                    className="bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-700 transition-all"
                  />
                  <select
                    value={newSubPeriod}
                    onChange={(e) => setNewSubPeriod(e.target.value as any)}
                    className="bg-[#000000] border border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono text-zinc-400 outline-none focus:border-zinc-700"
                  >
                    <option value="monthly">MONTHLY</option>
                    <option value="yearly">YEARLY</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={newSubRenewal}
                    onChange={(e) => setNewSubRenewal(e.target.value)}
                    className="bg-[#000000] border border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono text-zinc-400 outline-none focus:border-zinc-700"
                  />
                  <select
                    value={newSubLinkedAsset}
                    onChange={(e) => setNewSubLinkedAsset(e.target.value)}
                    className="bg-[#000000] border border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono text-zinc-400 outline-none focus:border-zinc-700"
                  >
                    <option value="">DEBIT FROM...</option>
                    {assets.filter(a => a.category === "bank").map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAddSubscription}
                  disabled={!newSubName.trim() || newSubCost === "" || !newSubRenewal || !newSubLinkedAsset}
                  className="px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-[9px] tracking-widest uppercase transition-all disabled:opacity-40 mt-1 cursor-pointer"
                >
                  Register Auto-Debit
                </button>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
