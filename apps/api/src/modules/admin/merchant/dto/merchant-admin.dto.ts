import { createZodDto } from "nestjs-zod"
import { z } from "zod"
import { blank } from "@admin/common/dto-fields"

// Legacy `StoreMerchantRequest` / `UpdateMerchantRequest`. The two differ only in the unique
// rule (`unique:merchants` vs `unique:merchants,email,{id}`), which zod cannot express — the
// service raises it with `throwFieldErrors({ email: ["Email sudah ada sebelumnya."] })`.
//
// `attributes()`: name => "nama lengkap", gender => "jenis kelamin", email => "email",
// merchant_name => "nama merchant", address => "alamat", phone => "nomor telepon",
// is_blocked => "status akun".

const text = (attr: string, label: string, max = 255) =>
	z
		.string({
			error: (issue) =>
				blank(issue.input) ? `Kolom ${attr} wajib untuk diisi.` : `${label} harus berupa string.`,
		})
		.min(1, `Kolom ${attr} wajib untuk diisi.`)
		.max(max, `${label} maksimal berisi ${max} karakter.`)

/** Legacy accepts any string; the port narrows it to the two the radios post (plan decision). */
const gender = z.enum(["male", "female"], {
	error: (issue) =>
		blank(issue.input) ? "Kolom jenis kelamin wajib untuk diisi." : "Jenis kelamin yang dipilih tidak valid.",
})

const email = z
	.email({
		error: (issue) =>
			blank(issue.input) ? "Kolom email wajib untuk diisi." : "Email harus berupa alamat surel yang valid.",
	})
	.max(255, "Email maksimal berisi 255 karakter.")

// The legacy radios post "0"/"1"
const isBlocked = z.preprocess(
	(input) => {
		if (input === "1" || input === 1) return true
		if (input === "0" || input === 0) return false
		return input
	},
	z.boolean({
		error: (issue) =>
			blank(issue.input) ? "Kolom status akun wajib untuk diisi." : "Status akun harus bernilai true atau false",
	}),
)

export const MerchantWriteSchema = z.object({
	name: text("nama lengkap", "Nama lengkap"),
	gender,
	email,
	merchantName: text("nama merchant", "Nama merchant"),
	address: text("alamat", "Alamat"),
	phone: text("nomor telepon", "Nomor telepon"),
	isBlocked,
})
export class MerchantWriteDto extends createZodDto(MerchantWriteSchema) {}
export type MerchantWriteInput = z.infer<typeof MerchantWriteSchema>

// ─── Responses (Swagger) ─────────────────────────────────────────

export const MerchantRowSchema = z.object({
	id: z.number(),
	uniqueNumber: z.string(),
	name: z.string().nullable(),
	merchantName: z.string().nullable(),
	email: z.string().nullable(),
	createdAt: z.string(),
	createdAtTs: z.number(),
	isBlocked: z.boolean(),
})
export class MerchantRowDto extends createZodDto(MerchantRowSchema) {}

export const MerchantDetailSchema = z.object({
	id: z.number(),
	uniqueNumber: z.string(),
	name: z.string().nullable(),
	gender: z.enum(["male", "female"]).nullable(),
	email: z.string().nullable(),
	merchantName: z.string().nullable(),
	address: z.string().nullable(),
	phone: z.string().nullable(),
	photoUrl: z.string().nullable(),
	isBlocked: z.boolean(),
})
export class MerchantDetailDto extends createZodDto(MerchantDetailSchema) {}

export const MerchantNextNumberSchema = z.object({ uniqueNumber: z.string() })
export class MerchantNextNumberDto extends createZodDto(MerchantNextNumberSchema) {}
