export type TabKey = 'video' | 'photo' | 'reel' | 'projects';

export type ProjectType = 'video' | 'photo' | 'reel';

export interface SavedProject {
  id: string;
  type: ProjectType;
  name: string;
  createdAt: number;
  updatedAt: number;
  /** Snapshot/thumbnail (data URL or remote URL) */
  thumbnail?: string;
  /** Serialized editor state (type-specific) */
  data: unknown;
}

export interface PexelsVideo {
  id: number;
  /** Landscape preview */
  image: string;
  width: number;
  height: number;
  duration: number;
  /** Best-quality mp4 url */
  videoUrl: string;
  user: string;
  userUrl: string;
}

export interface PexelsPhoto {
  id: number;
  src: {
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
  };
  alt: string;
  photographer: string;
  photographerUrl: string;
}

/** Text overlay on a video or photo */
export interface TextOverlay {
  id: string;
  text: string;
  x: number; // 0..1 relative
  y: number; // 0..1 relative
  fontSize: number; // px
  color: string;
  isUrdu: boolean;
  fontFamily: string;
  fontWeight: number;
}

/** Sticker/emoji overlay */
export interface StickerOverlay {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
}

export interface VideoProjectData {
  sourceUrl: string;
  sourceKind: 'gallery' | 'pexels';
  poster?: string;
  trimStart: number;
  trimEnd: number;
  speed: number;
  filter: string;
  blur: number;
  volume: number;
  muted: boolean;
  textOverlays: TextOverlay[];
  stickers: StickerOverlay[];
  musicTrack?: { name: string; url: string };
  musicVolume: number;
  captions: CaptionCue[];
  aspect: '9:16' | '1:1' | '16:9';
  pexelsUser?: string;
}

export interface CaptionCue {
  id: string;
  text: string;
  start: number;
  end: number;
}

export interface PhotoProjectData {
  sourceUrl: string;
  sourceKind: 'gallery' | 'pexels';
  filter: string;
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  blur: number;
  vignette: number;
  rotate: number;
  textOverlays: TextOverlay[];
  stickers: StickerOverlay[];
  pexelsUser?: string;
}

export interface ReelScript {
  hook: string;
  point1: string;
  point2: string;
  point3: string;
  cta: string;
}

export interface ReelProjectData {
  topic: string;
  language: 'urdu' | 'roman-urdu';
  script: ReelScript;
  voiceText: string;
  voiceURI?: string;
  rate: number;
  pitch: number;
  video?: PexelsVideo;
  musicTrack?: { name: string; url: string };
  musicVolume: number;
  textOverlays: TextOverlay[];
  pexelsUser?: string;
}

export const uid = (): string =>
  (crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);
