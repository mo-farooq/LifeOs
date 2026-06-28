import os

file_path = "/Users/mohammadfarooqshaikh/vector-verse-os/src/components/views/gym-view.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = []

# --- REPLACEMENT 1: Splits Config and Hooks ---
target_1 = """interface GymViewProps {
  gymType: "home" | "commercial" | "both";
  gymSplit: "push" | "pull" | "legs" | "rest";
  updateGymSettings: (fields: { gymType?: "home" | "commercial" | "both"; gymSplit?: "push" | "pull" | "legs" | "rest" }) => void;
  gymExercises: GymExercise[];
  updateGymExercises: (exercises: GymExercise[]) => void;
  gymPhotos: GymPhoto[];
  updateGymPhotos: (photos: GymPhoto[]) => void;
  activeDate: string;
  blocksConfig?: BlocksConfig;
}

export default function GymView({
  gymType,
  gymSplit,
  updateGymSettings,
  gymExercises,
  updateGymExercises,
  gymPhotos,
  updateGymPhotos,
  activeDate,
  blocksConfig
}: GymViewProps) {
  const showWorkoutSplit = blocksConfig?.workoutSplit ?? true;"""

replacement_1 = """interface GymViewProps {
  gymType: "home" | "commercial" | "both";
  gymSplit: "push" | "pull" | "legs" | "rest";
  updateGymSettings: (fields: { gymType?: "home" | "commercial" | "both"; gymSplit?: "push" | "pull" | "legs" | "rest" }) => void;
  gymExercises: GymExercise[];
  updateGymExercises: (exercises: GymExercise[]) => void;
  gymPhotos: GymPhoto[];
  updateGymPhotos: (photos: GymPhoto[]) => void;
  activeDate: string;
  blocksConfig?: BlocksConfig;
}

const routineSplits = {
  PUSH: ["Barbell Bench Press", "Incline DB Press", "Overhead Shoulder Press", "Pushups"],
  PULL: ["Barbell Deadlifts", "Lat Pulldowns", "Seated Cable Rows", "Bicep Dumbbell Curls"],
  LEGS: ["Barbell Back Squats", "Romanian Deadlifts", "Leg Extensions", "Calf Raises"],
  REST: [] as string[]
};

export default function GymView({
  gymType,
  gymSplit,
  updateGymSettings,
  gymExercises,
  updateGymExercises,
  gymPhotos,
  updateGymPhotos,
  activeDate,
  blocksConfig
}: GymViewProps) {
  const activeSplitTab = gymSplit.toUpperCase() as keyof typeof routineSplits;
  const activeRoutineExercises = routineSplits[activeSplitTab] || [];
  const filteredExercises = gymExercises.filter((ex) => activeRoutineExercises.includes(ex.name));

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

  const skipRestTimer = () => { setRestTimer(null); };

  const showWorkoutSplit = blocksConfig?.workoutSplit ?? true;"""

replacements.append((target_1, replacement_1, "splits and hooks"))

