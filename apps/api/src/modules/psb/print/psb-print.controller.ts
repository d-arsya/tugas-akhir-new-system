import { Controller, Get, Param, ParseIntPipe, UseGuards } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger"
import { CurrentUser } from "@core/auth/decorators/current-user.decorator"
import { Public } from "@core/auth/decorators/public.decorator"
import { ActiveMemberGuard } from "@psb/guards/active-member.guard"
import { PsbJwtAuthGuard } from "@psb/guards/psb-jwt-auth.guard"
import { RegistrationProofResponseDto, DecisionProofResponseDto } from "@psb/dto/print/print-response.dto"
import { ApiResponseWrapped } from "@core/decorators/api-response-wrapped.decorator"
import { PsbPrintService } from "@psb/print/psb-print.service"
import type { JwtPayload } from "@core/auth/strategies/jwt.strategy"

@ApiTags("PSB — Print & Proofs")
@Controller("psb/print")
export class PsbPrintController {
	constructor(private readonly psbPrintService: PsbPrintService) {}

	@Public()
	@Get("registration/:id")
	@ApiOperation({ summary: "Ambil data cetak bukti formulir registrasi awal pendaftar" })
	@ApiResponseWrapped({ status: 200, description: "Data bukti pendaftaran berhasil diambil", type: RegistrationProofResponseDto })
	@ApiResponse({ status: 404, description: "Pendaftar tidak ditemukan" })
	async getRegistrationProof(@Param("id", ParseIntPipe) id: number): Promise<RegistrationProofResponseDto> {
		const res = await this.psbPrintService.getRegistrationProof(id)
		return {
			registrant: res.registrant as any,
			academicYear: res.academicYear as any,
			school: res.school as any,
			level: res.level as any,
		}
	}

	@UseGuards(PsbJwtAuthGuard, ActiveMemberGuard)
	@ApiBearerAuth()
	@Get("accepted")
	@ApiOperation({ summary: "Ambil data cetak surat keputusan penerimaan santri baru" })
	@ApiResponseWrapped({ status: 200, description: "Surat keputusan diterima berhasil dimuat", type: DecisionProofResponseDto })
	@ApiResponse({ status: 403, description: "Status belum approve/diterima" })
	async getApprovalProof(@CurrentUser() user: JwtPayload): Promise<DecisionProofResponseDto> {
		const res = await this.psbPrintService.getApprovalProof(user.sub)
		return {
			registrant: res.registrant as any,
			academicYear: res.academicYear as any,
			school: res.school as any,
			announcement: res.announcement as any,
		}
	}

	@UseGuards(PsbJwtAuthGuard, ActiveMemberGuard)
	@ApiBearerAuth()
	@Get("rejected")
	@ApiOperation({ summary: "Ambil data cetak surat keputusan penolakan seleksi" })
	@ApiResponseWrapped({ status: 200, description: "Surat keputusan penolakan berhasil dimuat", type: DecisionProofResponseDto })
	@ApiResponse({ status: 403, description: "Status bukan reject/ditolak" })
	async getRejectedProof(@CurrentUser() user: JwtPayload): Promise<DecisionProofResponseDto> {
		const res = await this.psbPrintService.getRejectedProof(user.sub)
		return {
			registrant: res.registrant as any,
			school: res.school as any,
			announcement: res.announcement as any,
			academicYear: null,
		}
	}

	@UseGuards(PsbJwtAuthGuard, ActiveMemberGuard)
	@ApiBearerAuth()
	@Get("indent-rejected")
	@ApiOperation({ summary: "Ambil data cetak surat keputusan tidak lulus seleksi jalur indent" })
	@ApiResponseWrapped({ status: 200, description: "Surat keputusan tidak lulus indent berhasil dimuat", type: DecisionProofResponseDto })
	@ApiResponse({ status: 403, description: "Status tes indent bukan failed" })
	async getIndentRejectedProof(@CurrentUser() user: JwtPayload): Promise<DecisionProofResponseDto> {
		const res = await this.psbPrintService.getIndentRejectedProof(user.sub)
		return {
			registrant: res.registrant as any,
			school: res.school as any,
			announcement: res.announcement as any,
			academicYear: null,
		}
	}
}
