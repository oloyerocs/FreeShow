// Central reactive state for the BibleFlow control panel.
// BroadcastController lives here so the panel and all sub-components
// share the same instance. Settings are persisted via IPC on every change.

import { writable, derived } from "svelte/store"
import { BroadcastController } from "../broadcast/BroadcastController"
import type { DetectedVerse, BroadcastMode } from "../broadcast/BroadcastController"
import type { BibleFlowVerseMessage } from "../config"
import { BIBLEFLOW } from "../../types/Channels"
import type { BibleFlowPersistedSettings } from "../persist/BibleFlowSettings"

// ---------- IPC helpers ----------
function sendToOutput(verse: BibleFlowVerseMessage | null) {
    window.api.send(BIBLEFLOW, { type: "BIBLEFLOW_VERSE", verse })
}

async function loadRemote(): Promise<BibleFlowPersistedSettings | null> {
    try { return await (window as any).api.invoke("BIBLEFLOW_SETTINGS", { op: "get" }) }
    catch { return null }
}

async function saveRemote(partial: Partial<BibleFlowPersistedSettings>) {
    try { await (window as any).api.invoke("BIBLEFLOW_SETTINGS", { op: "set", data: partial }) }
    catch { /* non-fatal — settings just won't persist this session */ }
}

// ---------- BroadcastController ----------
export const controller = new BroadcastController(sendToOutput)

// ---------- Reactive stores ----------
export const broadcastState = writable(controller.getState())

export function refresh() {
    broadcastState.set(controller.getState())
}

// ---------- Settings hydration (called once by BibleFlowPanel on mount) ----------
export async function hydrate() {
    const saved = await loadRemote()
    if (!saved) return
    if (saved.broadcastMode) controller.setMode(saved.broadcastMode)
    if (saved.cooldownMs != null) controller.setCooldown(saved.cooldownMs)
    if (saved.confidenceThreshold != null) controller.setThreshold(saved.confidenceThreshold)
    if (saved.transcriptionProvider) transcriptionProvider.set(saved.transcriptionProvider)
    if (saved.audioDeviceId) selectedDeviceId.set(saved.audioDeviceId)
    refresh()
}

// ---------- Transcription ----------
export type TranscriptionProvider = "deepgram" | "whisper"
export type TranscriptionStatus = "idle" | "running" | "error"

export const transcriptionProvider = writable<TranscriptionProvider>("whisper")
export const transcriptionStatus = writable<TranscriptionStatus>("idle")
export const transcriptionError = writable<string | null>(null)
export const selectedDeviceId = writable<string>("")

// persist transcription prefs on change
transcriptionProvider.subscribe((v) => saveRemote({ transcriptionProvider: v }))
selectedDeviceId.subscribe((v) => { if (v) saveRemote({ audioDeviceId: v }) })

// ---------- Transcript + detected verses ----------
export const transcriptLines = writable<string[]>([])
export const lastTranscriptSegment = writable<string>("")

export function onTranscriptSegment(text: string) {
    transcriptLines.update((lines) => [...lines, text])
    lastTranscriptSegment.set(text)
    detectAndEnqueue(text)
}

let _detect: ((text: string) => DetectedVerse[]) | null = null
async function detectAndEnqueue(text: string) {
    if (!_detect) {
        const { VerseDetector } = await import("../verse-detection/VerseDetector")
        const vd = new VerseDetector()
        _detect = (t) => vd.detect(t)
    }
    const verses = _detect(text)
    for (const v of verses) {
        controller.enqueue(v)
        refresh()
    }
}

// ---------- Broadcast actions ----------
export function setMode(mode: BroadcastMode) {
    controller.setMode(mode)
    refresh()
    saveRemote({ broadcastMode: mode })
}

export function setCooldown(ms: number) {
    controller.setCooldown(ms)
    refresh()
    saveRemote({ cooldownMs: ms })
}

export function setThreshold(value: number) {
    controller.setThreshold(value)
    refresh()
    saveRemote({ confidenceThreshold: value })
}

export function approve(id: string) {
    controller.approve(id)
    refresh()
}

export function dismissVerse(id: string) {
    controller.dequeue(id)
    refresh()
}

export function clearDisplay() {
    controller.clearDisplay()
    refresh()
}

// ---------- Derived helpers ----------
export const queue = derived(broadcastState, ($s) => $s.queue)
export const activeVerse = derived(broadcastState, ($s) => $s.active)
export const broadcastMode = derived(broadcastState, ($s) => $s.mode)
