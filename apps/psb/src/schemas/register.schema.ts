import { z } from "zod"
import { isFieldRequired, type FormSetting } from "@roja/utils"

export const checkEmailSchema = z.object({
	email: z.string().email("Email tidak valid"),
	levelId: z.coerce.number().positive("Pilih jenjang"),
})

export const createPersonalSchema = (settings?: FormSetting[]) => {
	const req = (id: number) => isFieldRequired(settings, id)

	return z.object({
		fullName: req(1) ? z.string().min(2, "Nama minimal 2 karakter") : z.string().optional(),
		shortName: req(2) ? z.string().min(1, "Nama panggilan wajib diisi") : z.string().optional(),
		religion: req(3) ? z.string().min(1, "Pilih agama") : z.string().optional(),
		gender: req(4)
			? z.enum(["male", "female"] as const, { message: "Pilih jenis kelamin" })
			: z.enum(["male", "female"] as const).or(z.literal("")).or(z.null()).optional(),
		placeOfBirth: req(5) ? z.string().min(1, "Tempat lahir wajib diisi") : z.string().optional(),
		dateOfBirth: req(6) ? z.string().min(1, "Tanggal lahir wajib diisi") : z.string().optional(),
		nationality: req(7)
			? z.enum(["wni", "wna"] as const, { message: "Pilih kewarganegaraan" })
			: z.enum(["wni", "wna"] as const).or(z.literal("")).or(z.null()).optional(),
		liveWith: req(8)
			? z.enum(["parent", "guardian", "other"] as const, { message: "Pilih tinggal bersama" })
			: z.enum(["parent", "guardian", "other"] as const).or(z.literal("")).or(z.null()).optional(),
		siblingOrder: req(9) ? z.coerce.number().min(1, "Anak ke- minimal 1").optional() : z.coerce.number().optional(),
		numberOfSiblings: req(9) ? z.coerce.number().min(0, "Jumlah saudara minimal 0").optional() : z.coerce.number().optional(),
		parentStatus: req(10) ? z.string().min(1, "Pilih keadaan orang tua").optional() : z.string().optional(),
		childStatus: req(11) ? z.string().min(1, "Pilih status dalam keluarga").optional() : z.string().optional(),
		phone: req(12) ? z.string().min(10, "Nomor telepon minimal 10 digit") : z.string().optional(),
		provinceId: req(13) ? z.coerce.number().positive("Pilih provinsi") : z.coerce.number().optional(),
		regencyId: req(13) ? z.coerce.number().positive("Pilih kabupaten/kota") : z.coerce.number().optional(),
		districtId: req(13) ? z.coerce.number().positive("Pilih kecamatan") : z.coerce.number().optional(),
		village: z.string().optional(),
		street: z.string().optional(),
		rt: req(13) ? z.string().min(1, "RT wajib diisi") : z.string().optional(),
		rw: req(13) ? z.string().min(1, "RW wajib diisi") : z.string().optional(),
		subVillage: z.string().optional(),
		postalCode: z.string().optional(),
		address: z.string().optional(),
		nisn: z.string().optional(),
		nik: z.string().optional(),
		ksp: z.string().optional(),
		kip: z.string().optional(),
		certificateNumber: z.string().optional(),
		previousSchoolName: req(19) ? z.string().min(2, "Nama sekolah asal minimal 2 karakter") : z.string().optional(),
		previousSchoolPhone: req(20) ? z.string().min(1, "No telp sekolah asal wajib diisi") : z.string().optional(),
		previousSchoolProvinceId: req(21) ? z.coerce.number().positive("Pilih provinsi sekolah asal") : z.coerce.number().optional(),
		previousSchoolRegencyId: req(21) ? z.coerce.number().positive("Pilih kabupaten/kota sekolah asal") : z.coerce.number().optional(),
		previousSchoolDistrictId: req(21) ? z.coerce.number().positive("Pilih kecamatan sekolah asal") : z.coerce.number().optional(),
		previousSchoolAddressDetail: z.string().optional(),
		previousSchoolPostalCode: z.string().optional(),
	})
}

