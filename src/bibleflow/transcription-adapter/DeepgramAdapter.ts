import type { TranscriptionAdapter, TranscriptSegment } from "./TranscriptionAdapter"

interface DeepgramWord {
    word: string
    confidence: number
}
interface DeepgramAlternative {
    transcript: string
    confidence: number
    words: DeepgramWord[]
}
interface DeepgramResult {
    is_final: boolean
    channel: { alternatives: DeepgramAlternative[] }
}

export class DeepgramAdapter implements TranscriptionAdapter {
    readonly name = "deepgram" as const
    private apiKey: string
    private ws: WebSocket | null = null
    private mediaStream: MediaStream | null = null
    private audioCtx: AudioContext | null = null
    private processor: ScriptProcessorNode | null = null
    private running = false

    constructor(apiKey: string) {
        this.apiKey = apiKey
    }

    async start(deviceId: string, onSegment: (seg: TranscriptSegment) => void): Promise<void> {
        if (this.running) return

        const wsUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&language=en-US&interim_results=true&punctuate=true`
        this.ws = new WebSocket(wsUrl, ["token", this.apiKey])

        await new Promise<void>((resolve, reject) => {
            this.ws!.onopen = () => resolve()
            this.ws!.onerror = (e) => reject(new Error(`Deepgram WebSocket error: ${JSON.stringify(e)}`))
        })

        this.ws.onmessage = (event: MessageEvent) => {
            try {
                const msg = JSON.parse(event.data as string)
                const result: DeepgramResult = msg?.channel ? msg : msg?.results?.channels?.[0] ? { is_final: msg.is_final, channel: msg.results.channels[0] } : null
                if (!result) return
                const alt = result.channel.alternatives[0]
                if (!alt?.transcript) return
                onSegment({ text: alt.transcript, isFinal: result.is_final, confidence: alt.confidence ?? 1, timestampMs: Date.now() })
            } catch {
                // malformed frame — ignore
            }
        }

        // capture mic audio
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: deviceId || undefined } })
        this.audioCtx = new AudioContext({ sampleRate: 16000 })
        const source = this.audioCtx.createMediaStreamSource(this.mediaStream)
        // ScriptProcessorNode is deprecated but universally available in Electron WebContents
        this.processor = this.audioCtx.createScriptProcessor(4096, 1, 1)
        this.processor.onaudioprocess = (e) => {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
            const float32 = e.inputBuffer.getChannelData(0)
            const int16 = new Int16Array(float32.length)
            for (let i = 0; i < float32.length; i++) int16[i] = Math.max(-32768, Math.min(32767, float32[i] * 32768))
            this.ws.send(int16.buffer)
        }
        source.connect(this.processor)
        this.processor.connect(this.audioCtx.destination)
        this.running = true
    }

    async stop(): Promise<void> {
        this.running = false
        this.processor?.disconnect()
        this.audioCtx?.close()
        this.mediaStream?.getTracks().forEach((t) => t.stop())
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: "CloseStream" }))
            this.ws.close()
        }
        this.ws = null
        this.processor = null
        this.audioCtx = null
        this.mediaStream = null
    }

    isRunning(): boolean {
        return this.running
    }
}
