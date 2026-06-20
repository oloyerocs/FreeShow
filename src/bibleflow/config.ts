// BibleFlow feature flag and default settings.
// When BIBLEFLOW_ENABLED is false, zero BibleFlow code paths execute in the output window.
// __BIBLEFLOW_ENABLED__ is injected by Vite define at build time so Rollup can tree-shake the
// disabled branch entirely. Falls back to true in environments without the define (tests, SSR).
declare const __BIBLEFLOW_ENABLED__: boolean
export const BIBLEFLOW_ENABLED: boolean =
    typeof __BIBLEFLOW_ENABLED__ !== "undefined" ? __BIBLEFLOW_ENABLED__ : true

export interface BibleFlowVerseMessage {
    reference: string   // e.g. "John 3:16"
    text: string        // verse body
    translation: string // e.g. "KJV"
    theme?: BibleFlowTheme
}

export interface BibleFlowTheme {
    background: string  // CSS color or "transparent"
    color: string       // text color
    fontSize: number    // px
    fontFamily: string
    padding: number     // px
    position: "bottom" | "top" | "center"
    opacity: number     // 0–1
}

export const DEFAULT_THEME: BibleFlowTheme = {
    background: "rgba(0,0,0,0.7)",
    color: "#ffffff",
    fontSize: 48,
    fontFamily: "sans-serif",
    padding: 32,
    position: "bottom",
    opacity: 1,
}
