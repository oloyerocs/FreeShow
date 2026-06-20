import { describe, it, expect, vi } from "vitest"
import { LicenseManager, InMemoryLicenseStore } from "./LicenseManager"

const VALID_KEY = "BFAB-1234-5678-9XYZ"
const BAD_KEY = "invalid-key"

function makeManager(onlineOk = true) {
    const store = new InMemoryLicenseStore()
    const validator = vi.fn().mockResolvedValue(onlineOk)
    return { mgr: new LicenseManager(store, validator), store, validator }
}

describe("LicenseManager", () => {
    it("rejects malformed key without calling online validator", async () => {
        const { mgr, validator } = makeManager()
        const result = await mgr.activate(BAD_KEY, "NIV")
        expect(result.ok).toBe(false)
        expect(result.error).toContain("Invalid key format")
        expect(validator).not.toHaveBeenCalled()
    })

    it("activates a valid key online", async () => {
        const { mgr } = makeManager(true)
        const result = await mgr.activate(VALID_KEY, "NIV")
        expect(result.ok).toBe(true)
        expect(mgr.isLicensed("NIV")).toBe(true)
    })

    it("rejects a key rejected by online validator", async () => {
        const { mgr } = makeManager(false)
        const result = await mgr.activate(VALID_KEY, "ESV")
        expect(result.ok).toBe(false)
        expect(mgr.isLicensed("ESV")).toBe(false)
    })

    it("allows offline use after prior online validation", async () => {
        const { mgr, validator } = makeManager(true)
        await mgr.activate(VALID_KEY, "NIV")
        // simulate offline
        validator.mockRejectedValueOnce(new Error("Network error"))
        const result = await mgr.activate(VALID_KEY, "NIV")
        expect(result.ok).toBe(true)
    })

    it("revokes a license", async () => {
        const { mgr } = makeManager(true)
        await mgr.activate(VALID_KEY, "NIV")
        mgr.revoke("NIV")
        expect(mgr.isLicensed("NIV")).toBe(false)
    })

    it("lists all licenses", async () => {
        const { mgr } = makeManager(true)
        await mgr.activate(VALID_KEY, "NIV")
        expect(mgr.listLicenses()).toHaveLength(1)
        expect(mgr.listLicenses()[0].translationId).toBe("NIV")
    })
})
