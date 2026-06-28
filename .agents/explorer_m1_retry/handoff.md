# Gym-View Overhaul Investigation & Implementation Plan

This document details the analysis of the gym-view and related components, establishing a precise implementation plan for the upcoming UI overhauls.

---

## 1. Observation

Direct observations and code excerpts from the codebase analysis:

### 1.1 Exercise Details Sheet Modal & Viewport Container
- **File**: `src/components/views/gym-view.tsx`
- **Lines**: 809 - 1049
- **Current Rendering**: 
  Instead of utilizing a UI library sheet component, the active exercise detail view is rendered as a custom fullscreen overlay that fills the viewport:
  ```tsx
  {/* Fullscreen Exercise Detail Overlay View */}
  {currentExercise && (
    <div className="fixed inset-0 bg-black z-50 p-6 md:p-8 overflow-y-auto flex flex-col gap-6 animate-slide-in">
  ```
  It is triggered when the state `activeExercise` is set (e.g., when clicking an exercise item in the list at line 639).
  Dismissal occurs via setting `activeExercise(null)` on Esc keypress (registered via a global keydown event listener on lines 72-82) or via clicking the back button `[ ESC // BACK TO ROUTINE ]` at line 815.

### 1.2 "START WORKOUT SESSION" Action Button
- **File**: `src/components/views/gym-view.tsx`
- **Lines**: 876 - 890
- **Current Rendering**:
  When a workout session is inactive (`isSessionActive === false`), an overlay card is shown in the left column under "Panel 1 // Active Entry Grid":
  ```tsx
  {!isSessionActive ? (
    <div className="bg-zinc-955/50 border border-zinc-900 rounded-lg p-8 text-center space-y-4">
      <AlertCircle className="h-8 w-8 text-zinc-500 mx-auto" />
      <div className="space-y-1.5">
        <h4 className="text-sm font-mono font-bold text-zinc-300 uppercase">Workout Session Inactive</h4>
        <p className="text-xs font-mono text-zinc-500">You must start a workout session to log active sets, adjust parameters, and track progressive overload.</p>
      </div>
      <button
        disabled={gymSplit === "rest"}
        onClick={startWorkout}
        className="px-6 py-3 bg-zinc-150 hover:bg-white text-zinc-950 rounded font-mono font-bold text-xs tracking-widest uppercase active:scale-95 transition-all cursor-pointer disabled:opacity-35"
      >
        Start Workout Session
      </button>
    </div>
  ```

### 1.3 Workout Duration Clock/Timer
- **File**: `src/components/views/gym-view.tsx`
- **Lines**: 600 - 606 (Main View banner) & 834 - 841 (Detail Overlay header)
- **Current Rendering**:
  - Main View:
    ```tsx
    <div className="flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-ping" />
      <span className="text-sm font-mono font-bold text-[#10b981]">
        ACTIVE: {formatElapsedTime(sessionElapsedTime)}
      </span>
    </div>
    ```
  - Fullscreen Detail Overlay:
    ```tsx
    <div className="text-left">
      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">SESSION TIME</span>
      <span className="text-sm font-mono font-bold text-emerald-400 animate-pulse">
        {formatElapsedTime(sessionElapsedTime)}
      </span>
    </div>
    ```
  - State management uses `isSessionActive` and `sessionStartTime` to update `sessionElapsedTime` via `setInterval` inside a React `useEffect` (lines 90-102).

### 1.4 Logging Inputs & Set Completion
- **File**: `src/components/views/gym-view.tsx`
- **Lines**: 893 - 988
- **Current Rendering**:
  Inside the active entry grid, sets are iterated and rendered. The done state triggers a global `restTimer` at lines 244-258:
  ```tsx
  const handleToggleSetDone = (exId: string, setIdx: number) => {
    setSessionSets((prev) => {
      const exsSets = prev[exId] ? [...prev[exId]] : [];
      if (exsSets.length === 0) return prev;
      const setObj = { ...exsSets[setIdx] };
      const nextDone = !setObj.done;
      setObj.done = nextDone;
      exsSets[setIdx] = setObj;

      if (nextDone) {
        setRestTimer(90);
      }
      return { ...prev, [exId]: exsSets };
    });
  };
  ```
  The `restTimer` banner is rendered sticky at the top of the viewport on lines 504-527.

