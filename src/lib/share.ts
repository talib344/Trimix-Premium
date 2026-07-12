import { dataUrlToBlob } from './export';

export interface ShareTarget {
  key: string;
  label: string;
  url: (payload: { text: string; mediaUrl?: string }) => string;
}

// Native share intent links for the major platforms.
export const SHARE_TARGETS: ShareTarget[] = [
  {
    key: 'tiktok',
    label: 'TikTok',
    url: ({ text }) => `https://www.tiktok.com/upload?text=${encodeURIComponent(text)}`,
  },
  {
    key: 'youtube',
    label: 'YouTube',
    url: ({ text }) => `https://studio.youtube.com/channel/UC/videos/upload`,
  },
  {
    key: 'instagram',
    label: 'Instagram',
    url: ({ text }) => `https://www.instagram.com/`,
  },
  {
    key: 'more',
    label: 'More…',
    url: () => '',
  },
];

/** Try the Web Share API (with a file if possible), otherwise open intent URLs. */
export async function shareMedia({
  title,
  text,
  dataUrl,
  filename,
}: {
  title: string;
  text: string;
  dataUrl?: string;
  filename?: string;
}): Promise<'shared' | 'intent' | 'unsupported'> {
  // Try file share first
  if (dataUrl && navigator.canShare) {
    try {
      const file = new File([await dataUrlToBlob(dataUrl)], filename || 'trimix-export.jpg', {
        type: 'image/jpeg',
      });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ title, text, files: [file] });
        return 'shared';
      }
    } catch {
      /* user cancelled or unsupported; fall back */
    }
  }
  // Try basic share
  if (navigator.share) {
    try {
      await navigator.share({ title, text });
      return 'shared';
    } catch {
      return 'intent';
    }
  }
  // Clipboard fallback
  try {
    await navigator.clipboard.writeText(`${title}\n\n${text}`);
    return 'intent';
  } catch {
    return 'unsupported';
  }
}
