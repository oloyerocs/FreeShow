// electron-store-backed LicenseStore.
// Reads and writes the "licenses" array inside the "bibleflow" config key.
// Drop-in replacement for InMemoryLicenseStore in production builds.

import type { LicenseStore, License } from "./LicenseManager"

type ConfigLike = { get: (key: string, fallback: any) => any; set: (key: string, value: any) => void }

export class ElectronLicenseStore implements LicenseStore {
    constructor(private config: ConfigLike) {}

    private _load(): License[] {
        return this.config.get("bibleflow.licenses", []) as License[]
    }

    private _save(licenses: License[]) {
        this.config.set("bibleflow.licenses", licenses)
    }

    get(translationId: string): License | null {
        return this._load().find((l) => l.translationId === translationId) ?? null
    }

    set(license: License): void {
        const all = this._load().filter((l) => l.translationId !== license.translationId)
        this._save([...all, license])
    }

    remove(translationId: string): void {
        this._save(this._load().filter((l) => l.translationId !== translationId))
    }

    listAll(): License[] {
        return this._load()
    }
}
