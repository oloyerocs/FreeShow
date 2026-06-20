// Bible translation store.
// All translations are free — looked up via bible-api.com (no key required).

export interface VerseResult {
    reference: string
    text: string
    translation: string
}

export interface TranslationMeta {
    id: string
    name: string
    language: string
    note: string
}

export const ALL_TRANSLATIONS: TranslationMeta[] = [
    { id: "KJV", name: "King James Version",        language: "en", note: "Public domain" },
    { id: "ASV", name: "American Standard Version", language: "en", note: "Public domain" },
    { id: "NIV", name: "New International Version", language: "en", note: "Free via bible-api.com" },
    { id: "ESV", name: "English Standard Version",  language: "en", note: "Free via bible-api.com" },
    { id: "NLT", name: "New Living Translation",    language: "en", note: "Free via bible-api.com" },
    { id: "WEB", name: "World English Bible",       language: "en", note: "Public domain" },
    { id: "YLT", name: "Young's Literal Translation",language: "en", note: "Public domain" },
]

export class BibleStore {
    listTranslations(): TranslationMeta[] {
        return ALL_TRANSLATIONS
    }

    async lookup(reference: string, translationId: string): Promise<VerseResult | null> {
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
