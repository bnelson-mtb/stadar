import Svg, { Path } from 'react-native-svg'
import { colors } from '../theme.js'

// The web app's Heroicons-style outline icons, drawn with react-native-svg.
// Pass size and color (a hex, default ink-200); `filled` fills the shape.
function Icon({ paths, size = 20, color = colors.ink[200], strokeWidth = 1.8, filled = false, viewBox = '0 0 24 24', style }) {
  return (
    <Svg width={size} height={size} viewBox={viewBox} fill={filled ? color : 'none'} stroke={color} strokeWidth={strokeWidth} style={style}>
      {paths.map(d => (
        <Path key={d} d={d} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </Svg>
  )
}

const BOOKMARK = 'M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z'
const HEART = 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z'

export const SearchIcon = p => <Icon {...p} paths={['m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z']} />
export const BookmarkIcon = p => <Icon {...p} paths={[BOOKMARK]} />
export const HeartIcon = p => <Icon {...p} paths={[HEART]} />
export const UserGroupIcon = p => (
  <Icon {...p} paths={['M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z']} />
)
export const UserCircleIcon = p => (
  <Icon {...p} paths={['M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z']} />
)
export const ChevronRightIcon = p => <Icon strokeWidth={2} {...p} paths={['m8.25 4.5 7.5 7.5-7.5 7.5']} />
export const ChevronLeftIcon = p => <Icon strokeWidth={2} {...p} paths={['M15.75 19.5 8.25 12l7.5-7.5']} />
export const ChevronDownIcon = p => <Icon strokeWidth={1.9} viewBox="0 0 20 20" {...p} paths={['m5 7.5 5 5 5-5']} />
export const ShareIcon = p => (
  <Icon {...p} paths={['M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15']} />
)
export const CalendarIcon = p => (
  <Icon strokeWidth={1.7} {...p} paths={['M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5']} />
)
export const MapPinIcon = p => (
  <Icon {...p} paths={['M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z', 'M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z']} />
)
export const PaperPlaneIcon = p => (
  <Icon strokeWidth={1.9} {...p} paths={['M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5']} />
)
export const PencilIcon = p => (
  <Icon {...p} paths={['M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z']} />
)
export const ArrowRightIcon = p => <Icon strokeWidth={2.2} {...p} paths={['M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3']} />
export const ExternalLinkIcon = p => (
  <Icon strokeWidth={2} {...p} paths={['M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25']} />
)
export const FilterIcon = p => <Icon {...p} paths={['M12 3v18m0 0-4-4m4 4 4-4M6 8h12']} />
export const XMarkIcon = p => <Icon strokeWidth={2} {...p} paths={['M6 18 18 6M6 6l12 12']} />
export const CheckIcon = p => <Icon strokeWidth={2.2} {...p} paths={['m4.5 12.75 6 6 9-13.5']} />
export const PlusIcon = p => <Icon strokeWidth={2} {...p} paths={['M12 4.5v15m7.5-7.5h-15']} />
