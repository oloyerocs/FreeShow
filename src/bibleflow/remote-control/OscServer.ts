// OSC/UDP remote control for BibleFlow.
// Listens on a configurable UDP port (default 57121).
// Commands: /bibleflow/send, /bibleflow/clear, /bibleflow/approve
// Runs in Electron main process (Node.js dgram).

import { createSocket, type Socket } from "node:dgram"
import type { HttpApiCommand } from "./HttpApiServer"

export interface OscServerConfig {
    port?: number   // default 57121
    host?: string   // default "0.0.0.0"
}

export type OscCommandHandler = (cmd: HttpApiCommand) => void

// Minimal OSC packet decoder — handles string + optional string argument
function decodeOscString(buf: Buffer, offset: number): [string, number] {
    const end = buf.indexOf(0, offset)
    const str = buf.slice(offset, end).toString("utf8")
    const padded = end + 1 + (4 - ((end + 1) % 4)) % 4
    return [str, padded]
}

function parseOscPacket(buf: Buffer): { address: string; args: string[] } | null {
    try {
        const [address, after] = decodeOscString(buf, 0)
        if (!address.startsWith("/")) return null
        const [typetag, argsStart] = decodeOscString(buf, after)
        const args: string[] = []
        let pos = argsStart
        for (let i = 1; i < typetag.length; i++) {
            if (typetag[i] === "s") {
                const [s, next] = decodeOscString(buf, pos)
                args.push(s)
                pos = next
            }
        }
        return { address, args }
    } catch {
        return null
    }
}

export class OscServer {
    private socket: Socket | null = null
    private config: Required<OscServerConfig>
    private handler: OscCommandHandler

    constructor(config: OscServerConfig, handler: OscCommandHandler) {
        this.config = { port: config.port ?? 57121, host: config.host ?? "0.0.0.0" }
        this.handler = handler
    }

    start(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket = createSocket("udp4")
            this.socket.on("message", (msg) => this._onMessage(msg))
            this.socket.on("error", (err) => console.error("[BibleFlow OSC]", err))
            this.socket.bind(this.config.port, this.config.host, () => resolve())
            this.socket.once("error", reject)
        })
    }

    stop(): Promise<void> {
        return new Promise((resolve) => {
            if (!this.socket) return resolve()
            this.socket.close(() => resolve())
            this.socket = null
        })
    }

    isListening(): boolean {
        return this.socket !== null
    }

    private _onMessage(msg: Buffer) {
        const packet = parseOscPacket(msg)
        if (!packet) return

        if (packet.address === "/bibleflow/clear") {
            this.handler({ type: "clear" })
        } else if (packet.address === "/bibleflow/approve" && packet.args[0]) {
            this.handler({ type: "queue_approve", id: packet.args[0] })
        } else if (packet.address === "/bibleflow/send") {
            // args: reference, text, translation
            const [reference = "", text = "", translation = "KJV"] = packet.args
            if (reference && text) this.handler({ type: "send", verse: { reference, text, translation } })
        }
    }
}
