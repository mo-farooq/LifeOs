export interface Task {
  id: string;
  text: string;
  completed: boolean;
  queued: boolean;
  date: string; // YYYY-MM-DD
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
  history: Array<{
    date: string;
    weight: number;
    reps: number;
    sets?: Array<{ weight: number; reps: number }>;
  }>;
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

// Vision OS Structure
export interface VisionOS {
  identity: string;
  outcomeGoal: string;
  outputMilestone: string;
  inputHabit: string;
}

// Second Brain Notes Structure
export interface BrainNote {
  id: string;
  title: string;
  category: "notes" | "ideas" | "meetings" | "books";
  content: string;
  date: string; // YYYY-MM-DD
  tags: string[];
}

// Daily Rituals Structure
export interface DailyRituals {
  startupHydrate: boolean;
  startupReadVision: boolean;
  startupReviewAgenda: boolean;
  shutdownLogTasks: boolean;
  shutdownPlanTomorrow: boolean;
  shutdownCheckSupps: boolean;
  shutdownLogWillpower: number; // 0-10
}

// Nutrition Macros Structure
export interface NutritionConfig {
  targetCal: number;
  targetProt: number;
  targetCarb: number;
  targetFat: number;
  loggedCal: Record<string, number>; // YYYY-MM-DD -> value
  loggedProt: Record<string, number>;
  loggedCarb: Record<string, number>;
  loggedFat: Record<string, number>;
}

// Multi-Tier Reflections Structures
export interface WeeklyReview {
  wins: string;
  challenges: string;
  priority: string;
  checklist: Record<string, boolean>; // checklist item -> checked
}

export interface MonthlyReview {
  milestones: string;
  adjustments: string;
  focusArea: string;
  satisfactionScore: number; // 0-10
}

export interface QuarterlyReview {
  okrProgress: string;
  courseCorrections: string;
  highlights: string;
}

export interface YearlyReview {
  themeReview: string;
  lifeEvents: string;
  outlook: string;
}

export interface SalahLog {
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}

export interface ModuleConfig {
  health: boolean;
  gym: boolean;
  finance: boolean;
  focus: boolean;
  brain: boolean;
  reviews: boolean;
  salah: boolean;
}

export interface SleepConfig {
  awakeHourStart: number;
  awakeHourEnd: number;
}

export interface Habit {
  id: string;
  name: string;
  completedDates: Record<string, boolean>; // key: YYYY-MM-DD -> completed (true)
}

// Focus room timer configurations
export interface FocusConfig {
  focusDuration: number;
  shortDuration: number;
  longDuration: number;
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
  
  // New AI-Notion variables
  vision: VisionOS;
  notes: BrainNote[];
  rituals: Record<string, DailyRituals>; // key: YYYY-MM-DD
  nutrition: NutritionConfig;

  // Multi-Tier Reviews & Salah tracker
  weeklyReviews: Record<string, WeeklyReview>; // key: YYYY-WW (e.g. 2026-W25)
  monthlyReviews: Record<string, MonthlyReview>; // key: YYYY-MM (e.g. 2026-06)
  quarterlyReviews: Record<string, QuarterlyReview>; // key: YYYY-Q[1-4] (e.g. 2026-Q2)
  yearlyReviews: Record<string, YearlyReview>; // key: YYYY (e.g. 2026)
  salah: Record<string, SalahLog>; // key: YYYY-MM-DD

  // Modular view config
  modules: ModuleConfig;

  // Sleep / Awake Configuration
  sleepConfig: SleepConfig;

  // Historical Net Worth logging
  monthlyNetWorthHistory: Record<string, number>; // key: YYYY-MM

  // Focus room timer configurations
  focusConfig?: FocusConfig;

  // Daily Habits
  habits?: Habit[];

  // Focus sessions history log
  focusSessionsLog?: Record<string, number>; // key: YYYY-MM-DD -> sessionCount

  // Granular settings configuration for hiding/showing cards
  blocksConfig?: BlocksConfig;
}

export interface BlocksConfig {
  macroMonitor: boolean;
  waterCoach: boolean;
  supplementStack: boolean;
  workoutSplit: boolean;
  photoMatrix: boolean;
  netWorthProgress: boolean;
  recurringSubs: boolean;
  purchaseOrders: boolean;
}

