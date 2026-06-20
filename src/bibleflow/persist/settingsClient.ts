// Renderer-side client for BibleFlow persistent settings.
// Calls ipcRenderer.invoke(BIBLEFLOW_SETTINGS, ...) via window.api.

import { BIBLEFLOW_SETTINGS } from "../../types/Channels"
import type { BibleFlowPersistedSettings } from "./BibleFlowSettings"

export async function loadSettings(): Promise<BibleFlowPersistedSettings> {
    return (window as any).api.invoke(BIBLEFLOW_SETTINGS, { op: "get" })
}

export async function saveSettings(partial: Partial<BibleFlowPersistedSettings>): Promise<void> {
    await (window as any).api.invoke(BIBLEFLOW_SETTINGS, { op: "set", data: partial })
}
