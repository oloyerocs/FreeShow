<script lang="ts">
    import ActiveVerseDisplay from "./ActiveVerseDisplay.svelte"
    import BroadcastControls from "./BroadcastControls.svelte"
    import SermonNotes from "./SermonNotes.svelte"
    import ThemeDesigner from "./ThemeDesigner.svelte"
    import TranscriptionControls from "./TranscriptionControls.svelte"
    import TranslationStore from "./TranslationStore.svelte"
    import VerseQueue from "./VerseQueue.svelte"

    type Tab = "live" | "translations" | "theme"
    let activeTab: Tab = "live"
</script>

<div class="bibleflow-panel">
    <!-- Left sidebar: mic + broadcast controls -->
    <aside class="sidebar">
        <div class="logo-bar">
            <span class="logo-text">Bible<strong>Flow</strong></span>
        </div>

        <TranscriptionControls />
        <BroadcastControls />
        <ActiveVerseDisplay />

        <div class="spacer" />

        <SermonNotes />
    </aside>

    <!-- Main area: tabbed content -->
    <main class="main-area">
        <nav class="tabs">
            <button class:active={activeTab === "live"}         on:click={() => (activeTab = "live")}>Live queue</button>
            <button class:active={activeTab === "translations"} on:click={() => (activeTab = "translations")}>Translations</button>
            <button class:active={activeTab === "theme"}        on:click={() => (activeTab = "theme")}>Theme</button>
        </nav>

        <div class="tab-body">
            {#if activeTab === "live"}
                <VerseQueue />
            {:else if activeTab === "translations"}
                <TranslationStore />
            {:else if activeTab === "theme"}
                <ThemeDesigner />
            {/if}
        </div>
    </main>
</div>

<style>
    .bibleflow-panel {
        display: flex;
        height: 100%;
        overflow: hidden;
        background: var(--primary);
        color: var(--text);
    }

    /* Sidebar */
    .sidebar {
        width: 240px;
        flex-shrink: 0;
        border-right: 1px solid var(--primary-lighter);
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        overflow-x: hidden;
    }
    .logo-bar {
        padding: 10px 12px 8px;
        border-bottom: 1px solid var(--primary-lighter);
        background: var(--primary-darker);
    }
    .logo-text {
        font-size: 1em;
        color: var(--text);
        letter-spacing: 0.04em;
    }
    .logo-text strong { color: var(--secondary); }
    .spacer { flex: 1; }

    /* Main area */
    .main-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    /* Tabs */
    .tabs {
        display: flex;
        border-bottom: 1px solid var(--primary-lighter);
        flex-shrink: 0;
    }
    .tabs button {
        padding: 8px 16px;
        background: transparent;
        border: none;
        border-bottom: 2px solid transparent;
        color: var(--text-light);
        cursor: pointer;
        font-size: 0.82em;
        white-space: nowrap;
    }
    .tabs button.active {
        color: var(--text);
        border-bottom-color: var(--secondary);
    }
    .tabs button:hover:not(.active) { color: var(--text); }

    .tab-body {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
</style>
