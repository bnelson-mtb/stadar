import { View } from 'react-native'
import useAccountLink from '@stadar/shared/hooks/useAccountLink.js'
import { importPromptBody } from '@stadar/shared/copy/importPromptCopy.js'
import Button from './Button.jsx'
import Dialog from './Dialog.jsx'
import Txt from './Txt.jsx'

// One-time first-sign-in choice: bring this phone's teams and saved games
// into the account, or start from what the account already has.
export default function ImportPrompt() {
  const { counts, chooseImport, chooseStartFresh } = useAccountLink()
  if (!counts) return null

  return (
    <Dialog open onClose={() => {}} className="p-6">
      <Txt accessibilityRole="header" className="font-display text-[22px] uppercase leading-[26px] text-white">
        Welcome back
      </Txt>
      <Txt className="mt-2 text-sm leading-[21px] text-ink-200">{importPromptBody(counts)}</Txt>
      <View className="mt-6 flex-row gap-3">
        <Button label="Import" onPress={chooseImport} className="h-11 flex-1" boxClassName="rounded-xl" />
        <Button variant="ghost" label="Start fresh" onPress={chooseStartFresh} className="h-11 flex-1" boxClassName="rounded-xl" />
      </View>
    </Dialog>
  )
}
