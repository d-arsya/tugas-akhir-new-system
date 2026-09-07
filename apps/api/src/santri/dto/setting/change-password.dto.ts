import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, MinLength } from "class-validator"

export class ChangePasswordDto {
	@ApiProperty({ description: "Password baru (minimal 8 karakter)", example: "PasswordBaru123!" })
	@IsString()
	@IsNotEmpty()
	@MinLength(8, { message: "Password minimal 8 karakter" })
	password: string

	@ApiProperty({ description: "Konfirmasi password baru", example: "PasswordBaru123!" })
	@IsString()
	@IsNotEmpty()
	passwordConfirmation: string
}
