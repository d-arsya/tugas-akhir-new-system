// Fonts and images for the PDF receipt (`resources/views/download/transaction-download.blade.php`).
//
// The blade pulls Poppins from Google Fonts with `enable_remote => true`, and dompdf caches what it
// fetched under `storage/fonts/` — `poppins_300`, `poppins_normal`, `poppins_500`, `poppins_600`
// and `poppins_bold`. Those five files are the exact faces the legacy PDF embeds, so they are the
// ones copied into `apps/api/src/assets/receipt/fonts` rather than a fresh download that might be a
// different Poppins release. The two images come from `public/assets/images`, which the blade
// reaches through `public_path()`.
//
// `webpack.config.js` copies `./src/assets` into `dist/apps/api/assets`, so the built bundle finds
// them next to `main.js`; the other candidates cover running from the repo root, the same
// fallback list `mailer.service.ts:133-136` uses for its templates.

import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { Font } from "@react-pdf/renderer"

export const FONT_FAMILY = "Poppins"

const CANDIDATE_DIRS: readonly string[] = [
	join(__dirname, "assets", "receipt"),
	join(__dirname, "..", "assets", "receipt"),
	join(process.cwd(), "dist", "apps", "api", "assets", "receipt"),
	join(process.cwd(), "apps", "api", "src", "assets", "receipt"),
]

let assetDir: string | null = null

const resolveAssetDir = (): string => {
	if (assetDir !== null) return assetDir
	const found = CANDIDATE_DIRS.find((dir) => existsSync(join(dir, "Watermark.png")))
	if (!found) {
		throw new Error(`Receipt assets not found. Looked in: ${CANDIDATE_DIRS.join(", ")}`)
	}
	assetDir = found
	return found
}

const images = new Map<string, Buffer>()

/** `public_path('/assets/images/…')` — the bytes, so the renderer never touches the filesystem twice. */
export const receiptImage = (file: string): { data: Buffer; format: "png" } => {
	const cached = images.get(file)
	if (cached) return { data: cached, format: "png" }
	const data = readFileSync(join(resolveAssetDir(), file))
	images.set(file, data)
	return { data, format: "png" }
}

let registered = false

/**
 * Registers the five Poppins faces and switches hyphenation off.
 *
 * react-pdf hyphenates on its own by default, so a wrapped `MUHAFFIZHATIL` would come out as
 * `MUHAF-FIZHATIL`. dompdf never hyphenates, and the school's name is the one string on this
 * document long enough to wrap, so the callback returns the word whole.
 */
export const registerReceiptFonts = (): void => {
	if (registered) return
	const dir = resolveAssetDir()
	Font.register({
		family: FONT_FAMILY,
		fonts: [
			{ src: join(dir, "fonts", "Poppins-300.ttf"), fontWeight: 300 },
			{ src: join(dir, "fonts", "Poppins-400.ttf"), fontWeight: 400 },
			{ src: join(dir, "fonts", "Poppins-500.ttf"), fontWeight: 500 },
			{ src: join(dir, "fonts", "Poppins-600.ttf"), fontWeight: 600 },
			{ src: join(dir, "fonts", "Poppins-700.ttf"), fontWeight: 700 },
		],
	})
	Font.registerHyphenationCallback((word) => [word])
	registered = true
}
