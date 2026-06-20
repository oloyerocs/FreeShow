import { parseReferences, formatReference } from "./BibleReferenceParser"
import type { DetectedVerse } from "../broadcast/BroadcastController"

let _idCounter = 0
function newId() { return `vd-${Date.now()}-${++_idCounter}` }

export interface VerseDetectorOptions {
    defaultTranslation?: string
    minConfidence?: number
}

export class VerseDetector {
    private opts: Required<VerseDetectorOptions>

    constructor(opts: VerseDetectorOptions = {}) {
        this.opts = {
            defaultTranslation: opts.defaultTranslation ?? "KJV",
            minConfidence: opts.minConfidence ?? 0.5,
        }
    }

    detect(transcriptText: string): DetectedVerse[] {
        const refs = parseReferences(transcriptText)
        return refs
            .filter((r) => r.confidence >= this.opts.minConfidence)
            .map((r) => ({
                id: newId(),
                reference: formatReference(r),
                text: "", // populated later by bible store lookup
                translation: this.opts.defaultTranslation,
                confidence: r.confidence,
                detectedAt: Date.now(),
            }))
    }
}