export const createIdentitySchema = (settings?: FormSetting[]) => {
	const req = (id: number) => isFieldRequired(settings, id)

	return z.object({
		nik: req(15) ? z.string().min(1, "NIK wajib diisi") : z.string().optional(),
		nisn: req(14) ? z.string().min(1, "NISN wajib diisi") : z.string().optional(),
		ksp: req(16) ? z.string().min(1, "KSP wajib diisi") : z.string().optional(),
		kip: req(17) ? z.string().min(1, "KIP wajib diisi") : z.string().optional(),
		certificateNumber: req(18) ? z.string().min(1, "Nomor Ijazah wajib diisi") : z.string().optional(),
		weight: req(23) ? z.coerce.number().min(1, "Berat badan wajib diisi").optional() : z.coerce.number().optional(),
		height: req(23) ? z.coerce.number().min(1, "Tinggi badan wajib diisi").optional() : z.coerce.number().optional(),
		bloodType: req(24) ? z.string().min(1, "Pilih golongan darah").optional() : z.string().optional(),
		visualCondition: z.enum(["normal", "abnormal"] as const).or(z.literal("")).or(z.null()).optional(),
		hearingCondition: z.enum(["normal", "abnormal"] as const).or(z.literal("")).or(z.null()).optional(),
		immunizationGiven: z.enum(["complete", "incomplete", "not_at_all"] as const).or(z.literal("")).or(z.null()).optional(),
		diseaseHistories: z.array(
			z.object({
				name: z.string().optional(),
				status: z.string().optional(),
			}),
		).optional(),
		learningAchievment: req(30) ? z.string().min(1, "Prestasi belajar wajib diisi").optional() : z.string().optional(),
		reading: z.enum(["jilid", "quran"] as const).or(z.literal("")).or(z.null()).optional(),
		jilidChapter: z.string().optional(),
		quranMemorizing: req(33) ? z.string().min(1, "Informasi hafalan wajib diisi").optional() : z.string().optional(),
		gift: req(35) ? z.string().min(1, "Bakat wajib diisi").optional() : z.string().optional(),
	})
}

export const createFamilySchema = (settings?: FormSetting[]) => {
	const req = (id: number) => isFieldRequired(settings, id)

	return z.object({
		fatherName: req(37) ? z.string().min(2, "Nama ayah minimal 2 karakter") : z.string().optional(),
		fatherReligion: req(38) ? z.string().min(1, "Agama ayah wajib diisi").optional() : z.string().optional(),
		fatherNationality: z.string().optional(),
		fatherLastEducation: req(40) ? z.string().min(1, "Pendidikan ayah wajib diisi").optional() : z.string().optional(),
		fatherOccupation: req(43) ? z.string().min(1, "Pekerjaan ayah wajib diisi").optional() : z.string().optional(),
		fatherIncome: z.coerce.number().optional(),
		fatherPhone: req(41) ? z.string().min(1, "Telepon ayah wajib diisi").optional() : z.string().optional(),
		fatherStatus: z.enum(["hidup", "wafat"] as const).or(z.literal("")).or(z.null()).optional(),
		motherName: req(44) ? z.string().min(2, "Nama ibu minimal 2 karakter") : z.string().optional(),
		motherReligion: req(45) ? z.string().min(1, "Agama ibu wajib diisi").optional() : z.string().optional(),
		motherNationality: z.string().optional(),
		motherLastEducation: req(47) ? z.string().min(1, "Pendidikan ibu wajib diisi").optional() : z.string().optional(),
		motherOccupation: req(50) ? z.string().min(1, "Pekerjaan ibu wajib diisi").optional() : z.string().optional(),
		motherIncome: z.coerce.number().optional(),
		motherPhone: req(48) ? z.string().min(1, "Telepon ibu wajib diisi").optional() : z.string().optional(),
		motherStatus: z.enum(["hidup", "wafat"] as const).or(z.literal("")).or(z.null()).optional(),
		numberOfSiblings: z.coerce.number().optional(),
		childOrder: z.coerce.number().optional(),
		familyStatus: z.string().optional(),
		familyProvinceId: req(52) ? z.coerce.number().positive("Pilih provinsi orang tua").optional() : z.coerce.number().optional(),
		familyRegencyId: req(52) ? z.coerce.number().positive("Pilih kabupaten orang tua").optional() : z.coerce.number().optional(),
		familyDistrictId: req(52) ? z.coerce.number().positive("Pilih kecamatan orang tua").optional() : z.coerce.number().optional(),
		familyVillage: z.string().optional(),
		familyStreet: z.string().optional(),
		familyRt: z.string().optional(),
		familyRw: z.string().optional(),
		familySubVillage: z.string().optional(),
	})
}

