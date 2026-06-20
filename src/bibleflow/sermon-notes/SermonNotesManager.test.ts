import { describe, it, expect, vi } from "vitest"
import { SermonNotesManager } from "./SermonNotesManager"

const noopAi = async (t: string) => `Outline for: ${t.slice(0, 20)}`

describe("SermonNotesManager", () => {
    it("accumulates transcript", () => {
        const mgr = new SermonNotesManager("s1", noopAi)
        mgr.appendTranscript("Hello world")
        mgr.appendTranscript("more text")
        expect(mgr.getNotes().transcript).toBe("Hello world more text")
    })

    it("deduplicates references", () => {
        const mgr = new SermonNotesManager("s1", noopAi)
        mgr.addReference("John 3:16")
        mgr.addReference("John 3:16")
        expect(mgr.getNotes().detectedReferences).toHaveLength(1)
    })

    it("generates AI outline via provided function", async () => {
        const ai = vi.fn().mockResolvedValue("1. Introduction\n2. Body")
        const mgr = new SermonNotesManager("s1", ai)
        mgr.appendTranscript("Today we talk about John 3:16")
        const outline = await mgr.generateOutline()
        expect(outline).toContain("Introduction")
        expect(ai).toHaveBeenCalledWith("Today we talk about John 3:16")
    })

    it("exports valid markdown", async () => {
        const mgr = new SermonNotesManager("s1", noopAi)
        mgr.appendTranscript("In John 3:16 we see...")
        mgr.addReference("John 3:16")
        await mgr.generateOutline()
        const md = mgr.exportMarkdown()
        expect(md).toContain("# Sermon Notes")
        expect(md).toContain("John 3:16")
        expect(md).toContain("## Raw Transcript")
    })

    it("exports plain text transcript", () => {
        const mgr = new SermonNotesManager("s1", noopAi)
        mgr.appendTranscript("Plain text content")
        expect(mgr.exportPlainText()).toBe("Plain text content")
    })
})
