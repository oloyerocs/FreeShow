export type VerticalPosition = "top" | "center" | "bottom"
export type TextAlign = "left" | "center" | "right"

export interface BibleFlowThemeV1 {
    version: 1
    name: string
    background: string
    backgroundOpacity: number   // 0–1
    color: string
    fontSize: number            // px
    fontFamily: string
    fontWeight: "normal" | "bold"
    textAlign: TextAlign
    lineHeight: number          // em, e.g. 1.4
    padding: number             // px
    borderRadius: number        // px
    position: VerticalPosition
    opacity: number             // overall element opacity 0–1
    referenceColor: string
    referenceFontSize: number   // px, relative to fontSize via percentage? keep absolute for simplicity
    safeAreaPercent: number     // % inset from edges for safe-area guide, e.g. 5
    shadow: string              // CSS text-shadow value or ""
}

export const DEFAULT_THEME_V1: BibleFlowThemeV1 = {
    version: 1,
    name: "Default",
    background: "#000000",
    backgroundOpacity: 0.7,
    color: "#ffffff",
    fontSize: 48,
    fontFamily: "sans-serif",
    fontWeight: "normal",
    textAlign: "center",
    lineHeight: 1.3,
    padding: 32,
    borderRadius: 0,
    position: "bottom",
    opacity: 1,
    referenceColor: "#cccccc",
    referenceFontSize: 28,
    safeAreaPercent: 5,
    shadow: "0 2px 8px rgba(0,0,0,0.8)",
}

// ---- serialisation -------------------------------------------------------

export function exportTheme(theme: BibleFlowThemeV1): string {
    return JSON.stringify(theme, null, 2)
}

export function importTheme(json: string): BibleFlowThemeV1 {
    let raw: unknown
    try { raw = JSON.parse(json) } catch { throw new Error("Invalid JSON") }
    if (typeof raw !== "object" || raw === null) throw new Error("Theme must be an object")
    const obj = raw as Record<string, unknown>
    if (obj["version"] !== 1) throw new Error(`Unsupported theme version: ${obj["version"]}`)
    // merge with defaults so new fields don't break old exports
    const merged: BibleFlowThemeV1 = { ...DEFAULT_THEME_V1, ...(obj as Partial<BibleFlowThemeV1>), version: 1 }
    return merged
}
