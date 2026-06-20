// Electron-main-side handler for BibleFlow persistent settings.
// Stored under the "bibleflow" key in FreeShow's existing config store.
// The handler is registered once at startup by passing ipcMain + config.

import type { BibleFlowTheme } from "../config"
import { DEFAULT_THEME } from "../config"
import { BIBLEFLOW_SETTINGS } from "../../types/Channels"

export interface BibleFlowPersistedSettings {
    theme: BibleFlowTheme
    broadcastMode: "auto" | "manual"
    cooldownMs: number
    confidenceThreshold: number
    transcriptionProvider: "deepgram" | "whisper"
    audioDeviceId: string
    apiToken: string
    deepgramApiKey: string
    activeTranslation: string
    licenses: Array<{ key: string; translationId: string; validatedAt: number; offlineValid: boolean }>
}

export const BIBLEFLOW_SETTINGS_DEFAULTS: BibleFlowPersistedSettings = {
    theme: { ...DEFAULT_THEME },
    broadcastMode: "manual",
    cooldownMs: 2500,
    confidenceThreshold: 0.7,
    transcriptionProvider: "whisper",
    audioDeviceId: "",
    apiToken: "",
    deepgramApiKey: "",
    activeTranslation: "KJV",
    licenses: [],
}

type IpcMainLike = { handle: (channel: string, fn: (event: any, msg: any) => any) => void }
type ConfigLike  = { get: (key: string, fallback: any) => any; set: (key: string, value: any) => void }

export function registerBibleFlowSettingsHandler(ipcMain: IpcMainLike, config: ConfigLike) {
    ipcMain.handle(BIBLEFLOW_SETTINGS, (_event, msg: { op: "get" } | { op: "set"; data: Partial<BibleFlowPersistedSettings> }) => {
        if (msg.op === "get") {
            const saved = config.get("bibleflow", {}) as Partial<BibleFlowPersistedSettings>
            return { ...BIBLEFLOW_SETTINGS_DEFAULTS, ...saved }
        }
        if (msg.op === "set") {
            const current = config.get("bibleflow", {}) as Partial<BibleFlowPersistedSettings>
            config.set("bibleflow", { ...current, ...msg.data })
            return { ok: true }
        }
    })
}
