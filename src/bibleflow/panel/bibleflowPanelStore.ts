// Central reactive state for the BibleFlow control panel.
// BroadcastController lives here so the panel and all sub-components
// share the same instance.

import { writable, derived, get } from "svelte/store"
import { BroadcastController } from "../broadcast/BroadcastController"
import type { DetectedVerse, BroadcastMode } from "../broadcast/BroadcastController"
import type { BibleFlowVerseMessage } from "../config"
import { BIBLEFLOW } from "../../types/Channels"

// ---------- IPC send helper ----------
function sendToOutput(verse: BibleFlowVerseMessage | null) {
    window.api.send(BIBLEFLOW, { type: "BIBLEFLOW_VERSE", verse })
}

// ---------- BroadcastController ----------
export const controller = new BroadcastController(sendToOutput)

// ---------- Reactive stores wrapping controller state ----------
// Re-exported snapshots that update when we mutate controller state.
// Components call refresh() after any mutation.

export const broadcastState = writable(controller.getState())

export function refresh() {
    broadcastState.set(controller.getState())
}

// ---------- Transcription ----------
export type TranscriptionProvider = "deepgram" | "whisper"
export type TranscriptionStatus = "idle" | "running" | "error"

export const transcriptionProvider = writable<TranscriptionProvider>("whisper")
export const transcriptionStatus = writable<TranscriptionStatus>("idle")
export const transcriptionError = writable<string | null>(null)
export const selectedDeviceId = writable<string>("")

// ---------- Transcript + detected verses ----------
export const transcriptLines = writable<string[]>([])
export const lastTranscriptSegment = writable<string>("")

export function onTranscriptSegment(text: string) {
    transcriptLines.update((lines) => [...lines, text])
    lastTranscriptSegment.set(text)
    // verse detection runs here (import lazily to avoid circular)
    detectAndEnqueue(text)
}

// Lazy verse detection to keep store import-order-safe
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

// ---------- Broadcast actions (called from UI) ----------
export function setMode(mode: BroadcastMode) {
    controller.setMode(mode)
    refresh()
}

export function setCooldown(ms: number) {
    controller.setCooldown(ms)
    refresh()
}

export function setThreshold(value: number) {
    controller.setThreshold(value)
    refresh()
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
