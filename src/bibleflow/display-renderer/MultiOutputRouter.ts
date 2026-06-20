// Routes BibleFlow verse messages to one or more output targets.
// Main Output reuses FreeShow's existing BIBLEFLOW IPC channel (FR-01).
// Alternate Output is an independently configurable secondary target (e.g. NDI virtual, second display).

import type { BibleFlowVerseMessage } from "../config"

export type OutputTarget = "main" | "alternate" | "both"

export interface AlternateOutputConfig {
    enabled: boolean
    // Future: NDI source name, virtual output device, etc.
    label: string
}

export type SendVerseToMain = (verse: BibleFlowVerseMessage | null) => void
export type SendVerseToAlternate = (verse: BibleFlowVerseMessage | null) => void

export class MultiOutputRouter {
    private target: OutputTarget = "main"
    private altConfig: AlternateOutputConfig = { enabled: false, label: "Alternate" }
    private sendMain: SendVerseToMain
    private sendAlternate: SendVerseToAlternate

    constructor(sendMain: SendVerseToMain, sendAlternate: SendVerseToAlternate) {
        this.sendMain = sendMain
        this.sendAlternate = sendAlternate
    }

    setTarget(target: OutputTarget) {
        this.target = target
    }

    setAlternateConfig(cfg: AlternateOutputConfig) {
        this.altConfig = cfg
    }

    send(verse: BibleFlowVerseMessage | null) {
        if (this.target === "main" || this.target === "both") this.sendMain(verse)
        if ((this.target === "alternate" || this.target === "both") && this.altConfig.enabled) this.sendAlternate(verse)
    }

    getTarget(): OutputTarget { return this.target }
    getAlternateConfig(): Readonly<AlternateOutputConfig> { return { ...this.altConfig } }
}
