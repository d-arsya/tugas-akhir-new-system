import { Controller, Get } from "@nestjs/common"
import { ApiOperation, ApiTags } from "@nestjs/swagger"
import { Public } from "@core/auth/decorators/public.decorator"
import { GoogleIdTokenService } from "@core/auth/google/google-id-token.service"

@ApiTags("Auth — Google")
@Controller("auth/google")
export class GoogleConfigController {
	constructor(private readonly googleIdTokenService: GoogleIdTokenService) {}

	@Public()
	@Get("config")
	@ApiOperation({ summary: "Client ID Google untuk tombol login" })
	config(): { clientId: string | null } {
		return { clientId: this.googleIdTokenService.clientId() }
	}
}