### 1.5 Routine Exercises & Split Routing
- **File**: `src/types/index.ts` (lines 43-55) & `src/components/views/gym-view.tsx` (lines 630-678)
- **Current Rendering**:
  - `GymExercise` has no split field.
  - The routine view maps over all `gymExercises` without any split routing/filtering logic (lines 631-678). All exercises in the state are displayed regardless of which split (push, pull, legs) is currently selected.

### 1.6 Calendar Date Context & Navigation
- **File**: `src/app/page.tsx`
- **Lines**: 77-80 & 873-923
- **Current Rendering**:
  Managed via parent state `activeDateOverride` and `activeDate`.
  The previous (`<`) and next (`>`) buttons modify the active override date via:
  ```tsx
  const d = new Date(activeDate);
  d.setDate(d.getDate() - 1); // or + 1
  setActiveDateOverride(d.toISOString().split("T")[0]);
  ```

### 1.7 TypeScript Compilation Status
- **Command**: `npx tsc --noEmit`
- **Result**: Successfully compiles with **zero** issues or warnings.

---

## 2. Logic Chain

1. **Exercise Detail Sheet Container Overhaul**:
   - *Observation*: The current modal is a simple fullscreen `fixed inset-0` overlay.
   - *Reasoning*: Moving this into a modern bottom drawer or slide-out sheet component is straightforward. We can either build a custom React sheet (using absolute translation/transitions) or style it cleanly to look like a sheet container with a backdrop mask.

2. **Overlaying the Rest Timer on Completed Sets**:
   - *Observation*: Completing a set triggers `setRestTimer(90)`. There is currently no component-level mapping between the active rest timer and the set card that triggered it.
   - *Reasoning*: We can introduce a new state `restingSet: { exerciseId: string; setIdx: number } | null` inside `GymView` to map the active timer to the specific completed set card. When `handleToggleSetDone` completes a set, we store the metadata. We then render a local absolute overlay (`absolute inset-0 bg-black/90 z-10 rounded-lg`) over that specific set card showing the countdown clock, +30S button, and SKIP button.

3. **Routine Exercise Splits Routing & Filtering**:
   - *Observation*: `GymExercise` lacks a split designation field, displaying all items on all days.
   - *Reasoning*: Adding `split?: "push" | "pull" | "legs" | "rest"` to the `GymExercise` type definition in `src/types/index.ts` is necessary. We can then filter exercises in `gym-view.tsx` so only the matching exercises are rendered:
     ```tsx
     const filteredExercises = gymExercises.filter(ex => !ex.split || ex.split === gymSplit);
     ```

4. **Date Context Stability**:
   - *Observation*: Navigation is correctly handled globally in `page.tsx` and flows down to `GymView` as `activeDate`.
   - *Reasoning*: Any gym workout save logs (in `finishWorkout()`) will automatically log using the active calendar date context.

---

## 3. Caveats

- **Database Syncing & Seed State**: Since the database schema uses a JSON state registry `state_data` inside Supabase, adding the optional `split` field to `GymExercise` will not break Supabase queries (since it's a JSON column). However, existing items in the database will not have the `split` field initially, so we must fall back to displaying them (e.g. `!ex.split || ex.split === gymSplit`).
- **Multiple Rest Timers**: Only one rest timer can run at a time in the current model. This is acceptable for a single-person gym routine.

---

## 4. Conclusion

The gym-view is structurally sound and compiles cleanly. The planned overhauls (localizing the rest timer countdown on completed sets, filtering exercises by split, and modernizing the modal/sheet container) can be fully implemented within `src/components/views/gym-view.tsx` and `src/types/index.ts` with no major external dependencies or database migrations required.

---

## 5. Verification Method

- **Build / Type Verification**: Run `npx tsc --noEmit` from the project root to ensure no syntax/type regressions are introduced.
- **Visual & Logic Verification**:
  - Verify that selecting the `<` and `>` date arrows updates the `activeDate` display in the header and that the gym log updates accordingly.
  - Verify that marking a set as done starts a 90s countdown timer over the specific completed set card.
  - Verify that adding a split field to an exercise allows it to be correctly hidden/displayed depending on the active split.
