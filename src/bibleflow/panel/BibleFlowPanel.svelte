<script lang="ts">
    import ActiveVerseDisplay from "./ActiveVerseDisplay.svelte"
    import BroadcastControls from "./BroadcastControls.svelte"
    import SermonNotes from "./SermonNotes.svelte"
    import TranscriptionControls from "./TranscriptionControls.svelte"
    import VerseQueue from "./VerseQueue.svelte"
</script>

<div class="bibleflow-panel">
    <!-- Left sidebar: controls -->
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

    <!-- Main area: verse queue -->
    <main class="main-area">
        <VerseQueue />
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

    .logo-text strong {
        color: var(--secondary);
    }

    .spacer {
        flex: 1;
    }

    .main-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
</style>
