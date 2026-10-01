// Pill-track switcher used for Discover's date filter and Saved's tabs.
function SegmentedControl({ options, value, onChange, label, className = '' }) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`flex gap-1.5 rounded-xl border border-white/5 bg-night-900 p-1 ${className}`}
    >
      {options.map(option => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={`flex-1 cursor-pointer rounded-[9px] py-2 text-center text-xs transition-colors duration-150 ${
              isActive
                ? 'bg-radar-400 font-bold text-night-950'
                : 'font-medium text-ink-400 hover:text-ink-200'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export default SegmentedControl
