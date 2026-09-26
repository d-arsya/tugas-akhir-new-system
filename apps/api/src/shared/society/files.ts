import { createHash, randomBytes } from "crypto"

import type { StorageService } from "../../core/storage/storage.service"

import type { SocietyUpload } from "./society-rules"

// OWNER: AK-A. Legacy `UploadTraits::uploadFile` and `storage_url()` for the society attachments, with the
// key format of `modules/admin/setting/admin-school.service.ts` (`datePath` + `uploadName`, STORAGE_TEST_PREFIX).

// Legacy app timezone (config/app.php): `Carbon::now()->format('Y/m/d/')` builds the folder
const TIMEZONE = "Asia/Jakarta"

/** `Carbon::now()->format('Y/m/d/')` in the legacy timezone. */
const datePath = (): string => {
	const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(
		new Date(),
	)
	return `${parts.replaceAll("-", "/")}/`
}

/** `md5(pathinfo($name, PATHINFO_FILENAME) . Str::random(5)) . '.' . getClientOriginalExtension()` */
const uploadName = (originalName: string): string => {
	const dot = originalName.lastIndexOf(".")
	const base = dot > 0 ? originalName.slice(0, dot) : originalName
	const extension = dot > 0 ? originalName.slice(dot + 1) : ""
	const random = randomBytes(4).toString("base64url").slice(0, 5)
	const hash = createHash("md5").update(`${base}${random}`).digest("hex")
	return extension ? `${hash}.${extension}` : hash
}

/**
 * Display URL for a stored attachment (`storage_url()`, `Helper.php:999`): a full URL (PSB portal rows) as-is,
 * a relative legacy key (`2023/11/06/<md5>.jpeg`, a leading `storage/` stripped) under the S3 bucket, empty → null.
 * Reads `AWS_S3_URL` / `AWS_S3_BUCKET` from the environment the ConfigModule loaded.
 */
export const societyFileUrl = (value: string | null): string | null => {
	if (!value) return null
	if (/^https?:\/\//i.test(value)) return value
	const base = (process.env["AWS_S3_URL"] ?? "").replace(/\/+$/, "")
	const bucket = process.env["AWS_S3_BUCKET"] ?? ""
	const key = value.replace(/^\/?storage\//, "").replace(/^\/+/, "")
	return base && bucket ? `${base}/${bucket}/${key}` : key
}

/**
 * Legacy `UploadTraits::uploadFile`: store under `Y/m/d/<md5>.<ext>` and return that relative key (the column
 * keeps the key, never a URL — the psb and santri apps read it raw). `STORAGE_TEST_PREFIX` is set only by the
 * scratch runners, to keep test uploads in a throwaway folder.
 */
export const storeSocietyUpload = async (storage: StorageService, upload: SocietyUpload): Promise<string> => {
	const prefix = process.env["STORAGE_TEST_PREFIX"] ?? ""
	const key = `${prefix}${datePath()}${uploadName(upload.originalname)}`
	await storage.uploadBuffer(upload.buffer, key, upload.mimetype)
	return key
}
