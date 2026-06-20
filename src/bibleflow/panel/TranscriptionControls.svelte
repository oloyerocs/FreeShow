<script lang="ts">
    import {
        transcriptionStatus,
        transcriptionProvider,
        transcriptionError,
        selectedDeviceId,
        onTranscriptSegment,
        type TranscriptionProvider,
    } from "./bibleflowPanelStore"

    let devices: MediaDeviceInfo[] = []
    let adapter: any = null
    let deepgramApiKey = ""
    let showKey = false

    // Load saved Deepgram key on mount
    ;(async () => {
        try {
            const saved = await (window as any).api.invoke("BIBLEFLOW_SETTINGS", { op: "get" })
            if (saved?.deepgramApiKey) deepgramApiKey = saved.deepgramApiKey
        } catch { /* offline / test */ }
    })()

    async function saveDeepgramKey() {
        try {
            await (window as any).api.invoke("BIBLEFLOW_SETTINGS", { op: "set", data: { deepgramApiKey } })
        } catch { /* non-fatal */ }
    }

    async function loadDevices() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            stream.getTracks().forEach((t) => t.stop())
            const all = await navigator.mediaDevices.enumerateDevices()
            devices = all.filter((d) => d.kind === "audioinput")
            if (!$selectedDeviceId && devices[0]) selectedDeviceId.set(devices[0].deviceId)
        } catch {
            devices = []
        }
    }

    $: if (typeof window !== "undefined") loadDevices()

    async function buildAdapter(provider: TranscriptionProvider) {
        if (provider === "whisper") {
            const { WhisperAdapter } = await import("../transcription-adapter/WhisperAdapter")
            return new WhisperAdapter()
        }
        const { DeepgramAdapter } = await import("../transcription-adapter/DeepgramAdapter")
        return new DeepgramAdapter(deepgramApiKey)
    }

    async function start() {
        if ($transcriptionProvider === "deepgram" && !deepgramApiKey.trim()) {
            transcriptionError.set("Enter your Deepgram API key before starting.")
            return
        }
        transcriptionError.set(null)
        transcriptionStatus.set("running")
        try {
            adapter = await buildAdapter($transcriptionProvider)
            await adapter.start($selectedDeviceId, onTranscriptSegment)
        } catch (err: any) {
            transcriptionStatus.set("error")
            transcriptionError.set(err?.message ?? "Failed to start transcription")
            adapter = null
        }
    }

    async function stop() {
        if (adapter) {
            await adapter.stop()
            adapter = null
        }
        transcriptionStatus.set("idle")
    }

    function toggle() {
        if ($transcriptionStatus === "running") stop()
        else start()
    }
</script>

<section class="transcription-controls">
    <h3>Transcription</h3>

    <div class="row">
        <select bind:value={$transcriptionProvider} disabled={$transcriptionStatus === "running"}>
            <option value="whisper">Whisper (local, free)</option>
            <option value="deepgram">Deepgram (cloud — requires API key)</option>
        </select>
    </div>

    {#if $transcriptionProvider === "deepgram"}
        <div class="row key-row">
            <label for="dgkey">Deepgram API key</label>
            <div class="key-input-wrap">
                {#if showKey}
                    <input
                        id="dgkey"
                        type="text"
                        bind:value={deepgramApiKey}
                        on:blur={saveDeepgramKey}
                        placeholder="dg_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        disabled={$transcriptionStatus === "running"}
                        autocomplete="off"
                        spellcheck="false"
                    />
                {:else}
                    <input
                        id="dgkey"
                        type="password"
                        bind:value={deepgramApiKey}
                        on:blur={saveDeepgramKey}
                        placeholder="Enter Deepgram API key"
                        disabled={$transcriptionStatus === "running"}
                        autocomplete="off"
                    />
                {/if}
                <button class="eye" title={showKey ? "Hide" : "Show"} on:click={() => showKey = !showKey} tabindex="-1">
                    {showKey ? "🙈" : "👁"}
                </button>
            </div>
            <p class="key-hint">
                Get a free key at <strong>deepgram.com</strong> — required only for cloud transcription.
            </p>
        </div>
    {/if}

    {#if devices.length}
        <div class="row">
            <select bind:value={$selectedDeviceId} disabled={$transcriptionStatus === "running"}>
                {#each devices as d}
                    <option value={d.deviceId}>{d.label || "Microphone"}</option>
                {/each}
            </select>
        </div>
    {/if}

    <button
        class="start-btn"
        class:running={$transcriptionStatus === "running"}
        on:click={toggle}
        disabled={$transcriptionStatus === "error"}
    >
        {#if $transcriptionStatus === "running"}
            <span class="dot" />  Stop listening
        {:else}
            Start listening
        {/if}
    </button>

    {#if $transcriptionError}
        <p class="error">{$transcriptionError}</p>
    {/if}
</section>

<style>
    .transcription-controls {
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
    .row { margin-bottom: 6px; }
    select {
        width: 100%;
        background: var(--primary-darker);
        color: var(--text);
        border: 1px solid var(--primary-lighter);
        border-radius: 4px;
        padding: 4px 6px;
        font-size: 0.82em;
    }
    .key-row { display: flex; flex-direction: column; gap: 4px; }
    .key-row label { font-size: 0.75em; color: var(--text-light); }
    .key-input-wrap { display: flex; gap: 4px; }
    .key-input-wrap input {
        flex: 1;
        background: var(--primary-darker);
        color: var(--text);
        border: 1px solid var(--primary-lighter);
        border-radius: 4px;
        padding: 4px 6px;
        font-size: 0.78em;
        font-family: monospace;
    }
    .key-input-wrap input:focus { outline: none; border-color: var(--secondary); }
    .eye {
        background: var(--primary-darker);
        border: 1px solid var(--primary-lighter);
        border-radius: 4px;
        cursor: pointer;
        padding: 2px 5px;
        font-size: 0.85em;
    }
    .key-hint { font-size: 0.7em; color: var(--text-light); margin: 0; }
    .key-hint strong { color: var(--text); }
    .start-btn {
        width: 100%;
        padding: 6px;
        border-radius: 4px;
        border: none;
        background: var(--secondary);
        color: #fff;
        cursor: pointer;
        font-size: 0.85em;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        margin-top: 4px;
    }
    .start-btn.running { background: #c0392b; }
    .start-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .dot {
        width: 8px; height: 8px;
        border-radius: 50%;
        background: #fff;
        animation: pulse 1s ease-in-out infinite;
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
    }
    .error { margin: 4px 0 0; font-size: 0.75em; color: #e74c3c; }
</style>
