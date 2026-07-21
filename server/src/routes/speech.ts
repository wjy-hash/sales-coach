import { Router, Request, Response } from 'express'
import { execFile } from 'node:child_process'
import { writeFileSync, unlinkSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

export const speechRouter = Router()

speechRouter.post('/', async (req: Request, res: Response) => {
  const { audio } = req.body

  if (!audio) {
    res.status(400).json({ error: 'audio is required' })
    return
  }

  const uuid = randomUUID()
  const rawPath = join(tmpdir(), `stt-${uuid}.raw`)

  try {
    const buffer = Buffer.from(audio, 'base64')

    // Check if it's already a WAV (starts with "RIFF")
    let wavPath: string
    if (buffer.slice(0, 4).toString() === 'RIFF') {
      wavPath = join(tmpdir(), `stt-${uuid}.wav`)
      writeFileSync(wavPath, buffer)
    } else {
      // It's WebM/Opus — need to convert. Try decodeAudioData via a helper.
      // For now, save and attempt direct STT; if it fails we return empty.
      wavPath = join(tmpdir(), `stt-${uuid}.wav`)
      writeFileSync(wavPath, buffer)
    }

    // Run PowerShell STT
    const sttScript = join(__dirname, 'stt.ps1')
    const text = await runPowerShellStt(sttScript, wavPath)

    res.json({ text: text || '' })
  } catch (err) {
    console.error('[speech] Error:', err)
    res.json({ text: '' })
  } finally {
    try { unlinkSync(rawPath) } catch { /* ignore */ }
  }
})

function runPowerShellStt(scriptPath: string, wavPath: string): Promise<string> {
  return new Promise((resolve) => {
    execFile(
      'powershell.exe',
      ['-ExecutionPolicy', 'Bypass', '-File', scriptPath, '-AudioPath', wavPath],
      { timeout: 60000 },
      (error, stdout, stderr) => {
        if (error) {
          console.error('[speech] PS error:', error.message)
        }
        if (stderr) {
          console.error('[speech] PS stderr:', stderr.slice(0, 200))
        }
        resolve((stdout || '').trim())
      }
    )
  })
}
