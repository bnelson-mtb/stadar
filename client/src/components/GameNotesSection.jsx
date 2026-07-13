import { useId } from 'react'
import { sanitizeScoreInput } from '../utils/eventDetailState.js'

function GameNotesSection({
  record,
  homeTeamName,
  awayTeamName,
  showScore,
  persistenceStatus,
  onUpdate,
}) {
  const homeScoreId = useId()
  const awayScoreId = useId()
  const notesId = useId()
  const homeScore = record?.score?.home ?? ''
  const awayScore = record?.score?.away ?? ''
  const notes = record?.notes ?? ''
  const statusCopy = {
    saving: 'Saving locally…',
    saved: 'Autosaved locally',
    error: 'Could not save locally. Your latest changes may be lost if you leave this page.',
  }[persistenceStatus] ?? 'Saving locally…'

  function updateScore(side, value) {
    const sanitizedValue = sanitizeScoreInput(value)
    if (sanitizedValue === null) return

    onUpdate({
      score: {
        home: side === 'home' ? sanitizedValue : homeScore,
        away: side === 'away' ? sanitizedValue : awayScore,
      },
    })
  }

  return (
    <div className="space-y-5">
      {showScore && (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-slate-300">Final score</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label htmlFor={homeScoreId} className="block text-sm text-slate-400">
              <span className="mb-1.5 block">{homeTeamName || 'Home team'}</span>
              <input
                id={homeScoreId}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={homeScore}
                onChange={event => updateScore('home', event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-night-900 px-3 py-2 text-white outline-none transition-colors focus:border-radar-400"
              />
            </label>

            <label htmlFor={awayScoreId} className="block text-sm text-slate-400">
              <span className="mb-1.5 block">{awayTeamName || 'Away team'}</span>
              <input
                id={awayScoreId}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={awayScore}
                onChange={event => updateScore('away', event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-night-900 px-3 py-2 text-white outline-none transition-colors focus:border-radar-400"
              />
            </label>
          </div>
        </fieldset>
      )}

      <label htmlFor={notesId} className="block text-sm font-semibold text-slate-300">
        <span className="mb-2 block">Notes</span>
        <textarea
          id={notesId}
          value={notes}
          onChange={event => onUpdate({ notes: event.target.value })}
          rows={5}
          placeholder="Add memories, highlights, or anything you want to remember..."
          className="w-full resize-y rounded-lg border border-white/10 bg-night-900 px-3 py-2 font-normal text-white outline-none transition-colors placeholder:text-slate-600 focus:border-radar-400"
        />
      </label>

      <p
        aria-live="polite"
        className={`text-xs ${persistenceStatus === 'error' ? 'text-rose-400' : 'text-slate-500'}`}
      >
        {statusCopy}
      </p>
    </div>
  )
}

export default GameNotesSection
