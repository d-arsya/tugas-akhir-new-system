import { Column, Entity } from "typeorm"
import { BaseEntity } from "@core/database/base.entity"

@Entity({ name: "tbr_alumnis" })
export class Alumni extends BaseEntity {
	@Column({ name: "student_id", nullable: true, type: "bigint" })
	studentId: number | null

	@Column({ name: "nis", nullable: true, type: "bigint" })
	nis: number | null

	@Column({ name: "level_id", nullable: true, type: "bigint" })
	levelId: number | null

	@Column({ name: "major_name", nullable: true, type: "varchar" })
	majorName: string | null

	@Column({ name: "grade", nullable: true, type: "bigint" })
	grade: number | null

	@Column({ name: "academic_year", nullable: true, type: "varchar" })
	academicYear: string | null

	@Column({ name: "academic_year_id", nullable: true, type: "bigint" })
	academicYearId: number | null

	@Column({ name: "graduate_at", nullable: true, type: "timestamptz" })
	graduateAt: Date | null

	@Column({ name: "alumni_talent", nullable: true, type: "text" })
	alumniTalent: string | null

	@Column({ name: "advanced_study", nullable: true, type: "text" })
	advancedStudy: string | null

	@Column({ name: "profession", nullable: true, type: "text" })
	profession: string | null

	@Column({ name: "marriage_status", nullable: true, type: "text" })
	marriageStatus: string | null

	@Column({ name: "alumni_phone", nullable: true, type: "bigint" })
	alumniPhone: number | null

	@Column({ name: "alumni_email", nullable: true, type: "varchar" })
	alumniEmail: string | null

	@Column({ name: "alumni_province_id", nullable: true, type: "bigint" })
	alumniProvinceId: number | null

	@Column({ name: "alumni_regency_id", nullable: true, type: "bigint" })
	alumniRegencyId: number | null

	@Column({ name: "alumni_district_id", nullable: true, type: "bigint" })
	alumniDistrictId: number | null

	@Column({ name: "alumni_village", nullable: true, type: "varchar" })
	alumniVillage: string | null

	@Column({ name: "alumni_sub_village", nullable: true, type: "varchar" })
	alumniSubVillage: string | null

	@Column({ name: "alumni_rt", nullable: true, type: "varchar" })
	alumniRt: string | null

	@Column({ name: "alumni_rw", nullable: true, type: "varchar" })
	alumniRw: string | null

	@Column({ name: "alumni_street", nullable: true, type: "varchar" })
	alumniStreet: string | null

	@Column({ name: "fullname", nullable: true, type: "varchar" })
	fullname: string | null

	@Column({ name: "shortname", nullable: true, type: "varchar" })
	shortname: string | null

	@Column({ name: "religion", nullable: true, type: "text" })
	religion: string | null

	@Column({ name: "gender", nullable: true, type: "text" })
	gender: string | null

	@Column({ name: "place_of_birth", nullable: true, type: "varchar" })
	placeOfBirth: string | null

	@Column({ name: "date_of_birth", nullable: true, type: "date" })
	dateOfBirth: string | null

	@Column({ name: "nationality", nullable: true, type: "text" })
	nationality: string | null

	@Column({ name: "live_with", nullable: true, type: "text" })
	liveWith: string | null

	@Column({ name: "sibling_order", nullable: true, type: "bigint" })
	siblingOrder: number | null

	@Column({ name: "number_of_sibling", nullable: true, type: "bigint" })
	numberOfSibling: number | null

	@Column({ name: "parent_status", nullable: true, type: "text" })
	parentStatus: string | null

	@Column({ name: "child_status", nullable: true, type: "text" })
	childStatus: string | null

	@Column({ name: "phone", nullable: true, type: "bigint" })
	phone: number | null

	@Column({ name: "province_id", nullable: true, type: "bigint" })
	provinceId: number | null

	@Column({ name: "regency_id", nullable: true, type: "bigint" })
	regencyId: number | null

	@Column({ name: "district_id", nullable: true, type: "bigint" })
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

	@Column({ name: "school_name", nullable: true, type: "varchar" })
	schoolName: string | null

	@Column({ name: "school_phone", nullable: true, type: "bigint" })
	schoolPhone: number | null

	@Column({ name: "school_province_id", nullable: true, type: "bigint" })
	schoolProvinceId: number | null

	@Column({ name: "school_regency_id", nullable: true, type: "bigint" })
	schoolRegencyId: number | null

