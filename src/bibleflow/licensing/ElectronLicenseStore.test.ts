import { describe, it, expect, vi } from "vitest"
import { ElectronLicenseStore } from "./ElectronLicenseStore"
import type { License } from "./LicenseManager"

function makeConfig(initial: Record<string, any> = {}) {
    const store: Record<string, any> = { ...initial }
    return {
        get: vi.fn((key: string, fallback: any) => {
            // support dot-notation keys like "bibleflow.licenses"
            const parts = key.split(".")
            let v: any = store
            for (const p of parts) v = v?.[p]
            return v ?? fallback
        }),
        set: vi.fn((key: string, value: any) => {
            const parts = key.split(".")
            let target = store
            for (let i = 0; i < parts.length - 1; i++) {
                target[parts[i]] ??= {}
                target = target[parts[i]]
            }
            target[parts[parts.length - 1]] = value
        }),
    }
}

const L: License = { key: "BFAB-1234-5678-9XYZ", translationId: "NIV", validatedAt: 1000, offlineValid: true }

describe("ElectronLicenseStore", () => {
    it("returns null for missing translation", () => {
        const s = new ElectronLicenseStore(makeConfig())
        expect(s.get("NIV")).toBeNull()
    })

    it("set and get round-trips a license", () => {
        const s = new ElectronLicenseStore(makeConfig())
        s.set(L)
        expect(s.get("NIV")).toEqual(L)
    })

    it("set replaces existing entry for same translationId", () => {
        const s = new ElectronLicenseStore(makeConfig())
        s.set(L)
        s.set({ ...L, validatedAt: 9999 })
        expect(s.get("NIV")?.validatedAt).toBe(9999)
        expect(s.listAll()).toHaveLength(1)
    })

    it("remove deletes a license", () => {
        const s = new ElectronLicenseStore(makeConfig())
        s.set(L)
        s.remove("NIV")
        expect(s.get("NIV")).toBeNull()
    })

    it("listAll returns all stored licenses", () => {
        const s = new ElectronLicenseStore(makeConfig())
        s.set(L)
        s.set({ ...L, translationId: "ESV" })
        expect(s.listAll()).toHaveLength(2)
    })
})
