import { useId, useState } from 'react'
import { ChevronDownIcon } from './icons.jsx'

function CollapsibleSection({ title, subtitle, defaultOpen = true, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const regionId = useId()
  const buttonId = `${regionId}-button`

  return (
    <section className="overflow-hidden rounded-[14px] border border-white/[.06] bg-night-900">
      <button
        id={buttonId}
        type="button"
        className="press flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-[15px] text-left"
        aria-expanded={isOpen}
        aria-controls={regionId}
        onClick={() => setIsOpen(open => !open)}
      >
        <span className="min-w-0">
          <span className="block font-display text-xs uppercase tracking-[.18em] text-white">
            {title}
          </span>
          {subtitle && (
            <span className="mt-1 block truncate text-xs text-ink-400">
              {subtitle}
            </span>
          )}
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-ink-500 transition-transform duration-150 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>

      <div
        id={regionId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
        className="border-t border-white/[.06] px-4 pb-4 pt-4"
      >
        {children}
      </div>
    </section>
  )
}

export default CollapsibleSection