	@Column({ name: "school_district_id", nullable: true, type: "bigint" })
	schoolDistrictId: number | null

	@Column({ name: "school_address_detail", nullable: true, type: "varchar" })
	schoolAddressDetail: string | null

	@Column({ name: "school_postal_code", nullable: true, type: "bigint" })
	schoolPostalCode: number | null

	@Column({ name: "weight", nullable: true, type: "bigint" })
	weight: number | null

	@Column({ name: "height", nullable: true, type: "bigint" })
	height: number | null

	@Column({ name: "blood_type", nullable: true, type: "text" })
	bloodType: string | null

	@Column({ name: "visual_condition", nullable: true, type: "text" })
	visualCondition: string | null

	@Column({ name: "hearing_condition", nullable: true, type: "text" })
	hearingCondition: string | null

	@Column({ name: "immunization_given", nullable: true, type: "text" })
	immunizationGiven: string | null

	@Column({ name: "learning_achievment", nullable: true, type: "text" })
	learningAchievment: string | null

	@Column({ name: "reading", nullable: true, type: "text" })
	reading: string | null

	@Column({ name: "jilid_chapter", nullable: true, type: "varchar" })
	jilidChapter: string | null

	@Column({ name: "quran_memorizing", nullable: true, type: "text" })
	quranMemorizing: string | null

	@Column({ name: "gift", nullable: true, type: "text" })
	gift: string | null

	@Column({ name: "father_fullname", nullable: true, type: "varchar" })
	fatherFullname: string | null

	@Column({ name: "father_religion", nullable: true, type: "text" })
	fatherReligion: string | null

	@Column({ name: "father_nationality", nullable: true, type: "varchar" })
	fatherNationality: string | null

	@Column({ name: "father_last_education", nullable: true, type: "text" })
	fatherLastEducation: string | null

	@Column({ name: "father_phone", nullable: true, type: "bigint" })
	fatherPhone: number | null

	@Column({ name: "father_whatsapp", nullable: true, type: "varchar" })
	fatherWhatsapp: string | null

	@Column({ name: "father_job", nullable: true, type: "varchar" })
	fatherJob: string | null

	@Column({ name: "mother_fullname", nullable: true, type: "varchar" })
	motherFullname: string | null

	@Column({ name: "mother_religion", nullable: true, type: "text" })
	motherReligion: string | null

	@Column({ name: "mother_nationality", nullable: true, type: "varchar" })
	motherNationality: string | null

	@Column({ name: "mother_last_education", nullable: true, type: "text" })
	motherLastEducation: string | null

	@Column({ name: "mother_phone", nullable: true, type: "bigint" })
	motherPhone: number | null

	@Column({ name: "mother_whatsapp", nullable: true, type: "varchar" })
	motherWhatsapp: string | null

	@Column({ name: "mother_job", nullable: true, type: "varchar" })
	motherJob: string | null

	@Column({ name: "family_province_id", nullable: true, type: "bigint" })
	familyProvinceId: number | null

	@Column({ name: "family_regency_id", nullable: true, type: "bigint" })
	familyRegencyId: number | null

	@Column({ name: "family_district_id", nullable: true, type: "bigint" })
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

	@Column({ name: "guardian_fullname", nullable: true, type: "varchar" })
	guardianFullname: string | null

	@Column({ name: "guardian_religion", nullable: true, type: "text" })
	guardianReligion: string | null

	@Column({ name: "guardian_nationality", nullable: true, type: "varchar" })
	guardianNationality: string | null

	@Column({ name: "guardian_last_education", nullable: true, type: "text" })
	guardianLastEducation: string | null

	@Column({ name: "guardian_phone", nullable: true, type: "bigint" })
	guardianPhone: number | null

	@Column({ name: "guardian_whatsapp", nullable: true, type: "varchar" })
	guardianWhatsapp: string | null

	@Column({ name: "guardian_job", nullable: true, type: "varchar" })
	guardianJob: string | null

	@Column({ name: "guardian_province_id", nullable: true, type: "bigint" })
	guardianProvinceId: number | null

	@Column({ name: "guardian_regency_id", nullable: true, type: "bigint" })
	guardianRegencyId: number | null

	@Column({ name: "guardian_district_id", nullable: true, type: "bigint" })
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

	@Column({ name: "graduate_year", nullable: true, type: "timestamptz" })
	graduateYear: Date | null
}
