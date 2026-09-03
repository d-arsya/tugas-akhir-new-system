import { Column, Entity } from "typeorm"
import { BaseEntity } from "../../core/database/base.entity"

@Entity({ name: "tbr_registrants" })
export class Registrant extends BaseEntity {
	@Column({ name: "academic_year_id", nullable: true, type: "int" })
	academicYearId: number | null

	@Column({ name: "level_id", nullable: true, type: "int" })
	levelId: number | null

	@Column({ name: "registrant_id", nullable: true, type: "varchar", unique: true })
	registrantId: string | null

	@Column({ name: "nis", nullable: true, type: "varchar", unique: true })
	nis: string | null

	@Column({ name: "registration_path", nullable: true, type: "varchar", length: 20 })
	registrationPath: "indent" | "reguler" | null

	@Column({ name: "data_validation", nullable: true, type: "varchar", length: 20 })
	dataValidation: "valid" | "invalid" | "fixed" | null

	@Column({ name: "data_validation_note", nullable: true, type: "text" })
	dataValidationNote: string | null

	@Column({ name: "indent_test", nullable: true, type: "varchar", length: 20 })
	indentTest: "success" | "failed" | null

	@Column({ name: "regular_test", nullable: true, type: "varchar", length: 20 })
	regularTest: "success" | "failed" | null

	@Column({ name: "test_announcement", nullable: true, type: "boolean" })
	testAnnouncement: boolean | null

	@Column({ name: "approval_status", nullable: true, type: "varchar", length: 20, default: "wait" })
	approvalStatus: "wait" | "reserve" | "approve" | "reject" | null

	@Column({ name: "registered_by_admin", nullable: true, type: "boolean", default: false })
	registeredByAdmin: boolean | null

	// Auth
	@Column({ name: "email", nullable: true, type: "varchar", unique: true })
	email: string | null

	@Column({ name: "is_blocked", nullable: true, type: "boolean", default: false })
	isBlocked: boolean | null

	@Column({ name: "blocked_at", nullable: true, type: "timestamp" })
	blockedAt: Date | null

	@Column({ name: "password", nullable: true, type: "varchar" })
	password: string | null

	@Column({ name: "enabled_2fa", type: "boolean", default: true })
	enabled2fa: boolean

	@Column({ name: "remember_token", nullable: true, type: "varchar", length: 100 })
	rememberToken: string | null

	// Personal
	@Column({ name: "fullname", nullable: true, type: "varchar" })
	fullname: string | null

	@Column({ name: "shortname", nullable: true, type: "varchar" })
	shortname: string | null

	@Column({ name: "religion", nullable: true, type: "varchar", length: 20 })
	religion: string | null

	@Column({ name: "gender", nullable: true, type: "varchar", length: 10 })
	gender: "male" | "female" | null

	@Column({ name: "place_of_birth", nullable: true, type: "varchar" })
	placeOfBirth: string | null

	@Column({ name: "date_of_birth", nullable: true, type: "date" })
	dateOfBirth: string | null

	@Column({ name: "nationality", nullable: true, type: "varchar", length: 10 })
	nationality: "wna" | "wni" | null

	@Column({ name: "live_with", nullable: true, type: "varchar", length: 20 })
	liveWith: "parent" | "guardian" | null

	@Column({ name: "sibling_order", nullable: true, type: "int" })
	siblingOrder: number | null

	@Column({ name: "number_of_sibling", nullable: true, type: "int" })
	numberOfSibling: number | null

	@Column({ name: "parent_status", nullable: true, type: "varchar", length: 30 })
	parentStatus: string | null

	@Column({ name: "child_status", nullable: true, type: "varchar", length: 30 })
	childStatus: string | null

	@Column({ name: "phone", nullable: true, type: "bigint" })
	phone: string | null

	// Address
	@Column({ name: "province_id", nullable: true, type: "int" })
	provinceId: number | null

	@Column({ name: "regency_id", nullable: true, type: "int" })
	regencyId: number | null

	@Column({ name: "district_id", nullable: true, type: "int" })
	districtId: number | null

