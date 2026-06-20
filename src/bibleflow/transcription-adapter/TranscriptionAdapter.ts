export interface TranscriptSegment {
    text: string
    isFinal: boolean
    confidence: number // 0–1
    timestampMs: number
}

export interface TranscriptionAdapter {
    readonly name: "deepgram" | "whisper"
    start(deviceId: string, onSegment: (seg: TranscriptSegment) => void): Promise<void>
    stop(): Promise<void>
    isRunning(): boolean
}
