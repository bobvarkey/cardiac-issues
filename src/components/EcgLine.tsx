export function EcgLine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 80" className={className} preserveAspectRatio="none" aria-hidden="true">
      <path
        className="ecg-line"
        d="M0,40 L80,40 L100,40 L110,35 L120,45 L130,40 L160,40 L170,10 L180,70 L190,20 L200,40 L260,40 L275,30 L295,55 L310,40 L380,40 L395,15 L410,65 L420,40 L500,40 L515,35 L525,45 L535,40 L600,40"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
