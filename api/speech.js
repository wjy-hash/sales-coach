// Speech-to-text — Vercel (Linux) doesn't have Windows STT
// Returns empty text gracefully; voice input will prompt user to type
export default async function handler(req, res) {
  res.json({ text: '' })
}
