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
	parentStatus: z.enum(["complete", "single_parent", "orphan"] as const, { message: "Pilih status keluarga" }).optional(),
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
	postalCode: z.string().min(5, "Kode pos minimal 5 digit"),
	address: z.string().min(5, "Alamat minimal 5 karakter"),
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
	fatherOccupation: z.string().min(1, "Pekerjaan ayah wajib diisi"),
	fatherIncome: z.coerce.number().min(0, "Penghasilan ayah wajib diisi"),
	fatherPhone: z.string().optional(),
	fatherStatus: z.enum(["hidup", "wafat"] as const).optional(),
	motherName: z.string().min(2, "Nama ibu minimal 2 karakter"),
	motherReligion: z.string().optional(),
	motherNationality: z.string().optional(),
	motherLastEducation: z.string().optional(),
	motherOccupation: z.string().min(1, "Pekerjaan ibu wajib diisi"),
	motherIncome: z.coerce.number().min(0, "Penghasilan ibu wajib diisi"),
	motherPhone: z.string().optional(),
	motherStatus: z.enum(["hidup", "wafat"] as const).optional(),
	numberOfSiblings: z.coerce.number().min(0, "Jumlah saudara minimal 0"),
	childOrder: z.coerce.number().min(1, "Anak ke- minimal 1"),
	familyStatus: z.enum(["complete", "single_parent", "orphan"] as const, { message: "Pilih status keluarga" }),
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
	guardianName: z.string().min(2, "Nama wali minimal 2 karakter"),
	guardianReligion: z.string().optional(),
	guardianNationality: z.string().optional(),
	guardianLastEducation: z.string().optional(),
	guardianRelationship: z.string().min(1, "Hubungan wali wajib diisi"),
	guardianOccupation: z.string().min(1, "Pekerjaan wali wajib diisi"),
	guardianIncome: z.coerce.number().optional(),
	guardianPhone: z.string().min(10, "Nomor telepon wali minimal 10 digit"),
	guardianAddress: z.string().min(5, "Alamat wali minimal 5 karakter"),
	guardianProvinceId: z.coerce.number().positive("Pilih provinsi wali"),
	guardianRegencyId: z.coerce.number().positive("Pilih kabupaten/kota wali"),
	guardianDistrictId: z.coerce.number().positive("Pilih kecamatan wali"),
	guardianVillage: z.string().optional(),
	guardianStreet: z.string().optional(),
	guardianRt: z.string().optional(),
	guardianRw: z.string().optional(),
	guardianSubVillage: z.string().optional(),
})

export const attachmentSchema = z.object({
	ijazah: z.string().optional(),
	photo: z.string().optional(),
	kk: z.string().optional(),
	birthCert: z.string().optional(),
	ksp: z.string().optional(),
	kip: z.string().optional(),
	reportCard: z.string().optional(),
})

export type CheckEmailInput = z.infer<typeof checkEmailSchema>
export type PersonalInput = z.infer<typeof personalSchema>
export type IdentityInput = z.infer<typeof identitySchema>
export type FamilyInput = z.infer<typeof familySchema>
export type GuardianInput = z.infer<typeof guardianSchema>
export type AttachmentInput = z.infer<typeof attachmentSchema>
