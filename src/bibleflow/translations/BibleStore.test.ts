import { describe, it, expect } from "vitest"
import { BibleStore } from "./BibleStore"

describe("BibleStore", () => {
    it("lists KJV as available by default", () => {
        const store = new BibleStore()
        const kvj = store.listTranslations().find((t) => t.id === "KJV")
        expect(kvj?.available).toBe(true)
    })

    it("lists licensed translations as unavailable by default", () => {
        const store = new BibleStore()
        const niv = store.listTranslations().find((t) => t.id === "NIV")
        expect(niv?.available).toBe(false)
    })

    it("marks a translation purchased and makes it available", () => {
        const store = new BibleStore()
        store.markPurchased("NIV")
        expect(store.isAvailable("NIV")).toBe(true)
        const niv = store.listTranslations().find((t) => t.id === "NIV")
        expect(niv?.available).toBe(true)
    })

    it("isAvailable returns true for bundled translations", () => {
        const store = new BibleStore()
        expect(store.isAvailable("KJV")).toBe(true)
        expect(store.isAvailable("ASV")).toBe(true)
    })

    it("isAvailable returns false for unpurchased licensed translations", () => {
        const store = new BibleStore()
        expect(store.isAvailable("ESV")).toBe(false)
    })
})
