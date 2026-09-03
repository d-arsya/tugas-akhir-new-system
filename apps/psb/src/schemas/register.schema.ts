import { z } from "zod"

export const checkEmailSchema = z.object({
	email: z.string().email("Email tidak valid"),
	levelId: z.coerce.number().positive("Pilih jenjang"),
})

export const personalSchema = z.object({
	fullName: z.string().min(2, "Nama minimal 2 karakter"),
	shortName: z.string().optional(),
	religion: z.string().min(1, "Pilih agama"),
	gender: z.enum(["male", "female"] as const, { message: "Pilih jenis kelamin" }),
	placeOfBirth: z.string().min(1, "Tempat lahir wajib diisi"),
	dateOfBirth: z.string().min(1, "Tanggal lahir wajib diisi"),
	nationality: z.enum(["wni", "wna"] as const, { message: "Pilih kewarganegaraan" }),
	liveWith: z.enum(["parent", "guardian", "other"] as const, { message: "Pilih tinggal bersama" }),
	siblingOrder: z.coerce.number().min(1, "Anak ke- minimal 1").optional(),
	numberOfSiblings: z.coerce.number().min(0, "Jumlah saudara minimal 0").optional(),
	parentStatus: z.string().optional(),
	childStatus: z.string().optional(),
	phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
	provinceId: z.coerce.number().positive("Pilih provinsi"),
	regencyId: z.coerce.number().positive("Pilih kabupaten/kota"),
	districtId: z.coerce.number().positive("Pilih kecamatan"),
	village: z.string().optional(),
	street: z.string().optional(),
	rt: z.string().min(1, "RT wajib diisi"),
	rw: z.string().min(1, "RW wajib diisi"),
	subVillage: z.string().optional(),
	postalCode: z.string().optional(),
	address: z.string().optional(),
	nisn: z.string().optional(),
	nik: z.string().optional(),
	ksp: z.string().optional(),
	kip: z.string().optional(),
	certificateNumber: z.string().optional(),
	previousSchoolName: z.string().min(2, "Nama sekolah asal minimal 2 karakter"),
	previousSchoolPhone: z.string().optional(),
	previousSchoolProvinceId: z.coerce.number().positive("Pilih provinsi sekolah asal"),
	previousSchoolRegencyId: z.coerce.number().positive("Pilih kabupaten/kota sekolah asal"),
	previousSchoolDistrictId: z.coerce.number().positive("Pilih kecamatan sekolah asal"),
	previousSchoolAddressDetail: z.string().optional(),
	previousSchoolPostalCode: z.string().optional(),
})

export const identitySchema = z.object({
	nik: z.string().optional(),
	nisn: z.string().optional(),
	ksp: z.string().optional(),
	kip: z.string().optional(),
	certificateNumber: z.string().optional(),
	weight: z.coerce.number().optional(),
	height: z.coerce.number().optional(),
	bloodType: z.string().optional(),
	visualCondition: z.enum(["normal", "abnormal"] as const).optional(),
	hearingCondition: z.enum(["normal", "abnormal"] as const).optional(),
	immunizationGiven: z.enum(["complete", "incomplete", "not_at_all"] as const).optional(),
	diseaseHistories: z.array(
		z.object({
			name: z.string().min(1, "Nama penyakit wajib diisi"),
			status: z.string().min(1, "Status penyakit wajib diisi"),
		}),
	).optional(),
	learningAchievment: z.string().optional(),
	reading: z.enum(["jilid", "quran"] as const).optional(),
	jilidChapter: z.string().optional(),
	quranMemorizing: z.string().optional(),
	gift: z.string().optional(),
})

export const familySchema = z.object({
	fatherName: z.string().min(2, "Nama ayah minimal 2 karakter"),
	fatherReligion: z.string().optional(),
	fatherNationality: z.string().optional(),
	fatherLastEducation: z.string().optional(),
	fatherOccupation: z.string().optional(),
	fatherIncome: z.coerce.number().optional(),
	fatherPhone: z.string().optional(),
	fatherStatus: z.enum(["hidup", "wafat"] as const).optional(),
	motherName: z.string().min(2, "Nama ibu minimal 2 karakter"),
	motherReligion: z.string().optional(),
	motherNationality: z.string().optional(),
	motherLastEducation: z.string().optional(),
	motherOccupation: z.string().optional(),
	motherIncome: z.coerce.number().optional(),
	motherPhone: z.string().optional(),
	motherStatus: z.enum(["hidup", "wafat"] as const).optional(),
	numberOfSiblings: z.coerce.number().optional(),
	childOrder: z.coerce.number().optional(),
	familyStatus: z.string().optional(),
	familyProvinceId: z.coerce.number().optional(),
	familyRegencyId: z.coerce.number().optional(),
	familyDistrictId: z.coerce.number().optional(),
	familyVillage: z.string().optional(),
	familyStreet: z.string().optional(),
	familyRt: z.string().optional(),
	familyRw: z.string().optional(),
	familySubVillage: z.string().optional(),
})

export const guardianSchema = z.object({
	guardianName: z.string().optional(),
	guardianReligion: z.string().optional(),
	guardianNationality: z.string().optional(),
	guardianLastEducation: z.string().optional(),
	guardianRelationship: z.string().optional(),
	guardianOccupation: z.string().optional(),
	guardianIncome: z.coerce.number().optional(),
	guardianPhone: z.string().optional(),
	guardianWhatsapp: z.string().optional(),
	guardianAddress: z.string().optional(),
	guardianProvinceId: z.coerce.number().optional(),
	guardianRegencyId: z.coerce.number().optional(),
	guardianDistrictId: z.coerce.number().optional(),
	guardianVillage: z.string().optional(),
	guardianStreet: z.string().optional(),
	guardianRt: z.string().optional(),
	guardianRw: z.string().optional(),
	guardianSubVillage: z.string().optional(),
})

export const attachmentSchema = z.object({
	ijazah: z.any().optional(),
	photo: z.any().optional(),
	kk: z.any().optional(),
	birthCert: z.any().optional(),
	ksp: z.any().optional(),
	kip: z.any().optional(),
	reportCard: z.any().optional(),
})

export type CheckEmailInput = z.infer<typeof checkEmailSchema>
export type PersonalInput = z.infer<typeof personalSchema>
export type IdentityInput = z.infer<typeof identitySchema>
export type FamilyInput = z.infer<typeof familySchema>
export type GuardianInput = z.infer<typeof guardianSchema>
export type AttachmentInput = z.infer<typeof attachmentSchema>
