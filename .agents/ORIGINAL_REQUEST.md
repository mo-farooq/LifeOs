# Original User Request

## Initial Request — 2026-06-28T14:29:45Z

Overhaul `src/components/views/gym-view.tsx` to fix layout constraints, introduce an automatic rest timer, separate workout routine splits, and sync data display to the global calendar date context.

Working directory: `/Users/mohammadfarooqshaikh/vector-verse-os`
Integrity mode: demo

## Requirements

### R1. UI Real Estate Overhauls & Rest Break countdown timer
* **Sidebar Underlap & Centering**: Relocate the details sheet viewport container wrapping the exercise focus detail sheet modal. Change `fixed inset-0` to `fixed inset-0 md:left-64` to prevent clipping behind the desktop navigation sidebar. Set padding/alignment bounds to `p-6 md:p-12 max-w-7xl mx-auto w-full`.
* **Ghost Buttons**: Update the "START WORKOUT SESSION" action button in the inactive overlay to use high-contrast classes: `w-full max-w-xs h-12 bg-zinc-100 hover:bg-white text-zinc-950 font-mono text-xs font-bold uppercase tracking-wider transition-colors rounded shadow-lg` so it stands out immediately on a black workspace.
* **Glanceable Timer**: Scale up the running workout duration timer to `text-3xl md:text-4xl font-mono tracking-tight text-white font-bold`.
* **Automatic Rest Interval Engine**: Build an automated Rest Phase card overlay block. The exact moment a set completion checkbox state transitions to true, reveal a live, decrementing 90-second digital countdown panel directly on top of the logging inputs, with an escape button:
  `<button onClick={() => skipRestTimer()} className="mt-2 text-xs font-mono text-zinc-400 hover:text-white underline">[ SKIP REST BREAK ]</button>`

### R2. Isolated Routine Split & Calendar Sync
* **Isolated Workout Splits**: Stop tracking routine exercises over a single array. Implement a dictionary `const routineSplits = { PUSH: [...], PULL: [...], LEGS: [...], REST: [] };` with the exercises:
  * **PUSH**: Barbell Bench Press, Incline DB Press, Overhead Shoulder Press, Pushups.
  * **PULL**: Barbell Deadlifts, Lat Pulldowns, Seated Cable Rows, Bicep Dumbbell Curls.
  * **LEGS**: Barbell Back Squats, Romanian Deadlifts, Leg Extensions, Calf Raises.
* **Split Routing Filters**: Filter rows strictly based on `routineSplits[activeSplitTab]` (active tab state).
* **Recovery placeholder**: When the `REST` split tab is active, hide all tracking matrices and analytical line charts. Render a clean recovery placeholder layout block: "REST PROFILE ACTIVE // Focus on sleep metrics, mobility workflows, and active hydration pacing today."
* **Dynamic Calendar Syncing**: Bind all data collection logs directly to the root application calendar date context string. Display log entries matching ONLY the current date value. Clicking the calendar arrows (`<` / `>`) at the top of the dashboard layout must trigger an instant reload of the containers to display that specific date's performance history.

### R3. Orchestration & Verification Pipeline
* Act as the lead orchestrator. Verify code integrations concurrently.
* Ensure rest timer countdown triggers do not interfere with date-filtering parameters or unmount modal overlays unexpectedly.
* Validate that TypeScript type-check `npx tsc --noEmit` compiles successfully with zero errors.

## Acceptance Criteria

### UI Real Estate & Rest Break Mechanics
- [ ] Detail sheet container features `md:left-64` class, rendering clear of the navigation sidebar.
- [ ] "Start Workout Session" button text has high-contrast background styling visible without hover.
- [ ] Workout clock displays with bold `text-3xl md:text-4xl` metrics.
- [ ] Marking a set done immediately overlays the decrementing 90-second countdown; clicking "[ SKIP REST BREAK ]" clears the overlay.

### Routing Splits & Date Context Alignment
- [ ] Routine splits render exercises corresponding strictly to PUSH, PULL, or LEGS list templates based on the active tab state.
- [ ] Selecting the REST tab hides logging matrices and displays the recovery placeholder.
- [ ] Calendar day switches reload exercise log sheets to only show data matching the selected date.

### Swarm Pipeline Safety
- [ ] TypeScript compiler command `npx tsc --noEmit` completes with a zero-error output.
