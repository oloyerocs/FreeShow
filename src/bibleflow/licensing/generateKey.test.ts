import { describe, it, expect } from "vitest"
import { generateKey } from "./generateKey"

const KEY_RE = /^BF[A-Z0-9]{2}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/

describe("generateKey", () => {
    it("produces correctly formatted keys", () => {
        for (let i = 0; i < 20; i++) {
            expect(generateKey()).toMatch(KEY_RE)
        }
    })

    it("produces unique keys", () => {
        const keys = new Set(Array.from({ length: 100 }, generateKey))
        expect(keys.size).toBe(100)
    })

    it("keys are accepted by LicenseManager format check", async () => {
        const { LicenseManager, InMemoryLicenseStore } = await import("./LicenseManager")
        const mgr = new LicenseManager(new InMemoryLicenseStore(), async () => true)
        const key = generateKey()
        const result = await mgr.activate(key, "NIV")
        expect(result.ok).toBe(true)
    })
})
