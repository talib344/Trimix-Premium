import type { TabKey } from '../lib/types';
import { cn } from '../lib/cn';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'video', label: 'Video', icon: '🎬' },
  { key: 'photo', label: 'Photo', icon: '🖼️' },
  { key: 'reel', label: 'AI Reel', icon: '✨' },
  { key: 'projects', label: 'Projects', icon: '📁' },
];

export function BottomNav({
  tab,
  onChange,
}: {
  tab: TabKey;
  onChange: (t: TabKey) => void;
}) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 safe-bottom">
      <div className="max-w-3xl mx-auto px-3 pb-2 pt-1">
        <div className="glass rounded-2xl flex items-center justify-around p-1.5 shadow-2xl shadow-black/40">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => onChange(t.key)}
                className={cn(
                  'relative flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition',
                  active ? 'text-white' : 'text-white/45 hover:text-white/70',
                )}
              >
                {active && (
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-b from-brand-500/25 to-accent-500/15 border border-brand-400/30" />
                )}
                <span className="relative text-xl leading-none">{t.icon}</span>
                <span className="relative text-[10px] font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
