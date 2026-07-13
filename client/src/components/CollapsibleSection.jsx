import { useId, useState } from 'react'

function CollapsibleSection({ title, subtitle, children }) {
  const [isOpen, setIsOpen] = useState(true)
  const regionId = useId()
  const buttonId = `${regionId}-button`

  return (
    <section className="mb-4 overflow-hidden rounded-xl border border-white/5 bg-night-800">
      <button
        id={buttonId}
        type="button"
        className="flex w-full cursor-pointer items-center justify-between gap-4 p-6 text-left transition-colors hover:bg-white/[0.03]"
        aria-expanded={isOpen}
        aria-controls={regionId}
        onClick={() => setIsOpen(open => !open)}
      >
        <span className="min-w-0">
          <span className="block font-display font-semibold uppercase tracking-[0.15em] text-white">
            {title}
          </span>
          {subtitle && (
            <span className="mt-1 block text-sm font-normal normal-case tracking-normal text-slate-400">
              {subtitle}
            </span>
          )}
        </span>
        <svg
          aria-hidden="true"
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m5 7.5 5 5 5-5" />
        </svg>
      </button>

      <div
        id={regionId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
        className="border-t border-white/10 px-6 pb-6 pt-5"
      >
        {children}
      </div>
    </section>
  )
}

export default CollapsibleSection
