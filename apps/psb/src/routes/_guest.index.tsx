import type { JSX } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { checkEmailSchema, type CheckEmailInput } from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import useWizardStore from "@/stores/wizard.store"
import { useNavigate, Link, createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ChevronRight, Info, Mail, AlertTriangle } from "lucide-react"
import WizardStepper from "@/components/wizard-stepper"
import {
	Button,
	Input,
	Label,
	Alert,
	AlertDescription,
	SearchableSelect,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Skeleton,
	RojaCard,
} from "@roja/ui"

const LandingPage = (): JSX.Element => {
	const navigate = useNavigate()
	const setSession = useWizardStore((s) => s.setSession)
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

	const { data: landingData, isLoading: isLandingLoading } = useQuery({
		queryKey: ["landingInfo"],
		queryFn: () => psbApi.getLanding(),
	})

	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<CheckEmailInput>({
		resolver: zodResolver(checkEmailSchema) as unknown as import("react-hook-form").Resolver<CheckEmailInput>,
		defaultValues: {
			email: "",
			levelId: 0,
		},
	})

	const onSubmit = async (data: CheckEmailInput): Promise<void> => {
		setIsSubmitting(true)
		try {
			const res = await psbApi.checkEmail(data)
			setSession(res.sessionId, data.email, data.levelId)
			navigate({ to: "/register" })
		} catch (err: unknown) {
			alert(err instanceof Error ? err.message : "Gagal memulai pendaftaran")
		} finally {
			setIsSubmitting(false)
		}
	}

	if (isLandingLoading) {
		return (
			<RojaCard className="w-full max-w-4xl">
				<div className="flex flex-col gap-6 py-6 items-center">
					<Skeleton className="h-8 w-64 rounded-full" />
					<Skeleton className="h-16 w-full max-w-2xl rounded-xl" />
					<Skeleton className="h-12 w-full max-w-md rounded-xl" />
					<Skeleton className="h-12 w-full max-w-md rounded-xl" />
				</div>
			</RojaCard>
		)
	}

	const isOpen = landingData?.isOpen ?? false
	const schoolName = landingData?.schoolName || "Pondok Roja"
	const levels = landingData?.levels || []
	const note = landingData?.academicYear?.note || "PSB Reguler dibuka untuk tahun ajaran aktif. Harap isi email dengan benar untuk pengiriman password."

	if (!isOpen) {
		return (
			<RojaCard className="w-full max-w-md p-8 md:p-10 flex flex-col items-center text-center gap-6">
				<div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-200">
					<AlertTriangle className="w-8 h-8" />
				</div>

				<div className="flex flex-col gap-2">
					<div className="text-sm font-bold text-slate-800 m-0">Pendaftaran Ditutup</div>
					<p className="text-xs text-[var(--body-txt-inverse)] m-0 leading-relaxed">
						Saat ini Penerimaan Santri Baru (PSB) untuk {schoolName} sedang tidak dibuka.
						Silakan hubungi kontak panitia atau kunjungi website utama untuk informasi lebih lanjut.
					</p>
				</div>

				<div className="text-center text-xs border-t border-[var(--bg-form-border)] w-full pt-4">
					Sudah pernah mendaftar?{" "}
					<Link to="/login" className="text-[var(--secondary)] hover:underline font-semibold">
						Masuk ke Member Area
					</Link>
				</div>
			</RojaCard>
		)
	}

	return (
		<RojaCard className="w-full max-w-4xl p-8 md:p-12">
			{/* Stepper showing main step 1 */}
			<WizardStepper mainStep={1} />

				<form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-6">
					{/* Info Alert Box */}
					<Alert variant="muted-warning" className="max-w-2xl mx-auto flex items-center gap-3">
						<Info className="w-5 h-5 shrink-0" />
						<AlertDescription className="text-xs font-medium leading-relaxed">
							{note}
						</AlertDescription>
					</Alert>

					{/* Jenjang Dropdown */}
					<div className="flex flex-col items-center w-full mt-4">
						<Label className="text-center block text-sm font-semibold text-slate-600 mb-2">
							Kamu ingin mendaftar pada jenjang apa?
						</Label>
						<div className="w-full max-w-md">
							<Controller
								control={control}
								name="levelId"
								render={({ field }) => (
									<SearchableSelect
										placeholder="-- Pilih Jenjang --"
										searchPlaceholder="Cari jenjang..."
										triggerClassName="h-12 rounded-xl text-center font-medium"
										value={field.value ? String(field.value) : ""}
										onValueChange={(val) => field.onChange(Number(val))}
										options={[
											{ value: "0", label: "-- Pilih Jenjang --" },
											...levels.map((l) => ({ value: String(l.id), label: l.name })),
										]}
									/>
								)}
							/>
							{errors.levelId && (
								<p className="text-xs text-destructive text-center mt-1.5">{errors.levelId.message}</p>
							)}
						</div>
					</div>

					{/* Email Input */}
					<div className="flex flex-col items-center w-full">
						<Label className="text-center block text-sm font-semibold text-slate-600 mb-2">
							Untuk informasi penerimaan, kami membutuhkan email kamu
						</Label>
						<div className="w-full max-w-md">
							<Input
								type="email"
								className="h-12 rounded-xl text-sm"
								placeholder="yourmail.address@gmail.com"
								{...register("email")}
							/>
						</div>
						{errors.email && (
							<p className="text-xs text-destructive text-center mt-1.5">{errors.email.message}</p>
						)}
					</div>

					{/* Centered Orange Submit Button */}
					<div className="flex justify-center mt-4">
						<Button
							type="submit"
							variant="roja-warning"
							size="lg"
							className="px-8 rounded-lg"
							disabled={isSubmitting}
						>
							<span>{isSubmitting ? "Memproses..." : "Selanjutnya"}</span>
							<ChevronRight className="w-5 h-5 ml-1" />
						</Button>
					</div>
				</form>

				<div className="text-center text-xs border-t border-[var(--bg-form-border)] mt-8 pt-4 text-[var(--body-txt-inverse)]">
					Sudah pernah mendaftar?{" "}
					<Link to="/login" className="text-[var(--secondary)] hover:underline font-semibold">
						Masuk ke Member Area
					</Link>
				</div>
			</RojaCard>
	)
}

export const Route = createFileRoute("/_guest/")({
	component: LandingPage,
})

export default LandingPage
