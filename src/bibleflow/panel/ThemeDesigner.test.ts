import { describe, it, expect } from "vitest"
import { exportTheme, importTheme } from "../theme-designer/ThemeSchema"
import { DEFAULT_THEME } from "../config"

// Tests for the theme designer's import/export logic as exercised by the UI.

describe("ThemeDesigner — import/export round-trip", () => {
    it("exports a theme to valid JSON", () => {
        const json = exportTheme({ version: 1, ...DEFAULT_THEME })
        expect(() => JSON.parse(json)).not.toThrow()
        const parsed = JSON.parse(json)
        expect(parsed.version).toBe(1)
        expect(parsed.position).toBe("bottom")
    })

    it("imports exported theme and matches original", () => {
        const json = exportTheme({ version: 1, ...DEFAULT_THEME })
        const imported = importTheme(json)
        expect(imported.fontSize).toBe(DEFAULT_THEME.fontSize)
        expect(imported.color).toBe(DEFAULT_THEME.color)
        expect(imported.position).toBe(DEFAULT_THEME.position)
    })

    it("import merges with defaults for missing keys", () => {
        const partial = JSON.stringify({ version: 1, fontSize: 64 })
        const imported = importTheme(partial)
        expect(imported.fontSize).toBe(64)
        expect(imported.color).toBe(DEFAULT_THEME.color)
    })

    it("import rejects wrong version", () => {
        const bad = JSON.stringify({ version: 99, fontSize: 48 })
        expect(() => importTheme(bad)).toThrow()
    })

    it("import rejects non-JSON", () => {
        expect(() => importTheme("not json at all")).toThrow()
    })
})
