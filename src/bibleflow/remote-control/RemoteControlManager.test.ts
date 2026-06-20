import { describe, it, expect, vi, afterEach } from "vitest"
import { RemoteControlManager } from "./RemoteControlManager"

describe("RemoteControlManager", () => {
    const managers: RemoteControlManager[] = []

    afterEach(async () => {
        for (const m of managers) await m.stop().catch(() => {})
        managers.length = 0
    })

    it("auto-generates a token when none supplied", () => {
        const m = new RemoteControlManager({}, vi.fn())
        managers.push(m)
        expect(m.token).toMatch(/^[a-f0-9]{48}$/)
    })

    it("uses provided token", () => {
        const m = new RemoteControlManager({ token: "mytoken" }, vi.fn())
        managers.push(m)
        expect(m.token).toBe("mytoken")
    })

    it("is not running before start()", () => {
        const m = new RemoteControlManager({}, vi.fn())
        managers.push(m)
        expect(m.isRunning()).toBe(false)
    })

    it("starts and reports isRunning()", async () => {
        const m = new RemoteControlManager({ httpPort: 47930, oscPort: 57130 }, vi.fn())
        managers.push(m)
        await m.start()
        expect(m.isRunning()).toBe(true)
    })

    it("stop() resolves cleanly", async () => {
        const m = new RemoteControlManager({ httpPort: 47931, oscPort: 57131 }, vi.fn())
        managers.push(m)
        await m.start()
        await expect(m.stop()).resolves.toBeUndefined()
        expect(m.isRunning()).toBe(false)
    })
})
