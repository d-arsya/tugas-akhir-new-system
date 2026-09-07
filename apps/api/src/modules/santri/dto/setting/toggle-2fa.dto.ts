import { ApiProperty } from "@nestjs/swagger"
import { IsBoolean, IsNotEmpty } from "class-validator"

export class Toggle2faDto {
	@ApiProperty({ description: "Status aktifkan 2FA via email", example: true })
	@IsBoolean()
	@IsNotEmpty()
	enabled: boolean
}