	@Column({ name: "village", nullable: true, type: "varchar" })
	village: string | null

	@Column({ name: "sub_village", nullable: true, type: "varchar" })
	subVillage: string | null

	@Column({ name: "rt", nullable: true, type: "varchar", length: 10 })
	rt: string | null

	@Column({ name: "rw", nullable: true, type: "varchar", length: 10 })
	rw: string | null

	@Column({ name: "street", nullable: true, type: "varchar" })
	street: string | null

	// Identity
	@Column({ name: "nisn", nullable: true, type: "varchar", length: 20 })
	nisn: string | null

	@Column({ name: "nik", nullable: true, type: "varchar", length: 30 })
	nik: string | null

	@Column({ name: "kip", nullable: true, type: "varchar", length: 30 })
	kip: string | null

	@Column({ name: "ksp", nullable: true, type: "varchar", length: 30 })
	ksp: string | null

	@Column({ name: "certificate_number", nullable: true, type: "varchar" })
	certificateNumber: string | null

	// Previous school
	@Column({ name: "school_name", nullable: true, type: "varchar" })
	schoolName: string | null

	@Column({ name: "school_phone", nullable: true, type: "bigint" })
	schoolPhone: string | null

	@Column({ name: "school_province_id", nullable: true, type: "int" })
	schoolProvinceId: number | null

	@Column({ name: "school_regency_id", nullable: true, type: "int" })
	schoolRegencyId: number | null

	@Column({ name: "school_district_id", nullable: true, type: "int" })
	schoolDistrictId: number | null

	@Column({ name: "school_address_detail", nullable: true, type: "varchar" })
	schoolAddressDetail: string | null

	@Column({ name: "school_postal_code", nullable: true, type: "int" })
	schoolPostalCode: number | null

	// Health
	@Column({ name: "weight", nullable: true, type: "int" })
	weight: number | null

	@Column({ name: "height", nullable: true, type: "int" })
	height: number | null

	@Column({ name: "blood_type", nullable: true, type: "varchar", length: 5 })
	bloodType: "a" | "ab" | "b" | "o" | null

	@Column({ name: "visual_condition", nullable: true, type: "varchar", length: 20 })
	visualCondition: "normal" | "abnormal" | null

	@Column({ name: "hearing_condition", nullable: true, type: "varchar", length: 20 })
	hearingCondition: "normal" | "abnormal" | null

	@Column({ name: "immunization_given", nullable: true, type: "varchar", length: 20 })
	immunizationGiven: "complete" | "incomplete" | "not_at_all" | null

	@Column({ name: "reading", nullable: true, type: "varchar", length: 20 })
	reading: "jilid" | "quran" | null

	@Column({ name: "jilid_chapter", nullable: true, type: "varchar" })
	jilidChapter: string | null

	@Column({ name: "quran_memorizing", nullable: true, type: "text" })
	quranMemorizing: string | null

	@Column({ name: "learning_achievment", nullable: true, type: "text" })
	learningAchievement: string | null

	@Column({ name: "gift", nullable: true, type: "text" })
	gift: string | null

	// Father
	@Column({ name: "father_fullname", nullable: true, type: "varchar" })
	fatherFullname: string | null

	@Column({ name: "father_religion", nullable: true, type: "varchar", length: 20 })
	fatherReligion: string | null

	@Column({ name: "father_nationality", nullable: true, type: "varchar", length: 20 })
	fatherNationality: string | null

	@Column({ name: "father_last_education", nullable: true, type: "varchar", length: 30 })
	fatherLastEducation: string | null

	@Column({ name: "father_phone", nullable: true, type: "bigint" })
	fatherPhone: string | null

	@Column({ name: "father_whatsapp", nullable: true, type: "bigint" })
	fatherWhatsapp: string | null

	@Column({ name: "father_job", nullable: true, type: "varchar" })
	fatherJob: string | null

	// Mother
	@Column({ name: "mother_fullname", nullable: true, type: "varchar" })
	motherFullname: string | null

	@Column({ name: "mother_religion", nullable: true, type: "varchar", length: 20 })
	motherReligion: string | null

