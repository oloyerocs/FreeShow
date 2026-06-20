import type { BibleFlowVerseMessage } from "../config"

export type BroadcastMode = "auto" | "manual"

export interface DetectedVerse {
    id: string
    reference: string
    text: string
    translation: string
    confidence: number // 0–1
    detectedAt: number // Date.now()
}

export interface BroadcastState {
    mode: BroadcastMode
    cooldownMs: number
    confidenceThreshold: number
    queue: DetectedVerse[]
    active: BibleFlowVerseMessage | null
    lastSentAt: number
}

export type SendFn = (verse: BibleFlowVerseMessage | null) => void

const DEFAULT_STATE: BroadcastState = {
    mode: "manual",
    cooldownMs: 2500,
    confidenceThreshold: 0.7,
    queue: [],
    active: null,
    lastSentAt: 0,
}

export class BroadcastController {
    private state: BroadcastState
    private sendFn: SendFn
    private autoTimer: ReturnType<typeof setTimeout> | null = null
    _now: () => number = () => Date.now()  // injectable for tests

    constructor(sendFn: SendFn, initial?: Partial<BroadcastState>) {
        this.sendFn = sendFn
        this.state = { ...DEFAULT_STATE, ...initial, queue: [...(initial?.queue ?? [])] }
    }

    getState(): Readonly<BroadcastState> {
        return { ...this.state, queue: [...this.state.queue] }
    }

    setMode(mode: BroadcastMode) {
        this.state.mode = mode
        if (mode === "auto") this._scheduleAutoSend()
    }

    setCooldown(ms: number) {
        this.state.cooldownMs = Math.max(0, ms)
    }

    setThreshold(threshold: number) {
        this.state.confidenceThreshold = Math.max(0, Math.min(1, threshold))
    }

    /** Called by verse-detection when a new candidate arrives */
    enqueue(verse: DetectedVerse) {
        // deduplicate by reference
        const exists = this.state.queue.some((v) => v.reference === verse.reference && v.translation === verse.translation)
        if (!exists) this.state.queue = [...this.state.queue, verse]

        if (this.state.mode === "auto") this._scheduleAutoSend()
    }

    /** Manual mode: operator picks a verse from the queue by id */
    approve(id: string) {
        const verse = this.state.queue.find((v) => v.id === id)
        if (!verse) return
        this._send(verse)
        this.dequeue(id)
    }

    dequeue(id: string) {
        this.state.queue = this.state.queue.filter((v) => v.id !== id)
    }

    clearQueue() {
        this.state.queue = []
    }

    clearDisplay() {
        this.state.active = null
        this.sendFn(null)
    }

    private _send(verse: DetectedVerse) {
        const msg: BibleFlowVerseMessage = {
            reference: verse.reference,
            text: verse.text,
            translation: verse.translation,
        }
        this.state.active = msg
        this.state.lastSentAt = this._now()
        this.sendFn(msg)
    }

    private _scheduleAutoSend() {
        if (this.autoTimer) return

        const candidates = this.state.queue.filter((v) => v.confidence >= this.state.confidenceThreshold)
        if (!candidates.length) return

        const elapsed = this._now() - this.state.lastSentAt
        const delay = Math.max(0, this.state.cooldownMs - elapsed)

        this.autoTimer = setTimeout(() => {
            this.autoTimer = null
            if (this.state.mode !== "auto") return
            // re-evaluate best at fire time so later-arriving higher-confidence verses win
            const current = this.state.queue.filter((v) => v.confidence >= this.state.confidenceThreshold)
            if (!current.length) return
            const best = current.reduce((a, b) => (b.confidence > a.confidence ? b : a))
            this._send(best)
            this.dequeue(best.id)
        }, delay)
    }

    destroy() {
        if (this.autoTimer) clearTimeout(this.autoTimer)
    }
}
