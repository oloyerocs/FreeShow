// Audio input device selection and gain control for BibleFlow transcription.
// Settings are persisted via the same electron-store mechanism FreeShow uses.

export interface AudioInputSettings {
    deviceId: string    // empty string = system default
    gainDb: number      // decibels, -40 to +40, default 0
}

const DEFAULT_SETTINGS: AudioInputSettings = {
    deviceId: "",
    gainDb: 0,
}

export class AudioInputManager {
    private settings: AudioInputSettings
    private gainNode: GainNode | null = null
    private audioCtx: AudioContext | null = null
    private onSettingsChange: (s: AudioInputSettings) => void

    constructor(initial: Partial<AudioInputSettings> = {}, onSettingsChange: (s: AudioInputSettings) => void = () => {}) {
        this.settings = { ...DEFAULT_SETTINGS, ...initial }
        this.onSettingsChange = onSettingsChange
    }

    getSettings(): Readonly<AudioInputSettings> {
        return { ...this.settings }
    }

    setDevice(deviceId: string) {
        this.settings = { ...this.settings, deviceId }
        this.onSettingsChange(this.settings)
    }

    setGain(gainDb: number) {
        const clamped = Math.max(-40, Math.min(40, gainDb))
        this.settings = { ...this.settings, gainDb: clamped }
        if (this.gainNode) this.gainNode.gain.value = this._dbToLinear(clamped)
        this.onSettingsChange(this.settings)
    }

    /** Attach a GainNode from an active AudioContext to apply live gain changes */
    attachGainNode(ctx: AudioContext, node: GainNode) {
        this.audioCtx = ctx
        this.gainNode = node
        this.gainNode.gain.value = this._dbToLinear(this.settings.gainDb)
    }

    detach() {
        this.gainNode = null
        this.audioCtx = null
    }

    static async listDevices(): Promise<MediaDeviceInfo[]> {
        if (typeof navigator === "undefined" || !navigator.mediaDevices) return []
        const devices = await navigator.mediaDevices.enumerateDevices()
        return devices.filter((d) => d.kind === "audioinput")
    }

    private _dbToLinear(db: number): number {
        return Math.pow(10, db / 20)
    }
}
