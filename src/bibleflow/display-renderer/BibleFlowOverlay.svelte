<script lang="ts">
    import { onDestroy, onMount } from "svelte"
    import { fade } from "svelte/transition"
    import { BIBLEFLOW } from "../../types/Channels"
    import { DEFAULT_THEME, type BibleFlowTheme, type BibleFlowVerseMessage } from "../config"
    import { receive, destroy } from "../../frontend/utils/request"

    const LISTENER_ID = "bibleflow-overlay"

    let verse: BibleFlowVerseMessage | null = null
    let theme: BibleFlowTheme = DEFAULT_THEME

    onMount(() => {
        receive(
            BIBLEFLOW,
            {
                BIBLEFLOW_VERSE: (data: BibleFlowVerseMessage | null) => {
                    verse = data
                    if (data?.theme) theme = { ...DEFAULT_THEME, ...data.theme }
                    else theme = DEFAULT_THEME
                },
            },
            LISTENER_ID
        )
    })

    onDestroy(() => {
        destroy(BIBLEFLOW, LISTENER_ID)
    })

    function positionStyle(t: BibleFlowTheme): string {
        const base = `padding: ${t.padding}px; opacity: ${t.opacity}; background: ${t.background}; color: ${t.color}; font-size: ${t.fontSize}px; font-family: ${t.fontFamily};`
        if (t.position === "top") return base + " top: 0; left: 0; right: 0;"
        if (t.position === "center") return base + " top: 50%; left: 0; right: 0; transform: translateY(-50%);"
        return base + " bottom: 0; left: 0; right: 0;"
    }
</script>

{#if verse}
    <div class="bibleflow-overlay" style={positionStyle(theme)} transition:fade={{ duration: 300 }}>
        <p class="bibleflow-text">{verse.text}</p>
        <p class="bibleflow-reference">{verse.reference} · {verse.translation}</p>
    </div>
{/if}

<style>
    .bibleflow-overlay {
        position: absolute;
        z-index: 100;
        box-sizing: border-box;
        pointer-events: none;
    }

    .bibleflow-text {
        margin: 0 0 0.4em;
        line-height: 1.3;
        font-weight: 500;
    }

    .bibleflow-reference {
        margin: 0;
        font-size: 0.6em;
        opacity: 0.85;
        font-style: italic;
    }
</style>
