import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

import { User } from "@admin/auth/entities/user.entity"
import { AdminUserController } from "@admin/user/admin-user.controller"
import { AdminUserService } from "@admin/user/admin-user.service"
import { SettingSchool } from "@shared/school/entities/setting-school.entity"

@Module({
	imports: [TypeOrmModule.forFeature([User, SettingSchool])],
	controllers: [AdminUserController],
	providers: [AdminUserService],
})
export class UserAdminModule {}
