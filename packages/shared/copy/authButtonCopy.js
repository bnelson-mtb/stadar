export function getAuthButtonCopy(status) {
  if (status === 'authenticated') {
    return { label: 'Sign out', title: 'Sign out' }
  }

  return { label: 'Sign in with Google', title: 'Sign in with Google' }
}
