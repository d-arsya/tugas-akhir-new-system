import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { singleGoogleAccount } from "@core/auth/google/google-account"
import { GoogleIdTokenService } from "@core/auth/google/google-id-token.service"
import { Student } from "@santri/entities/student.entity"
import { SantriAuthService, type SantriAuthResult } from "@santri/auth/santri-auth.service"

@Injectable()
export class SantriGoogleLoginService {
	constructor(
		@InjectRepository(Student)
		private readonly studentRepository: Repository<Student>,
		private readonly googleIdTokenService: GoogleIdTokenService,
		private readonly santriAuthService: SantriAuthService,
	) {}

	async login(credential: string, clientIp: string): Promise<SantriAuthResult> {
		const { email } = await this.googleIdTokenService.verify(credential)
		const students = await this.studentRepository
			.createQueryBuilder("student")
			.where("LOWER(student.email) = :email", { email })
			.andWhere("student.deletedAt IS NULL")
			.getMany()
		const student = singleGoogleAccount(students, "Email ini tidak terdaftar pada akun santri. Silakan hubungi admin.")
		return this.santriAuthService.completeLogin(student, clientIp)
	}
}
