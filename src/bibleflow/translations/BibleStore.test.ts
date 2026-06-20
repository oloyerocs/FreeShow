import { describe, it, expect, vi } from "vitest"
import { BibleStore, ALL_TRANSLATIONS } from "./BibleStore"

describe("BibleStore", () => {
    it("lists all 7 translations", () => {
        expect(ALL_TRANSLATIONS).toHaveLength(7)
    })

    it("all translation IDs are present", () => {
        const ids = ALL_TRANSLATIONS.map((t) => t.id)
        expect(ids).toContain("KJV")
        expect(ids).toContain("ASV")
        expect(ids).toContain("NIV")
        expect(ids).toContain("ESV")
        expect(ids).toContain("NLT")
        expect(ids).toContain("WEB")
        expect(ids).toContain("YLT")
    })

    it("listTranslations returns all translations", () => {
        const store = new BibleStore()
        expect(store.listTranslations()).toHaveLength(7)
    })

    it("lookup resolves via bible-api.com", async () => {
        const mockJson = { reference: "John 3:16", text: "For God so loved the world..." }
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockJson,
        } as any)

        const store = new BibleStore()
        const result = await store.lookup("John 3:16", "KJV")
        expect(result).not.toBeNull()
        expect(result?.reference).toBe("John 3:16")
        expect(result?.translation).toBe("KJV")
    })

    it("lookup returns null on network error", async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error("offline"))
        const store = new BibleStore()
        const result = await store.lookup("John 3:16", "KJV")
        expect(result).toBeNull()
    })

    it("lookup returns null on non-ok response", async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false } as any)
        const store = new BibleStore()
        const result = await store.lookup("John 3:16", "KJV")
        expect(result).toBeNull()
    })
})
