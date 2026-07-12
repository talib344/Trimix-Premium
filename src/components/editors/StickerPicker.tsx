import { STICKER_EMOJIS } from '../../lib/constants';

export function StickerPicker({
  onPick,
  onClose,
}: {
  onPick: (emoji: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center sm:items-center p-0 sm:p-4">
      <div className="glass rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Stickers & Emojis</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            ✕
          </button>
        </div>
        <div className="grid grid-cols-8 gap-1.5 max-h-[50vh] overflow-y-auto no-scrollbar">
          {STICKER_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => {
                onPick(e);
                onClose();
              }}
              className="aspect-square text-2xl rounded-lg hover:bg-white/10 active:scale-90 transition flex items-center justify-center"
            >
              {e}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
