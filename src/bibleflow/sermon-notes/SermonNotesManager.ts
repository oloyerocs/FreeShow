// Sermon notes: raw transcript accumulation + AI-generated outline export.

export interface SermonNotes {
    sessionId: string
    startedAt: number
    transcript: string          // raw accumulated transcript
    aiOutline: string           // AI-generated markdown outline (populated by generateOutline)
    detectedReferences: string[]// verse references detected during session
}

export type AiOutlineFn = (transcript: string) => Promise<string>

export class SermonNotesManager {
    private notes: SermonNotes
    private aiOutlineFn: AiOutlineFn

    constructor(sessionId: string, aiOutlineFn: AiOutlineFn) {
        this.aiOutlineFn = aiOutlineFn
        this.notes = {
            sessionId,
            startedAt: Date.now(),
            transcript: "",
            aiOutline: "",
            detectedReferences: [],
        }
    }

    appendTranscript(text: string) {
        this.notes.transcript += (this.notes.transcript ? " " : "") + text.trim()
    }

    addReference(reference: string) {
        if (!this.notes.detectedReferences.includes(reference)) {
            this.notes.detectedReferences.push(reference)
        }
    }

    async generateOutline(): Promise<string> {
        this.notes.aiOutline = await this.aiOutlineFn(this.notes.transcript)
        return this.notes.aiOutline
    }

    exportMarkdown(): string {
        const date = new Date(this.notes.startedAt).toISOString().split("T")[0]
        const refs = this.notes.detectedReferences.length
            ? this.notes.detectedReferences.map((r) => `- ${r}`).join("\n")
            : "_None detected_"

        return [
            `# Sermon Notes — ${date}`,
            "",
            "## Detected Verse References",
            refs,
            "",
            "## AI-Generated Outline",
            this.notes.aiOutline || "_Not yet generated_",
            "",
            "## Raw Transcript",
            this.notes.transcript || "_No transcript yet_",
        ].join("\n")
    }

    exportPlainText(): string {
        return this.notes.transcript
    }

    getNotes(): Readonly<SermonNotes> {
        return { ...this.notes, detectedReferences: [...this.notes.detectedReferences] }
    }
}
