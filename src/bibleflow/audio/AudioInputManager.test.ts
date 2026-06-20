import { describe, it, expect, vi } from "vitest"
import { AudioInputManager } from "./AudioInputManager"

describe("AudioInputManager", () => {
    it("initialises with defaults", () => {
        const mgr = new AudioInputManager()
        expect(mgr.getSettings().deviceId).toBe("")
        expect(mgr.getSettings().gainDb).toBe(0)
    })

    it("accepts initial settings", () => {
        const mgr = new AudioInputManager({ deviceId: "mic1", gainDb: 6 })
        expect(mgr.getSettings().deviceId).toBe("mic1")
        expect(mgr.getSettings().gainDb).toBe(6)
    })

    it("sets device and fires callback", () => {
        const cb = vi.fn()
        const mgr = new AudioInputManager({}, cb)
        mgr.setDevice("mic2")
        expect(mgr.getSettings().deviceId).toBe("mic2")
        expect(cb).toHaveBeenCalledWith(expect.objectContaining({ deviceId: "mic2" }))
    })

    it("clamps gain to -40..+40 dB", () => {
        const mgr = new AudioInputManager()
        mgr.setGain(999)
        expect(mgr.getSettings().gainDb).toBe(40)
        mgr.setGain(-999)
        expect(mgr.getSettings().gainDb).toBe(-40)
    })

    it("persists gain in settings", () => {
        const mgr = new AudioInputManager()
        mgr.setGain(12)
        expect(mgr.getSettings().gainDb).toBe(12)
    })
})
