import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { BroadcastController } from "./BroadcastController"
import type { DetectedVerse } from "./BroadcastController"

function makeVerse(overrides: Partial<DetectedVerse> = {}): DetectedVerse {
    return {
        id: "v1",
        reference: "John 3:16",
        text: "For God so loved the world",
        translation: "KJV",
        confidence: 0.9,
        detectedAt: Date.now(),
        ...overrides,
    }
}

describe("BroadcastController — manual mode", () => {
    it("starts in manual mode by default", () => {
        const ctrl = new BroadcastController(vi.fn())
        expect(ctrl.getState().mode).toBe("manual")
    })

    it("enqueues a verse", () => {
        const ctrl = new BroadcastController(vi.fn())
        ctrl.enqueue(makeVerse())
        expect(ctrl.getState().queue).toHaveLength(1)
    })

    it("does not auto-send in manual mode", () => {
        vi.useFakeTimers()
        const send = vi.fn()
        const ctrl = new BroadcastController(send)
        ctrl.enqueue(makeVerse())
        vi.runAllTimers()
        expect(send).not.toHaveBeenCalled()
        vi.useRealTimers()
    })

    it("approves and sends a queued verse", () => {
        const send = vi.fn()
        const ctrl = new BroadcastController(send)
        ctrl.enqueue(makeVerse({ id: "v1" }))
        ctrl.approve("v1")
        expect(send).toHaveBeenCalledWith(expect.objectContaining({ reference: "John 3:16" }))
        expect(ctrl.getState().queue).toHaveLength(0)
    })

    it("deduplicates verses by reference+translation", () => {
        const ctrl = new BroadcastController(vi.fn())
        ctrl.enqueue(makeVerse())
        ctrl.enqueue(makeVerse())
        expect(ctrl.getState().queue).toHaveLength(1)
    })

    it("clears the display", () => {
        const send = vi.fn()
        const ctrl = new BroadcastController(send)
        ctrl.enqueue(makeVerse({ id: "v1" }))
        ctrl.approve("v1")
        ctrl.clearDisplay()
        expect(send).toHaveBeenLastCalledWith(null)
        expect(ctrl.getState().active).toBeNull()
    })
})

describe("BroadcastController — auto mode", () => {
    beforeEach(() => { vi.useFakeTimers(); vi.clearAllTimers() })
    afterEach(() => { vi.clearAllTimers(); vi.useRealTimers() })

    function makeCtrl(send: ReturnType<typeof vi.fn>, opts: Partial<BroadcastState> = {}) {
        const ctrl = new BroadcastController(send, { mode: "auto", cooldownMs: 2500, ...opts })
        // inject monotonic fake clock so cooldown calc uses same clock as timers
        let fakeNow = 0
        ctrl._now = () => fakeNow
        const advance = (ms: number) => { fakeNow += ms; vi.advanceTimersByTime(ms) }
        return { ctrl, advance }
    }

    it("respects confidence threshold — skips low-confidence verses", () => {
        const send = vi.fn()
        const { ctrl } = makeCtrl(send, { cooldownMs: 0, confidenceThreshold: 0.8 })
        ctrl.enqueue(makeVerse({ confidence: 0.5 }))
        vi.advanceTimersByTime(500)
        expect(send).not.toHaveBeenCalled()
        ctrl.destroy()
    })

    it("auto-sends highest-confidence verse after cooldown", () => {
        const send = vi.fn()
        const { ctrl, advance } = makeCtrl(send)
        ctrl.enqueue(makeVerse({ id: "v1", confidence: 0.8 }))
        ctrl.enqueue(makeVerse({ id: "v2", reference: "Ps 23:1", confidence: 0.95 }))
        advance(2500)
        expect(send).toHaveBeenCalledWith(expect.objectContaining({ reference: "Ps 23:1" }))
        ctrl.destroy()
    })

    it("cooldown prevents re-send before interval elapses", () => {
        const send = vi.fn()
        const { ctrl, advance } = makeCtrl(send)
        ctrl.enqueue(makeVerse({ id: "v1" }))
        advance(2500) // first send fires here
        ctrl.enqueue(makeVerse({ id: "v2", reference: "Ps 23:1" }))
        advance(1000) // only 1s into 2500ms cooldown — should not fire
        expect(send).toHaveBeenCalledTimes(1)
    })
})
