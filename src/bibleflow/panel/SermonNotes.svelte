<script lang="ts">
    import { transcriptLines } from "./bibleflowPanelStore"
    import { SermonNotesManager } from "../sermon-notes/SermonNotesManager"

    const mgr = new SermonNotesManager(async (transcript, refs) => {
        // placeholder — wire a real AI fn here in production
        return `# Sermon Outline\n\n${refs.map((r) => `- ${r}`).join("\n")}\n\n---\n${transcript.slice(0, 300)}...`
    })

    let outline = ""
    let generating = false

    $: {
        // keep manager in sync with transcript store
        if ($transcriptLines.length) {
            mgr.appendTranscript($transcriptLines[$transcriptLines.length - 1])
        }
    }

    async function generate() {
        generating = true
        try {
            outline = await mgr.generateOutline()
        } finally {
            generating = false
        }
    }

    function exportMd() {
        const content = mgr.exportMarkdown()
        download(content, "sermon-notes.md", "text/markdown")
    }

    function exportTxt() {
        const content = mgr.exportPlainText()
        download(content, "sermon-notes.txt", "text/plain")
    }

    function download(content: string, filename: string, type: string) {
        const a = document.createElement("a")
        a.href = URL.createObjectURL(new Blob([content], { type }))
        a.download = filename
        a.click()
    }
</script>

<section class="sermon-notes">
    <div class="header">
        <h3>Sermon notes</h3>
        <div class="export-btns">
            <button on:click={exportMd} title="Export Markdown">MD</button>
            <button on:click={exportTxt} title="Export plain text">TXT</button>
        </div>
    </div>

    <div class="transcript-box">
        {#if $transcriptLines.length === 0}
            <span class="empty">Transcript will appear here…</span>
        {:else}
            {#each $transcriptLines as line}
                <p>{line}</p>
            {/each}
        {/if}
    </div>

    <button class="generate-btn" on:click={generate} disabled={generating || $transcriptLines.length === 0}>
        {generating ? "Generating…" : "Generate outline"}
    </button>

    {#if outline}
        <pre class="outline">{outline}</pre>
    {/if}
</section>

<style>
    .sermon-notes {
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        border-top: 1px solid var(--primary-lighter);
    }
    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    h3 {
        font-size: 0.75em;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-light);
        margin: 0;
    }
    .export-btns {
        display: flex;
        gap: 4px;
    }
    .export-btns button {
        padding: 2px 7px;
        border: 1px solid var(--primary-lighter);
        border-radius: 4px;
        background: transparent;
        color: var(--text-light);
        cursor: pointer;
        font-size: 0.72em;
    }
    .export-btns button:hover { background: var(--primary-lighter); }
    .transcript-box {
        max-height: 120px;
        overflow-y: auto;
        background: var(--primary-darker);
        border: 1px solid var(--primary-lighter);
        border-radius: 4px;
        padding: 6px 8px;
        font-size: 0.78em;
        color: var(--text);
        line-height: 1.5;
    }
    .transcript-box p { margin: 0 0 2px; }
    .empty { color: var(--text-light); }
    .generate-btn {
        padding: 5px;
        border: none;
        border-radius: 4px;
        background: var(--secondary);
        color: #fff;
        cursor: pointer;
        font-size: 0.82em;
    }
    .generate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .outline {
        white-space: pre-wrap;
        font-size: 0.78em;
        background: var(--primary-darker);
        border: 1px solid var(--primary-lighter);
        border-radius: 4px;
        padding: 8px;
        color: var(--text);
        max-height: 200px;
        overflow-y: auto;
        margin: 0;
    }
</style>
