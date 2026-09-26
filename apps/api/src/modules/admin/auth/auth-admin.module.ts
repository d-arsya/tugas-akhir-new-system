import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { TypeOrmModule } from "@nestjs/typeorm"

import { AdminAuthController } from "@admin/auth/admin-auth.controller"
import { AdminAuthService } from "@admin/auth/admin-auth.service"
import { AdminCreatePasswordController } from "@admin/auth/admin-create-password.controller"
import { AdminCreatePasswordService } from "@admin/auth/admin-create-password.service"
import { AdminProfileController } from "@admin/auth/admin-profile.controller"
import { AdminProfileService } from "@admin/auth/admin-profile.service"
import { AuthLogController } from "@admin/auth/auth-log.controller"
import { AuthLogScheduler } from "@admin/auth/auth-log.scheduler"
import { AuthLogService } from "@admin/auth/auth-log.service"
import { AuthLogWriter } from "@admin/auth/auth-log.writer"
import { AuthLog } from "@admin/auth/entities/auth-log.entity"
import { User } from "@admin/auth/entities/user.entity"
import { AdminIpBanController } from "@admin/auth/ip-ban.controller"

@Module({
	imports: [TypeOrmModule.forFeature([User, AuthLog]), JwtModule.register({})],
	controllers: [
		AdminAuthController,
		AdminCreatePasswordController,
		AdminProfileController,
		AuthLogController,
		AdminIpBanController,
	],
	providers: [
		AdminAuthService,
		AdminCreatePasswordService,
		AdminProfileService,
		AuthLogService,
		AuthLogWriter,
		AuthLogScheduler,
	],
})
export class AuthAdminModule {}
