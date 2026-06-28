export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#000000] p-6 text-zinc-50 select-none">
      <div className="max-w-md w-full border border-zinc-800 bg-[#050505] p-8 rounded-lg text-center shadow-2xl">
        <div className="mb-6 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 font-mono text-xs text-zinc-400">
            !
          </div>
        </div>
        <h1 className="text-xs font-mono uppercase tracking-widest font-semibold text-zinc-500 mb-2">
          OFFLINE MODE
        </h1>
        <p className="text-[11px] font-mono tracking-tight text-zinc-400 uppercase">
          WAITING FOR CONNECTIVITY STREAM
        </p>
      </div>
    </div>
  );
}
