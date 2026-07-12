import type { PexelsPhoto, PexelsVideo } from './types';

const KEY = import.meta.env.VITE_PEXELS_API_KEY || '';
const BASE = 'https://api.pexels.com';

export function isPexelsConfigured(): boolean {
  return !!KEY && KEY !== 'YOUR_PEXELS_API_KEY_HERE';
}

export function pexelsKeyMissingMessage(): string {
  return 'Add your Pexels API key to .env as VITE_PEXELS_API_KEY (get a free key at pexels.com/api).';
}

interface PexelsVideoResponse {
  videos: Array<{
    id: number;
    width: number;
    height: number;
    duration: number;
    image: string;
    user: { name: string; url: string };
    video_files: Array<{
      link: string;
      quality: string;
      width: number;
      height: number;
      file_type: string;
    }>;
  }>;
}
interface PexelsPhotoResponse {
  photos: Array<{
    id: number;
    width: number;
    height: number;
    alt: string;
    src: { large: string; medium: string; small: string; portrait: string; landscape: string };
    photographer: string;
    photographer_url: string;
  }>;
}

async function pexels<T>(path: string): Promise<T> {
  if (!isPexelsConfigured()) {
    throw new Error(pexelsKeyMissingMessage());
  }
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: KEY },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Pexels API key is invalid.');
    throw new Error(`Pexels request failed (${res.status}).`);
  }
  return (await res.json()) as T;
}

function pickBestVideo(files: PexelsVideoResponse['videos'][number]['video_files']): string {
  // Prefer hd/sd mp4 landscape then any mp4
  const order = ['hd', 'sd', 'hls'];
  for (const q of order) {
    const f = files.find((f) => f.file_type === 'video/mp4' && f.quality === q);
    if (f) return f.link;
  }
  const mp4 = files.find((f) => f.file_type === 'video/mp4');
  return mp4?.link ?? files[0]?.link ?? '';
}

export async function searchVideos(query: string, perPage = 15): Promise<PexelsVideo[]> {
  const q = encodeURIComponent(query.trim() || 'nature');
  const data = await pexels<PexelsVideoResponse>(`/videos/search?query=${q}&per_page=${perPage}`);
  return data.videos.map((v) => ({
    id: v.id,
    image: v.image,
    width: v.width,
    height: v.height,
    duration: v.duration,
    videoUrl: pickBestVideo(v.video_files),
    user: v.user.name,
    userUrl: v.user.url,
  }));
}

export async function searchPhotos(query: string, perPage = 24): Promise<PexelsPhoto[]> {
  const q = encodeURIComponent(query.trim() || 'nature');
  const data = await pexels<PexelsPhotoResponse>(`/v1/search?query=${q}&per_page=${perPage}`);
  return data.photos.map((p) => ({
    id: p.id,
    src: p.src,
    alt: p.alt,
    photographer: p.photographer,
    photographerUrl: p.photographer_url,
  }));
}

export async function curatedPhotos(perPage = 24): Promise<PexelsPhoto[]> {
  const data = await pexels<PexelsPhotoResponse>(`/v1/curated?per_page=${perPage}`);
  return data.photos.map((p) => ({
    id: p.id,
    src: p.src,
    alt: p.alt,
    photographer: p.photographer,
    photographerUrl: p.photographer_url,
  }));
}
