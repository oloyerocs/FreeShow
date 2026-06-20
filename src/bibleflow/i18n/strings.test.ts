import { describe, it, expect, beforeEach } from "vitest"
import { t, setLocale, registerLocale } from "./strings"

beforeEach(() => setLocale("en"))

describe("i18n strings", () => {
    it("returns English string for known key", () => {
        expect(t("broadcastModeAuto")).toBe("Auto")
        expect(t("broadcastClear")).toBe("Clear display")
    })

    it("falls back to key name for unknown locale", () => {
        setLocale("xx")
        expect(t("broadcastModeAuto")).toBe("Auto") // falls back to EN
    })

    it("registers and uses a custom locale", () => {
        registerLocale("es", { broadcastModeAuto: "Automático", broadcastClear: "Limpiar pantalla" })
        setLocale("es")
        expect(t("broadcastModeAuto")).toBe("Automático")
        expect(t("broadcastClear")).toBe("Limpiar pantalla")
        // untranslated key falls through to EN
        expect(t("queueEmpty")).toBe("No verses detected")
    })

    it("all string keys are defined in EN locale", () => {
        setLocale("en")
        const keys: Array<Parameters<typeof t>[0]> = [
            "broadcastModeAuto", "broadcastModeManual", "broadcastCooldownLabel",
            "broadcastApprove", "broadcastClear", "broadcastSend",
            "queueEmpty", "queueConfidence",
            "transcriptionStart", "transcriptionStop",
            "themeImport", "themeExport", "themePreview",
            "notesGenerate", "notesExportMarkdown", "notesExportText",
            "storeInstalled", "storePurchase", "storeAvailable",
            "ariaVerseOverlay", "ariaCloseOverlay", "ariaQueueList",
        ]
        for (const k of keys) {
            expect(t(k), `Missing EN string for key "${k}"`).not.toBe(k)
        }
    })
})
