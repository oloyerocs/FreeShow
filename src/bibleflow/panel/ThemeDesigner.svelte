<script lang="ts">
    import { writable } from "svelte/store"
    import { DEFAULT_THEME } from "../config"
    import type { BibleFlowTheme } from "../config"
    import { exportTheme, importTheme } from "../theme-designer/ThemeSchema"

    let theme = writable<BibleFlowTheme>({ ...DEFAULT_THEME })

    // Live preview verse
    const PREVIEW_REF  = "John 3:16"
    const PREVIEW_TEXT = "For God so loved the world, that he gave his only begotten Son…"
    const PREVIEW_TRANS = "KJV"

    type Position = BibleFlowTheme["position"]
    function setPosition(pos: string) { theme.update((t) => ({ ...t, position: pos as Position })) }
    function reset() { theme.set({ ...DEFAULT_THEME }) }

    function doExport() {
        const json = exportTheme({ version: 1, ...$theme })
        const a = document.createElement("a")
        a.href = URL.createObjectURL(new Blob([json], { type: "application/json" }))
        a.download = "bibleflow-theme.json"
        a.click()
    }

    function doImport() {
        const input = document.createElement("input")
        input.type = "file"
        input.accept = ".json,application/json"
        input.onchange = async () => {
            const file = input.files?.[0]
            if (!file) return
            try {
                const text = await file.text()
                const imported = importTheme(text)
                theme.set({ ...DEFAULT_THEME, ...imported })
            } catch (e: any) {
                alert("Import failed: " + (e?.message ?? "Invalid file"))
            }
        }
        input.click()
    }

    $: overlayStyle = [
        `background: ${$theme.background}`,
        `color: ${$theme.color}`,
        `font-size: ${$theme.fontSize}px`,
        `font-family: ${$theme.fontFamily}`,
        `padding: ${$theme.padding}px`,
        `opacity: ${$theme.opacity}`,
    ].join(";")

    $: containerStyle = (() => {
        const pos = $theme.position
        if (pos === "top")    return "align-items: flex-start;"
        if (pos === "center") return "align-items: center;"
        return "align-items: flex-end;"
    })()
</script>

<div class="designer">
    <!-- Live preview -->
    <div class="preview-wrap">
        <div class="preview-screen" style={containerStyle}>
            <div class="preview-verse" style={overlayStyle}>
                <span class="pv-ref">{PREVIEW_REF}</span>
                <span class="pv-sep"> — </span>
                <span class="pv-text">{PREVIEW_TEXT}</span>
                <span class="pv-trans"> ({PREVIEW_TRANS})</span>
            </div>
        </div>
        <p class="preview-label">Preview (scaled)</p>
    </div>

    <!-- Controls -->
    <div class="controls">
        <div class="row-2">
            <label class="control">
                <span>Background</span>
                <input type="color" value={$theme.background.startsWith("rgba") ? "#000000" : $theme.background}
                    on:input={(e) => theme.update((t) => ({ ...t, background: e.currentTarget.value }))} />
                <input type="text" class="text-input" bind:value={$theme.background}
                    placeholder="rgba(0,0,0,0.7)" />
            </label>
            <label class="control">
                <span>Text color</span>
                <input type="color" bind:value={$theme.color}
                    on:input={(e) => theme.update((t) => ({ ...t, color: e.currentTarget.value }))} />
                <input type="text" class="text-input" bind:value={$theme.color} />
            </label>
        </div>

        <label class="control">
            <span>Font size <em>{$theme.fontSize}px</em></span>
            <input type="range" min="16" max="96" step="2" bind:value={$theme.fontSize} />
        </label>

        <label class="control">
            <span>Font family</span>
            <select bind:value={$theme.fontFamily}>
                <option value="sans-serif">Sans-serif</option>
                <option value="serif">Serif</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="monospace">Monospace</option>
            </select>
        </label>

        <label class="control">
            <span>Padding <em>{$theme.padding}px</em></span>
            <input type="range" min="8" max="80" step="4" bind:value={$theme.padding} />
        </label>

        <label class="control">
            <span>Opacity <em>{Math.round($theme.opacity * 100)}%</em></span>
            <input type="range" min="0" max="1" step="0.05" bind:value={$theme.opacity} />
        </label>

        <label class="control">
            <span>Position</span>
            <div class="btn-group">
                {#each ["top", "center", "bottom"] as pos}
                    <button
                        class:active={$theme.position === pos}
                        on:click={() => setPosition(pos)}
                    >{pos}</button>
                {/each}
            </div>
        </label>

        <div class="action-row">
            <button class="action-btn" on:click={doImport}>Import</button>
            <button class="action-btn" on:click={doExport}>Export</button>
            <button class="action-btn ghost" on:click={reset}>Reset</button>
        </div>
    </div>
</div>

<style>
    .designer {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow-y: auto;
    }

    /* Preview */
    .preview-wrap {
        flex-shrink: 0;
        background: #111;
        position: relative;
    }
    .preview-screen {
        width: 100%;
        aspect-ratio: 16/9;
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow: hidden;
        position: relative;
    }
    .preview-verse {
        width: 100%;
        box-sizing: border-box;
        line-height: 1.35;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        transform: scale(0.45);
        transform-origin: left center;
        width: 222%;
    }
    .pv-ref  { font-weight: 700; }
    .pv-trans { opacity: 0.7; font-size: 0.75em; }
    .preview-label {
        text-align: center;
        font-size: 0.7em;
        color: var(--text-light);
        margin: 4px 0 0;
        padding-bottom: 6px;
    }

    /* Controls */
    .controls {
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
    }
    .control {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 0.8em;
        color: var(--text);
    }
    .control span { color: var(--text-light); }
    .control em { color: var(--secondary); font-style: normal; margin-left: 5px; }
    .control input[type="range"] { width: 100%; accent-color: var(--secondary); }
    .control input[type="color"] {
        width: 32px; height: 24px; border: none; border-radius: 4px;
        cursor: pointer; padding: 0; background: none;
    }
    .text-input {
        flex: 1;
        background: var(--primary-darker);
        border: 1px solid var(--primary-lighter);
        border-radius: 4px;
        padding: 3px 6px;
        color: var(--text);
        font-size: 0.9em;
        font-family: monospace;
    }
    select {
        background: var(--primary-darker);
        color: var(--text);
        border: 1px solid var(--primary-lighter);
        border-radius: 4px;
        padding: 4px 6px;
        font-size: 0.9em;
    }
    .btn-group {
        display: flex;
        gap: 4px;
    }
    .btn-group button {
        flex: 1;
        padding: 4px 0;
        border: 1px solid var(--primary-lighter);
        border-radius: 4px;
        background: transparent;
        color: var(--text);
        cursor: pointer;
        text-transform: capitalize;
        font-size: 0.85em;
    }
    .btn-group button.active {
        background: var(--secondary);
        border-color: var(--secondary);
        color: #fff;
    }
    .action-row {
        display: flex;
        gap: 6px;
        margin-top: 4px;
    }
    .action-btn {
        flex: 1;
        padding: 6px 0;
        border: none;
        border-radius: 5px;
        background: var(--secondary);
        color: #fff;
        font-size: 0.82em;
        cursor: pointer;
    }
    .action-btn.ghost {
        background: transparent;
        border: 1px solid var(--primary-lighter);
        color: var(--text-light);
    }
    .action-btn:hover { opacity: 0.85; }
</style>
