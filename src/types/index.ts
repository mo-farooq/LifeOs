export interface Task {
  id: string;
  text: string;
  completed: boolean;
  queued: boolean;
  date: string; // YYYY-MM-DD
  energy: "charging" | "draining";
  revenue: "high" | "low";
  priority: boolean;
}

export interface CharacterStats {
  willpower: number; // 0-10
  focus: number;     // 0-10
  clarity: number;   // 0-10
  energy: number;    // 0-10
}

export interface Skill {
  id: string;
  name: string;
  keyResult: string;
  currentProgress: number;
  targetProgress: number;
}

export interface Supplement {
  id: string;
  name: string;
  dose: string;
  window: "morning" | "lunch" | "evening";
  low: boolean;
  takenDates: Record<string, boolean>; // key: YYYY-MM-DD
}

export interface WaterConfig {
  weightKg: number;
  age: number;
  trainingHrs: number;
  caffeineMg: number;
  activeMedsCount: number;
  loggedTodayMl: Record<string, number>; // key: YYYY-MM-DD
}

export interface GymExercise {
  id: string;
  name: string;
  weight: number;
  reps: number;
  targetReps: number;
  history: Array<{ date: string; weight: number; reps: number }>;
}

export interface GymPhoto {
  id: string;
  date: string;
  url: string;
  label: string;
}

export interface Asset {
  id: string;
  name: string;
  category: "bank" | "stocks" | "crypto" | "other";
  amount: number;
}

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  period: "monthly" | "yearly";
  nextRenewalDate: string; // YYYY-MM-DD
  linkedAssetId: string;
}

export interface PurchaseOrder {
  id: string;
  name: string;
  cost: number;
  date: string; // YYYY-MM-DD
  linkedAssetId: string;
}

export interface LifeOSState {
  tasks: Task[];
  stats: CharacterStats;
  skills: Skill[];
  supplements: Supplement[];
  water: WaterConfig;
  gymType: "home" | "commercial" | "both";
  gymSplit: "push" | "pull" | "legs" | "rest";
  gymExercises: GymExercise[];
  gymPhotos: GymPhoto[];
  assets: Asset[];
  subscriptions: Subscription[];
  orders: PurchaseOrder[];
}
