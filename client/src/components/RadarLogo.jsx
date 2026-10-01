function RadarLogo({ className = 'w-8 h-8' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
      <circle cx="12" cy="12" r="10" className="stroke-radar-400/[.28]" strokeWidth="1" />
      <circle cx="12" cy="12" r="5.5" className="stroke-radar-400/[.18]" strokeWidth="1" />
      <g className="radar-sweep">
        <path d="M12 12 L12 2 A10 10 0 0 1 19.07 4.93 Z" className="fill-radar-400/[.22]" />
        <line
          x1="12"
          y1="12"
          x2="19.07"
          y2="4.93"
          className="stroke-radar-400"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </g>
      <circle cx="12" cy="12" r="1.3" className="fill-radar-400" />
      <circle cx="16.2" cy="7.8" r="1.1" className="fill-radar-300 radar-blip" />
    </svg>
  )
}

export default RadarLogo