	@Column({ name: "mother_nationality", nullable: true, type: "varchar", length: 20 })
	motherNationality: string | null

	@Column({ name: "mother_last_education", nullable: true, type: "varchar", length: 30 })
	motherLastEducation: string | null

	@Column({ name: "mother_phone", nullable: true, type: "bigint" })
	motherPhone: string | null

	@Column({ name: "mother_whatsapp", nullable: true, type: "bigint" })
	motherWhatsapp: string | null

	@Column({ name: "mother_job", nullable: true, type: "varchar" })
	motherJob: string | null

	// Family address
	@Column({ name: "family_province_id", nullable: true, type: "int" })
	familyProvinceId: number | null

	@Column({ name: "family_regency_id", nullable: true, type: "int" })
	familyRegencyId: number | null

	@Column({ name: "family_district_id", nullable: true, type: "int" })
	familyDistrictId: number | null

	@Column({ name: "family_village", nullable: true, type: "varchar" })
	familyVillage: string | null

	@Column({ name: "family_sub_village", nullable: true, type: "varchar" })
	familySubVillage: string | null

	@Column({ name: "family_rt", nullable: true, type: "varchar", length: 10 })
	familyRt: string | null

	@Column({ name: "family_rw", nullable: true, type: "varchar", length: 10 })
	familyRw: string | null

	@Column({ name: "family_street", nullable: true, type: "varchar" })
	familyStreet: string | null

	// Guardian
	@Column({ name: "guardian_fullname", nullable: true, type: "varchar" })
	guardianFullname: string | null

	@Column({ name: "guardian_religion", nullable: true, type: "varchar", length: 20 })
	guardianReligion: string | null

	@Column({ name: "guardian_nationality", nullable: true, type: "varchar", length: 20 })
	guardianNationality: string | null

	@Column({ name: "guardian_last_education", nullable: true, type: "varchar", length: 30 })
	guardianLastEducation: string | null

	@Column({ name: "guardian_phone", nullable: true, type: "bigint" })
	guardianPhone: string | null

	@Column({ name: "guardian_whatsapp", nullable: true, type: "bigint" })
	guardianWhatsapp: string | null

	@Column({ name: "guardian_job", nullable: true, type: "varchar" })
	guardianJob: string | null

	@Column({ name: "guardian_province_id", nullable: true, type: "int" })
	guardianProvinceId: number | null

	@Column({ name: "guardian_regency_id", nullable: true, type: "int" })
	guardianRegencyId: number | null

	@Column({ name: "guardian_district_id", nullable: true, type: "int" })
	guardianDistrictId: number | null

	@Column({ name: "guardian_village", nullable: true, type: "varchar" })
	guardianVillage: string | null

	@Column({ name: "guardian_sub_village", nullable: true, type: "varchar" })
	guardianSubVillage: string | null

	@Column({ name: "guardian_rt", nullable: true, type: "varchar", length: 10 })
	guardianRt: string | null

	@Column({ name: "guardian_rw", nullable: true, type: "varchar", length: 10 })
	guardianRw: string | null

	@Column({ name: "guardian_street", nullable: true, type: "varchar" })
	guardianStreet: string | null

	// Attachments
	@Column({ name: "attach_certificate", nullable: true, type: "varchar" })
	attachCertificate: string | null

	@Column({ name: "attach_photo", nullable: true, type: "varchar" })
	attachPhoto: string | null

	@Column({ name: "attach_family_card", nullable: true, type: "varchar" })
	attachFamilyCard: string | null

	@Column({ name: "attach_ksp", nullable: true, type: "varchar" })
	attachKsp: string | null

	@Column({ name: "attach_kip", nullable: true, type: "varchar" })
	attachKip: string | null

	@Column({ name: "attach_report_card", nullable: true, type: "varchar" })
	attachReportCard: string | null

	@Column({ name: "attach_birth_certificate", nullable: true, type: "varchar" })
	attachBirthCertificate: string | null

	@Column({ name: "email_verified_at", nullable: true, type: "timestamp" })
	emailVerifiedAt: Date | null
}
