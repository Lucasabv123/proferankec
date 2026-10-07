// thin up-right arrow drawn as SVG; the "↗" character turns into a grey emoji box on iPhones
const ArrowIcon = ({ className = "" }: { className?: string }) => (
  <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 12 12 4M5.5 4H12v6.5" />
  </svg>
);

export default ArrowIcon;
