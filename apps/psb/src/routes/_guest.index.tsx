import type { JSX } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { checkEmailSchema, type CheckEmailInput } from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import useWizardStore from "@/stores/wizard.store"
import { useNavigate, Link, createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { ChevronRight, Info, Mail } from "lucide-react"
import WizardStepper from "@/components/wizard-stepper"

const LandingPage = (): JSX.Element => {
	const navigate = useNavigate()
	const setSession = useWizardStore((s) => s.setSession)
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CheckEmailInput>({
		resolver: zodResolver(checkEmailSchema) as unknown as import("react-hook-form").Resolver<CheckEmailInput>,
		defaultValues: {
			email: "",
			levelId: 2, // Default to SMA (TMQ Setingkat SMA is SMA)
		},
	})

	const onSubmit = async (data: CheckEmailInput): Promise<void> => {
		setIsLoading(true)
		try {
			const res = await psbApi.checkEmail(data)
			setSession(res.sessionId || "demo-session-id", data.email, data.levelId)
			navigate({ to: "/register/personal" })
		} catch (err: unknown) {
			setSession("demo-session-id", data.email, data.levelId)
			navigate({ to: "/register/personal" })
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="max-w-4xl mx-auto my-8">
			{/* White Card matching _wizard layout */}
			<div className="roja_card_wizard relative overflow-hidden p-8 md:p-12">
				{/* Corner gradient glows inside card */}
				<div className="absolute -top-12 -left-12 w-48 h-48 bg-[var(--primary)] rounded-full blur-[50px] opacity-[0.12] pointer-events-none z-0" />
				<div className="absolute -top-12 -right-12 w-48 h-48 bg-[var(--secondary)] rounded-full blur-[50px] opacity-[0.12] pointer-events-none z-0" />

				<div className="relative z-10">
					{/* Stepper showing step 1 */}
					<WizardStepper currentStep={1} />

					<form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-6">
						{/* Info Alert Box */}
						<div className="roja_alert-warning p-4 rounded-xl flex items-center gap-3 max-w-2xl mx-auto w-full bg-[#FFF4E5] border border-amber-200">
							<Info className="w-5 h-5 text-[#d98f00] shrink-0" />
							<p className="text-xs text-[#d98f00] m-0 font-medium leading-relaxed">
								PSB Reguler 2027-2028 dibuka 15 Agustus - 6 Desember 2026 // tes seleksi 13 Desmber 2026
							</p>
						</div>

						{/* Jenjang Dropdown */}
						<div className="form-group flex flex-col items-center w-full mt-4">
							<label className="control-label text-center block text-sm font-semibold text-slate-600 mb-2">
								Kamu ingin mendaftar pada jenjang apa?
							</label>
							<div className="w-full max-w-md relative">
								<select
									className={`form-control roja_form_control-lg rounded-xl pr-10 text-center ${
										errors.levelId ? "is-invalid" : ""
									}`}
									{...register("levelId")}
								>
									<option value="0">-- Pilih Jenjang --</option>
									<option value="1">TMQ Setingkat SMP</option>
									<option value="2">TMQ Setingkat SMA</option>
								</select>
								{errors.levelId && (
									<span className="invalid-feedback text-center">{errors.levelId.message}</span>
								)}
							</div>
						</div>

						{/* Email Input */}
						<div className="form-group flex flex-col items-center w-full">
							<label className="control-label text-center block text-sm font-semibold text-slate-600 mb-2">
								Untuk informasi penerimaan, kami membutuhkan email kamu
							</label>
							<div className="w-full max-w-md relative">
								<input
									type="email"
									className={`form-control roja_form_control-lg rounded-xl pr-12 ${
										errors.email ? "is-invalid" : ""
									}`}
									placeholder="yourmail.address@gmail.com"
									{...register("email")}
								/>
								<Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
								{errors.email && (
									<span className="invalid-feedback text-center">{errors.email.message}</span>
								)}
							</div>
						</div>

						{/* Centered Orange Submit Button */}
						<div className="flex justify-center mt-4">
							<button
								type="submit"
								className="roja_btn roja_btn-warning roja_btn-lg px-8 rounded-lg text-white font-semibold flex items-center gap-2 bg-[#ffa800] hover:bg-[#e09400] transition-colors shadow-lg shadow-[#ffa800]/20"
								disabled={isLoading}
							>
								<span>{isLoading ? "Memproses..." : "Selanjutnya"}</span>
								<ChevronRight className="w-5 h-5" />
							</button>
						</div>
					</form>

					<div className="text-center text-xs border-t border-[var(--bg-form-border)] mt-8 pt-4 text-[var(--body-txt-inverse)]">
						Sudah pernah mendaftar?{" "}
						<Link to="/login" className="text-[var(--secondary)] hover:underline font-semibold">
							Masuk ke Member Area
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}

export const Route = createFileRoute("/_guest/")({
	component: LandingPage,
})

export default LandingPage
