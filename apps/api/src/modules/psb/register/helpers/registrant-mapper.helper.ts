import type { AcademicYear } from "@shared/master/entities/academic-year.entity"
import type { Registrant } from "@psb/entities/registrant.entity"
import type { FamilyDto } from "@psb/dto/register/family.dto"
import type { GuardianDto } from "@psb/dto/register/guardian.dto"
import type { IdentityDto } from "@psb/dto/register/identity.dto"
import type { PersonalDto } from "@psb/dto/register/personal.dto"
import type { UploadedAttachments } from "@psb/register/helpers/attachment-uploader.helper"

export interface MapRegistrantInput {
	academicYear: AcademicYear | null
	levelId: number
	registrantId: string
	email: string
	hashedPassword: string
	personalData: PersonalDto
	identityData: IdentityDto
	familyData: FamilyDto
	guardianData: Partial<GuardianDto>
	attachments: UploadedAttachments
}

export function mapWizardDataToRegistrant(input: MapRegistrantInput): Partial<Registrant> {
	const {
		academicYear,
		levelId,
		registrantId,
		email,
		hashedPassword,
		personalData,
		identityData,
		familyData,
		guardianData,
		attachments,
	} = input

	return {
		academicYearId: academicYear?.id ?? null,
		levelId,
		registrantId,
		email,
		password: hashedPassword,
		approvalStatus: "wait",
		registrationPath: academicYear?.type === "indent" ? "indent" : "reguler",

		// Personal
		fullname: personalData.fullname ?? null,
		shortname: personalData.shortname ?? null,
		religion: personalData.religion ?? "islam",
		gender: personalData.gender ?? null,
		placeOfBirth: personalData.placeOfBirth ?? null,
		dateOfBirth: personalData.dateOfBirth || null,
		nationality: personalData.nationality ?? "wni",
		liveWith: personalData.liveWith ?? "parent",
		siblingOrder: personalData.siblingOrder ?? null,
		numberOfSibling: personalData.numberOfSibling ?? null,
		parentStatus: personalData.parentStatus ?? null,
		childStatus: personalData.childStatus ?? null,
		phone: personalData.phone || null,
		provinceId: personalData.provinceId || null,
		regencyId: personalData.regencyId || null,
		districtId: personalData.districtId || null,
		village: personalData.village ?? null,
		subVillage: personalData.subVillage ?? null,
		rt: personalData.rt ?? null,
		rw: personalData.rw ?? null,
		street: personalData.street ?? null,
		schoolName: personalData.schoolName ?? null,
		schoolPhone: personalData.schoolPhone || null,
		schoolProvinceId: personalData.schoolProvinceId || null,
		schoolRegencyId: personalData.schoolRegencyId || null,
		schoolDistrictId: personalData.schoolDistrictId || null,
		schoolAddressDetail: personalData.schoolAddressDetail ?? null,
		schoolPostalCode: personalData.schoolPostalCode || null,

		// Identity & Health
		nik: identityData.nik || null,
		nisn: identityData.nisn || null,
		kip: identityData.kip || null,
		ksp: identityData.ksp || null,
		certificateNumber: identityData.certificateNumber || null,
		weight: identityData.weight || null,
		height: identityData.height || null,
		bloodType: identityData.bloodType ?? null,
		visualCondition: identityData.visualCondition ?? "normal",
		hearingCondition: identityData.hearingCondition ?? "normal",
		immunizationGiven: identityData.immunizationGiven ?? "complete",
		reading: identityData.reading ?? null,
		jilidChapter: identityData.jilidChapter ?? null,
		quranMemorizing: identityData.quranMemorizing ?? null,
		learningAchievement: identityData.learningAchievement ?? null,
		gift: identityData.gift ?? null,

		// Family
		fatherFullname: familyData.fatherFullname ?? null,
		fatherReligion: familyData.fatherReligion ?? "islam",
		fatherNationality: familyData.fatherNationality ?? "wni",
		fatherLastEducation: familyData.fatherLastEducation ?? null,
		fatherPhone: familyData.fatherPhone || null,
		fatherWhatsapp: familyData.fatherWhatsapp || null,
		fatherJob: familyData.fatherJob ?? null,
		motherFullname: familyData.motherFullname ?? null,
		motherReligion: familyData.motherReligion ?? "islam",
		motherNationality: familyData.motherNationality ?? "wni",
		motherLastEducation: familyData.motherLastEducation ?? null,
		motherPhone: familyData.motherPhone || null,
		motherWhatsapp: familyData.motherWhatsapp || null,
		motherJob: familyData.motherJob ?? null,
		familyProvinceId: familyData.familyProvinceId || null,
		familyRegencyId: familyData.familyRegencyId || null,
		familyDistrictId: familyData.familyDistrictId || null,
		familyVillage: familyData.familyVillage ?? null,
		familySubVillage: familyData.familySubVillage ?? null,
		familyRt: familyData.familyRt ?? null,
		familyRw: familyData.familyRw ?? null,
		familyStreet: familyData.familyStreet ?? null,

		// Guardian
		guardianFullname: guardianData.guardianFullname ?? null,
		guardianReligion: guardianData.guardianReligion ?? null,
		guardianNationality: guardianData.guardianNationality ?? null,
		guardianLastEducation: guardianData.guardianLastEducation ?? null,
		guardianPhone: guardianData.guardianPhone || null,
		guardianWhatsapp: guardianData.guardianWhatsapp || null,
		guardianJob: guardianData.guardianJob ?? null,
		guardianProvinceId: guardianData.guardianProvinceId || null,
		guardianRegencyId: guardianData.guardianRegencyId || null,
		guardianDistrictId: guardianData.guardianDistrictId || null,
		guardianVillage: guardianData.guardianVillage ?? null,
		guardianSubVillage: guardianData.guardianSubVillage ?? null,
		guardianRt: guardianData.guardianRt ?? null,
		guardianRw: guardianData.guardianRw ?? null,
		guardianStreet: guardianData.guardianStreet ?? null,

		// Attachments
		...attachments,
	}
}
