import { useLocalSearchParams } from 'expo-router'
import TeamScreen from '../../screens/TeamScreen.jsx'

export default function TeamRoute() {
  const { name } = useLocalSearchParams()
  const teamName = Array.isArray(name) ? name[0] : name
  return <TeamScreen key={teamName} teamName={teamName} />
}
