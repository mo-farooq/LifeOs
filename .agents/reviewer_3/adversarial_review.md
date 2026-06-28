# Adversarial Review Report — Gym View

## Challenge Summary

**Overall risk assessment**: LOW

The component exhibits excellent defensive engineering. State management is cleanly decoupled from presentation modals, avoiding typical component-unmount state losses. Critical edge cases like division-by-zero or NaN in SVG charts are handled via conditional rendering.

## Challenges

### [Low] Challenge 1: Infinite Effect Loop in Auto-population

- Assumption challenged: The effect that auto-populates split routine exercises when changing splits could cause an infinite loop because `gymExercises` is a dependency and `updateGymExercises` modifies `gymExercises`.
- Attack scenario: Modifying `gymExercises` inside the effect triggers the effect again.
- Blast radius: Page freeze or browser crash.
- Mitigation: Verified that on the subsequent render, the `missing.length > 0` condition is false since the missing exercises were appended to `gymExercises`. The block does not execute, terminating the cycle cleanly.

### [Low] Challenge 2: State Loss on Closing Detail View

- Assumption challenged: Closing the detail modal destroys the active rest break timer.
- Attack scenario: The user completes a set, starting a 90-second rest countdown, then closes the detail modal to check another view.
- Blast radius: Timer resets or vanishes.
- Mitigation: The rest timer state `restTimer` is stored in the parent `GymView` component. Closing the modal sets `activeExercise` to null but keeps `restTimer` intact. The parent component renders a sticky banner `restTimer !== null` at the top of the viewport, preserving the active countdown and allowing interaction (+30s or Skip).

### [Low] Challenge 3: SVG Rendering with Insufficient History

- Assumption challenged: Drawing trend paths using SVG points can break or produce division-by-zero if there is zero or one historical entry.
- Attack scenario: An exercise with no history logs is viewed, trying to render the trend line.
- Blast radius: NaN or crash in SVG rendering path calculation.
- Mitigation: Verified that the chart generation helper `render1RMChart` includes a safeguard:
  ```tsx
  if (dataPoints.length < 2) {
    return (
      <div className="py-8 text-center text-xs font-mono text-zinc-500 uppercase tracking-widest border border-dashed border-zinc-800 rounded">
        More historical data required to render 1RM performance trend.
      </div>
    );
  }
  ```
  This prevents any unsafe division-by-zero calculations when `dataPoints.length < 2`.

## Stress Test Results

- **Empty / rest split** → Selection of "rest" split should show placeholder without exercises → Verified (renders REST PROFILE ACTIVE placeholder card, hides workout timer controls) → **Pass**
- **Detail modal unmount during countdown** → Closing overlay while timer runs → Verified (timer continues in sticky top banner) → **Pass**
- **Add custom exercise with invalid/empty fields** → Leaving some fields empty and clicking "Add Exercise" → Verified (fails validation silently and does not add malformed exercises) → **Pass**
- **SVG trend line for new exercises** → Viewing details of a newly added exercise with zero history → Verified (correctly shows "More historical data required..." warning, does not crash) → **Pass**

## Unchallenged Areas

- Styling layout responsiveness is not challenged at a deep OS rendering level since we are in a headless environment. However, style class inspect shows complete mobile and desktop styling.
