import { useEffect, useMemo, useState } from 'react';
import type { SavedProject, TabKey } from './lib/types';
import { loadProjects } from './lib/projects';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { VideoEditor } from './features/video/VideoEditor';
import { PhotoEditor } from './features/photo/PhotoEditor';
import { ReelMaker } from './features/reel/ReelMaker';
import { Projects } from './features/projects/Projects';

export default function App() {
  const [tab, setTab] = useState<TabKey>('video');
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [openProject, setOpenProject] = useState<SavedProject | null>(null);

  useEffect(() => {
    setProjects(loadProjects());
  }, []);

  const handleOpenProject = (p: SavedProject) => {
    setOpenProject(p);
    setTab(p.type === 'reel' ? 'reel' : p.type === 'photo' ? 'photo' : 'video');
  };

  const handleSaved = () => {
    setProjects(loadProjects());
    setOpenProject(null);
  };

  const view = useMemo(() => {
    switch (tab) {
      case 'video':
        return (
          <VideoEditor
            initialProject={openProject?.type === 'video' ? openProject : null}
            onSaved={handleSaved}
          />
        );
      case 'photo':
        return (
          <PhotoEditor
            initialProject={openProject?.type === 'photo' ? openProject : null}
            onSaved={handleSaved}
          />
        );
      case 'reel':
        return (
          <ReelMaker
            initialProject={openProject?.type === 'reel' ? openProject : null}
            onSaved={handleSaved}
          />
        );
      case 'projects':
        return (
          <Projects
            projects={projects}
            onOpen={handleOpenProject}
            onChanged={setProjects}
          />
        );
    }
  }, [tab, openProject, projects]);

  return (
    <div className="app-bg min-h-screen text-white flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto no-scrollbar pb-28 max-w-3xl w-full mx-auto">
        <div key={tab} className="animate-fade-in px-4 pt-4">
          {view}
        </div>
      </main>
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
}
