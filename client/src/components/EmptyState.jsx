// Anton eyebrow over a muted line of copy, with an optional action below.
function EmptyState({ title, body, children, className = '' }) {
  return (
    <div className={`rounded-[14px] border border-white/5 bg-night-900 px-5 py-8 text-center ${className}`}>
      <p className="font-display text-xs uppercase tracking-[.2em] text-ink-400">{title}</p>
      {body && <p className="mx-auto mt-2 max-w-[34ch] text-sm leading-relaxed text-ink-400">{body}</p>}
      {children && <div className="mt-4 flex justify-center">{children}</div>}
    </div>
  )
}

export default EmptyState
