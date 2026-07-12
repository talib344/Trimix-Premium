import type { SavedProject } from './types';
import { uid } from './types';

const KEY = 'trimix_projects_v2';

export function loadProjects(): SavedProject[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as SavedProject[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveProjects(projects: SavedProject[]): void {
  try {
    // Strip heavy data URLs to avoid quota issues if needed; keep last 30
    const trimmed = projects.slice(0, 30);
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch (e) {
    // Quota exceeded — try saving metadata only (no thumbnails)
    try {
      const lite = projects.slice(0, 30).map((p) => ({ ...p, thumbnail: undefined }));
      localStorage.setItem(KEY, JSON.stringify(lite));
    } catch {
      /* give up silently */
    }
  }
}

export function upsertProject(
  projects: SavedProject[],
  project: Omit<SavedProject, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): SavedProject[] {
  const now = Date.now();
  let list = [...projects];
  if (project.id) {
    list = list.map((p) =>
      p.id === project.id ? { ...p, ...project, id: p.id, createdAt: p.createdAt, updatedAt: now } : p,
    );
  } else {
    const newProj: SavedProject = {
      ...project,
      id: uid(),
      createdAt: now,
      updatedAt: now,
    } as SavedProject;
    list = [newProj, ...list];
  }
  saveProjects(list);
  return list;
}

export function deleteProject(projects: SavedProject[], id: string): SavedProject[] {
  const list = projects.filter((p) => p.id !== id);
  saveProjects(list);
  return list;
}
