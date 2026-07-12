export function Header() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-ink-950/70 border-b border-white/5">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/crown.svg" alt="" className="h-7 w-7" />
          <div className="leading-tight">
            <h1 className="text-base font-bold tracking-tight">
              Trimix Premium Pro <span className="align-middle">👑</span>
            </h1>
            <p className="text-[10px] text-white/45 -mt-0.5">Free Forever · No Watermark</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-2 py-1 rounded-full bg-gradient-to-r from-brand-500/30 to-accent-500/30 border border-brand-400/30 text-brand-200 font-medium">
            100% Free
          </span>
        </div>
      </div>
    </header>
  );
}
