## 2026-06-28T14:36:30Z

Modify `src/components/views/gym-view.tsx` to implement all requirements detailed below, and verify type safety.

Implementation Requirements:
1. R1. UI Real Estate Overhauls & Rest Break countdown timer:
   - Relocate the details sheet viewport container wrapping the exercise focus detail sheet modal (around line 810 in `src/components/views/gym-view.tsx`). Change `fixed inset-0` to `fixed inset-0 md:left-64 bg-black z-50 p-6 md:p-12 max-w-7xl mx-auto w-full overflow-y-auto flex flex-col gap-6 animate-slide-in` to prevent clipping behind desktop navigation sidebar.
   - Update the "START WORKOUT SESSION" action button in the inactive overlay (around lines 883-889) to use high-contrast classes: `w-full max-w-xs h-12 bg-zinc-100 hover:bg-white text-zinc-950 font-mono text-xs font-bold uppercase tracking-wider transition-colors rounded shadow-lg`. Make sure the text is uppercase: "START WORKOUT SESSION".
   - Scale up the main running workout duration timer (around line 604) to `text-3xl md:text-4xl font-mono tracking-tight text-white font-bold` (remove/re-style the preceding "ACTIVE: " string as needed so the timer itself takes these classes).
   - Build an automated Rest Phase card overlay block. The exact moment a set completion checkbox state transitions to true (revealed by restTimer becoming non-null), display a live, decrementing 90-second digital countdown panel directly on top of the logging inputs (overlaying Panel 1 sets container), with an escape button:
     `<button onClick={() => skipRestTimer()} className="mt-2 text-xs font-mono text-zinc-400 hover:text-white underline">[ SKIP REST BREAK ]</button>`
     Define `skipRestTimer()` inside `GymView` as:
     `const skipRestTimer = () => { setRestTimer(null); };`
     Ensure this overlay displays the rest timer countdown cleanly.

2. R2. Isolated Routine Split & Calendar Sync:
   - Implement the `routineSplits` dictionary at the top level of `GymView`:
     ```typescript
     const routineSplits = {
       PUSH: ["Barbell Bench Press", "Incline DB Press", "Overhead Shoulder Press", "Pushups"],
       PULL: ["Barbell Deadlifts", "Lat Pulldowns", "Seated Cable Rows", "Bicep Dumbbell Curls"],
       LEGS: ["Barbell Back Squats", "Romanian Deadlifts", "Leg Extensions", "Calf Raises"],
       REST: [] as string[]
     };
     ```
   - Implement a `useEffect` inside `GymView` to check for missing exercises for the current split from `gymExercises` and initialize them with default values (weight 0, reps 8, targetReps 8, history []), so that they appear in the UI:
     ```typescript
     React.useEffect(() => {
       if (gymSplit === "rest") return;
       const activeSplitTab = gymSplit.toUpperCase() as keyof typeof routineSplits;
       const exercisesForSplit = routineSplits[activeSplitTab] || [];
       
       const missing = exercisesForSplit.filter(
         name => !gymExercises.some(ex => ex.name.toLowerCase() === name.toLowerCase())
       );
       
       if (missing.length > 0) {
         const nextExs = [...gymExercises];
         missing.forEach(name => {
           nextExs.push({
             id: `auto-${name.toLowerCase().replace(/\s+/g, "-")}`,
             name,
             weight: 0,
             reps: 8,
             targetReps: 8,
             history: []
           });
         });
         updateGymExercises(nextExs);
       }
     }, [gymSplit, gymExercises, updateGymExercises]);
     ```
   - Filter the displayed exercises in the tracker card strictly based on the active tab split name from `routineSplits`:
     ```typescript
     const activeSplitTab = gymSplit.toUpperCase() as keyof typeof routineSplits;
     const activeRoutineExercises = routineSplits[activeSplitTab] || [];
     const filteredExercises = gymExercises.filter((ex) => activeRoutineExercises.includes(ex.name));
     ```
     Render using `filteredExercises` in the card header count and exercise cards `.map()`.
   - When the `REST` split tab is active, hide the main exercises card and render a clean recovery placeholder layout block:
     ```tsx
     <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
       <CardContent className="p-8 text-center text-zinc-400 font-mono text-sm uppercase leading-relaxed">
         REST PROFILE ACTIVE // Focus on sleep metrics, mobility workflows, and active hydration pacing today.
       </CardContent>
     </Card>
     ```
   - Bind all logging and displaying directly to the root application calendar date context string (`activeDate` prop).
   - Display log entries matching ONLY the current date value. Filter `gymPhotos` rendered by `activeDate` (`gymPhotos.filter(p => p.date === activeDate)`).
   - In the exercise detail sheet, if the session is inactive but there is a completed history item matching `activeDate` (e.g., `currentExercise.history.find(h => h.date === activeDate)`), render those sets as completed sets (read-only) in Panel 1 instead of showing the "Workout Session Inactive" card.

Verification Requirements:
1. Ensure the application compiles successfully using `npx tsc --noEmit` and has zero errors.
2. Save your changes and write a detailed handoff report to `/Users/mohammadfarooqshaikh/vector-verse-os/.agents/implementer_m2/handoff.md`. Include the test compile commands and results.
3. Report back to the parent once completed.