# --- REPLACEMENT 2: Left column card, REST Day Placeholder and Timer scale up ---
target_2 = """        {showWorkoutSplit && (
          <div className={`${leftSpan} space-y-2 sm:space-y-4 md:space-y-6`}>
            <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
            <CardHeader className="p-3.5 sm:p-5 md:p-6 border-b border-zinc-800">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-550 font-bold">ROUTINE TRACKER</span>
                  <CardTitle className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-widest">
                    ACTIVE {gymSplit} EXERCISES
                  </CardTitle>
                </div>
                <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider font-bold">
                  {gymExercises.length} Total Exercises
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-5 md:p-6 space-y-6">

              {/* Live Workout Session Banner */}
              <div className="border border-zinc-900 bg-[#000000] p-4.5 rounded-md flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 font-bold">WORKOUT SESSION</span>
                  {isSessionActive ? (
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-ping" />
                      <span className="text-sm font-mono font-bold text-[#10b981]">
                        ACTIVE: {formatElapsedTime(sessionElapsedTime)}
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm font-mono font-bold text-zinc-400">INACTIVE</div>
                  )}
                </div>
                {isSessionActive ? (
                  <button
                    onClick={finishWorkout}
                    className="px-5 py-2.5 bg-red-955/20 hover:bg-red-955/40 border border-red-900/60 hover:border-red-900 text-red-500 rounded text-xs font-mono font-bold tracking-widest uppercase active:scale-95 transition-all cursor-pointer font-bold"
                  >
                    Finish Workout
                  </button>
                ) : (
                  <button
                    disabled={gymSplit === "rest"}
                    onClick={startWorkout}
                    className="px-5 py-2.5 bg-zinc-50 hover:bg-white text-zinc-950 rounded text-xs font-mono font-bold tracking-widest uppercase active:scale-95 transition-all cursor-pointer font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Start Workout
                  </button>
                )}
              </div>
              
              {/* List Exercises (Basic Clickable Cards Profile) */}
              <div className="space-y-4">
                {gymExercises.map((ex) => {
                  const isUpgraded = isSessionActive 
                    ? sessionSets[ex.id]?.some(s => s.done && s.reps >= ex.targetReps)
                    : ex.reps >= ex.targetReps;

                  return (
                    <div 
                      key={ex.id} 
                      onClick={() => setActiveExercise(ex)}
                      className="group border border-zinc-900 bg-[#000000]/60 p-4 rounded-md flex flex-col gap-2 transition-all hover:border-zinc-700 hover:bg-zinc-900/10 cursor-pointer animate-slide-in animate-fade-in"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <h3 className="text-sm font-bold font-mono text-zinc-150 uppercase tracking-wide group-hover:text-white transition-colors">
                              {ex.name}
                            </h3>
                            <span className="text-[10px] text-zinc-500 font-mono tracking-wider">
                              [PR: {calculatePR(ex)}KG // 1RM: {calculate1RM(ex)}KG]
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 uppercase">
                            <span>CURRENT: <span className="font-bold text-zinc-200">{ex.weight}kg × {ex.reps} reps</span></span>
                            <span>TARGET: <span className="font-bold text-zinc-400">{ex.targetReps} reps</span></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isUpgraded && (
                            <span className="px-2 py-0.5 bg-emerald-950/20 border border-emerald-900/60 rounded text-[9px] font-mono text-emerald-400 uppercase font-semibold">
                              TARGET MET
                            </span>
                          )}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteExercise(ex.id);
                            }}
                            className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-sm font-bold font-mono"
                            title="Delete exercise"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {gymExercises.length === 0 && (
                  <div className="text-center py-6 text-xs font-mono uppercase tracking-widest text-zinc-500 border border-dashed border-zinc-800 rounded animate-pulse">
                    No active gym split logs.
                  </div>
                )}
              </div>

              {/* Add Exercise form */}
              <div className="flex flex-col gap-2.5 pt-4 border-t border-zinc-900 mt-3">
                <input
                  type="text"
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  placeholder="EXERCISE NAME (e.g. Overhead Press)..."
                  className="h-12 bg-transparent border border-zinc-800 rounded-md px-4 text-sm font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400 bg-black/40 transition-all focus:outline-none"
                />
                <div className="grid grid-cols-3 gap-2.5">
                  <input
                    type="number"
                    value={newExWeight}
                    onChange={(e) => setNewExWeight(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="WEIGHT (KG)..."
                    className="h-12 bg-transparent border border-zinc-800 rounded-md px-4 text-sm font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400 bg-black/40 transition-all focus:outline-none"
                  />
                  <input
                    type="number"
                    value={newExReps}
                    onChange={(e) => setNewExReps(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="REPS..."
                    className="h-12 bg-transparent border border-zinc-800 rounded-md px-4 text-sm font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400 bg-black/40 transition-all focus:outline-none"
                  />
                  <input
                    type="number"
                    value={newExTarget}
                    onChange={(e) => setNewExTarget(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="TARGET REPS..."
                    className="h-12 bg-transparent border border-zinc-800 rounded-md px-4 text-sm font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400 bg-black/40 transition-all focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleAddExercise}
                  className="h-12 w-full rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-xs tracking-widest uppercase transition-all duration-100 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  Add Exercise
                </button>
              </div>

            </CardContent>
          </Card>
          </div>
        )}"""

