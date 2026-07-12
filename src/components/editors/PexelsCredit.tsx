export function PexelsCredit({ className }: { className?: string }) {
  return (
    <a
      href="https://www.pexels.com"
      target="_blank"
      rel="noreferrer noopener"
      className={
        'text-[10px] text-white/40 hover:text-white/70 transition ' + (className ?? '')
      }
    >
      Videos by Pexels
    </a>
  );
}
