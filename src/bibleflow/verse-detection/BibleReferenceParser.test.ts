import { describe, it, expect } from "vitest"
import { parseReferences, formatReference } from "./BibleReferenceParser"

describe("parseReferences", () => {
    it("parses a simple chapter:verse reference", () => {
        const refs = parseReferences("Today we look at John 3:16")
        expect(refs).toHaveLength(1)
        expect(refs[0].book).toBe("John")
        expect(refs[0].chapter).toBe(3)
        expect(refs[0].verseStart).toBe(16)
    })

    it("parses a verse range", () => {
        const refs = parseReferences("Galatians 5:22-23 lists the fruit of the Spirit")
        expect(refs[0].book).toBe("Galatians")
        expect(refs[0].verseStart).toBe(22)
        expect(refs[0].verseEnd).toBe(23)
    })

    it("parses numbered book (1 Corinthians)", () => {
        const refs = parseReferences("1 Corinthians 13:4 is about love")
        expect(refs[0].book).toBe("1 Corinthians")
        expect(refs[0].chapter).toBe(13)
        expect(refs[0].verseStart).toBe(4)
    })

    it("resolves abbreviated book names", () => {
        const refs = parseReferences("As it says in Rev 22:13")
        expect(refs[0].book).toBe("Revelation")
    })

    it("returns empty array for unrecognised text", () => {
        expect(parseReferences("Hello world, no references here")).toHaveLength(0)
    })

    it("deduplicates repeated references", () => {
        const refs = parseReferences("John 3:16 and again John 3:16")
        expect(refs).toHaveLength(1)
    })

    it("parses multiple different references", () => {
        const refs = parseReferences("John 3:16 and Romans 8:28 are key verses")
        expect(refs).toHaveLength(2)
        expect(refs.map((r) => r.book)).toContain("John")
        expect(refs.map((r) => r.book)).toContain("Romans")
    })

    it("assigns high confidence to numeric references", () => {
        const refs = parseReferences("Psalm 23:1")
        expect(refs[0].confidence).toBeGreaterThanOrEqual(0.9)
    })
})

describe("formatReference", () => {
    it("formats a simple reference", () => {
        expect(formatReference({ raw: "", book: "John", chapter: 3, verseStart: 16, confidence: 1 })).toBe("John 3:16")
    })

    it("formats a verse range", () => {
        expect(formatReference({ raw: "", book: "Galatians", chapter: 5, verseStart: 22, verseEnd: 23, confidence: 1 })).toBe("Galatians 5:22-23")
    })
})
