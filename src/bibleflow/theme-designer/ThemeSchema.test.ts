import { describe, it, expect } from "vitest"
import { exportTheme, importTheme, DEFAULT_THEME_V1 } from "./ThemeSchema"

describe("Theme JSON round-trip", () => {
    it("exports then imports the default theme unchanged", () => {
        const json = exportTheme(DEFAULT_THEME_V1)
        const imported = importTheme(json)
        expect(imported).toEqual(DEFAULT_THEME_V1)
    })

    it("exports valid JSON", () => {
        expect(() => JSON.parse(exportTheme(DEFAULT_THEME_V1))).not.toThrow()
    })

    it("imports a partial theme, filling gaps from defaults", () => {
        const partial = JSON.stringify({ version: 1, name: "Custom", fontSize: 64 })
        const theme = importTheme(partial)
        expect(theme.fontSize).toBe(64)
        expect(theme.name).toBe("Custom")
        expect(theme.color).toBe(DEFAULT_THEME_V1.color)
    })

    it("throws on invalid JSON", () => {
        expect(() => importTheme("not json")).toThrow("Invalid JSON")
    })

    it("throws on unsupported version", () => {
        expect(() => importTheme(JSON.stringify({ version: 99 }))).toThrow("Unsupported theme version")
    })
})
