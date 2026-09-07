import type { AuthUser } from "@roja/types"

export const hijackAuthUser: AuthUser = {
	id: 999,
	email: "calonsantri@pondokroja.ac.id",
	name: "Ahmad Mujtaba",
	role: "registrant",
	domain: "psb",
}

export type DashboardScenario = "wait" | "fixed" | "invalid" | "approve" | "failed" | "indent_failed"

export const mockRegistrantBase = {
	id: 999,
	registrantId: "PSB-2026-0999",
	fullname: "Ahmad Mujtaba",
	fullName: "Ahmad Mujtaba",
	email: "calonsantri@pondokroja.ac.id",
	levelId: 1,
	dataValidation: "valid" as const,
	dataValidationNote: "",
	approvalStatus: "wait" as const,
}

export const mockDashboardData: Record<DashboardScenario, any> = {
	wait: {
		registrant: {
			...mockRegistrantBase,
			dataValidation: "valid",
			approvalStatus: "wait",
		},
		announcement: null,
		statusInfo: {
			status: "wait",
			label: "Menunggu Verifikasi",
			description: "Data Anda sedang diverifikasi oleh panitia PSB.",
		},
	},
	fixed: {
		registrant: {
			...mockRegistrantBase,
			dataValidation: "fixed",
			approvalStatus: "wait",
		},
		announcement: null,
		statusInfo: {
			status: "fixed",
			label: "Perbaikan Data Tersimpan",
			description: "Kamu berhasil melakukan update data. Silakan tunggu keputusan selanjutnya dari admin.",
		},
	},
	invalid: {
		registrant: {
			...mockRegistrantBase,
			dataValidation: "invalid",
			dataValidationNote: "• Foto ijazah buram / tidak terbaca.<br/>• Nomor NIK tidak sesuai dengan Kartu Keluarga.",
			approvalStatus: "wait",
		},
		announcement: null,
		statusInfo: {
			status: "invalid",
			label: "Data / Berkas Tidak Valid",
			description: "Panitia menemukan beberapa data/berkas yang tidak valid. Silakan lakukan perbaikan data.",
		},
	},
	approve: {
		registrant: {
			...mockRegistrantBase,
			dataValidation: "valid",
			approvalStatus: "approve",
		},
		announcement: {
			successDesc: "Selamat, calon santri atas nama <strong>Ahmad Mujtaba</strong> dinyatakan <strong>LULUS SELEKSI</strong> Penerimaan Santri Baru Pondok Roja Tahun Ajaran 2026/2027.",
			dateStart: "2026-09-10",
			dateEnd: "2026-09-20",
			information: "Silakan melakukan pembayaran uang pangkal dan membawa berkas fisik asli (Ijazah, KK, Akta Kelahiran) ke sekretariat panitia PSB.",
			additionalInformation: "Pertemuan wali santri baru akan dilaksanakan pada tanggal 25 September 2026 di Aula Utama Pondok Roja.",
		},
		statusInfo: {
			status: "approve",
			label: "Diterima / Lulus",
			description: "Selamat! Anda dinyatakan DITERIMA sebagai Santri Baru Pondok Roja.",
		},
	},
	failed: {
		registrant: {
			...mockRegistrantBase,
			dataValidation: "valid",
			approvalStatus: "reject",
		},
		announcement: {
			failedDesc: "Mohon maaf, calon santri atas nama <strong>Ahmad Mujtaba</strong> belum berhasil lulus seleksi PSB periode ini karena kuota pendaftaran telah terpenuhi.",
		},
		statusInfo: {
			status: "failed",
			label: "Belum Diterima",
			description: "Mohon maaf, Anda belum berhasil lulus pada seleksi PSB periode ini.",
		},
	},
	indent_failed: {
		registrant: {
			...mockRegistrantBase,
			dataValidation: "valid",
			approvalStatus: "indent failed",
		},
		announcement: {
			failedIndentTestDesc: "Hasil tes indent menyatakan calon santri belum memenuhi kriteria minimal pembacaan Al-Qur'an dan hafalan dasar.",
		},
		statusInfo: {
			status: "indent_failed",
			label: "Tes Indent Belum Lulus",
			description: "Hasil tes indent pendaftaran santri baru menyatakan Anda belum lulus.",
		},
	},
}

