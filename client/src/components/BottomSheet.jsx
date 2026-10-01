import { useEffect, useId, useRef } from 'react'
import {
  getFocusRestoreTarget,
  getFocusTrapTarget,
} from '../utils/eventDetailState.js'
import { XMarkIcon } from './icons.jsx'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

// Modal sheet that slides up from the bottom. Same keyboard contract as the
// app's dialogs: Escape closes, Tab is trapped, focus returns to the opener.
// Scrolling the page behind it is locked while it's open.
function BottomSheet({ open, title, subtitle, onClose, footer, children }) {
  const sheetRef = useRef(null)
  const onCloseRef = useRef(onClose)
  const titleId = useId()

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined

    const previouslyActiveElement = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(keyEvent) {
      if (keyEvent.key === 'Escape') {
        onCloseRef.current()
        return
      }

      if (keyEvent.key === 'Tab') {
        const focusableElements = Array.from(
          sheetRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) ?? []
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
    sheetRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      getFocusRestoreTarget(previouslyActiveElement, null)?.focus()
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="backdrop-in absolute inset-0 bg-black/50" aria-hidden="true" onClick={onClose} />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="sheet-up relative flex max-h-[85vh] w-full max-w-xl flex-col rounded-t-[22px] border-t border-white/[.08] bg-night-900 outline-none"
      >
        <div className="flex justify-center pt-2.5" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-white/15" />
        </div>

        <div className="flex items-start justify-between gap-4 px-[18px] pb-3 pt-3">
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-[22px] uppercase leading-none text-white">
              {title}
            </h2>
            {subtitle && <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-400">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 flex-none cursor-pointer items-center justify-center rounded-[11px] border border-white/10 bg-white/[.06] text-ink-200 transition-colors duration-150 hover:text-white"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-[18px] pb-5">{children}</div>

        {footer && (
          <div className="border-t border-white/[.06] px-[18px] pb-[18px] pt-3.5">{footer}</div>
        )}
      </div>
    </div>
  )
}

export default BottomSheet
