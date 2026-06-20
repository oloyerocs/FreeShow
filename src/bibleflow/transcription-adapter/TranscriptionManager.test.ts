import { describe, it, expect, vi } from "vitest"
import { TranscriptionManager } from "./TranscriptionManager"
import type { TranscriptionAdapter, TranscriptSegment } from "./TranscriptionAdapter"

function makeMockAdapter(name: "deepgram" | "whisper"): TranscriptionAdapter {
    let running = false
    return {
        name,
        async start(_deviceId, _onSeg) { running = true },
        async stop() { running = false },
        isRunning: () => running,
    }
}

vi.mock("./DeepgramAdapter", () => ({
    DeepgramAdapter: vi.fn().mockImplementation(() => makeMockAdapter("deepgram")),
}))
vi.mock("./WhisperAdapter", () => ({
    WhisperAdapter: vi.fn().mockImplementation(() => makeMockAdapter("whisper")),
}))

describe("TranscriptionManager", () => {
    it("starts deepgram adapter when provider is deepgram", async () => {
        const mgr = new TranscriptionManager({ provider: "deepgram", deviceId: "", deepgramApiKey: "test-key" })
        await mgr.start(vi.fn())
        expect(mgr.isRunning()).toBe(true)
        expect(mgr.currentProvider()).toBe("deepgram")
        await mgr.stop()
    })

    it("starts whisper adapter when provider is whisper", async () => {
        const mgr = new TranscriptionManager({ provider: "whisper", deviceId: "" })
        await mgr.start(vi.fn())
        expect(mgr.isRunning()).toBe(true)
        expect(mgr.currentProvider()).toBe("whisper")
        await mgr.stop()
    })

    it("throws if deepgram started without API key", async () => {
        const mgr = new TranscriptionManager({ provider: "deepgram", deviceId: "" })
        await expect(mgr.start(vi.fn())).rejects.toThrow("API key")
    })

    it("stops and restarts on switchProvider", async () => {
        const mgr = new TranscriptionManager({ provider: "whisper", deviceId: "" })
        await mgr.start(vi.fn())
        await mgr.switchProvider({ provider: "whisper", deviceId: "mic2" }, vi.fn())
        expect(mgr.isRunning()).toBe(true)
        await mgr.stop()
        expect(mgr.isRunning()).toBe(false)
    })
})
