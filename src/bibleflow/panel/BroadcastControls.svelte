<script lang="ts">
    import { broadcastState, setMode, setCooldown, setThreshold, clearDisplay } from "./bibleflowPanelStore"

    $: mode = $broadcastState.mode
    $: cooldown = $broadcastState.cooldownMs
    $: threshold = $broadcastState.confidenceThreshold
</script>

<section class="broadcast-controls">
    <h3>Broadcast</h3>

    <div class="row">
        <button class="mode-btn" class:active={mode === "manual"} on:click={() => setMode("manual")}>Manual</button>
        <button class="mode-btn" class:active={mode === "auto"} on:click={() => setMode("auto")}>Auto</button>
    </div>

    {#if mode === "auto"}
        <label>
            <span>Cooldown <em>{cooldown} ms</em></span>
            <input type="range" min="0" max="10000" step="250" value={cooldown}
                on:input={(e) => setCooldown(Number(e.currentTarget.value))} />
        </label>

        <label>
            <span>Min confidence <em>{Math.round(threshold * 100)}%</em></span>
            <input type="range" min="0" max="1" step="0.05" value={threshold}
                on:input={(e) => setThreshold(Number(e.currentTarget.value))} />
        </label>
    {/if}

    <button class="clear-btn" on:click={clearDisplay}>Clear display</button>
</section>

<style>
    .broadcast-controls {
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
    .row {
        display: flex;
        gap: 6px;
        margin-bottom: 10px;
    }
    .mode-btn {
        flex: 1;
        padding: 5px 0;
        border: 1px solid var(--primary-lighter);
        border-radius: 4px;
        background: transparent;
        color: var(--text);
        cursor: pointer;
        font-size: 0.85em;
    }
    .mode-btn.active {
        background: var(--secondary);
        border-color: var(--secondary);
        color: #fff;
    }
    label {
        display: flex;
        flex-direction: column;
        gap: 3px;
        margin-bottom: 8px;
        font-size: 0.8em;
        color: var(--text);
    }
    label em {
        color: var(--secondary);
        font-style: normal;
        margin-left: 6px;
    }
    input[type="range"] {
        width: 100%;
        accent-color: var(--secondary);
    }
    .clear-btn {
        width: 100%;
        margin-top: 4px;
        padding: 5px;
        border: 1px solid var(--primary-lighter);
        border-radius: 4px;
        background: transparent;
        color: var(--text-light);
        cursor: pointer;
        font-size: 0.8em;
    }
    .clear-btn:hover {
        background: var(--primary-lighter);
    }
</style>
