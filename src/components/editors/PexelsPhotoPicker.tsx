import { useState } from 'react';
import { searchPhotos, curatedPhotos, isPexelsConfigured, pexelsKeyMissingMessage } from '../../lib/pexels';
import type { PexelsPhoto } from '../../lib/types';
import { Button, Spinner } from '../ui';
import { PexelsCredit } from './PexelsCredit';

export function PexelsPhotoPicker({
  onPick,
  onClose,
}: {
  onPick: (p: PexelsPhoto) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runSearch(q?: string) {
    const term = (q ?? query).trim();
    setLoading(true);
    setError(null);
    try {
      const r = term ? await searchPhotos(term, 24) : await curatedPhotos(24);
      setResults(r);
    } catch (e: any) {
      setError(e?.message || 'Search failed.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  if (!isPexelsConfigured()) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
        <div className="glass rounded-2xl p-6 max-w-md w-full animate-slide-up">
          <h3 className="text-lg font-semibold mb-2">Pexels not configured</h3>
          <p className="text-sm text-white/60 mb-4">{pexelsKeyMissingMessage()}</p>
          <div className="flex gap-2 justify-end">
            <Button variant="subtle" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col animate-fade-in">
      <div className="glass border-b border-white/5 px-4 py-3 flex items-center gap-2">
        <button onClick={onClose} className="text-white/60 hover:text-white p-1">
          ✕
        </button>
        <h3 className="font-semibold text-sm">Pexels Photos</h3>
        <PexelsCredit className="ml-auto" />
      </div>

      <div className="px-4 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runSearch();
          }}
          className="flex gap-2"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search free photos… (or leave blank for curated)"
            className="flex-1 bg-ink-900/80 border border-white/10 rounded-xl px-3 py-2.5 text-sm placeholder:text-white/30 focus:outline-none focus:border-brand-400"
          />
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner className="h-4 w-4" /> : 'Search'}
          </Button>
        </form>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6">
        {loading ? (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="shimmer rounded-lg aspect-square" />
            ))}
          </div>
        ) : (
          results.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onPick(p);
                    onClose();
                  }}
                  className="group relative rounded-lg overflow-hidden aspect-square bg-ink-800 border border-white/5 hover:border-brand-400 transition"
                >
                  <img
                    src={p.src.medium}
                    alt={p.alt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                    <p className="text-[9px] text-white/70 truncate">by {p.photographer}</p>
                  </div>
                </button>
              ))}
            </div>
          )
        )}
        {!loading && results.length === 0 && !error && (
          <p className="text-sm text-white/40 text-center py-10">
            Search for a photo to start editing.
          </p>
        )}
      </div>
    </div>
  );
}
