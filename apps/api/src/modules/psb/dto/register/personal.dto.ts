import { createZodDto } from "nestjs-zod"
import { z } from "zod"

export const PersonalSchema = z.object({
	fullname: z.string().optional(),
	shortname: z.string().optional(),
	religion: z.enum(["islam", "kristen", "katolik", "hindu", "buddha", "konghucu"]).optional(),
	gender: z.enum(["male", "female"]).optional(),
	placeOfBirth: z.string().optional(),
	dateOfBirth: z.string().optional(),
	nationality: z.enum(["wna", "wni"]).optional(),
	liveWith: z.enum(["parent", "guardian"]).optional(),
	siblingOrder: z.coerce.number().int().optional(),
	numberOfSibling: z.coerce.number().int().optional(),
	parentStatus: z.enum(["father&mother", "fatherless", "motherless", "orphan"]).optional(),
	childStatus: z.enum(["biological_child", "step_child", "adopted_child"]).optional(),
	phone: z.string().optional(),
	provinceId: z.coerce.number().int().optional(),
	regencyId: z.coerce.number().int().optional(),
	districtId: z.coerce.number().int().optional(),
	village: z.string().optional(),
	subVillage: z.string().optional(),
	rt: z.string().optional(),
	rw: z.string().optional(),
	street: z.string().optional(),
	schoolName: z.string().optional(),
	schoolPhone: z.string().optional(),
	schoolProvinceId: z.coerce.number().int().optional(),
	schoolRegencyId: z.coerce.number().int().optional(),
	schoolDistrictId: z.coerce.number().int().optional(),
	schoolAddressDetail: z.string().optional(),
	schoolPostalCode: z.coerce.number().int().optional(),
})

export class PersonalDto extends createZodDto(PersonalSchema) {}
