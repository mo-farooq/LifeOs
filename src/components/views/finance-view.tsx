"use client";

import React, { useState, useEffect } from "react";
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
  ArrowRight
} from "lucide-react";

interface AssetItem {
  name: string;
  amount: number; // Stored in base USD
}

interface Subscription {
  id: string;
  name: string;
  amount: number; // in USD
  period: "monthly" | "yearly";
  active: boolean;
}

interface WishItem {
  id: string;
  name: string;
  cost: number;
}

export default function FinanceView() {
  const [mounted, setMounted] = useState(false);

  // --- STATE ---
  const [currency, setCurrency] = useState<"USD" | "EUR" | "GBP" | "CHF">("USD");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    USD: 1, EUR: 0.93, GBP: 0.79, CHF: 0.89
  });

  // Ledgers State
  const [bankList, setBankList] = useState<AssetItem[]>([]);
  const [stocksList, setStocksList] = useState<AssetItem[]>([]);
  const [cryptoList, setCryptoList] = useState<AssetItem[]>([]);
  const [otherList, setOtherList] = useState<AssetItem[]>([]);

  // Subscriptions & Wishlists
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [wishlist, setWishlist] = useState<WishItem[]>([]);

  // Input states for adding
  const [selectedCategory, setSelectedCategory] = useState<"bank" | "stocks" | "crypto" | "other">("bank");
  const [newItemName, setNewItemName] = useState("");
  const [newItemAmount, setNewItemAmount] = useState<number | "">("");

  const [newSubName, setNewSubName] = useState("");
  const [newSubAmount, setNewSubAmount] = useState<number | "">("");
  const [newSubPeriod, setNewSubPeriod] = useState<"monthly" | "yearly">("monthly");

  const [newWishName, setNewWishName] = useState("");
  const [newWishCost, setNewWishCost] = useState<number | "">("");

  // Editing helpers
  const [editingKey, setEditingKey] = useState<string | null>(null); // "category-index-field"
  const [editVal, setEditVal] = useState("");

  // Lifecycle
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Fetch live rates
      const loadRates = async () => {
        try {
          const res = await fetch("https://open.er-api.com/v6/latest/USD");
          const data = await res.json();
          if (data && data.rates) {
            setExchangeRates({
              USD: 1,
              EUR: data.rates.EUR || 0.93,
              GBP: data.rates.GBP || 0.79,
              CHF: data.rates.CHF || 0.89
            });
          }
        } catch (e) {}
      };
      loadRates();

      // Load items
      setBankList(loadLocal("nw:bank", [
        { name: "Checking Account", amount: 4850 },
        { name: "Emergency Vault", amount: 2000 }
      ]));
      setStocksList(loadLocal("nw:stocks", [
        { name: "S&P 500 Index Fund", amount: 4500 }
      ]));
      setCryptoList(loadLocal("nw:crypto", [
        { name: "Bitcoin (BTC)", amount: 1100 }
      ]));
      setOtherList(loadLocal("nw:other", [
        { name: "Collector Coins", amount: 0 }
      ]));

      setSubscriptions(loadLocal("finance:subs", [
        { id: "sub_1", name: "Gym Membership", amount: 50, period: "monthly", active: true },
        { id: "sub_2", name: "Life OS Cloud Server", amount: 15, period: "monthly", active: true },
        { id: "sub_3", name: "Professional Dev Licenses", amount: 120, period: "yearly", active: true }
      ]));

      setWishlist(loadLocal("finance:wish", [
        { id: "w_1", name: "Mechanical Ergonomic Keyboard", cost: 240 },
        { id: "w_2", name: "Premium Noise-Cancelling Headphones", cost: 350 }
      ]));
    }
  }, [mounted]);

  const loadLocal = <T,>(key: string, fallback: T): T => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  };

  const saveLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // --- CALCULATORS ---
  const formatMoney = (amountUSD: number) => {
    const rate = exchangeRates[currency] || 1;
    const value = amountUSD * rate;
    const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "Fr ";
    return `${symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getCategoryTotal = (list: AssetItem[]) => {
    return list.reduce((sum, item) => sum + item.amount, 0);
  };

  const bankTotal = getCategoryTotal(bankList);
  const stocksTotal = getCategoryTotal(stocksList);
  const cryptoTotal = getCategoryTotal(cryptoList);
  const otherTotal = getCategoryTotal(otherList);
  const netWorthTotal = bankTotal + stocksTotal + cryptoTotal + otherTotal;

  // Monthly subscription total expense helper
  const getSubsMonthlyTotal = () => {
    return subscriptions
      .filter(s => s.active)
      .reduce((sum, s) => sum + (s.period === "monthly" ? s.amount : s.amount / 12), 0);
  };

  const monthlySubs = getSubsMonthlyTotal();

  // Parse inline equations like +500 or -200
  const parseAmountExpression = (currentVal: number, expr: string): number => {
    const trimmed = expr.trim();
    if (trimmed.startsWith("+")) {
      const addon = Number(trimmed.slice(1));
      return Number.isNaN(addon) ? currentVal : currentVal + addon;
    }
    if (trimmed.startsWith("-")) {
      const sub = Number(trimmed.slice(1));
      return Number.isNaN(sub) ? currentVal : Math.max(0, currentVal - sub);
    }
    const val = Number(trimmed);
    return Number.isNaN(val) ? currentVal : val;
  };

  // --- ACTIONS ---
  const handleAddAssetItem = () => {
    if (!newItemName.trim() || newItemAmount === "") return;
    const amount = Number(newItemAmount);
    if (Number.isNaN(amount)) return;

    const newItem: AssetItem = { name: newItemName.trim(), amount };

    if (selectedCategory === "bank") {
      const updated = [...bankList, newItem];
      setBankList(updated);
      saveLocal("nw:bank", updated);
    } else if (selectedCategory === "stocks") {
      const updated = [...stocksList, newItem];
      setStocksList(updated);
      saveLocal("nw:stocks", updated);
    } else if (selectedCategory === "crypto") {
      const updated = [...cryptoList, newItem];
      setCryptoList(updated);
      saveLocal("nw:crypto", updated);
    } else {
      const updated = [...otherList, newItem];
      setOtherList(updated);
      saveLocal("nw:other", updated);
    }

    setNewItemName("");
    setNewItemAmount("");
  };

  const handleDeleteAssetItem = (cat: "bank" | "stocks" | "crypto" | "other", idx: number) => {
    if (cat === "bank") {
      const updated = bankList.filter((_, i) => i !== idx);
      setBankList(updated);
      saveLocal("nw:bank", updated);
    } else if (cat === "stocks") {
      const updated = stocksList.filter((_, i) => i !== idx);
      setStocksList(updated);
      saveLocal("nw:stocks", updated);
    } else if (cat === "crypto") {
      const updated = cryptoList.filter((_, i) => i !== idx);
      setCryptoList(updated);
      saveLocal("nw:crypto", updated);
    } else {
      const updated = otherList.filter((_, i) => i !== idx);
      setOtherList(updated);
      saveLocal("nw:other", updated);
    }
  };

  const handleEditCommit = (cat: "bank" | "stocks" | "crypto" | "other", idx: number, field: "name" | "amount") => {
    let list: AssetItem[];
    if (cat === "bank") list = [...bankList];
    else if (cat === "stocks") list = [...stocksList];
    else if (cat === "crypto") list = [...cryptoList];
    else list = [...otherList];

    if (field === "name") {
      if (editVal.trim()) {
        list[idx].name = editVal.trim();
      }
    } else {
      list[idx].amount = parseAmountExpression(list[idx].amount, editVal);
    }

    if (cat === "bank") {
      setBankList(list);
      saveLocal("nw:bank", list);
    } else if (cat === "stocks") {
      setStocksList(list);
      saveLocal("nw:stocks", list);
    } else if (cat === "crypto") {
      setCryptoList(list);
      saveLocal("nw:crypto", list);
    } else {
      setOtherList(list);
      saveLocal("nw:other", list);
    }

    setEditingKey(null);
    setEditVal("");
  };

  // Subscriptions Actions
  const handleAddSubscription = () => {
    if (!newSubName.trim() || newSubAmount === "") return;
    const amount = Number(newSubAmount);
    if (Number.isNaN(amount)) return;

    const newSub: Subscription = {
      id: "sub_" + Date.now(),
      name: newSubName.trim(),
      amount,
      period: newSubPeriod,
      active: true
    };

    const updated = [...subscriptions, newSub];
    setSubscriptions(updated);
    saveLocal("finance:subs", updated);

    setNewSubName("");
    setNewSubAmount("");
  };

  const toggleSubActive = (id: string) => {
    const updated = subscriptions.map(s => s.id === id ? { ...s, active: !s.active } : s);
    setSubscriptions(updated);
    saveLocal("finance:subs", updated);
  };

  const handleDeleteSubscription = (id: string) => {
    const updated = subscriptions.filter(s => s.id !== id);
    setSubscriptions(updated);
    saveLocal("finance:subs", updated);
  };

  // Wishlist Actions
  const handleAddWishItem = () => {
    if (!newWishName.trim() || newWishCost === "") return;
    const cost = Number(newWishCost);
    if (Number.isNaN(cost)) return;

    const newWish: WishItem = {
      id: "wish_" + Date.now(),
      name: newWishName.trim(),
      cost
    };

    const updated = [...wishlist, newWish];
    setWishlist(updated);
    saveLocal("finance:wish", updated);

    setNewWishName("");
    setNewWishCost("");
  };

  const handleDeleteWishItem = (id: string) => {
    const updated = wishlist.filter(w => w.id !== id);
    setWishlist(updated);
    saveLocal("finance:wish", updated);
  };

  if (!mounted) {
    return null;
  }

  const renderCategoryList = (catKey: "bank" | "stocks" | "crypto" | "other", list: AssetItem[]) => {
    return (
      <div className="space-y-1.5 pt-1.5">
        {list.map((item, idx) => {
          const nameKey = `${catKey}-${idx}-name`;
          const amtKey = `${catKey}-${idx}-amount`;

          return (
            <div 
              key={idx} 
              className="group flex justify-between items-center px-3 py-2 border border-zinc-900 bg-[#000000]/60 hover:bg-[#0a0a0a] rounded text-xs font-mono"
            >
              {/* Editable Name */}
              {editingKey === nameKey ? (
                <input
                  type="text"
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  onBlur={() => handleEditCommit(catKey, idx, "name")}
                  onKeyDown={(e) => e.key === "Enter" && handleEditCommit(catKey, idx, "name")}
                  className="bg-transparent border-b border-zinc-700 outline-none text-zinc-200 w-32 py-0.5"
                  autoFocus
                />
              ) : (
                <span 
                  onClick={() => {
                    setEditingKey(nameKey);
                    setEditVal(item.name);
                  }}
                  className="cursor-pointer text-zinc-300 hover:text-zinc-50 transition-colors"
                  title="Click to rename"
                >
                  {item.name}
                </span>
              )}

              <div className="flex items-center gap-3">
                {/* Editable Amount */}
                {editingKey === amtKey ? (
                  <input
                    type="text"
                    value={editVal}
                    onChange={(e) => setEditVal(e.target.value)}
                    onBlur={() => handleEditCommit(catKey, idx, "amount")}
                    onKeyDown={(e) => e.key === "Enter" && handleEditCommit(catKey, idx, "amount")}
                    placeholder="+500 or -200"
                    className="bg-transparent border-b border-zinc-700 outline-none text-zinc-200 text-right w-24 py-0.5"
                    autoFocus
                  />
                ) : (
                  <span 
                    onClick={() => {
                      setEditingKey(amtKey);
                      setEditVal(item.amount.toString());
                    }}
                    className="cursor-pointer font-bold text-zinc-200 hover:text-zinc-50 transition-colors"
                    title="Click to edit balance"
                  >
                    {formatMoney(item.amount)}
                  </span>
                )}

                <button 
                  onClick={() => handleDeleteAssetItem(catKey, idx)}
                  className="text-zinc-600 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}

        {list.length === 0 && (
          <div className="text-center py-2 text-[9px] font-mono uppercase tracking-widest text-zinc-650">Empty category ledger.</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 text-zinc-200">
      
      {/* Header */}
      <div className="rounded-md border border-zinc-800 bg-[#0a0a0a] p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#000000] border border-zinc-800 text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
              LEDGERS // RESERVES
            </div>
            <h1 className="text-xl font-mono uppercase tracking-wider font-bold text-zinc-150 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-zinc-300" /> WEALTH & FINANCIAL LEDGERS
            </h1>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wide">
              Track net worth reserves, auto exchange conversions, and active subscriptions.
            </p>
          </div>

          {/* Currency Selector */}
          <div className="flex items-center gap-2 bg-[#000000] border border-zinc-800 p-1.5 rounded-md">
            <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-bold pl-1.5">CURRENCY</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="bg-[#000000] border border-zinc-900 rounded px-2 py-1 text-xs font-mono text-zinc-200 outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CHF">CHF (Fr)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Net Worth Summary banner */}
      <div className="rounded-md border border-zinc-800 bg-[#0a0a0a] p-5">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <span className="text-[9px] font-mono uppercase tracking-widest font-semibold text-zinc-500">NET WORTH STACK</span>
            <h2 className="text-3xl font-mono font-bold tracking-tight text-zinc-50">
              {formatMoney(netWorthTotal)}
            </h2>
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 uppercase tracking-wide">
              <TrendingUp className="h-3.5 w-3.5 text-zinc-400" />
              <span>Converted at live rates</span>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="px-3 py-1.5 rounded-md border border-zinc-850 bg-[#000000] text-[10px] font-mono text-zinc-400">
              EXPENSES: {formatMoney(monthlySubs)}/MO
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* Left column: Asset Ledger groups (col-span-12 lg:col-span-8) */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-4 border-b border-zinc-800">
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">NET WORTH CATEGORIES</span>
              <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase">ASSET ALLOCATIONS</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              {/* Bank accounts */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-900 pb-1">
                  <span className="font-bold text-zinc-400">BANK RESERVES</span>
                  <span>SUBTOTAL: {formatMoney(bankTotal)}</span>
                </div>
                {renderCategoryList("bank", bankList)}
              </div>

              {/* Stocks accounts */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-900 pb-1">
                  <span className="font-bold text-zinc-400">STOCKS & INDEXES</span>
                  <span>SUBTOTAL: {formatMoney(stocksTotal)}</span>
                </div>
                {renderCategoryList("stocks", stocksList)}
              </div>

              {/* Crypto accounts */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-900 pb-1">
                  <span className="font-bold text-zinc-400">CRYPTO WALLETS</span>
                  <span>SUBTOTAL: {formatMoney(cryptoTotal)}</span>
                </div>
                {renderCategoryList("crypto", cryptoList)}
              </div>

              {/* Other accounts */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-900 pb-1">
                  <span className="font-bold text-zinc-400">OTHER RESERVES</span>
                  <span>SUBTOTAL: {formatMoney(otherTotal)}</span>
                </div>
                {renderCategoryList("other", otherList)}
              </div>

              {/* Add AssetItem Form */}
              <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-zinc-800 mt-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="bg-[#000000] border border-zinc-800 rounded px-2 py-1.5 text-xs font-mono text-zinc-400 outline-none"
                >
                  <option value="bank">BANK</option>
                  <option value="stocks">STOCKS</option>
                  <option value="crypto">CRYPTO</option>
                  <option value="other">OTHER</option>
                </select>

                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="ASSET/ACCOUNT NAME..."
                  className="flex-1 bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-700 transition-all"
                />

                <input
                  type="number"
                  value={newItemAmount}
                  onChange={(e) => setNewItemAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="AMOUNT (USD)..."
                  className="w-32 bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-700 transition-all"
                />

                <button
                  onClick={handleAddAssetItem}
                  className="px-4 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-[10px] tracking-wider uppercase transition-all"
                >
                  Add
                </button>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right column: Subscriptions & Wishlists (col-span-12 lg:col-span-4) */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          
          {/* Subscriptions */}
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-4 border-b border-zinc-800">
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">RECURRING OUTFLOWS</span>
              <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase">SUBSCRIPTIONS</CardTitle>
            </CardHeader>
            
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {subscriptions.map((sub) => (
                  <div 
                    key={sub.id} 
                    className={`group flex items-center justify-between px-3 py-2 border border-zinc-900 bg-[#000000]/60 hover:bg-[#0a0a0a] rounded text-[10px] font-mono transition-all ${
                      sub.active ? "" : "opacity-40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSubActive(sub.id)}
                        className={`w-3 h-3 border flex items-center justify-center rounded-sm transition-all ${
                          sub.active ? "bg-zinc-100 border-zinc-250 text-zinc-950" : "border-zinc-800 bg-transparent"
                        }`}
                      >
                        {sub.active && <span className="text-[7px]">✓</span>}
                      </button>
                      <span className="text-zinc-300 font-semibold">{sub.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">
                        {formatMoney(sub.amount)}/{sub.period === "monthly" ? "mo" : "yr"}
                      </span>
                      <button 
                        onClick={() => handleDeleteSubscription(sub.id)}
                        className="text-zinc-600 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}

                {subscriptions.length === 0 && (
                  <div className="text-center py-4 text-[9px] font-mono uppercase tracking-widest text-zinc-650 border border-dashed border-zinc-800 rounded">
                    No active subscriptions logged.
                  </div>
                )}
              </div>

              {/* Add Subscription Form */}
              <div className="flex flex-col gap-2 pt-3 border-t border-zinc-800 mt-2">
                <input
                  type="text"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="SUBSCRIPTION NAME..."
                  className="bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-250 outline-none focus:border-zinc-700 transition-all"
                />
                
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newSubAmount}
                    onChange={(e) => setNewSubAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="AMOUNT..."
                    className="flex-1 bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-250 outline-none focus:border-zinc-700 transition-all"
                  />
                  <select
                    value={newSubPeriod}
                    onChange={(e) => setNewSubPeriod(e.target.value as any)}
                    className="bg-[#000000] border border-zinc-800 rounded px-2 py-1.5 text-xs font-mono text-zinc-400 outline-none"
                  >
                    <option value="monthly">MONTHLY</option>
                    <option value="yearly">YEARLY</option>
                  </select>
                  <button
                    onClick={handleAddSubscription}
                    className="px-3.5 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-[9px] tracking-wider uppercase transition-all"
                  >
                    Add
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wishlist */}
          <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-4 border-b border-zinc-800">
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">WISHLIST LEDGERS</span>
              <CardTitle className="text-xs font-mono font-bold text-zinc-100 uppercase">SAVINGS TARGETS</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {wishlist.map((w) => (
                  <div 
                    key={w.id} 
                    className="group flex justify-between items-center px-3 py-2 border border-zinc-900 bg-[#000000]/60 hover:bg-[#0a0a0a] rounded text-[10px] font-mono transition-all"
                  >
                    <span className="text-zinc-300 font-semibold">{w.name}</span>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">{formatMoney(w.cost)}</span>
                      <button 
                        onClick={() => handleDeleteWishItem(w.id)}
                        className="text-zinc-600 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}

                {wishlist.length === 0 && (
                  <div className="text-center py-4 text-[9px] font-mono uppercase tracking-widest text-zinc-650 border border-dashed border-zinc-800 rounded">
                    Wishlist empty.
                  </div>
                )}
              </div>

              {/* Add Wish Item Form */}
              <div className="flex gap-2 pt-3 border-t border-zinc-800 mt-2">
                <input
                  type="text"
                  value={newWishName}
                  onChange={(e) => setNewWishName(e.target.value)}
                  placeholder="ITEM NAME..."
                  className="flex-1 bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-250 outline-none focus:border-zinc-700 transition-all"
                />
                <input
                  type="number"
                  value={newWishCost}
                  onChange={(e) => setNewWishCost(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="COST..."
                  className="w-20 bg-transparent border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus:border-zinc-700 transition-all"
                />
                <button
                  onClick={handleAddWishItem}
                  className="px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-[9px] tracking-wider uppercase transition-all"
                >
                  Plan
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
}
