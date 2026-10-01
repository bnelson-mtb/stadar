import { useEffect, useId, useRef } from 'react'
import {
  getFocusRestoreTarget,
  getFocusTrapTarget,
  isPastEvent,
} from '../utils/eventDetailState.js'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function UnsaveConfirmDialog({ event, focusFallbackRef, onCancel, onConfirm }) {
  const dialogRef = useRef(null)
  const cancelButtonRef = useRef(null)
  const onCancelRef = useRef(onCancel)
  const titleId = useId()
  const descriptionId = useId()
  const isOpen = Boolean(event)

  useEffect(() => {
    onCancelRef.current = onCancel
  }, [onCancel])

  useEffect(() => {
    if (!isOpen) return undefined

    const previouslyActiveElement = document.activeElement
    const fallbackElement = focusFallbackRef?.current

    function handleKeyDown(keyEvent) {
      if (keyEvent.key === 'Escape') {
        onCancelRef.current()
        return
      }

      if (keyEvent.key === 'Tab') {
        const focusableElements = Array.from(
          dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) ?? []
        ).filter(element => !element.closest('[hidden]') && element.getAttribute('aria-hidden') !== 'true')
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
    cancelButtonRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      getFocusRestoreTarget(
        previouslyActiveElement,
        fallbackElement
      )?.focus()
    }
  }, [focusFallbackRef, isOpen])

  if (!event) return null

  const isPast = isPastEvent(event)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={clickEvent => {
        if (clickEvent.target === clickEvent.currentTarget) onCancel()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-md rounded-[18px] border border-white/[.08] bg-night-900 p-6 shadow-2xl"
      >
        <h2 id={titleId} className="font-display text-[22px] uppercase leading-none text-white">
          Unsave this event?
        </h2>
        <p id={descriptionId} className="mt-3 text-sm leading-relaxed text-ink-400">
          {isPast
            ? 'Your notes and the final score will be permanently deleted. This cannot be undone.'
            : 'Are you sure you want to unsave this event?'}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-xl border border-white/10 bg-white/[.06] px-4 py-2.5 text-sm font-semibold text-ink-100 transition-colors duration-150 hover:bg-white/10 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="cursor-pointer rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-500"
          >
            Unsave
          </button>
        </div>
      </div>
    </div>
  )
}

export default UnsaveConfirmDialog
