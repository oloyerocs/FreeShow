// Localization-ready string keys for BibleFlow UI.
// All user-visible strings go through t() — never hardcode labels in components.

export type Locale = "en" | string

export interface BibleFlowStrings {
    // Broadcast panel
    broadcastModeAuto: string
    broadcastModeManual: string
    broadcastCooldownLabel: string
    broadcastApprove: string
    broadcastClear: string
    broadcastSend: string
    // Queue
    queueEmpty: string
    queueConfidence: string
    // Transcription
    transcriptionStart: string
    transcriptionStop: string
    transcriptionProviderDeepgram: string
    transcriptionProviderWhisper: string
    // Theme designer
    themeImport: string
    themeExport: string
    themePreview: string
    // Sermon notes
    notesGenerate: string
    notesExportMarkdown: string
    notesExportText: string
    // Translations store
    storeInstalled: string
    storePurchase: string
    storeAvailable: string
    // Accessibility labels
    ariaVerseOverlay: string
    ariaCloseOverlay: string
    ariaQueueList: string
}

const EN: BibleFlowStrings = {
    broadcastModeAuto: "Auto",
    broadcastModeManual: "Manual",
    broadcastCooldownLabel: "Cooldown (ms)",
    broadcastApprove: "Send to display",
    broadcastClear: "Clear display",
    broadcastSend: "Send",
    queueEmpty: "No verses detected",
    queueConfidence: "Confidence",
    transcriptionStart: "Start transcription",
    transcriptionStop: "Stop transcription",
    transcriptionProviderDeepgram: "Deepgram (cloud)",
    transcriptionProviderWhisper: "Whisper (local)",
    themeImport: "Import theme",
    themeExport: "Export theme",
    themePreview: "Preview",
    notesGenerate: "Generate outline",
    notesExportMarkdown: "Export as Markdown",
    notesExportText: "Export as plain text",
    storeInstalled: "Installed",
    storePurchase: "Purchase",
    storeAvailable: "Available",
    ariaVerseOverlay: "Bible verse overlay",
    ariaCloseOverlay: "Close verse overlay",
    ariaQueueList: "Detected verse queue",
}

const LOCALES: Record<string, BibleFlowStrings> = { en: EN }

let _current: BibleFlowStrings = EN

export function setLocale(locale: Locale) {
    _current = LOCALES[locale] ?? EN
}

export function t(key: keyof BibleFlowStrings): string {
    return _current[key] ?? key
}

export function registerLocale(locale: string, strings: Partial<BibleFlowStrings>) {
    LOCALES[locale] = { ...EN, ...strings }
}
