// Rule-based moderation (works without any API key)
// Upgrade to Claude/OpenAI later by replacing moderateContent()

const SPAM_PATTERNS = [
  /\b(buy now|click here|free money|make money fast|work from home|earn \$|casino|viagra|crypto|nft|investment opportunity)\b/i,
  /(.)\1{6,}/,
  /(https?:\/\/[^\s]+){3,}/i,
]

const ABUSE_PATTERNS = [
  /\b(hate|kill|die|idiot|stupid|loser|trash|garbage)\b/i,
]

const HARMFUL_PATTERNS = [
  /\b(suicide method|how to make bomb|drug recipe|illegal weapon)\b/i,
]

export function moderateContent(title, body) {
  const text = `${title} ${body}`.toLowerCase()

  for (const p of HARMFUL_PATTERNS) {
    if (p.test(text)) return { status: 'rejected', reason: 'Content contains harmful information.' }
  }
  for (const p of SPAM_PATTERNS) {
    if (p.test(text)) return { status: 'review', reason: 'Possible spam detected — pending admin review.' }
  }
  for (const p of ABUSE_PATTERNS) {
    if (p.test(text)) return { status: 'review', reason: 'Possible abusive language — pending admin review.' }
  }
  if (body.trim().length < 50) {
    return { status: 'review', reason: 'Content too short — pending admin review.' }
  }

  return { status: 'approved', reason: 'Content passed automated checks.' }
}

// Optional: Claude API moderation (add your API key to .env)
export async function moderateWithAI(title, body) {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY
  if (!apiKey) return moderateContent(title, body)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `You are a content moderator for a dream/story sharing platform. Review this post.
Rules: No spam, no harassment, no hate speech, no adult content, no scams, no illegal activities.
Title: ${title}
Body: ${body.slice(0, 500)}
Return ONLY JSON: {"status":"approved/rejected/review","reason":"short reason"}`
        }]
      })
    })
    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return moderateContent(title, body)
  }
}
