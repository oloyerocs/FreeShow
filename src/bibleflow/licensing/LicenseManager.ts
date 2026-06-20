// License validation for BibleFlow purchased translations.
// License keys are validated locally (format check) plus optionally online.
// Persisted in the same electron-store as other BibleFlow settings.

export interface License {
    key: string
    translationId: string
    validatedAt: number
    offlineValid: boolean   // true once validated online at least once
}

export interface LicenseStore {
    get(translationId: string): License | null
    set(license: License): void
    remove(translationId: string): void
    listAll(): License[]
}

/** Simple in-memory store (replace with electron-store in production) */
export class InMemoryLicenseStore implements LicenseStore {
    private data = new Map<string, License>()
    get(id: string) { return this.data.get(id) ?? null }
    set(l: License) { this.data.set(l.translationId, l) }
    remove(id: string) { this.data.delete(id) }
    listAll() { return [...this.data.values()] }
}

// Key format: BFXX-XXXX-XXXX-XXXX (4 groups of 4 alphanumeric, prefix BF)
const KEY_RE = /^BF[A-Z0-9]{2}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i

export type OnlineValidator = (key: string, translationId: string) => Promise<boolean>

export class LicenseManager {
    private store: LicenseStore
    private onlineValidator: OnlineValidator

    constructor(store: LicenseStore, onlineValidator: OnlineValidator) {
        this.store = store
        this.onlineValidator = onlineValidator
    }

    /** Returns true if the translation is licensed for offline use */
    isLicensed(translationId: string): boolean {
        const l = this.store.get(translationId)
        return l?.offlineValid ?? false
    }

    /** Validates and stores a license key. Returns true on success. */
    async activate(key: string, translationId: string): Promise<{ ok: boolean; error?: string }> {
        if (!KEY_RE.test(key)) return { ok: false, error: "Invalid key format" }
        try {
            const valid = await this.onlineValidator(key, translationId)
            if (!valid) return { ok: false, error: "Key not recognized" }
            this.store.set({ key, translationId, validatedAt: Date.now(), offlineValid: true })
            return { ok: true }
        } catch {
            // offline: accept if key format is correct and was previously validated
            const existing = this.store.get(translationId)
            if (existing?.key === key && existing.offlineValid) return { ok: true }
            return { ok: false, error: "Offline and no prior validation" }
        }
    }

    revoke(translationId: string) {
        this.store.remove(translationId)
    }

    listLicenses(): License[] {
        return this.store.listAll()
    }
}
