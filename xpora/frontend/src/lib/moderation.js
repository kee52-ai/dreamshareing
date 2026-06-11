// Auto-approve all posts — admin can remove bad ones later
// This gives better user experience — no waiting!

const SPAM_PATTERNS = [
  /\b(buy now|click here|free money|make money fast|casino|viagra|crypto pump)\b/i,
  /(.)\1{8,}/,
]

const HARMFUL_PATTERNS = [
  /\b(suicide method|how to make bomb|drug recipe)\b/i,
]

export function moderateContent(title, body) {
  const text = `${title} ${body}`.toLowerCase()
  for (const p of HARMFUL_PATTERNS) {
    if (p.test(text)) return { status: 'rejected', reason: 'Content contains harmful information.' }
  }
  for (const p of SPAM_PATTERNS) {
    if (p.test(text)) return { status: 'review', reason: 'Possible spam — admin will review shortly.' }
  }
  // Auto approve everything else!
  return { status: 'approved', reason: 'Looks good!' }
}

export async function moderateWithAI(title, body) {
  return moderateContent(title, body)
}
