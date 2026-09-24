// Fonts and images for the PDF agreement (`resources/views/download/capability-download.blade.php`).
//
// The blade pulls Poppins from Google Fonts with `enable_remote => true`, and dompdf caches what it
// fetched under `storage/fonts/`. Dumping the fonts the legacy render actually embeds shows four:
// `Poppins-Regular`, `Poppins-Medium`, `Poppins-SemiBold` — and **`Helvetica-Oblique`**, because the
// cached family has no italic face, so every `.text-italic` value on the agreement (the parent's
// name, address, job and phone; the santri's name and school) falls back to a base-14 PDF font
// rather than to italic Poppins. That is reproduced here rather than corrected: it is what the
// document the school hands out looks like.
//
// The Poppins faces are the ones already copied into `apps/api/src/assets/receipt/fonts` for the
// payment receipt — the same five files, from the same dompdf cache — so they are reused rather
// than duplicated. The watermark is `public/assets/images/capability-bg.png`, which the blade
// reaches through `public_path()`.
//
// `webpack.config.js` copies `./src/assets` into `dist/apps/api/assets`, so the built bundle finds
// both next to `main.js`; the other candidates cover running from the repo root.

import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { Font } from "@react-pdf/renderer"

export const FONT_FAMILY = "Poppins"
/** What `.text-italic` resolves to in the legacy render — a standard PDF font, not Poppins. */
export const ITALIC_FAMILY = "Helvetica"

const candidates = (leaf: string): readonly string[] => [
	join(__dirname, "assets", leaf),
	join(__dirname, "..", "assets", leaf),
	join(process.cwd(), "dist", "apps", "api", "assets", leaf),
	join(process.cwd(), "apps", "api", "src", "assets", leaf),
]

const resolved = new Map<string, string>()

const assetDir = (leaf: string, probe: string): string => {
	const cached = resolved.get(leaf)
	if (cached !== undefined) return cached
	const dirs = candidates(leaf)
	const found = dirs.find((dir) => existsSync(join(dir, probe)))
	if (!found) throw new Error(`Capability assets not found. Looked in: ${dirs.join(", ")}`)
	resolved.set(leaf, found)
	return found
}

let watermark: Buffer | null = null

/** `public_path('/assets/images/capability-bg.png')` — the pink strip down the left of every page. */
export const capabilityWatermark = (): { data: Buffer; format: "png" } => {
	watermark ??= readFileSync(join(assetDir("capability", "capability-bg.png"), "capability-bg.png"))
	return { data: watermark, format: "png" }
}

export type LogoSource = { src: { data: Buffer; format: "png" | "jpg" }; width: number; height: number }

/**
 * The school logo, sized as dompdf sizes an `<img>` with no dimensions: its natural pixel size at
 * `"dpi" => 96`, i.e. 0.75pt per pixel. react-pdf would otherwise lay a bitmap out at one point per
 * pixel, a third larger than legacy. The format and size are read off the file's own header; a
 * file that is neither PNG nor JPEG returns null and the caller falls back to the brand heading,
 * exactly as the blade's `@else` does when there is no logo.
 */
export const logoSource = (data: Buffer): LogoSource | null => {
	const pt = (pixels: number): number => (pixels * 72) / 96
	// PNG: signature, then the IHDR chunk's width and height at bytes 16-23
	if (data.length > 24 && data.readUInt32BE(0) === 0x89504e47) {
		return { src: { data, format: "png" }, width: pt(data.readUInt32BE(16)), height: pt(data.readUInt32BE(20)) }
	}
	// JPEG: walk the markers to the first start-of-frame, which carries height then width
	if (data.length > 4 && data[0] === 0xff && data[1] === 0xd8) {
		let offset = 2
		while (offset + 9 < data.length && data[offset] === 0xff) {
			const marker = data[offset + 1] ?? 0
			const length = data.readUInt16BE(offset + 2)
			if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
				return {
					src: { data, format: "jpg" },
					width: pt(data.readUInt16BE(offset + 7)),
					height: pt(data.readUInt16BE(offset + 5)),
				}
			}
			offset += 2 + length
		}
	}
	return null
}

let registered = false

/**
 * Registers the Poppins faces the agreement uses and switches hyphenation off.
 *
 * react-pdf hyphenates on its own by default, so a wrapped `MUHAFFIZHATIL` would come out as
 * `MUHAF-FIZHATIL`. dompdf never hyphenates, and the school's name is the one string on this
 * document long enough to wrap, so the callback returns the word whole.
 *
 * Registering the same family twice with identical sources is a no-op, so this is safe to call
 * alongside the receipt's own registration in the same process.
 */
export const registerCapabilityFonts = (): void => {
	if (registered) return
	const dir = join(assetDir("receipt", "Watermark.png"), "fonts")
	Font.register({
		family: FONT_FAMILY,
		fonts: [
			{ src: join(dir, "Poppins-300.ttf"), fontWeight: 300 },
			{ src: join(dir, "Poppins-400.ttf"), fontWeight: 400 },
			{ src: join(dir, "Poppins-500.ttf"), fontWeight: 500 },
			{ src: join(dir, "Poppins-600.ttf"), fontWeight: 600 },
			{ src: join(dir, "Poppins-700.ttf"), fontWeight: 700 },
		],
	})
	Font.registerHyphenationCallback((word) => [word])
	registered = true
}
