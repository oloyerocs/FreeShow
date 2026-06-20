<script lang="ts">
    import { activeVerse, clearDisplay } from "./bibleflowPanelStore"
</script>

<section class="active-verse" class:has-verse={!!$activeVerse}>
    <h3>On screen now</h3>
    {#if $activeVerse}
        <div class="verse-card live">
            <span class="ref">{$activeVerse.reference}</span>
            <span class="trans">{$activeVerse.translation}</span>
            <p class="text">{$activeVerse.text || "—"}</p>
            <button class="clear" on:click={clearDisplay} aria-label="Clear display">✕</button>
        </div>
    {:else}
        <p class="empty">Nothing on screen</p>
    {/if}
</section>

<style>
    .active-verse {
        padding: 10px;
        border-bottom: 1px solid var(--primary-lighter);
    }
    h3 {
        font-size: 0.75em;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-light);
        margin: 0 0 8px;
    }
    .verse-card {
        position: relative;
        padding: 8px 30px 8px 10px;
        border-radius: 6px;
        background: var(--primary-darker);
        border-left: 3px solid var(--secondary);
    }
    .verse-card.live {
        border-left-color: #27ae60;
    }
    .ref {
        font-weight: 700;
        font-size: 0.9em;
        color: var(--text);
    }
    .trans {
        font-size: 0.75em;
        color: var(--text-light);
        margin-left: 6px;
    }
    .text {
        margin: 4px 0 0;
        font-size: 0.82em;
        color: var(--text);
        line-height: 1.4;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .clear {
        position: absolute;
        top: 6px;
        right: 6px;
        background: none;
        border: none;
        color: var(--text-light);
        cursor: pointer;
        font-size: 0.8em;
        line-height: 1;
        padding: 2px 4px;
    }
    .clear:hover { color: #e74c3c; }
    .empty {
        font-size: 0.82em;
        color: var(--text-light);
        margin: 0;
    }
</style>
