import { describe, it, expect, vi, afterEach } from "vitest"
import { HttpApiServer } from "./HttpApiServer"

const TOKEN = "test-secret"

async function startServer(handler = vi.fn(() => ({ mode: "manual" }))) {
    const srv = new HttpApiServer({ port: 0, token: TOKEN }, handler)
    // port 0 = OS-assigned; we'll override with a fixed test port
    const fixed = new HttpApiServer({ port: 47999, token: TOKEN }, handler)
    await fixed.start()
    return { server: fixed, handler }
}

describe("HttpApiServer", () => {
    let server: HttpApiServer

    afterEach(async () => {
        if (server?.isListening()) await server.stop()
    })

    it("starts and reports listening", async () => {
        const h = vi.fn(() => ({}))
        server = new HttpApiServer({ port: 47998, token: TOKEN }, h)
        await server.start()
        expect(server.isListening()).toBe(true)
    })

    it("rejects requests without auth token", async () => {
        const h = vi.fn(() => ({}))
        server = new HttpApiServer({ port: 47997, token: TOKEN }, h)
        await server.start()
        const res = await fetch("http://127.0.0.1:47997/status")
        expect(res.status).toBe(401)
    })

    it("returns status with valid token", async () => {
        const h = vi.fn(() => ({ mode: "auto" }))
        server = new HttpApiServer({ port: 47996, token: TOKEN }, h)
        await server.start()
        const res = await fetch("http://127.0.0.1:47996/status", {
            headers: { Authorization: `Bearer ${TOKEN}` },
        })
        expect(res.status).toBe(200)
        const body = await res.json() as { mode?: string }
        expect(body.mode).toBe("auto")
    })

    it("handles /clear command", async () => {
        const h = vi.fn(() => null)
        server = new HttpApiServer({ port: 47995, token: TOKEN }, h)
        await server.start()
        const res = await fetch("http://127.0.0.1:47995/clear", {
            method: "POST",
            headers: { Authorization: `Bearer ${TOKEN}` },
        })
        expect(res.status).toBe(200)
        expect(h).toHaveBeenCalledWith({ type: "clear" })
    })

    it("stops cleanly", async () => {
        const h = vi.fn(() => ({}))
        server = new HttpApiServer({ port: 47994, token: TOKEN }, h)
        await server.start()
        await server.stop()
        expect(server.isListening()).toBe(false)
    })
})
