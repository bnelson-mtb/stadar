import { useEffect, useId, useRef } from 'react'
import {
  getFocusRestoreTarget,
  getFocusTrapTarget,
} from '../utils/eventDetailState.js'
import {
  DATA_USAGE_SECTIONS,
  DATA_USAGE_TITLE,
  GITHUB_URL,
} from './profileCopy.js'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

// Plain-language summary of what the project stores. Mirrors
// UnsaveConfirmDialog's focus/escape/restore behavior so both dialogs in the
// app behave identically for keyboard and screen-reader users.
function DataUsageDialog({ open, focusFallbackRef, onClose }) {
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined

    const previouslyActiveElement = document.activeElement
    const fallbackElement = focusFallbackRef?.current

    function handleKeyDown(keyEvent) {
      if (keyEvent.key === 'Escape') {
        onCloseRef.current()
        return
      }

      if (keyEvent.key === 'Tab') {
        const focusableElements = Array.from(
          dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) ?? []
        ).filter(
          element =>
            !element.closest('[hidden]') &&
            element.getAttribute('aria-hidden') !== 'true'
        )
        const focusTarget = getFocusTrapTarget(
          focusableElements,
          document.activeElement,
          keyEvent.shiftKey
        )

        if (focusTarget) {
          keyEvent.preventDefault()
          focusTarget.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      getFocusRestoreTarget(previouslyActiveElement, fallbackElement)?.focus()
    }
  }, [focusFallbackRef, open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={clickEvent => {
        if (clickEvent.target === clickEvent.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-xl border border-white/10 bg-night-800 shadow-2xl"
      >
        <div className="border-b border-white/10 px-6 pt-6 pb-4">
          <h2 id={titleId} className="font-display text-xl font-bold text-white">
            {DATA_USAGE_TITLE}
          </h2>
        </div>

        <div id={descriptionId} className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {DATA_USAGE_SECTIONS.map(section => (
            <section key={section.heading}>
              <h3 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-radar-400">
                {section.heading}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {section.body}
              </p>
            </section>
          ))}

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-night-700 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-white/25 hover:bg-night-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-radar-400/60"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
            View the source on GitHub
          </a>
        </div>

        <div className="flex justify-end border-t border-white/10 px-6 py-4">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-white/10 bg-night-700 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-night-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-radar-400/60"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default DataUsageDialog
