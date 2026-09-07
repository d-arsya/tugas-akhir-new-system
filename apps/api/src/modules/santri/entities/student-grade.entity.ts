import { Column, Entity } from "typeorm"
import { BaseEntity } from "@core/database/base.entity"

@Entity({ name: "tbr_student_grades" })
export class StudentGrade extends BaseEntity {
	// Academic & Grade Info
	@Column({ name: "student_id", nullable: true, type: "bigint" })
	studentId: number | null

	@Column({ name: "major_name", nullable: true, type: "varchar" })
	majorName: string | null

	@Column({ name: "level_id", nullable: true, type: "bigint" })
	levelId: number | null

	@Column({ name: "grade", nullable: true, type: "int" })
	grade: number | null

	@Column({ name: "sub_grade", nullable: true, type: "varchar", default: "undefined" })
	subGrade: string | null

	@Column({ name: "grade_status", nullable: true, type: "varchar" })
	gradeStatus: "active" | "inactive" | null

	@Column({ name: "grade_note", nullable: true, type: "varchar" })
	gradeNote:
		| "pendaftaran"
		| "naik kelas"
		| "tinggal kelas"
		| "keluar"
		| "mutasi"
		| "santri lama"
		| "kenaikan kelas"
		| "lulus"
		| null

	@Column({ name: "prev_grade_note", nullable: true, type: "varchar" })
	prevGradeNote:
		| "pendaftaran"
		| "naik kelas"
		| "tinggal kelas"
		| "keluar"
		| "mutasi"
		| "santri lama"
		| "kenaikan kelas"
		| "lulus"
		| null

	@Column({ name: "dropout_note", nullable: true, type: "text" })
	dropoutNote: string | null

	@Column({ name: "registered_by_admin", nullable: true, type: "boolean", default: false })
	registeredByAdmin: boolean | null

	@Column({ name: "current_academic_year", nullable: true, type: "varchar" })
	currentAcademicYear: string | null

	@Column({ name: "source", nullable: true, type: "varchar" })
	source: "pendaftaran" | "santri lama" | "mutasi" | null

	@Column({ name: "deleted_at", nullable: true, type: "timestamp" })
	deletedAt: Date | null

	// Personal Data
	@Column({ name: "fullname", nullable: true, type: "varchar" })
	fullname: string | null

	@Column({ name: "shortname", nullable: true, type: "varchar" })
	shortname: string | null

	@Column({ name: "religion", nullable: true, type: "varchar" })
	religion: "islam" | "kristen" | "katolik" | "hindu" | "buddha" | "konghucu" | null

	@Column({ name: "gender", nullable: true, type: "varchar" })
	gender: "male" | "female" | null

	@Column({ name: "place_of_birth", nullable: true, type: "varchar" })
	placeOfBirth: string | null

	@Column({ name: "date_of_birth", nullable: true, type: "date" })
	dateOfBirth: string | null

	@Column({ name: "nationality", nullable: true, type: "varchar" })
	nationality: "wna" | "wni" | null

	@Column({ name: "live_with", nullable: true, type: "varchar" })
	liveWith: "parent" | "guardian" | null

	@Column({ name: "sibling_order", nullable: true, type: "int" })
	siblingOrder: number | null

	@Column({ name: "number_of_sibling", nullable: true, type: "int" })
	numberOfSibling: number | null

	@Column({ name: "parent_status", nullable: true, type: "varchar" })
	parentStatus: "father&mother" | "fatherless" | "motherless" | "orphan" | null

	@Column({ name: "child_status", nullable: true, type: "varchar" })
	childStatus: "biological_child" | "step_child" | "adopted_child" | null

	@Column({ name: "phone", nullable: true, type: "bigint" })
	phone: string | null

	// Address Data
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

	@Column({ name: "rt", nullable: true, type: "varchar" })
	rt: string | null

	@Column({ name: "rw", nullable: true, type: "varchar" })
	rw: string | null

	@Column({ name: "street", nullable: true, type: "varchar" })
	street: string | null

	// Identity Numbers
	@Column({ name: "nisn", nullable: true, type: "varchar" })
	nisn: string | null

	@Column({ name: "nik", nullable: true, type: "varchar" })
	nik: string | null

	@Column({ name: "kip", nullable: true, type: "varchar" })
	kip: string | null

	@Column({ name: "ksp", nullable: true, type: "varchar" })
	ksp: string | null

	@Column({ name: "certificate_number", nullable: true, type: "varchar" })
	certificateNumber: string | null

	// Origin School
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

	// Physical & Health & Aptitude
	@Column({ name: "weight", nullable: true, type: "int" })
	weight: number | null

	@Column({ name: "height", nullable: true, type: "int" })
	height: number | null

	@Column({ name: "blood_type", nullable: true, type: "varchar" })
	bloodType: "a" | "ab" | "b" | "o" | null

	@Column({ name: "visual_condition", nullable: true, type: "varchar" })
	visualCondition: "normal" | "abnormal" | null

