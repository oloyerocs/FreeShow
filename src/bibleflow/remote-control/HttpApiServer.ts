// Local-only HTTP REST API for remote control of BibleFlow.
// Token auth (Bearer), binds to 127.0.0.1 only.
// Requires Node.js http module — runs in Electron main process.

import { createServer, type IncomingMessage, type ServerResponse, type Server } from "node:http"
import type { BibleFlowVerseMessage } from "../config"

export interface HttpApiConfig {
    port?: number   // default 47921
    token: string   // shared secret; set by user, stored in OS keychain
}

export type HttpApiCommand =
    | { type: "send"; verse: BibleFlowVerseMessage }
    | { type: "clear" }
    | { type: "status" }
    | { type: "queue_approve"; id: string }

export type CommandHandler = (cmd: HttpApiCommand) => unknown

export class HttpApiServer {
    private server: Server | null = null
    private config: Required<HttpApiConfig>
    private handler: CommandHandler

    constructor(config: HttpApiConfig, handler: CommandHandler) {
        this.config = { port: config.port ?? 47921, token: config.token }
        this.handler = handler
    }

    start(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server = createServer((req, res) => this._handle(req, res))
            this.server.listen(this.config.port, "127.0.0.1", () => resolve())
            this.server.once("error", reject)
        })
    }

    stop(): Promise<void> {
        return new Promise((resolve) => {
            if (!this.server) return resolve()
            this.server.close(() => resolve())
            this.server = null
        })
    }

    isListening(): boolean {
        return this.server?.listening ?? false
    }

    private _authenticate(req: IncomingMessage): boolean {
        const auth = req.headers["authorization"] ?? ""
        return auth === `Bearer ${this.config.token}`
    }

    private _handle(req: IncomingMessage, res: ServerResponse) {
        if (!this._authenticate(req)) {
            res.writeHead(401, { "Content-Type": "application/json" })
            res.end(JSON.stringify({ error: "Unauthorized" }))
            return
        }

        const url = req.url ?? "/"
        const method = req.method ?? "GET"

        if (method === "GET" && url === "/status") {
            const result = this.handler({ type: "status" })
            res.writeHead(200, { "Content-Type": "application/json" })
            res.end(JSON.stringify(result))
            return
        }

        if (method === "POST") {
            let body = ""
            req.on("data", (chunk: Buffer) => { body += chunk.toString() })
            req.on("end", () => {
                let data: Record<string, unknown> = {}
                try { data = body ? JSON.parse(body) : {} } catch {
                    res.writeHead(400, { "Content-Type": "application/json" })
                    res.end(JSON.stringify({ error: "Invalid JSON" }))
                    return
                }
                let cmd: HttpApiCommand | null = null
                if (url === "/send" && data.verse) cmd = { type: "send", verse: data.verse as BibleFlowVerseMessage }
                else if (url === "/clear") cmd = { type: "clear" }
                else if (url === "/queue/approve" && data.id) cmd = { type: "queue_approve", id: data.id as string }

                if (!cmd) {
                    res.writeHead(404, { "Content-Type": "application/json" })
                    res.end(JSON.stringify({ error: "Not found" }))
                    return
                }
                const result = this.handler(cmd)
                res.writeHead(200, { "Content-Type": "application/json" })
                res.end(JSON.stringify({ ok: true, result: result ?? null }))
            })
            return
        }

        res.writeHead(404, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ error: "Not found" }))
    }
}
