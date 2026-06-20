<script lang="ts">
    import { queue, broadcastMode, approve, dismissVerse } from "./bibleflowPanelStore"

    function confidenceColor(c: number): string {
        if (c >= 0.85) return "#27ae60"
        if (c >= 0.6) return "#f39c12"
        return "#e74c3c"
    }
</script>

<section class="verse-queue">
    <h3>Detected verses <span class="count">{$queue.length}</span></h3>

    {#if $queue.length === 0}
        <p class="empty">No verses detected yet</p>
    {:else}
        <ul>
            {#each $queue as v (v.id)}
                <li class="verse-row">
                    <div class="meta">
                        <span class="ref">{v.reference}</span>
                        <span class="trans">{v.translation}</span>
                        <span class="confidence" style="color: {confidenceColor(v.confidence)}">
                            {Math.round(v.confidence * 100)}%
                        </span>
                    </div>
                    <div class="actions">
                        {#if $broadcastMode === "manual"}
                            <button class="approve" on:click={() => approve(v.id)} title="Send to screen">▶</button>
                        {/if}
                        <button class="dismiss" on:click={() => dismissVerse(v.id)} title="Remove from queue">✕</button>
                    </div>
                </li>
            {/each}
        </ul>
    {/if}
</section>

<style>
    .verse-queue {
        padding: 10px;
        flex: 1;
        overflow-y: auto;
    }
    h3 {
        font-size: 0.75em;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-light);
        margin: 0 0 8px;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .count {
        background: var(--secondary);
        color: #fff;
        border-radius: 10px;
        padding: 0 6px;
        font-size: 0.9em;
        min-width: 18px;
        text-align: center;
    }
    .empty {
        font-size: 0.82em;
        color: var(--text-light);
        margin: 0;
    }
    ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    .verse-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 7px 8px;
        border-radius: 5px;
        background: var(--primary-darker);
        border: 1px solid var(--primary-lighter);
    }
    .meta {
        display: flex;
        align-items: baseline;
        gap: 6px;
        min-width: 0;
    }
    .ref {
        font-weight: 700;
        font-size: 0.88em;
        color: var(--text);
        white-space: nowrap;
    }
    .trans {
        font-size: 0.72em;
        color: var(--text-light);
    }
    .confidence {
        font-size: 0.72em;
        font-weight: 600;
    }
    .actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
    }
    button {
        border: none;
        border-radius: 4px;
        padding: 3px 8px;
        cursor: pointer;
        font-size: 0.8em;
        line-height: 1;
    }
    .approve {
        background: var(--secondary);
        color: #fff;
    }
    .approve:hover { opacity: 0.85; }
    .dismiss {
        background: transparent;
        color: var(--text-light);
        border: 1px solid var(--primary-lighter);
    }
    .dismiss:hover { color: #e74c3c; border-color: #e74c3c; }
</style>
