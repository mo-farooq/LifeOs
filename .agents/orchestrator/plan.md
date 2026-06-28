# Plan: Gym View Overhaul

This plan outlines the milestones, steps, and verification strategies to overhaul `src/components/views/gym-view.tsx`.

## Architecture
- **Target File**: `src/components/views/gym-view.tsx`
- **Interactions**:
  - The UI uses Tailwind CSS classes for layout.
  - Active routines split by PUSH, PULL, LEGS, REST.
  - Integration with the root calendar date context.

## Milestones

| # | Milestone Name | Scope | Dependencies | Status |
|---|----------------|-------|--------------|--------|
| 1 | Exploration & Analysis | Investigate current layout, state, components, and calendar date context implementation in `gym-view.tsx` and parent/context components. | None | PLANNED |
| 2 | UI Real Estate & Rest Timer | Relocate details sheet viewport, style "Start Workout" button, scale duration timer, and build automatic 90s rest interval engine overlay. | M1 | PLANNED |
| 3 | Isolated Splits & REST Placeholder | Refactor routine tracking to dictionary, filter by active tab split, and implement REST split recovery placeholder. | M2 | PLANNED |
| 4 | Calendar Context Integration | Bind all logging to root calendar date context, reload on date changes (via `<` / `>` clicks). | M3 | PLANNED |
| 5 | E2E & TypeScript Verification | Run TypeScript type-check `npx tsc --noEmit` and perform verification checks on components, making sure layout works clear of sidebar and timer runs without issues. | M4 | PLANNED |

## Interface Contracts
- `routineSplits`:
  - `PUSH`: Barbell Bench Press, Incline DB Press, Overhead Shoulder Press, Pushups
  - `PULL`: Barbell Deadlifts, Lat Pulldowns, Seated Cable Rows, Bicep Dumbbell Curls
  - `LEGS`: Barbell Back Squats, Romanian Deadlifts, Leg Extensions, Calf Raises
  - `REST`: [] (Recovery placeholder active)
- Date Context:
  - Must display/filter gym logs based on root calendar date context.
  - Click on dashboard layout calendar arrows must update context and trigger refresh in `gym-view.tsx`.

## Code Layout
- `src/components/views/gym-view.tsx`