export const mockWizardPersonalData = {
	fullName: "Ahmad Mujtaba",
	shortName: "Ahmad",
	religion: "Islam",
	gender: "male",
	placeOfBirth: "Jakarta",
	dateOfBirth: "2012-05-15",
	nationality: "wni",
	liveWith: "parent",
	siblingOrder: 1,
	numberOfSiblings: 2,
	parentStatus: "complete",
	childStatus: "kandung",
	phone: "081234567890",
	nik: "3171011505120001",
	nisn: "0051234567",
	ksp: "",
	kip: "",
	certificateNumber: "DN-01/D-SD/12/0001",
	provinceId: 31,
	regencyId: 3171,
	districtId: 317101,
	village: "Cilandak Barat",
	subVillage: "RT 02 / RW 05",
	rt: "02",
	rw: "05",
	street: "Jl. Pondok Indah No. 12",
	address: "Jl. Pondok Indah No. 12, RT 02 / RW 05",
	postalCode: "12430",
	previousSchoolName: "SD Islam Terpadu Al-Azhar",
	previousSchoolPhone: "0217654321",
	previousSchoolProvinceId: 31,
	previousSchoolRegencyId: 3171,
	previousSchoolDistrictId: 317101,
	previousSchoolAddressDetail: "Jl. Sisingamangaraja No. 1",
	previousSchoolPostalCode: "12110",
}

export const mockWizardIdentityData = {
	nik: "3171011505120001",
	nisn: "0051234567",
	kip: "",
	ksp: "",
	certificateNumber: "DN-01/D-SD/12/0001",
	weight: 45,
	height: 152,
	bloodType: "O",
	visualCondition: "normal",
	hearingCondition: "normal",
	immunizationGiven: "complete",
	diseaseHistories: [{ name: "Asma Ringan", status: "Sembuh" }],
	learningAchievment: "Juara 1 Lomba LCT Al-Qur'an Tingkat Kecamatan",
	reading: "quran",
	jilidChapter: "Juz 30",
	quranMemorizing: "Juz 30 (An-Naas s/d An-Naba)",
	gift: "Bisa Tilawah",
}

export const mockWizardFamilyData = {
	fatherName: "Budi Santoso",
	fatherReligion: "Islam",
	fatherNationality: "wni",
	fatherLastEducation: "s1",
	fatherOccupation: "Wiraswasta",
	fatherIncome: 10000000,
	fatherPhone: "08111222333",
	fatherStatus: "hidup",
	motherName: "Siti Rahmah",
	motherReligion: "Islam",
	motherNationality: "wni",
	motherLastEducation: "s1",
	motherOccupation: "Ibu Rumah Tangga",
	motherIncome: 0,
	motherPhone: "08111222444",
	motherStatus: "hidup",
	numberOfSiblings: 2,
	childOrder: 1,
	familyStatus: "complete",
	familyProvinceId: 31,
	familyRegencyId: 3171,
	familyDistrictId: 317101,
	familyVillage: "Cilandak Barat",
	familyStreet: "Jl. Pondok Indah No. 12",
	familyRt: "02",
	familyRw: "05",
	familySubVillage: "-",
}

export const mockWizardGuardianData = {
	guardianName: "Budi Santoso",
	guardianReligion: "Islam",
	guardianNationality: "wni",
	guardianLastEducation: "s1",
	guardianRelationship: "Ayah Kandung",
	guardianOccupation: "Wiraswasta",
	guardianIncome: 10000000,
	guardianPhone: "08111222333",
	guardianAddress: "Jl. Pondok Indah No. 12",
	guardianProvinceId: 31,
	guardianRegencyId: 3171,
	guardianDistrictId: 317101,
	guardianVillage: "Cilandak Barat",
	guardianStreet: "Jl. Pondok Indah No. 12",
	guardianRt: "02",
	guardianRw: "05",
	guardianSubVillage: "-",
}
