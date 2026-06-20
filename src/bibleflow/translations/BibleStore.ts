// Bible translation store.
// Bundles KJV (public domain). Licensed translations are looked up online.

export interface VerseResult {
    reference: string
    text: string
    translation: string
}

export interface TranslationMeta {
    id: string
    name: string
    language: string
    license: "public-domain" | "licensed" | "online-only"
    available: boolean
}

// KJV data is bundled inline via a JSON import (populated at build time).
// For the scaffold, the lookup falls back to a lightweight API call.
const BUNDLED_TRANSLATIONS: TranslationMeta[] = [
    { id: "KJV", name: "King James Version", language: "en", license: "public-domain", available: true },
    { id: "ASV", name: "American Standard Version", language: "en", license: "public-domain", available: true },
]

const ONLINE_TRANSLATIONS: TranslationMeta[] = [
    { id: "NIV", name: "New International Version", language: "en", license: "licensed", available: false },
    { id: "ESV", name: "English Standard Version", language: "en", license: "licensed", available: false },
    { id: "NLT", name: "New Living Translation", language: "en", license: "licensed", available: false },
]

export class BibleStore {
    private purchased: Set<string> = new Set()

    listTranslations(): TranslationMeta[] {
        return [
            ...BUNDLED_TRANSLATIONS,
            ...ONLINE_TRANSLATIONS.map((t) => ({ ...t, available: this.purchased.has(t.id) })),
        ]
    }

    markPurchased(translationId: string) {
        this.purchased.add(translationId)
    }

    isAvailable(translationId: string): boolean {
        return (
            BUNDLED_TRANSLATIONS.some((t) => t.id === translationId) ||
            this.purchased.has(translationId)
        )
    }

    // Looks up a verse using bible-api.com (no key required, open API).
    // For bundled translations, would use local JSON; this is the online fallback.
    async lookup(reference: string, translationId: string): Promise<VerseResult | null> {
        if (!this.isAvailable(translationId)) return null
        try {
            const encoded = encodeURIComponent(reference)
            const id = translationId.toLowerCase()
            const res = await fetch(`https://bible-api.com/${encoded}?translation=${id}`)
            if (!res.ok) return null
            const json = await res.json() as { text?: string; reference?: string }
            if (!json.text) return null
            return { reference: json.reference ?? reference, text: json.text.trim(), translation: translationId }
        } catch {
            return null
        }
    }
}
