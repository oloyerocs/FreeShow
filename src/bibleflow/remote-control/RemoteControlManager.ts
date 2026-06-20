// Starts and stops the BibleFlow HTTP + OSC remote-control servers.
// Called once from the Electron main process after app is ready.
// The command handler is a thin bridge that fans commands back through
// the existing BIBLEFLOW IPC channel to the renderer/output windows.

import { HttpApiServer } from "./HttpApiServer"
import { OscServer } from "./OscServer"
import type { HttpApiCommand } from "./HttpApiServer"
import { randomBytes } from "node:crypto"

export interface RemoteControlConfig {
    httpPort?: number  // default 47921
    oscPort?: number   // default 57121
    token?: string     // auto-generated if not supplied
}

export class RemoteControlManager {
    private http: HttpApiServer
    private osc: OscServer
    readonly token: string

    constructor(
        config: RemoteControlConfig,
        private commandHandler: (cmd: HttpApiCommand) => unknown
    ) {
        this.token = config.token ?? randomBytes(24).toString("hex")
        this.http = new HttpApiServer({ port: config.httpPort, token: this.token }, commandHandler)
        this.osc  = new OscServer({ port: config.oscPort }, commandHandler)
    }

    async start(): Promise<void> {
        await this.http.start()
        await this.osc.start()
    }

    async stop(): Promise<void> {
        await this.http.stop()
        await this.osc.stop()
    }

    isRunning(): boolean {
        return this.http.isListening()
    }
}
