import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock window.api so the store can load outside Electron
vi.stubGlobal("window", {
    api: { send: vi.fn() },
    __DEEPGRAM_KEY__: "",
})

// Import after stub so the module initializes with the mock
const { controller, refresh, setMode, setCooldown, setThreshold, approve, dismissVerse, clearDisplay, broadcastState, queue, activeVerse } = await import("./bibleflowPanelStore")

describe("bibleflowPanelStore", () => {
    beforeEach(() => {
        controller.clearQueue()
        controller.clearDisplay()
        controller.setMode("manual")
        controller.setCooldown(2500)
        controller.setThreshold(0.7)
        refresh()
    })

    it("starts in manual mode", () => {
        let state: any
        broadcastState.subscribe((s) => (state = s))()
        expect(state.mode).toBe("manual")
    })

    it("setMode updates broadcastState", () => {
        setMode("auto")
        let state: any
        broadcastState.subscribe((s) => (state = s))()
        expect(state.mode).toBe("auto")
        setMode("manual")
    })

    it("setCooldown updates broadcastState", () => {
        setCooldown(1000)
        let state: any
        broadcastState.subscribe((s) => (state = s))()
        expect(state.cooldownMs).toBe(1000)
    })

    it("setThreshold updates broadcastState", () => {
        setThreshold(0.5)
        let state: any
        broadcastState.subscribe((s) => (state = s))()
        expect(state.confidenceThreshold).toBe(0.5)
    })

    it("approve sends verse via window.api.send", () => {
        const sendSpy = vi.spyOn((window as any).api, "send")
        controller.enqueue({ id: "v1", reference: "John 3:16", text: "For God so loved the world", translation: "KJV", confidence: 0.9, detectedAt: Date.now() })
        refresh()
        approve("v1")
        expect(sendSpy).toHaveBeenCalledWith("BIBLEFLOW", expect.objectContaining({ type: "BIBLEFLOW_VERSE" }))
    })

    it("dismissVerse removes verse from queue", () => {
        controller.enqueue({ id: "v2", reference: "Ps 23:1", text: "The Lord is my shepherd", translation: "KJV", confidence: 0.85, detectedAt: Date.now() })
        refresh()
        let q: any[]
        queue.subscribe((v) => (q = v))()
        expect(q!).toHaveLength(1)
        dismissVerse("v2")
        queue.subscribe((v) => (q = v))()
        expect(q!).toHaveLength(0)
    })

    it("clearDisplay calls sendToOutput(null)", () => {
        const sendSpy = vi.spyOn((window as any).api, "send")
        clearDisplay()
        expect(sendSpy).toHaveBeenCalledWith("BIBLEFLOW", expect.objectContaining({ type: "BIBLEFLOW_VERSE", verse: null }))
    })
})