# Note: baseline has bg-red-950/20 in finishWorkout, let's look at what's in the actual file. We will double check.
# Let's adjust target_2 to match the actual file contents exactly:
if 'bg-red-950/20' in content:
    target_2 = target_2.replace('bg-red-955/20', 'bg-red-950/20').replace('bg-red-955/40', 'bg-red-950/40')

replacement_2 = """        {showWorkoutSplit && (
          <div className={`${leftSpan} space-y-2 sm:space-y-4 md:space-y-6`}>
            {gymSplit === "rest" ? (
              <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
                <CardContent className="p-8 text-center text-zinc-400 font-mono text-sm uppercase leading-relaxed">
                  REST PROFILE ACTIVE // Focus on sleep metrics, mobility workflows, and active hydration pacing today.
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-[#0a0a0a] border-zinc-800 rounded-md">
              <CardHeader className="p-3.5 sm:p-5 md:p-6 border-b border-zinc-800">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-550 font-bold">ROUTINE TRACKER</span>
                    <CardTitle className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-widest">
                      ACTIVE {gymSplit} EXERCISES
                    </CardTitle>
                  </div>
                  <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider font-bold">
                    {filteredExercises.length} Total Exercises
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3.5 sm:p-5 md:p-6 space-y-6">

                {/* Live Workout Session Banner */}
                <div className="border border-zinc-900 bg-[#000000] p-4.5 rounded-md flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-550 font-bold">WORKOUT SESSION</span>
                    {isSessionActive ? (
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#10b981] animate-ping" />
                        <span className="text-3xl md:text-4xl font-mono tracking-tight text-white font-bold">
                          {formatElapsedTime(sessionElapsedTime)}
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm font-mono font-bold text-zinc-400">INACTIVE</div>
                    )}
                  </div>
                  {isSessionActive ? (
                    <button
                      onClick={finishWorkout}
                      className="px-5 py-2.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/60 hover:border-red-900 text-red-500 rounded text-xs font-mono font-bold tracking-widest uppercase active:scale-95 transition-all cursor-pointer font-bold"
                    >
                      Finish Workout
                    </button>
                  ) : (
                    <button
                      disabled={gymSplit === "rest"}
                      onClick={startWorkout}
                      className="px-5 py-2.5 bg-zinc-50 hover:bg-white text-zinc-950 rounded text-xs font-mono font-bold tracking-widest uppercase active:scale-95 transition-all cursor-pointer font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Start Workout
                    </button>
                  )}
                </div>
                
                {/* List Exercises (Basic Clickable Cards Profile) */}
                <div className="space-y-4">
                  {filteredExercises.map((ex) => {
                    const isUpgraded = isSessionActive 
                      ? sessionSets[ex.id]?.some(s => s.done && s.reps >= ex.targetReps)
                      : ex.reps >= ex.targetReps;

                    return (
                      <div 
                        key={ex.id} 
                        onClick={() => setActiveExercise(ex)}
                        className="group border border-zinc-900 bg-[#000000]/60 p-4 rounded-md flex flex-col gap-2 transition-all hover:border-zinc-700 hover:bg-zinc-900/10 cursor-pointer animate-slide-in animate-fade-in"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <h3 className="text-sm font-bold font-mono text-zinc-150 uppercase tracking-wide group-hover:text-white transition-colors">
                                {ex.name}
                              </h3>
                              <span className="text-[10px] text-zinc-500 font-mono tracking-wider">
                                [PR: {calculatePR(ex)}KG // 1RM: {calculate1RM(ex)}KG]
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 uppercase">
                              <span>CURRENT: <span className="font-bold text-zinc-200">{ex.weight}kg × {ex.reps} reps</span></span>
                              <span>TARGET: <span className="font-bold text-zinc-400">{ex.targetReps} reps</span></span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isUpgraded && (
                              <span className="px-2 py-0.5 bg-emerald-950/20 border border-emerald-900/60 rounded text-[9px] font-mono text-emerald-400 uppercase font-semibold">
                                TARGET MET
                              </span>
                            )}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteExercise(ex.id);
                              }}
                              className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-sm font-bold font-mono"
                              title="Delete exercise"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredExercises.length === 0 && (
                    <div className="text-center py-6 text-xs font-mono uppercase tracking-widest text-zinc-500 border border-dashed border-zinc-800 rounded animate-pulse">
                      No active gym split logs.
                    </div>
                  )}
                </div>

                {/* Add Exercise form */}
                <div className="flex flex-col gap-2.5 pt-4 border-t border-zinc-900 mt-3">
                  <input
                    type="text"
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    placeholder="EXERCISE NAME (e.g. Overhead Press)..."
                    className="h-12 bg-transparent border border-zinc-800 rounded-md px-4 text-sm font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400 bg-black/40 transition-all focus:outline-none"
                  />
                  <div className="grid grid-cols-3 gap-2.5">
                    <input
                      type="number"
                      value={newExWeight}
                      onChange={(e) => setNewExWeight(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="WEIGHT (KG)..."
                      className="h-12 bg-transparent border border-zinc-800 rounded-md px-4 text-sm font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400 bg-black/40 transition-all focus:outline-none"
                    />
                    <input
                      type="number"
                      value={newExReps}
                      onChange={(e) => setNewExReps(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="REPS..."
                      className="h-12 bg-transparent border border-zinc-800 rounded-md px-4 text-sm font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400 bg-black/40 transition-all focus:outline-none"
                    />
                    <input
                      type="number"
                      value={newExTarget}
                      onChange={(e) => setNewExTarget(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="TARGET REPS..."
                      className="h-12 bg-transparent border border-zinc-800 rounded-md px-4 text-sm font-mono placeholder:text-zinc-700 text-zinc-200 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-zinc-400 bg-black/40 transition-all focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleAddExercise}
                    className="h-12 w-full rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-xs tracking-widest uppercase transition-all duration-100 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    Add Exercise
                  </button>
                </div>

              </CardContent>
            </Card>
            )}
          </div>
        )}"""

