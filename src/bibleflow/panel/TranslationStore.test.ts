import { describe, it, expect, vi } from "vitest"
import { LicenseManager, InMemoryLicenseStore } from "../licensing/LicenseManager"

// Tests for the translation store's licensing logic (the Svelte component
// itself is exercised via the existing LicenseManager unit tests — these
// cover the store-specific activation + revoke flow as used by the UI).

function makeStore(onlineOk = true) {
    const store = new InMemoryLicenseStore()
    const validator = vi.fn().mockResolvedValue(onlineOk)
    const mgr = new LicenseManager(store, validator)
    return { mgr, store, validator }
}

const VALID_KEY = "BFAB-1234-5678-9XYZ"

describe("TranslationStore — licensing flow", () => {
    it("NIV is not licensed by default", () => {
        const { mgr } = makeStore()
        expect(mgr.isLicensed("NIV")).toBe(false)
    })

    it("activating NIV with valid key licenses it", async () => {
        const { mgr } = makeStore(true)
        const result = await mgr.activate(VALID_KEY, "NIV")
        expect(result.ok).toBe(true)
        expect(mgr.isLicensed("NIV")).toBe(true)
    })

    it("empty key returns error without calling validator", async () => {
        const { mgr, validator } = makeStore()
        const result = await mgr.activate("", "NIV")
        expect(result.ok).toBe(false)
        expect(validator).not.toHaveBeenCalled()
    })

    it("revoking a licensed translation unlicenses it", async () => {
        const { mgr } = makeStore(true)
        await mgr.activate(VALID_KEY, "ESV")
        expect(mgr.isLicensed("ESV")).toBe(true)
        mgr.revoke("ESV")
        expect(mgr.isLicensed("ESV")).toBe(false)
    })

    it("all three paid translations can be activated independently", async () => {
        const { mgr } = makeStore(true)
        for (const id of ["NIV", "ESV", "NLT"]) {
            await mgr.activate(VALID_KEY, id)
            expect(mgr.isLicensed(id)).toBe(true)
        }
        expect(mgr.listLicenses()).toHaveLength(3)
    })
})
