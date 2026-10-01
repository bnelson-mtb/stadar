import { getCanonicalTeamName } from '../data/teams'
import { formatLongDate } from '../utils/eventDisplay.js'
import BottomSheet from './BottomSheet.jsx'
import GameNotesSection from './GameNotesSection.jsx'

// The detail page's notes editor (final score + notes) in a sheet, so a
// played game can be logged straight from the Saved and team pages.
function NotesSheet({ record, onClose, onUpdate, persistenceStatus }) {
  const event = record?.event
  const homeTeamName = getCanonicalTeamName(event?.homeTeam)
  const awayTeamName = getCanonicalTeamName(event?.awayTeam)
  const matchup = awayTeamName ? `${homeTeamName} vs ${awayTeamName}` : homeTeamName || event?.name
  const subtitle = [matchup, formatLongDate(event?.localDate)].filter(Boolean).join(' · ')

  return (
    <BottomSheet
      open={Boolean(record)}
      onClose={onClose}
      title="Game notes"
      subtitle={subtitle}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="h-12 w-full cursor-pointer rounded-[14px] bg-radar-400 text-sm font-bold text-night-950 transition-colors duration-150 hover:bg-radar-300 active:bg-radar-500"
        >
          Done
        </button>
      }
    >
      {record && (
        <GameNotesSection
          record={record}
          homeTeamName={homeTeamName}
          awayTeamName={awayTeamName}
          showScore={Boolean(awayTeamName)}
          persistenceStatus={persistenceStatus}
          onUpdate={patch => onUpdate(event.id, patch)}
        />
      )}
    </BottomSheet>
  )
}

export default NotesSheet
