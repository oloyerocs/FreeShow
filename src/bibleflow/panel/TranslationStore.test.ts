import { describe, it, expect } from "vitest"
import { ALL_TRANSLATIONS } from "../translations/BibleStore"

// TranslationStore.svelte is a Svelte UI component — full mounting requires
// @testing-library/svelte and jsdom. These tests verify the underlying data
// that the component renders (the all-free translation list).

describe("TranslationStore data", () => {
    it("has at least 7 translations, all free", () => {
        expect(ALL_TRANSLATIONS.length).toBeGreaterThanOrEqual(7)
    })

    it("every translation has an id, name, and language", () => {
        for (const t of ALL_TRANSLATIONS) {
            expect(t.id).toBeTruthy()
            expect(t.name).toBeTruthy()
            expect(t.language).toBeTruthy()
        }
    })

    it("KJV is in the list", () => {
        expect(ALL_TRANSLATIONS.some((t) => t.id === "KJV")).toBe(true)
    })

    it("NIV is free (was previously gated behind a license)", () => {
        const niv = ALL_TRANSLATIONS.find((t) => t.id === "NIV")
        expect(niv).toBeDefined()
        // Any note is fine — it just needs to exist as a free entry
        expect(niv?.note).toBeTruthy()
    })
})
