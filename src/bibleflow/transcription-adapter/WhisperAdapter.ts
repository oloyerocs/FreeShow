// Local Whisper adapter — audio never leaves the device.
// Requires whisper.cpp server running at http://localhost:8080 (or configured port).
import type { TranscriptionAdapter, TranscriptSegment } from "./TranscriptionAdapter"

export interface WhisperConfig {
    serverUrl?: string  // default: http://localhost:8080
    model?: string      // default: "base.en"
    language?: string   // default: "en"
}

export class WhisperAdapter implements TranscriptionAdapter {
    readonly name = "whisper" as const
    private config: Required<WhisperConfig>
    private mediaStream: MediaStream | null = null
    private mediaRecorder: MediaRecorder | null = null
    private running = false
    private onSegment: ((seg: TranscriptSegment) => void) | null = null

    constructor(config: WhisperConfig = {}) {
        this.config = {
            serverUrl: config.serverUrl ?? "http://localhost:8080",
            model: config.model ?? "base.en",
            language: config.language ?? "en",
        }
    }

    async start(deviceId: string, onSegment: (seg: TranscriptSegment) => void): Promise<void> {
        if (this.running) return
        this.onSegment = onSegment

        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: deviceId || undefined } })
        // chunk every 5s for near-realtime local inference
        this.mediaRecorder = new MediaRecorder(this.mediaStream, { mimeType: "audio/webm;codecs=opus" })
        this.mediaRecorder.addEventListener("dataavailable", (e) => {
            if (e.data.size > 0) this._transcribeChunk(e.data)
        })
        this.mediaRecorder.start(5000)
        this.running = true
    }

    async stop(): Promise<void> {
        this.running = false
        this.mediaRecorder?.stop()
        this.mediaStream?.getTracks().forEach((t) => t.stop())
        this.mediaRecorder = null
        this.mediaStream = null
        this.onSegment = null
    }

    isRunning(): boolean {
        return this.running
    }

    private async _transcribeChunk(blob: Blob): Promise<void> {
        if (!this.onSegment) return
        try {
            const form = new FormData()
            form.append("file", blob, "audio.webm")
            form.append("model", this.config.model)
            form.append("language", this.config.language)

            const res = await fetch(`${this.config.serverUrl}/inference`, { method: "POST", body: form })
            if (!res.ok) return
            const json = await res.json() as { text?: string }
            const text = json.text?.trim()
            if (!text) return
            this.onSegment({ text, isFinal: true, confidence: 1, timestampMs: Date.now() })
        } catch {
            // local server unavailable — swallow silently
        }
    }
}
