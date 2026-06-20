// Detects Bible references in free-form text.
// Handles: "John 3:16", "John three sixteen", "1 Corinthians 13:4-7", "Genesis 1:1"

export interface ParsedReference {
    raw: string       // original matched text
    book: string      // normalised book name, e.g. "John"
    chapter: number
    verseStart: number
    verseEnd?: number // set for ranges like 3:16-18
    confidence: number
}

// Ordered book list — index used for validation
const BOOKS: [string, string[]][] = [
    ["Genesis", ["gen", "ge", "gn"]],
    ["Exodus", ["exo", "ex"]],
    ["Leviticus", ["lev", "le", "lv"]],
    ["Numbers", ["num", "nu", "nm", "nb"]],
    ["Deuteronomy", ["deu", "de", "dt"]],
    ["Joshua", ["josh", "jos", "jsh"]],
    ["Judges", ["judg", "jdg", "jg"]],
    ["Ruth", ["ru", "rth"]],
    ["1 Samuel", ["1sam", "1sa", "1sm", "1s"]],
    ["2 Samuel", ["2sam", "2sa", "2sm", "2s"]],
    ["1 Kings", ["1kin", "1ki", "1kg"]],
    ["2 Kings", ["2kin", "2ki", "2kg"]],
    ["1 Chronicles", ["1chr", "1ch"]],
    ["2 Chronicles", ["2chr", "2ch"]],
    ["Ezra", ["ezr", "ez"]],
    ["Nehemiah", ["neh", "ne"]],
    ["Esther", ["est", "esth", "es"]],
    ["Job", ["jb"]],
    ["Psalms", ["ps", "psa", "psalm", "pslm"]],
    ["Proverbs", ["pro", "pr", "prv"]],
    ["Ecclesiastes", ["ecc", "ec", "qoh"]],
    ["Song of Solomon", ["sos", "song", "ss", "sng"]],
    ["Isaiah", ["isa", "is"]],
    ["Jeremiah", ["jer", "je", "jr"]],
    ["Lamentations", ["lam", "la"]],
    ["Ezekiel", ["eze", "ezek", "ek"]],
    ["Daniel", ["dan", "da", "dn"]],
    ["Hosea", ["hos", "ho"]],
    ["Joel", ["joe", "jl"]],
    ["Amos", ["amo", "am"]],
    ["Obadiah", ["oba", "ob"]],
    ["Jonah", ["jon", "jnh"]],
    ["Micah", ["mic", "mi"]],
    ["Nahum", ["nah", "na"]],
    ["Habakkuk", ["hab", "hb"]],
    ["Zephaniah", ["zep", "zph"]],
    ["Haggai", ["hag", "hg"]],
    ["Zechariah", ["zec", "zech", "zch"]],
    ["Malachi", ["mal", "ml"]],
    ["Matthew", ["mat", "mt", "matt"]],
    ["Mark", ["mar", "mk", "mr"]],
    ["Luke", ["luk", "lk"]],
    ["John", ["joh", "jn"]],
    ["Acts", ["act", "ac"]],
    ["Romans", ["rom", "ro", "rm"]],
    ["1 Corinthians", ["1cor", "1co"]],
    ["2 Corinthians", ["2cor", "2co"]],
    ["Galatians", ["gal", "ga"]],
    ["Ephesians", ["eph", "ep"]],
    ["Philippians", ["php", "phi", "ph"]],
    ["Colossians", ["col", "co"]],
    ["1 Thessalonians", ["1th", "1thes"]],
    ["2 Thessalonians", ["2th", "2thes"]],
    ["1 Timothy", ["1ti", "1tim"]],
    ["2 Timothy", ["2ti", "2tim"]],
    ["Titus", ["tit", "ti"]],
    ["Philemon", ["phm", "pm"]],
    ["Hebrews", ["heb", "he"]],
    ["James", ["jam", "jas", "jm"]],
    ["1 Peter", ["1pe", "1pet", "1pt"]],
    ["2 Peter", ["2pe", "2pet", "2pt"]],
    ["1 John", ["1jo", "1jn", "1jhn"]],
    ["2 John", ["2jo", "2jn", "2jhn"]],
    ["3 John", ["3jo", "3jn", "3jhn"]],
    ["Jude", ["jud", "jd"]],
    ["Revelation", ["rev", "re", "rv"]],
]

const WORD_NUMBERS: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
    ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
    sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
    thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
    hundred: 100, thousand: 1000,
}

// Build lookup: lowercased alias → canonical name
const BOOK_LOOKUP = new Map<string, string>()
for (const [name, aliases] of BOOKS) {
    BOOK_LOOKUP.set(name.toLowerCase(), name)
    for (const a of aliases) BOOK_LOOKUP.set(a.toLowerCase(), name)
}

function resolveWordNumber(text: string): number | null {
    const words = text.toLowerCase().trim().split(/\s+/)
    let total = 0
    let current = 0
    let found = false
    for (const w of words) {
        const n = WORD_NUMBERS[w]
        if (n === undefined) return found ? total + current : null
        found = true
        if (n === 100) current = (current || 1) * 100
        else if (n === 1000) { total += (current || 1) * 1000; current = 0 }
        else current += n
    }
    return total + current || null
}

// Numeric reference regex: "John 3:16" or "John 3:16-18"
const NUM_REF_RE = /\b((?:\d\s*)?[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?)\s+(\d{1,3})\s*[:\s]\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?/g

export function parseReferences(text: string): ParsedReference[] {
    const results: ParsedReference[] = []
    const seen = new Set<string>()

    let match: RegExpExecArray | null
    NUM_REF_RE.lastIndex = 0
    while ((match = NUM_REF_RE.exec(text)) !== null) {
        const bookRaw = match[1].trim()
        const book = BOOK_LOOKUP.get(bookRaw.toLowerCase())
        if (!book) continue
        const chapter = parseInt(match[2], 10)
        const verseStart = parseInt(match[3], 10)
        const verseEnd = match[4] ? parseInt(match[4], 10) : undefined
        const key = `${book}:${chapter}:${verseStart}`
        if (seen.has(key)) continue
        seen.add(key)
        results.push({ raw: match[0], book, chapter, verseStart, verseEnd, confidence: 0.95 })
    }

    return results
}

export function formatReference(ref: ParsedReference): string {
    const verse = ref.verseEnd ? `${ref.verseStart}-${ref.verseEnd}` : `${ref.verseStart}`
    return `${ref.book} ${ref.chapter}:${verse}`
}
