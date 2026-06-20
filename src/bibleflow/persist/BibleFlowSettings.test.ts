import { describe, it, expect, vi } from "vitest"
import { registerBibleFlowSettingsHandler, BIBLEFLOW_SETTINGS_DEFAULTS } from "./BibleFlowSettings"

function makeMockConfig(initial: Record<string, any> = {}) {
    const store: Record<string, any> = { ...initial }
    return {
        get: vi.fn((key: string, fallback: any) => store[key] ?? fallback),
        set: vi.fn((key: string, value: any) => { store[key] = value }),
        _store: store,
    }
}

function makeMockIpc() {
    let handlerFn: ((event: any, msg: any) => any) | null = null
    return {
        ipcMain: { handle: vi.fn((_ch: string, fn: any) => { handlerFn = fn }) },
        call: (msg: any) => handlerFn!(null, msg),
    }
}

describe("BibleFlowSettings IPC handler", () => {
    it("registers a handler and returns defaults when store is empty", () => {
        const config = makeMockConfig()
        const { ipcMain, call } = makeMockIpc()
        registerBibleFlowSettingsHandler(ipcMain, config)
        const result = call({ op: "get" })
        expect(result.broadcastMode).toBe("manual")
        expect(result.cooldownMs).toBe(2500)
        expect(result.confidenceThreshold).toBe(0.7)
    })

    it("get merges saved values over defaults", () => {
        const config = makeMockConfig({ bibleflow: { cooldownMs: 5000 } })
        const { ipcMain, call } = makeMockIpc()
        registerBibleFlowSettingsHandler(ipcMain, config)
        const result = call({ op: "get" })
        expect(result.cooldownMs).toBe(5000)
        expect(result.broadcastMode).toBe("manual")
    })

    it("set merges partial into existing store", () => {
        const config = makeMockConfig()
        const { ipcMain, call } = makeMockIpc()
        registerBibleFlowSettingsHandler(ipcMain, config)
        call({ op: "set", data: { cooldownMs: 3000 } })
        expect(config.set).toHaveBeenCalledWith("bibleflow", expect.objectContaining({ cooldownMs: 3000 }))
    })

    it("set does not overwrite unrelated keys", () => {
        const config = makeMockConfig({ bibleflow: { broadcastMode: "auto", cooldownMs: 2500 } })
        const { ipcMain, call } = makeMockIpc()
        registerBibleFlowSettingsHandler(ipcMain, config)
        call({ op: "set", data: { cooldownMs: 1000 } })
        const saved = config._store.bibleflow
        expect(saved.cooldownMs).toBe(1000)
        expect(saved.broadcastMode).toBe("auto")
    })

    it("defaults include all required keys", () => {
        const keys: Array<keyof typeof BIBLEFLOW_SETTINGS_DEFAULTS> = [
            "theme", "broadcastMode", "cooldownMs", "confidenceThreshold",
            "transcriptionProvider", "audioDeviceId", "apiToken", "licenses",
        ]
        for (const k of keys) {
            expect(BIBLEFLOW_SETTINGS_DEFAULTS).toHaveProperty(k)
        }
    })
})