	@Column({ name: "hearing_condition", nullable: true, type: "varchar" })
	hearingCondition: "normal" | "abnormal" | null

	@Column({ name: "immunization_given", nullable: true, type: "varchar" })
	immunizationGiven: "complete" | "incomplete" | "not_at_all" | null

	@Column({ name: "learning_achievment", nullable: true, type: "text" })
	learningAchievment: string | null

	@Column({ name: "reading", nullable: true, type: "varchar" })
	reading: "jilid" | "quran" | null

	@Column({ name: "jilid_chapter", nullable: true, type: "varchar" })
	jilidChapter: string | null

	@Column({ name: "quran_memorizing", nullable: true, type: "text" })
	quranMemorizing: string | null

	@Column({ name: "gift", nullable: true, type: "text" })
	gift: string | null

	// Father Info
	@Column({ name: "father_fullname", nullable: true, type: "varchar" })
	fatherFullname: string | null

	@Column({ name: "father_religion", nullable: true, type: "varchar" })
	fatherReligion: "islam" | "kristen" | "katolik" | "hindu" | "buddha" | "konghucu" | null

	@Column({ name: "father_nationality", nullable: true, type: "varchar" })
	fatherNationality: string | null

	@Column({ name: "father_last_education", nullable: true, type: "varchar" })
	fatherLastEducation: "tidak sekolah" | "sd" | "smp" | "sma" | "diploma" | "s1" | "s2" | "s3" | null

	@Column({ name: "father_phone", nullable: true, type: "bigint" })
	fatherPhone: string | null

	@Column({ name: "father_whatsapp", nullable: true, type: "varchar" })
	fatherWhatsapp: string | null

	@Column({ name: "father_job", nullable: true, type: "varchar" })
	fatherJob: string | null

	// Mother Info
	@Column({ name: "mother_fullname", nullable: true, type: "varchar" })
	motherFullname: string | null

	@Column({ name: "mother_religion", nullable: true, type: "varchar" })
	motherReligion: "islam" | "kristen" | "katolik" | "hindu" | "buddha" | "konghucu" | null

	@Column({ name: "mother_nationality", nullable: true, type: "varchar" })
	motherNationality: string | null

	@Column({ name: "mother_last_education", nullable: true, type: "varchar" })
	motherLastEducation: "tidak sekolah" | "sd" | "smp" | "sma" | "diploma" | "s1" | "s2" | "s3" | null

	@Column({ name: "mother_phone", nullable: true, type: "bigint" })
	motherPhone: string | null

	@Column({ name: "mother_whatsapp", nullable: true, type: "varchar" })
	motherWhatsapp: string | null

	@Column({ name: "mother_job", nullable: true, type: "varchar" })
	motherJob: string | null

	// Family Address
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

	@Column({ name: "family_rt", nullable: true, type: "varchar" })
	familyRt: string | null

	@Column({ name: "family_rw", nullable: true, type: "varchar" })
	familyRw: string | null

	@Column({ name: "family_street", nullable: true, type: "varchar" })
	familyStreet: string | null

	// Guardian Info
	@Column({ name: "guardian_fullname", nullable: true, type: "varchar" })
	guardianFullname: string | null

	@Column({ name: "guardian_religion", nullable: true, type: "varchar" })
	guardianReligion: "islam" | "kristen" | "katolik" | "hindu" | "buddha" | "konghucu" | null

	@Column({ name: "guardian_nationality", nullable: true, type: "varchar" })
	guardianNationality: string | null

	@Column({ name: "guardian_last_education", nullable: true, type: "varchar" })
	guardianLastEducation:
		| "tidak sekolah"
		| "sd"
		| "smp"
		| "sma"
		| "diploma"
		| "s1"
		| "s2"
		| "s3"
		| null

	@Column({ name: "guardian_phone", nullable: true, type: "bigint" })
	guardianPhone: string | null

	@Column({ name: "guardian_whatsapp", nullable: true, type: "varchar" })
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

	@Column({ name: "guardian_rt", nullable: true, type: "varchar" })
	guardianRt: string | null

	@Column({ name: "guardian_rw", nullable: true, type: "varchar" })
	guardianRw: string | null

	@Column({ name: "guardian_street", nullable: true, type: "varchar" })
	guardianStreet: string | null

	// Attachments
	@Column({ name: "attach_certificate", nullable: true, type: "varchar" })
	attachCertificate: string | null

	@Column({ name: "attach_family_card", nullable: true, type: "varchar" })
	attachFamilyCard: string | null

	@Column({ name: "attach_photo", nullable: true, type: "varchar" })
	attachPhoto: string | null

	@Column({ name: "attach_ksp", nullable: true, type: "varchar" })
	attachKsp: string | null

	@Column({ name: "attach_kip", nullable: true, type: "varchar" })
	attachKip: string | null

	@Column({ name: "attach_report_card", nullable: true, type: "varchar" })
	attachReportCard: string | null

	@Column({ name: "attach_birth_certificate", nullable: true, type: "varchar" })
	attachBirthCertificate: string | null
}
