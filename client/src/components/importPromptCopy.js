function phrase(count, singular) {
  return `${count} ${singular}${count === 1 ? '' : 's'}`
}

// Builds the prompt body from the local data counts. A zero-count collection is
// omitted; the provider never opens the prompt when both are zero.
export function importPromptBody({ favorites, savedEvents }) {
  const parts = []
  if (favorites > 0) parts.push(phrase(favorites, 'saved team'))
  if (savedEvents > 0) parts.push(phrase(savedEvents, 'saved event'))
  return `Import your ${parts.join(' and ')} into your account?`
}