replacements.append((target_2, replacement_2, "left exercises column"))

# --- REPLACEMENT 3: Photos activeDate filtering ---
target_3 = """              {/* Comparative side-by-side list */}
              <div className="grid grid-cols-1 gap-3.5 max-h-[300px] overflow-y-auto pr-1">
                {gymPhotos.map((photo) => (
                  <div key={photo.id} className="group border border-zinc-900 bg-[#000000]/60 p-3.5 rounded relative flex flex-col gap-2 transition-all hover:border-zinc-805 animate-slide-in">
                    <img 
                      src={photo.url} 
                      alt={photo.label}
                      className="w-full h-28 object-cover rounded bg-zinc-955 border border-zinc-900 grayscale brightness-75 contrast-125 transition-all duration-300 group-hover:grayscale-0 group-hover:brightness-90"
                    />
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-bold text-zinc-300 uppercase tracking-wider">{photo.label}</span>
                      <span className="text-zinc-550 flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" /> {photo.date}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-4 right-4 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {gymPhotos.length === 0 && (
                  <div className="text-center py-6 text-xs font-mono uppercase tracking-widest text-zinc-550 border border-dashed border-zinc-850 rounded animate-pulse">
                    No visual logs.
                  </div>
                )}
              </div>"""

replacement_3 = """              {/* Comparative side-by-side list */}
              <div className="grid grid-cols-1 gap-3.5 max-h-[300px] overflow-y-auto pr-1">
                {gymPhotos.filter(p => p.date === activeDate).map((photo) => (
                  <div key={photo.id} className="group border border-zinc-900 bg-[#000000]/60 p-3.5 rounded relative flex flex-col gap-2 transition-all hover:border-zinc-805 animate-slide-in">
                    <img 
                      src={photo.url} 
                      alt={photo.label}
                      className="w-full h-28 object-cover rounded bg-zinc-955 border border-zinc-900 grayscale brightness-75 contrast-125 transition-all duration-300 group-hover:grayscale-0 group-hover:brightness-90"
                    />
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-bold text-zinc-300 uppercase tracking-wider">{photo.label}</span>
                      <span className="text-zinc-550 flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" /> {photo.date}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-4 right-4 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 text-zinc-450 hover:text-zinc-200 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {gymPhotos.filter(p => p.date === activeDate).length === 0 && (
                  <div className="text-center py-6 text-xs font-mono uppercase tracking-widest text-zinc-550 border border-dashed border-zinc-850 rounded animate-pulse">
                    No visual logs.
                  </div>
                )}
              </div>"""

