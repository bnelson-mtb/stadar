import useAccountLink from '../hooks/useAccountLink.js'
import { importPromptBody } from './importPromptCopy.js'

// One-time first-login reconciliation prompt. Renders only while the provider
// is holding a decision (counts present, mode === 'wait'). The overlay gates
// the UI so no favorites/saved mutations race the choice.
export default function ImportPrompt() {
  const { counts, chooseImport, chooseStartFresh } = useAccountLink()
  if (!counts) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-night-900 p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-white">Welcome back</h2>
        <p className="mt-2 text-sm text-slate-300">{importPromptBody(counts)}</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={chooseImport}
            className="flex-1 rounded-lg bg-radar-400 px-4 py-2 text-sm font-semibold text-night-950 transition hover:bg-radar-300 focus:outline-none focus:ring-2 focus:ring-radar-400/60"
          >
            Import
          </button>
          <button
            type="button"
            onClick={chooseStartFresh}
            className="flex-1 rounded-lg border border-white/15 bg-night-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-radar-400/60"
          >
            Start fresh
          </button>
        </div>
      </div>
    </div>
  )
}
