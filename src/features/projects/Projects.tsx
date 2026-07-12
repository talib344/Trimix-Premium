import type { ProjectType, SavedProject } from '../../lib/types';
import { deleteProject } from '../../lib/projects';
import { Button, Card, EmptyState } from '../../components/ui';

const TYPE_META: Record<ProjectType, { label: string; icon: string }> = {
  video: { label: 'Video', icon: '🎬' },
  photo: { label: 'Photo', icon: '🖼️' },
  reel: { label: 'AI Reel', icon: '✨' },
};

export function Projects({
  projects,
  onOpen,
  onChanged,
}: {
  projects: SavedProject[];
  onOpen: (p: SavedProject) => void;
  onChanged: (list: SavedProject[]) => void;
}) {
  function handleDelete(id: string) {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    onChanged(deleteProject(projects, id));
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        icon="📁"
        title="No projects yet"
        subtitle="Save a video, photo, or AI reel from its editor and it will appear here. All projects are stored locally on your device."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">My Projects</h2>
        <span className="text-xs text-white/40">{projects.length} saved · local</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {projects.map((p) => {
          const meta = TYPE_META[p.type];
          return (
            <Card key={p.id} className="p-2 group">
              <button onClick={() => onOpen(p)} className="block w-full text-left">
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-ink-800">
                  {p.thumbnail ? (
                    <img
                      src={p.thumbnail}
                      alt={p.name}
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-40">
                      {meta.icon}
                    </div>
                  )}
                  <span className="absolute top-2 left-2 text-[10px] bg-black/60 rounded-full px-2 py-0.5">
                    {meta.icon} {meta.label}
                  </span>
                </div>
                <p className="text-sm mt-2 truncate">{p.name}</p>
                <p className="text-[10px] text-white/40">
                  {new Date(p.updatedAt).toLocaleDateString()}
                </p>
              </button>
              <div className="flex gap-1 mt-2">
                <Button size="sm" variant="subtle" className="flex-1" onClick={() => onOpen(p)}>
                  Open
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(p.id)}>
                  🗑
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
