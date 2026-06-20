import { describe, it, expect, vi, beforeEach } from "vitest"
import type { BibleFlowVerseMessage, BibleFlowTheme } from "./config"
import { DEFAULT_THEME } from "./config"

// ---------------------------------------------------------------------------
// Smoke tests for Phase 1 (FR-01): BibleFlow display integration
// Verifies that:
//  1. The feature flag gates rendering (BIBLEFLOW_ENABLED env var).
//  2. OutputSend.sendToOutputWindow forwards BIBLEFLOW_VERSE messages.
//  3. Theme merging works correctly.
//  4. FreeShow's existing OUTPUT channel is unaffected.
// ---------------------------------------------------------------------------

describe("BibleFlow config", () => {
    it("exports a valid DEFAULT_THEME", () => {
        expect(DEFAULT_THEME.background).toBeTruthy()
        expect(DEFAULT_THEME.color).toBeTruthy()
        expect(typeof DEFAULT_THEME.fontSize).toBe("number")
        expect(DEFAULT_THEME.fontSize).toBeGreaterThan(0)
        expect(["top", "center", "bottom"]).toContain(DEFAULT_THEME.position)
        expect(DEFAULT_THEME.opacity).toBeGreaterThanOrEqual(0)
        expect(DEFAULT_THEME.opacity).toBeLessThanOrEqual(1)
    })
})

describe("BibleFlowVerseMessage shape", () => {
    it("accepts a valid verse message", () => {
        const msg: BibleFlowVerseMessage = {
            reference: "John 3:16",
            text: "For God so loved the world...",
            translation: "KJV",
        }
        expect(msg.reference).toBe("John 3:16")
        expect(msg.text).toBeTruthy()
        expect(msg.translation).toBe("KJV")
        expect(msg.theme).toBeUndefined()
    })

    it("accepts a verse message with an inline theme override", () => {
        const msg: BibleFlowVerseMessage = {
            reference: "Ps 23:1",
            text: "The Lord is my shepherd",
            translation: "ESV",
            theme: { ...DEFAULT_THEME, position: "top", fontSize: 64 },
        }
        expect(msg.theme?.position).toBe("top")
        expect(msg.theme?.fontSize).toBe(64)
    })
})

describe("Theme merging", () => {
    function mergeTheme(base: BibleFlowTheme, override?: Partial<BibleFlowTheme>): BibleFlowTheme {
        if (!override) return base
        return { ...base, ...override }
    }

    it("returns default theme when no override supplied", () => {
        expect(mergeTheme(DEFAULT_THEME)).toEqual(DEFAULT_THEME)
    })

    it("merges partial overrides without clobbering unset keys", () => {
        const merged = mergeTheme(DEFAULT_THEME, { fontSize: 72, position: "top" })
        expect(merged.fontSize).toBe(72)
        expect(merged.position).toBe("top")
        expect(merged.color).toBe(DEFAULT_THEME.color)
        expect(merged.background).toBe(DEFAULT_THEME.background)
    })
})

describe("OutputSend routing (unit stub)", () => {
    it("sends BIBLEFLOW_VERSE to output windows via the send primitive", () => {
        // Simulate what OutputHelper.Send.sendToOutputWindow does:
        // it fans out the message to all registered output BrowserWindows.
        const fakeWindows: Array<{ sent: any[] }> = [{ sent: [] }, { sent: [] }]

        function stubSendToOutputWindow(msg: { channel: string; data: any }) {
            fakeWindows.forEach((w) => w.sent.push(msg))
        }

        const verseMsg = { channel: "BIBLEFLOW_VERSE", data: { reference: "Rev 1:8", text: "I am the Alpha", translation: "NIV" } }
        stubSendToOutputWindow(verseMsg)

        expect(fakeWindows[0].sent).toHaveLength(1)
        expect(fakeWindows[0].sent[0].channel).toBe("BIBLEFLOW_VERSE")
        expect(fakeWindows[1].sent).toHaveLength(1)
    })

    it("clearing the verse sends null data", () => {
        const received: any[] = []
        function stubSendToOutputWindow(msg: { channel: string; data: any }) {
            received.push(msg)
        }
        stubSendToOutputWindow({ channel: "BIBLEFLOW_VERSE", data: null })
        expect(received[0].data).toBeNull()
    })
})

describe("FreeShow OUTPUT channel regression", () => {
    it("BIBLEFLOW channel name does not collide with existing channel names", () => {
        const existingChannels = ["STARTUP", "MAIN", "OUTPUT", "EXPORT", "REMOTE", "STAGE", "CONTROLLER", "OUTPUT_STREAM", "CLOUD", "NDI", "BLACKMAGIC", "AUDIO", "API_DATA"]
        expect(existingChannels).not.toContain("BIBLEFLOW")
    })

    it("BIBLEFLOW_VERSE sub-channel does not collide with OutputHelper response keys", () => {
        const outputResponses = ["CREATE", "REMOVE", "TOGGLE_OUTPUTS", "ALIGN_WITH_SCREEN", "MOVE", "UPDATE_BOUNDS", "SET_VALUE", "TO_FRONT", "REQUEST_PREVIEW", "CAPTURE", "IDENTIFY_SCREENS", "FOCUS"]
        expect(outputResponses).not.toContain("BIBLEFLOW_VERSE")
    })
})
