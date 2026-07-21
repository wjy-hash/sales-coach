<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const emit = defineEmits<{
  (e: 'result', text: string): void
}>()

const isSupported = ref(false)
const isListening = ref(false)
const isProcessing = ref(false)
const statusText = ref('')
const duration = ref(0)

let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let stream: MediaStream | null = null
let timer: ReturnType<typeof setInterval> | null = null
let stopTimer: ReturnType<typeof setTimeout> | null = null

const MAX_SEC = 60

async function checkSupport() {
  try {
    isSupported.value = !!(navigator.mediaDevices?.getUserMedia)
  } catch {
    isSupported.value = false
  }
}

async function toggleVoice() {
  if (isListening.value) {
    stopRecording()
  } else {
    await startRecording()
  }
}

async function startRecording() {
  statusText.value = ''
  duration.value = 0
  audioChunks = []

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
    })

    const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm'

    mediaRecorder = new MediaRecorder(stream, { mimeType: mime })

    mediaRecorder.ondataavailable = (e) => {
      try { if (e.data.size > 0) audioChunks.push(e.data) } catch { /* ignore */ }
    }

    mediaRecorder.onstop = () => {
      safeCleanup()
      if (audioChunks.length === 0) {
        showStatus('未录制到音频')
        return
      }
      processAndSend()
    }

    mediaRecorder.onerror = () => {
      safeCleanup()
      showStatus('录音异常')
    }

    mediaRecorder.start(1000)
    isListening.value = true

    timer = setInterval(() => {
      duration.value++
      if (duration.value >= MAX_SEC) stopRecording()
    }, 1000)
    stopTimer = setTimeout(() => stopRecording(), MAX_SEC * 1000)
  } catch (err: any) {
    console.error('[voice] start:', err.message || err)
    if (err.name === 'NotAllowedError') {
      showStatus('请允许麦克风权限后刷新重试', 4000)
    } else {
      showStatus('麦克风不可用: ' + (err.message || ''), 3000)
    }
  }
}

function stopRecording() {
  isListening.value = false
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    try { mediaRecorder.stop() } catch { /* ignore */ }
  }
}

function safeCleanup() {
  if (timer) { clearInterval(timer); timer = null }
  if (stopTimer) { clearTimeout(stopTimer); stopTimer = null }
  if (stream) {
    try { stream.getTracks().forEach((t) => t.stop()) } catch { /* ignore */ }
    stream = null
  }
}

function showStatus(msg: string, ms = 2000) {
  statusText.value = msg
  setTimeout(() => { statusText.value = '' }, ms)
}

async function processAndSend() {
  isProcessing.value = true
  statusText.value = '正在识别...'

  try {
    const blob = new Blob(audioChunks, { type: 'audio/webm' })
    const base64 = await blobToBase64(blob)

    // Try browser-side decode → WAV first
    let audioData = base64
    let isWav = false
    try {
      audioData = await webmToWav(blob)
      isWav = true
      console.log('[voice] WebM→WAV converted locally, size:', audioData.length)
    } catch (e: any) {
      console.log('[voice] Local WAV conversion skipped:', e.message)
      // Send raw WebM, backend will handle
    }

    const res = await fetch('/api/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio: audioData, isWav }),
    })

    const data = await res.json()
    if (data.text?.trim()) {
      statusText.value = ''
      emit('result', data.text.trim())
    } else {
      showStatus(data.error || '未识别到语音，请重试', 2500)
    }
  } catch (err: any) {
    console.error('[voice] send:', err.message || err)
    showStatus('识别失败: ' + (err.message || '网络错误'), 3000)
  } finally {
    isProcessing.value = false
  }
}

async function webmToWav(blob: Blob): Promise<string> {
  const ab = await blob.arrayBuffer()
  if (ab.byteLength === 0) throw new Error('empty audio')

  const ctx = new AudioContext()
  try {
    const buffer = await ctx.decodeAudioData(ab)
    const samples = buffer.getChannelData(0)
    if (samples.length === 0) throw new Error('empty buffer')

    const wav = encodeWav(samples, buffer.sampleRate)
    let bin = ''
    const bytes = new Uint8Array(wav)
    // Process in chunks to avoid stack overflow with large recordings
    const CHUNK = 8192
    for (let i = 0; i < bytes.length; i += CHUNK) {
      const end = Math.min(i + CHUNK, bytes.length)
      for (let j = i; j < end; j++) bin += String.fromCharCode(bytes[j])
    }
    return btoa(bin)
  } finally {
    ctx.close()
  }
}

function encodeWav(samples: Float32Array, sr: number): ArrayBuffer {
  const len = samples.length * 2
  const buf = new ArrayBuffer(44 + len)
  const v = new DataView(buf)
  const ws = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)) }
  ws(0, 'RIFF'); v.setUint32(4, 36 + len, true)
  ws(8, 'WAVE'); ws(12, 'fmt ')
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true)
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true)
  ws(36, 'data'); v.setUint32(40, len, true)
  let o = 44
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
    o += 2
  }
  return buf
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onloadend = () => {
      try { resolve((r.result as string).split(',')[1]) }
      catch (e) { reject(e) }
    }
    r.onerror = () => reject(new Error('FileReader error'))
    r.readAsDataURL(blob)
  })
}

checkSupport()
onUnmounted(() => {
  safeCleanup()
})
</script>

<template>
  <div v-if="isSupported" class="voice-input">
    <button
      :class="['mic-btn', { recording: isListening, processing: isProcessing }]"
      :title="isListening ? `录音中 ${duration}s / ${MAX_SEC}s · 点击停止` : '语音输入'"
      @click="toggleVoice"
      :disabled="isProcessing"
      type="button"
    >
      <span class="mic-icon">{{ isProcessing ? '⏳' : isListening ? '⏹' : '🎤' }}</span>
    </button>
    <Transition name="fade">
      <span v-if="statusText" class="status-text">{{ statusText }}</span>
    </Transition>
  </div>
</template>

<style scoped>
.voice-input { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.mic-btn {
  width: 40px; height: 40px; border-radius: 50%;
  border: 2px solid #d9d9d9; background: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; padding: 0; font-size: 16px;
}
.mic-btn:hover:not(:disabled) { border-color: #1677ff; background: #f0f5ff; }
.mic-btn:disabled { cursor: not-allowed; opacity: 0.7; }
.mic-btn.recording { border-color: #ff4d4f; background: #fff1f0; animation: pulse 1.2s infinite; }
.mic-btn.processing { border-color: #fa8c16; background: #fff7e6; }
.mic-icon { line-height: 1; }
.status-text { font-size: 12px; color: #999; white-space: nowrap; max-width: 220px; overflow: hidden; text-overflow: ellipsis; }
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(255, 77, 79, 0); }
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
