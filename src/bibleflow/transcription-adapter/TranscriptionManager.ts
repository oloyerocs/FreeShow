import type { TranscriptionAdapter, TranscriptSegment } from "./TranscriptionAdapter"
import { DeepgramAdapter } from "./DeepgramAdapter"
import { WhisperAdapter, type WhisperConfig } from "./WhisperAdapter"

export type ProviderName = "deepgram" | "whisper"

export interface TranscriptionManagerConfig {
    provider: ProviderName
    deviceId: string
    deepgramApiKey?: string
    whisper?: WhisperConfig
}

export class TranscriptionManager {
    private adapter: TranscriptionAdapter | null = null
    private config: TranscriptionManagerConfig

    constructor(config: TranscriptionManagerConfig) {
        this.config = config
    }

    async start(onSegment: (seg: TranscriptSegment) => void): Promise<void> {
        await this.stop()
        this.adapter = this._buildAdapter()
        await this.adapter.start(this.config.deviceId, onSegment)
    }

    async stop(): Promise<void> {
        if (this.adapter?.isRunning()) await this.adapter.stop()
        this.adapter = null
    }

    async switchProvider(cfg: TranscriptionManagerConfig, onSegment: (seg: TranscriptSegment) => void): Promise<void> {
        this.config = cfg
        await this.start(onSegment)
    }

    isRunning(): boolean {
        return this.adapter?.isRunning() ?? false
    }

    currentProvider(): ProviderName | null {
        return this.adapter?.name ?? null
    }

    private _buildAdapter(): TranscriptionAdapter {
        if (this.config.provider === "deepgram") {
            if (!this.config.deepgramApiKey) throw new Error("Deepgram API key required")
            return new DeepgramAdapter(this.config.deepgramApiKey)
        }
        return new WhisperAdapter(this.config.whisper)
    }
}
