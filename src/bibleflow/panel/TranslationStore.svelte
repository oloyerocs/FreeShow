<script lang="ts">
    import { LicenseManager, InMemoryLicenseStore } from "../licensing/LicenseManager"
    import { BibleStore } from "../translations/BibleStore"
    import { onMount } from "svelte"

    // In production this store would be backed by electron-store.
    // The LicenseManager is shared with BibleStore via module-level singleton.
    const licenseStore = new InMemoryLicenseStore()

    async function onlineValidator(key: string, translationId: string): Promise<boolean> {
        // Stub — replace with real licence-server call in production.
        // Format is already validated before this is called.
        return key.startsWith("BF") && translationId.length > 0
    }

    const mgr = new LicenseManager(licenseStore, onlineValidator)

    const TRANSLATIONS = [
        { id: "KJV",  name: "King James Version",         free: true  },
        { id: "ASV",  name: "American Standard Version",  free: true  },
        { id: "NIV",  name: "New International Version",  free: false },
        { id: "ESV",  name: "English Standard Version",   free: false },
        { id: "NLT",  name: "New Living Translation",     free: false },
    ]

    let keyInputs: Record<string, string> = { NIV: "", ESV: "", NLT: "" }
    let statuses: Record<string, "idle" | "activating" | "ok" | "error"> = {}
    let errors: Record<string, string> = {}
    let licensed: Record<string, boolean> = {}

    function refresh() {
        TRANSLATIONS.forEach((t) => {
            licensed[t.id] = t.free || mgr.isLicensed(t.id)
        })
        licensed = { ...licensed }
    }

    onMount(refresh)

    async function activate(translationId: string) {
        const key = keyInputs[translationId]?.trim()
        if (!key) {
            errors[translationId] = "Enter a license key"
            errors = { ...errors }
            return
        }
        statuses[translationId] = "activating"
        statuses = { ...statuses }
        errors[translationId] = ""
        errors = { ...errors }

        const result = await mgr.activate(key, translationId)
        if (result.ok) {
            statuses[translationId] = "ok"
            keyInputs[translationId] = ""
            keyInputs = { ...keyInputs }
            refresh()
        } else {
            statuses[translationId] = "error"
            errors[translationId] = result.error ?? "Activation failed"
            errors = { ...errors }
        }
        setTimeout(() => {
            if (statuses[translationId] !== "activating") {
                statuses[translationId] = "idle"
                statuses = { ...statuses }
            }
        }, 3000)
    }

    function revoke(translationId: string) {
        mgr.revoke(translationId)
        refresh()
    }
</script>

<div class="store">
    <div class="store-header">
        <h2>Translations</h2>
        <p class="sub">Public-domain translations are free. Licensed translations require a key.</p>
    </div>

    <ul class="translation-list">
        {#each TRANSLATIONS as t}
            <li class="translation-row" class:licensed={licensed[t.id]}>
                <div class="info">
                    <span class="name">{t.name}</span>
                    <span class="id-badge">{t.id}</span>
                    {#if t.free}
                        <span class="tag free">Free</span>
                    {:else if licensed[t.id]}
                        <span class="tag active">Licensed ✓</span>
                    {:else}
                        <span class="tag locked">Locked</span>
                    {/if}
                </div>

                {#if !t.free}
                    {#if licensed[t.id]}
                        <button class="revoke-btn" on:click={() => revoke(t.id)}>Revoke</button>
                    {:else}
                        <div class="activate-row">
                            <input
                                type="text"
                                placeholder="BFXX-XXXX-XXXX-XXXX"
                                bind:value={keyInputs[t.id]}
                                class:error-input={statuses[t.id] === "error"}
                                on:keydown={(e) => e.key === "Enter" && activate(t.id)}
                            />
                            <button
                                class="activate-btn"
                                class:success={statuses[t.id] === "ok"}
                                class:fail={statuses[t.id] === "error"}
                                disabled={statuses[t.id] === "activating"}
                                on:click={() => activate(t.id)}
                            >
                                {statuses[t.id] === "activating" ? "…" : statuses[t.id] === "ok" ? "✓" : "Activate"}
                            </button>
                        </div>
                        {#if errors[t.id]}
                            <p class="err-msg">{errors[t.id]}</p>
                        {/if}
                    {/if}
                {/if}
            </li>
        {/each}
    </ul>

    <p class="footnote">
        Keys are validated online at activation and cached for offline use.<br/>
        Format: <code>BFXX-XXXX-XXXX-XXXX</code>
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
    .store-header h2 {
        font-size: 1.05em;
        margin: 0 0 4px;
        color: var(--text);
    }
    .sub {
        font-size: 0.78em;
        color: var(--text-light);
        margin: 0;
    }
    .translation-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .translation-row {
        padding: 12px 14px;
        border-radius: 8px;
        background: var(--primary-darker);
        border: 1px solid var(--primary-lighter);
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .translation-row.licensed {
        border-color: #27ae60;
    }
    .info {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }
    .name {
        font-weight: 600;
        font-size: 0.9em;
        color: var(--text);
    }
    .id-badge {
        font-size: 0.72em;
        background: var(--primary-lighter);
        border-radius: 4px;
        padding: 1px 6px;
        color: var(--text-light);
        font-family: monospace;
    }
    .tag {
        font-size: 0.7em;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .free   { background: #1a4a2e; color: #4ade80; }
    .active { background: #1a3a1a; color: #27ae60; }
    .locked { background: #3a1a1a; color: #e06060; }

    .activate-row {
        display: flex;
        gap: 6px;
    }
    input[type="text"] {
        flex: 1;
        background: var(--primary);
        border: 1px solid var(--primary-lighter);
        border-radius: 5px;
        padding: 5px 8px;
        color: var(--text);
        font-size: 0.82em;
        font-family: monospace;
        letter-spacing: 0.05em;
    }
    input.error-input { border-color: #e74c3c; }
    .activate-btn {
        padding: 5px 14px;
        border: none;
        border-radius: 5px;
        background: var(--secondary);
        color: #fff;
        font-size: 0.82em;
        cursor: pointer;
        white-space: nowrap;
        flex-shrink: 0;
    }
    .activate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .activate-btn.success  { background: #27ae60; }
    .activate-btn.fail     { background: #c0392b; }
    .revoke-btn {
        align-self: flex-start;
        padding: 3px 10px;
        border: 1px solid var(--primary-lighter);
        border-radius: 4px;
        background: transparent;
        color: var(--text-light);
        font-size: 0.75em;
        cursor: pointer;
    }
    .revoke-btn:hover { color: #e74c3c; border-color: #e74c3c; }
    .err-msg {
        font-size: 0.75em;
        color: #e74c3c;
        margin: 0;
    }
    .footnote {
        font-size: 0.72em;
        color: var(--text-light);
        line-height: 1.6;
        margin: 0;
    }
    code {
        font-family: monospace;
        background: var(--primary-darker);
        padding: 1px 5px;
        border-radius: 3px;
    }
</style>
