// Shared UI constants: emoji stickers, free music tracks, font choices.

export const STICKER_EMOJIS: string[] = [
  '😀','😂','😍','🥰','😎','🤩','😇','🤔','😢','😭',
  '🔥','💯','✨','🎉','👍','👏','🙌','💪','🙏','❤️',
  '🧡','💛','💚','💙','💜','🖤','🤍','💖','👑','⭐',
  '🌟','💥','💫','🎊','🎈','🎁','🏆','🥇','🎯','📌',
  '💎','🌈','☀️','🌙','⚡','🎶','🎵','🎤','📸','🎥',
];

export const GIF_STICKERS: { label: string; emoji: string }[] = [
  { label: 'Like', emoji: '👍' },
  { label: 'Fire', emoji: '🔥' },
  { label: 'Heart', emoji: '❤️' },
  { label: 'Crown', emoji: '👑' },
  { label: 'Star', emoji: '⭐' },
  { label: 'Party', emoji: '🎉' },
];

// Royalty-free music tracks (Pixabay / public-domain direct mp3 URLs).
// These are lightweight demo tracks; users can also upload their own MP3.
export const FREE_MUSIC: { name: string; url: string }[] = [
  {
    name: 'Lofi Chill',
    url: 'https://cdn.pixabay.com/audio/2022/10/25/audio_946bc6b1e0.mp3',
  },
  {
    name: 'Upbeat Pop',
    url: 'https://cdn.pixabay.com/audio/2023/06/19/audio_18c2c7b6c0.mp3',
  },
  {
    name: 'Cinematic',
    url: 'https://cdn.pixabay.com/audio/2022/08/02/audio_2dde668d05.mp3',
  },
  {
    name: 'Soft Piano',
    url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_1a1b8e9b6c.mp3',
  },
  {
    name: 'Energetic Beat',
    url: 'https://cdn.pixabay.com/audio/2024/02/05/audio_9b7c3a2f12.mp3',
  },
];

export const FONT_FAMILIES: { label: string; value: string; urdu?: boolean }[] = [
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'System', value: 'system-ui, sans-serif' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Nastaliq (Urdu)', value: '"Noto Nastaliq Urdu", serif', urdu: true },
  { label: 'Naskh (Urdu)', value: '"Noto Naskh Arabic", serif', urdu: true },
];

export const ASPECT_PRESETS: { key: '9:16' | '1:1' | '16:9'; label: string; w: number; h: number }[] = [
  { key: '9:16', label: '9:16 Reel', w: 1080, h: 1920 },
  { key: '1:1', label: '1:1 Square', w: 1080, h: 1080 },
  { key: '16:9', label: '16:9 Wide', w: 1920, h: 1080 },
];

export const COLOR_SWATCHES: string[] = [
  '#ffffff', '#000000', '#FFD700', '#FF4D4D', '#FF8A00',
  '#FFE600', '#22C55E', '#00D4FF', '#3B82F6', '#7A52F5',
  '#FF4D9D', '#A855F7', '#10B981', '#F59E0B', '#EF4444',
];
