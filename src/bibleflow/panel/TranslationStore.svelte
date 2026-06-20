<script lang="ts">
    import { ALL_TRANSLATIONS } from "../translations/BibleStore"
    import { transcriptionProvider } from "./bibleflowPanelStore"

    // Active translation — persisted via BIBLEFLOW_SETTINGS
    let activeTranslation = "KJV"
    let loaded = false

    async function load() {
        try {
            const saved = await (window as any).api.invoke("BIBLEFLOW_SETTINGS", { op: "get" })
            if (saved?.activeTranslation) activeTranslation = saved.activeTranslation
        } catch { /* offline / test */ }
        loaded = true
    }

    async function select(id: string) {
        activeTranslation = id
        try {
            await (window as any).api.invoke("BIBLEFLOW_SETTINGS", { op: "set", data: { activeTranslation: id } })
        } catch { /* non-fatal */ }
    }

    load()
</script>

<div class="store">
    <div class="store-header">
        <h2>Translations</h2>
        <p class="sub">All translations are free. Select the one to display with detected verses.</p>
    </div>

    <ul class="list">
        {#each ALL_TRANSLATIONS as t}
            <li
                class="row"
                class:active={activeTranslation === t.id}
                role="button"
                tabindex="0"
                on:click={() => select(t.id)}
                on:keydown={(e) => e.key === "Enter" && select(t.id)}
            >
                <div class="meta">
                    <span class="name">{t.name}</span>
                    <span class="note">{t.note}</span>
                </div>
                <span class="badge">{t.id}</span>
                {#if activeTranslation === t.id}
                    <span class="check">✓</span>
                {/if}
            </li>
        {/each}
    </ul>

    <p class="footnote">
        Verse text is fetched from <strong>bible-api.com</strong> — no account required.<br/>
        Deepgram (cloud transcription) is the only feature that requires an external account.
        {#if $transcriptionProvider === "deepgram"}
            Enter your Deepgram API key in the <strong>Transcription</strong> panel on the left.
        {/if}
    </p>
</div>

<style>
    .store {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        height: 100%;
        overflow-y: auto;
    }
    .store-header h2 { font-size: 1.05em; margin: 0 0 4px; color: var(--text); }
    .sub { font-size: 0.78em; color: var(--text-light); margin: 0; }

    .list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        border-radius: 8px;
        background: var(--primary-darker);
        border: 1px solid var(--primary-lighter);
        cursor: pointer;
        transition: border-color 0.15s;
    }
    .row:hover { border-color: var(--secondary); }
    .row.active { border-color: var(--secondary); background: color-mix(in srgb, var(--secondary) 10%, var(--primary-darker)); }
    .meta { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .name { font-size: 0.88em; font-weight: 600; color: var(--text); }
    .note { font-size: 0.72em; color: var(--text-light); }
    .badge {
        font-size: 0.72em;
        font-family: monospace;
        background: var(--primary-lighter);
        border-radius: 4px;
        padding: 2px 6px;
        color: var(--text-light);
        flex-shrink: 0;
    }
    .check { color: var(--secondary); font-size: 1em; flex-shrink: 0; }
    .footnote { font-size: 0.72em; color: var(--text-light); line-height: 1.7; margin: 0; }
    .footnote strong { color: var(--text); }
</style>
