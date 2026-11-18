// Account-card notices specific to the app's sign-in handoff.
export function signInErrorMessage(error) {
  if (error === 'unavailable') return 'Sign-in from the app isn’t available yet. Your teams and saved games stay on this phone.'
  if (error === 'failed') return 'Sign-in didn’t finish. Please try again.'
  return null
}