replacements.append((target_3, replacement_3, "progress photos matrix"))

# --- REPLACEMENT 4: relocate fullscreen overlay div ---
target_4 = """      {/* Fullscreen Exercise Detail Overlay View */}
      {currentExercise && (
        <div className="fixed inset-0 bg-black z-50 p-6 md:p-8 overflow-y-auto flex flex-col gap-6 animate-slide-in">"""

replacement_4 = """      {/* Fullscreen Exercise Detail Overlay View */}
      {currentExercise && (
        <div className="fixed inset-0 md:left-64 bg-black z-50 p-6 md:p-12 max-w-7xl mx-auto w-full overflow-y-auto flex flex-col gap-6 animate-slide-in">"""

replacements.append((target_4, replacement_4, "fullscreen overlay container"))

# --- REPLACEMENT 5: Panel 1 Active Sets / Inactive Overlay / Read-only / Rest timer countdown ---
target_5 = """              {!isSessionActive ? (
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
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const activeSets = sessionSets[currentExercise.id] || [];
                    return activeSets.map((set, setIdx) => {
                      const isDone = set.done;
                      const previousDetail = getPreviousSetDetails(currentExercise, setIdx);
                      return (
                        <div
                          key={setIdx}
                          className={`border rounded-lg p-4 bg-zinc-955 transition-all ${
                            isDone ? "border-emerald-900 bg-emerald-950/5" : "border-zinc-900"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                                isDone ? "bg-emerald-950 text-emerald-400" : "bg-zinc-900 text-zinc-450"
                              }`}>
                                SET {setIdx + 1}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-500 uppercase">
                                PREV: {previousDetail}
                              </span>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => handleToggleSetDone(currentExercise.id, setIdx)}
                              className={`px-3 py-1.5 rounded font-mono text-xs font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                                isDone
                                  ? "bg-emerald-500 border-emerald-400 text-black font-extrabold"
                                  : "bg-transparent border-zinc-800 text-zinc-300 hover:border-zinc-600"
                              }`}
                            >
                              {isDone ? "✓ DONE" : "MARK DONE"}
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            {/* Weight Adjuster with large touch targets */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">WEIGHT (KG)</span>
                              <div className="flex items-center bg-black border border-zinc-800 rounded">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSetWeight(currentExercise.id, setIdx, Math.max(0, (set.weight || 0) - 2.5))}
                                  className="px-3.5 py-2.5 text-zinc-400 hover:text-white border-r border-zinc-800 font-mono font-bold active:scale-90 transition-transform cursor-pointer"
                                >
                                  -2.5
                                </button>
                                <input
                                  type="number"
                                  value={set.weight ?? ""}
                                  onChange={(e) => handleUpdateSetWeight(currentExercise.id, setIdx, Number(e.target.value))}
                                  className="w-full bg-transparent text-center font-mono text-sm text-zinc-200 outline-none focus:text-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSetWeight(currentExercise.id, setIdx, (set.weight || 0) + 2.5)}
                                  className="px-3.5 py-2.5 text-zinc-400 hover:text-white border-l border-zinc-800 font-mono font-bold active:scale-90 transition-transform cursor-pointer"
                                >
                                  +2.5
                                </button>
                              </div>
                            </div>

                            {/* Reps Adjuster with large touch targets */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">REPS</span>
                              <div className="flex items-center bg-black border border-zinc-800 rounded">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSetReps(currentExercise.id, setIdx, Math.max(0, (set.reps || 0) - 1))}
                                  className="px-4 py-2.5 text-zinc-400 hover:text-white border-r border-zinc-800 font-mono font-bold active:scale-90 transition-transform cursor-pointer"
                                >
                                  -1
                                </button>
                                <input
                                  type="number"
                                  value={set.reps ?? ""}
                                  onChange={(e) => handleUpdateSetReps(currentExercise.id, setIdx, Number(e.target.value))}
                                  className="w-full bg-transparent text-center font-mono text-sm text-zinc-200 outline-none focus:text-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSetReps(currentExercise.id, setIdx, (set.reps || 0) + 1)}
                                  className="px-4 py-2.5 text-zinc-400 hover:text-white border-l border-zinc-800 font-mono font-bold active:scale-90 transition-transform cursor-pointer"
                                >
                                  +1
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}"""

