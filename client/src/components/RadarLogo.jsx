function RadarLogo({ className = 'w-8 h-8' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
      <circle cx="12" cy="12" r="10" className="stroke-radar-400/30" strokeWidth="1" />
      <circle cx="12" cy="12" r="6" className="stroke-radar-400/20" strokeWidth="1" />
      <line x1="12" y1="2" x2="12" y2="22" className="stroke-radar-400/10" strokeWidth="1" />
      <line x1="2" y1="12" x2="22" y2="12" className="stroke-radar-400/10" strokeWidth="1" />
      <g className="radar-sweep">
        <path d="M12 12 L12 2 A10 10 0 0 1 19.07 4.93 Z" className="fill-radar-400/25" />
        <line
          x1="12"
          y1="12"
          x2="19.07"
          y2="4.93"
          className="stroke-radar-400"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>
      <circle cx="12" cy="12" r="1.4" className="fill-radar-400" />
      <circle cx="16.2" cy="7.8" r="1.2" className="fill-radar-300 radar-blip" />
    </svg>
  )
}

export default RadarLogo
