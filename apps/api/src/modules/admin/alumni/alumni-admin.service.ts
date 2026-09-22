import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Alumni } from "@admin/entities/alumni.entity"
import { AlumniFilterDto, UpdateAlumniDto } from "@admin/dto/alumni-admin.dto"

@Injectable()
export class AlumniAdminService {
	constructor(
		@InjectRepository(Alumni)
		private readonly alumniRepo: Repository<Alumni>,
	) {}

	async getGroupedByGraduationYear() {
		const result = await this.alumniRepo
			.createQueryBuilder("a")
			.select("COALESCE(a.academic_year, 'Lainnya')", "graduationYear")
			.addSelect("COUNT(a.id)", "count")
			.groupBy("COALESCE(a.academic_year, 'Lainnya')")
			.orderBy("graduationYear", "DESC")
			.getRawMany()

		return result.map((r) => ({
			graduationYear: r.graduationYear,
			count: parseInt(r.count, 10),
		}))
	}

	async getArchiveYears() {
		return this.getGroupedByGraduationYear()
	}

	async findByGraduationYear(graduationYear: string, query: AlumniFilterDto) {
		const { search, page = 1, limit = 10 } = query
		const qb = this.alumniRepo.createQueryBuilder("a")

		if (graduationYear !== "all") {
			qb.where("a.academic_year = :graduationYear", { graduationYear })
		}

		if (search) {
			qb.andWhere("(a.fullname ILIKE :search OR a.nis ILIKE :search OR a.alumni_email ILIKE :search)", {
				search: `%${search}%`,
			})
		}

		qb.orderBy("a.id", "DESC")
		qb.skip((page - 1) * limit).take(limit)

		const [items, total] = await qb.getManyAndCount()
		return {
			data: items,
			meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
		}
	}


	async exportByGraduationYear(graduationYear: string) {
		const qb = this.alumniRepo.createQueryBuilder("a")
		if (graduationYear !== "all") {
			qb.where("a.academic_year = :graduationYear", { graduationYear })
		}
		qb.orderBy("a.fullname", "ASC")
		return qb.getMany()
	}

	async findOne(id: number) {
		const alumni = await this.alumniRepo.findOneBy({ id })
		if (!alumni) throw new NotFoundException(`Alumni #${id} not found`)
		return alumni
	}

	async update(id: number, dto: UpdateAlumniDto) {
		const alumni = await this.findOne(id)
		Object.assign(alumni, dto)
		return this.alumniRepo.save(alumni)
	}

	async removeByGraduationYear(graduationYear: string) {
		await this.alumniRepo.delete({ academicYear: graduationYear })
		return { success: true, message: `Alumni untuk tahun kelulusan ${graduationYear} berhasil dihapus` }
	}

	async removeOne(id: number) {
		const alumni = await this.findOne(id)
		await this.alumniRepo.remove(alumni)
		return { success: true, message: `Alumni #${id} berhasil dihapus` }
	}
}
