import { useId } from 'react'
import { sanitizeScoreInput } from '../utils/eventDetailState.js'
import TeamLogo from './TeamLogo.jsx'

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
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 sm:gap-3">
            <div className="flex min-w-0 flex-col items-center gap-1.5 sm:flex-row sm:gap-2">
              <TeamLogo name={homeTeamName} />
              <span className="min-w-0 break-words text-center text-[10px] font-semibold leading-tight text-slate-300 sm:text-left sm:text-sm">
                {homeTeamName || 'Home team'}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <label htmlFor={homeScoreId} className="sr-only">
                {homeTeamName || 'Home team'} score
              </label>
              <input
                id={homeScoreId}
                aria-label={`${homeTeamName || 'Home team'} score`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={homeScore}
                onChange={event => updateScore('home', event.target.value)}
                className="h-11 w-10 rounded-lg border border-white/10 bg-night-900 px-1 text-center text-xl font-bold text-white outline-none transition-colors focus:border-radar-400 sm:h-12 sm:w-16 sm:text-2xl md:w-20"
              />
              <span aria-hidden="true" className="text-lg font-bold text-slate-500">&ndash;</span>

              <label htmlFor={awayScoreId} className="sr-only">
                {awayTeamName || 'Away team'} score
              </label>
              <input
                id={awayScoreId}
                aria-label={`${awayTeamName || 'Away team'} score`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={awayScore}
                onChange={event => updateScore('away', event.target.value)}
                className="h-11 w-10 rounded-lg border border-white/10 bg-night-900 px-1 text-center text-xl font-bold text-white outline-none transition-colors focus:border-radar-400 sm:h-12 sm:w-16 sm:text-2xl md:w-20"
              />
            </div>

            <div className="flex min-w-0 flex-col-reverse items-center gap-1.5 text-right sm:flex-row sm:justify-end sm:gap-2">
              <span className="min-w-0 break-words text-center text-[10px] font-semibold leading-tight text-slate-300 sm:text-right sm:text-sm">
                {awayTeamName || 'Away team'}
              </span>
              <TeamLogo name={awayTeamName} />
            </div>
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
