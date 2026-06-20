// Offline licence key generator for BibleFlow.
// Run as a script: npx ts-node src/bibleflow/licensing/generateKey.ts [count]
// Keys are format-validated by LicenseManager; the online validator stub
// accepts any correctly-formatted key — replace with a real server call
// once you have a backend.

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

export function generateKey(): string {
    const seg = (len: number) =>
        Array.from({ length: len }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("")
    return `BF${seg(2)}-${seg(4)}-${seg(4)}-${seg(4)}`
}

// CLI entry point
if (typeof process !== "undefined" && process.argv[1]?.endsWith("generateKey.ts")) {
    const count = parseInt(process.argv[2] ?? "1", 10)
    for (let i = 0; i < count; i++) console.log(generateKey())
}