replacement_5 = """              {!isSessionActive ? (
                (() => {
                  const completedToday = currentExercise.history.find(h => h.date === activeDate);
                  if (completedToday) {
                    return (
                      <div className="space-y-4">
                        {completedToday.sets && completedToday.sets.length > 0 ? (
                          completedToday.sets.map((set: any, setIdx: number) => (
                            <div
                              key={setIdx}
                              className="border border-emerald-900 bg-emerald-950/5 rounded-lg p-4 transition-all animate-slide-in"
                            >
                              <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400">
                                    SET {setIdx + 1}
                                  </span>
                                  <span className="text-[10px] font-mono text-zinc-500 uppercase">
                                    COMPLETED
                                  </span>
                                </div>
                                <span className="text-xs font-mono text-emerald-400 font-bold">
                                  ✓ READ-ONLY
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                                <div className="bg-black/40 border border-zinc-900 rounded p-2.5 text-center">
                                  <span className="text-[9px] text-zinc-500 uppercase block mb-1">WEIGHT</span>
                                  <span className="text-zinc-200 font-bold">{set.weight} kg</span>
                                </div>
                                <div className="bg-black/40 border border-zinc-900 rounded p-2.5 text-center">
                                  <span className="text-[9px] text-zinc-500 uppercase block mb-1">REPS</span>
                                  <span className="text-zinc-200 font-bold">{set.reps}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="border border-emerald-900 bg-emerald-950/5 rounded-lg p-4 animate-slide-in">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400">
                                SINGLE LOG
                              </span>
                              <span className="text-xs font-mono text-emerald-400 font-bold">
                                ✓ READ-ONLY
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                              <div className="bg-black/40 border border-zinc-900 rounded p-2.5 text-center">
                                <span className="text-[9px] text-zinc-500 uppercase block mb-1">WEIGHT</span>
                                <span className="text-zinc-200 font-bold">{completedToday.weight} kg</span>
                              </div>
                              <div className="bg-black/40 border border-zinc-900 rounded p-2.5 text-center">
                                <span className="text-[9px] text-zinc-500 uppercase block mb-1">REPS</span>
                                <span className="text-zinc-200 font-bold">{completedToday.reps}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div className="bg-zinc-955/50 border border-zinc-900 rounded-lg p-8 text-center space-y-4">
                      <AlertCircle className="h-8 w-8 text-zinc-500 mx-auto" />
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-mono font-bold text-zinc-300 uppercase">Workout Session Inactive</h4>
                        <p className="text-xs font-mono text-zinc-500">You must start a workout session to log active sets, adjust parameters, and track progressive overload.</p>
                      </div>
                      <div className="flex justify-center w-full">
                        <button
                          disabled={gymSplit === "rest"}
                          onClick={startWorkout}
                          className="w-full max-w-xs h-12 bg-zinc-100 hover:bg-white text-zinc-950 font-mono text-xs font-bold uppercase tracking-wider transition-colors rounded shadow-lg disabled:opacity-35"
                        >
                          START WORKOUT SESSION
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="space-y-4 relative min-h-[200px]">
                  {restTimer !== null && (
                    <div className="absolute inset-0 bg-[#0a0a0a]/95 border border-zinc-800 rounded-lg z-10 flex flex-col items-center justify-center p-6 text-center animate-slide-in">
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono tracking-widest text-zinc-550 uppercase font-semibold block">REST BREAK ACTIVE</span>
                        <div className="text-4xl md:text-5xl font-mono tracking-tight text-emerald-400 font-bold animate-pulse-slow">
                          {formatTime(restTimer)}
                        </div>
                        <p className="text-xs font-mono text-zinc-500 max-w-xs mx-auto">Take a moment to recover. Hydrate and prepare for the next set.</p>
                        <button onClick={() => skipRestTimer()} className="mt-2 text-xs font-mono text-zinc-400 hover:text-white underline block mx-auto">
                          [ SKIP REST BREAK ]
                        </button>
                      </div>
                    </div>
                  )}
                  {(() => {
                    const activeSets = sessionSets[currentExercise.id] || [];
                    return activeSets.map((set, setIdx) => {
                      const isDone = set.done;
                      const previousDetail = getPreviousSetDetails(currentExercise, setIdx);
                      return (
                        <div
                          key={setIdx}
                          className={`border rounded-lg p-4 bg-zinc-955 transition-all ${
                            isDone ? "border-emerald-900 bg-emerald-950/5" : "border-zinc-900"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                                isDone ? "bg-emerald-950 text-emerald-400" : "bg-zinc-900 text-zinc-450"
                              }`}>
                                SET {setIdx + 1}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-500 uppercase">
                                PREV: {previousDetail}
                              </span>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => handleToggleSetDone(currentExercise.id, setIdx)}
                              className={`px-3 py-1.5 rounded font-mono text-xs font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                                isDone
                                  ? "bg-emerald-500 border-emerald-400 text-black font-extrabold"
                                  : "bg-transparent border-zinc-800 text-zinc-300 hover:border-zinc-600"
                              }`}
                            >
                              {isDone ? "✓ DONE" : "MARK DONE"}
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            {/* Weight Adjuster with large touch targets */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">WEIGHT (KG)</span>
                              <div className="flex items-center bg-black border border-zinc-800 rounded">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSetWeight(currentExercise.id, setIdx, Math.max(0, (set.weight || 0) - 2.5))}
                                  className="px-3.5 py-2.5 text-zinc-400 hover:text-white border-r border-zinc-800 font-mono font-bold active:scale-90 transition-transform cursor-pointer"
                                >
                                  -2.5
                                </button>
                                <input
                                  type="number"
                                  value={set.weight ?? ""}
                                  onChange={(e) => handleUpdateSetWeight(currentExercise.id, setIdx, Number(e.target.value))}
                                  className="w-full bg-transparent text-center font-mono text-sm text-zinc-200 outline-none focus:text-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSetWeight(currentExercise.id, setIdx, (set.weight || 0) + 2.5)}
                                  className="px-3.5 py-2.5 text-zinc-400 hover:text-white border-l border-zinc-800 font-mono font-bold active:scale-90 transition-transform cursor-pointer"
                                >
                                  +2.5
                                </button>
                              </div>
                            </div>

                            {/* Reps Adjuster with large touch targets */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">REPS</span>
                              <div className="flex items-center bg-black border border-zinc-800 rounded">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSetReps(currentExercise.id, setIdx, Math.max(0, (set.reps || 0) - 1))}
                                  className="px-4 py-2.5 text-zinc-400 hover:text-white border-r border-zinc-800 font-mono font-bold active:scale-90 transition-transform cursor-pointer"
                                >
                                  -1
                                </button>
                                <input
                                  type="number"
                                  value={set.reps ?? ""}
                                  onChange={(e) => handleUpdateSetReps(currentExercise.id, setIdx, Number(e.target.value))}
                                  className="w-full bg-transparent text-center font-mono text-sm text-zinc-200 outline-none focus:text-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSetReps(currentExercise.id, setIdx, (set.reps || 0) + 1)}
                                  className="px-4 py-2.5 text-zinc-400 hover:text-white border-l border-zinc-800 font-mono font-bold active:scale-90 transition-transform cursor-pointer"
                                >
                                  +1
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}"""

replacements.append((target_5, replacement_5, "Panel 1 active sets & rest break"))

print("Starting replacements...")
success = True
for target, replacement, name in replacements:
    count = content.count(target)
    if count == 0:
        print(f"ERROR: Target for {name} not found in the file!")
        success = False
    elif count > 1:
        print(f"ERROR: Target for {name} matched {count} times (must be unique)!")
        success = False
    else:
        content = content.replace(target, replacement)
        print(f"SUCCESS: Replaced target for {name}")

if success:
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("ALL REPLACEMENTS COMPLETED SUCCESSFULLY")
else:
    print("FAILED TO APPLY REPLACEMENTS")
    exit(1)
