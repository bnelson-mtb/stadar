import { useContext } from 'react'
import { AccountLinkContext } from '../context/AccountLinkContextDef.js'

export default function useAccountLink() {
  const ctx = useContext(AccountLinkContext)
  if (ctx === null) throw new Error('useAccountLink must be used within AccountLinkProvider')
  return ctx
}
