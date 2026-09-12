import type { JSX } from "react"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createPersonalSchema, type PersonalInput } from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import useWizardStore from "@/stores/wizard.store"
import { useNavigate } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronRight } from "lucide-react"
import { Button } from "@roja/ui"
import { toast } from "sonner"
import { isGroupAllInvisible } from "@roja/utils"
import { NoNeedDataDisclaimer } from "../no-need-data-disclaimer"
import { PersonalFormSections } from "../forms/PersonalFormSections"

export const PersonalStepContent = ({ onNext }: { onNext: () => void }): JSX.Element => {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const sessionId = useWizardStore((s) => s.sessionId) || ""
	const clearSession = useWizardStore((s) => s.clearSession)

	const { data: landingData, isLoading: landingLoading } = useQuery({
		queryKey: ["landingInfo"],
		queryFn: () => psbApi.getLanding(),
	})
	const formSettings = landingData?.formSettings
	const isAllInvisible = isGroupAllInvisible(formSettings, "personal data")

	const dynamicSchema = useMemo(() => createPersonalSchema(formSettings), [formSettings])

	const { data: initialData, isLoading: stepLoading, error } = useQuery({
		queryKey: ["wizardStep", "personal", sessionId],
		queryFn: () => psbApi.getWizardStep("personal", sessionId),
		enabled: !!sessionId,
		retry: false,
	})

	useEffect(() => {
		if (error) {
			clearSession()
			toast.error("Sesi Pendaftaran Berakhir", {
				description: error instanceof Error ? error.message : "Sesi pendaftaran Anda telah berakhir. Silakan mulai kembali.",
			})
			navigate({ to: "/" })
		}
	}, [error, clearSession, navigate])

	const mutation = useMutation({
		mutationFn: (data: PersonalInput) => psbApi.saveWizardStep("personal", sessionId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["wizardStep", "personal", sessionId] })
			onNext()
		},
		onError: (err: any) => {
			toast.error("Gagal Menyimpan Data Diri", {
				description: err instanceof Error ? err.message : "Silakan periksa kembali data yang diisi.",
			})
		},
	})

	const {
		control,
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<PersonalInput>({
		resolver: zodResolver(dynamicSchema) as unknown as import("react-hook-form").Resolver<PersonalInput>,
		values: (initialData || {}) as PersonalInput,
		defaultValues: {
			fullName: "",
			shortName: "",
			religion: "islam",
			gender: "male",
			placeOfBirth: "",
			dateOfBirth: "",
			nationality: "wni",
			liveWith: "parent",
			siblingOrder: 1,
			numberOfSiblings: 0,
			parentStatus: "complete",
			childStatus: "kandung",
			phone: "",
			provinceId: 0,
			regencyId: 0,
			districtId: 0,
			village: "",
			street: "",
			rt: "",
			rw: "",
			subVillage: "",
			postalCode: "",
			address: "",
			nisn: "",
			nik: "",
			ksp: "",
			kip: "",
			certificateNumber: "",
			previousSchoolName: "",
			previousSchoolPhone: "",
			previousSchoolProvinceId: 0,
			previousSchoolRegencyId: 0,
			previousSchoolDistrictId: 0,
			previousSchoolAddressDetail: "",
			previousSchoolPostalCode: "",
		},
	})

	const onFormError = (formErrors: Record<string, any>): void => {
		console.error("Form Validation Errors (Personal):", formErrors)
		toast.error("Validasi Formulir Gagal", { description: "Mohon periksa kembali kolom yang wajib diisi." })
	}

	if (landingLoading || stepLoading) {
		return <div className="text-center py-10 text-xs">Memuat data...</div>
	}

	return (
		<form onSubmit={handleSubmit((d) => mutation.mutate(d), onFormError)} className="flex flex-col gap-8">
			{isAllInvisible && <NoNeedDataDisclaimer />}
			<PersonalFormSections
				control={control}
				register={register}
				errors={errors}
				setValue={setValue}
				watch={watch}
				formSettings={formSettings}
			/>

			<div className="flex justify-end gap-4 mt-8 border-t border-[var(--bg-form-border)] pt-6">
				<Button
					type="submit"
					variant="roja-warning"
					disabled={mutation.isPending}
				>
					<span>{mutation.isPending ? "Menyimpan..." : "Lanjutkan"}</span>
					<ChevronRight className="w-5 h-5 ml-1" />
				</Button>
			</div>
		</form>
	)
}

export default PersonalStepContent