export const createGuardianSchema = (settings?: FormSetting[]) => {
	const req = (id: number) => isFieldRequired(settings, id)

	return z.object({
		guardianName: req(54) ? z.string().min(2, "Nama wali minimal 2 karakter").optional() : z.string().optional(),
		guardianReligion: req(55) ? z.string().min(1, "Agama wali wajib diisi").optional() : z.string().optional(),
		guardianNationality: z.string().optional(),
		guardianLastEducation: req(57) ? z.string().min(1, "Pendidikan wali wajib diisi").optional() : z.string().optional(),
		guardianRelationship: z.string().optional(),
		guardianOccupation: req(60) ? z.string().min(1, "Pekerjaan wali wajib diisi").optional() : z.string().optional(),
		guardianIncome: z.coerce.number().optional(),
		guardianPhone: req(58) ? z.string().min(1, "Telepon wali wajib diisi").optional() : z.string().optional(),
		guardianWhatsapp: req(59) ? z.string().min(1, "WA wali wajib diisi").optional() : z.string().optional(),
		guardianAddress: z.string().optional(),
		guardianProvinceId: req(62) ? z.coerce.number().positive("Pilih provinsi wali").optional() : z.coerce.number().optional(),
		guardianRegencyId: req(62) ? z.coerce.number().positive("Pilih kabupaten wali").optional() : z.coerce.number().optional(),
		guardianDistrictId: req(62) ? z.coerce.number().positive("Pilih kecamatan wali").optional() : z.coerce.number().optional(),
		guardianVillage: z.string().optional(),
		guardianStreet: z.string().optional(),
		guardianRt: z.string().optional(),
		guardianRw: z.string().optional(),
		guardianSubVillage: z.string().optional(),
	})
}

export const createAttachmentSchema = (settings?: FormSetting[]) => {
	const req = (id: number) => isFieldRequired(settings, id)

	return z.object({
		ijazah: req(63) ? z.any().refine((val) => !!val, "Berkas Ijazah wajib diunggah") : z.any().optional(),
		photo: req(64) ? z.any().refine((val) => !!val, "Pasfoto wajib diunggah") : z.any().optional(),
		kk: req(65) ? z.any().refine((val) => !!val, "Kartu Keluarga wajib diunggah") : z.any().optional(),
		ksp: req(66) ? z.any().refine((val) => !!val, "KSP wajib diunggah") : z.any().optional(),
		kip: req(67) ? z.any().refine((val) => !!val, "KIP wajib diunggah") : z.any().optional(),
		reportCard: req(68) ? z.any().refine((val) => !!val, "Rapor wajib diunggah") : z.any().optional(),
		birthCert: req(69) ? z.any().refine((val) => !!val, "Akta Kelahiran wajib diunggah") : z.any().optional(),
	})
}

export const personalSchema = createPersonalSchema()
export const identitySchema = createIdentitySchema()
export const familySchema = createFamilySchema()
export const guardianSchema = createGuardianSchema()
export const attachmentSchema = createAttachmentSchema()

export type CheckEmailInput = z.infer<typeof checkEmailSchema>
export type PersonalInput = z.infer<typeof personalSchema>
export type IdentityInput = z.infer<typeof identitySchema>
export type FamilyInput = z.infer<typeof familySchema>
export type GuardianInput = z.infer<typeof guardianSchema>
export type AttachmentInput = z.infer<typeof attachmentSchema>

