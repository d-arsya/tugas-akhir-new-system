import type { JSX } from "react"
import { useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createPersonalSchema, type PersonalInput } from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import { useNavigate } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronRight, ArrowLeft } from "lucide-react"
import { Button } from "@roja/ui"
import { toast } from "sonner"
import { isGroupAllInvisible } from "@roja/utils"
import { NoNeedDataDisclaimer } from "../no-need-data-disclaimer"
import { PersonalFormSections } from "../forms/PersonalFormSections"

export const InvalidPersonalStepContent = ({ onNext }: { onNext: () => void }): JSX.Element => {
	const navigate = useNavigate()
	const queryClient = useQueryClient()

	const { data: landingData } = useQuery({
		queryKey: ["landingInfo"],
		queryFn: () => psbApi.getLanding(),
	})
	const formSettings = landingData?.formSettings
	const isAllInvisible = isGroupAllInvisible(formSettings, "personal data")

	const dynamicSchema = useMemo(() => createPersonalSchema(formSettings), [formSettings])

	const { data: initialData, isLoading } = useQuery({
		queryKey: ["invalidData"],
		queryFn: () => psbApi.getInvalidData(),
	})

	const mutation = useMutation({
		mutationFn: (data: PersonalInput) => psbApi.updateInvalidStep("personal", data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invalidData"] })
			onNext()
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
		values: (initialData ? (initialData as Record<string, unknown>).personal : {}) as PersonalInput,
		defaultValues: {
			fullName: "",
			shortName: "",
			religion: "Islam",
			gender: "male",
			nationality: "wni",
			dateOfBirth: "",
			placeOfBirth: "",
			address: "",
			provinceId: 0,
			regencyId: 0,
			districtId: 0,
			village: "",
			street: "",
			rt: "",
			rw: "",
			subVillage: "",
			postalCode: "",
			phone: "",
			liveWith: "parent",
			siblingOrder: 1,
			numberOfSiblings: 0,
			parentStatus: "complete",
			childStatus: "kandung",
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
		console.error("Form Validation Errors (Invalid Personal):", formErrors)
		toast.error("Mohon periksa kembali kolom yang wajib diisi.")
	}

	if (isLoading) {
		return <div className="text-center py-10 text-xs font-medium text-[var(--grey)]">Memuat data pendaftaran...</div>
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

			<div className="flex justify-between gap-4 mt-8 border-t border-[var(--bg-form-border)] pt-6">
				<button type="button" onClick={() => navigate({ to: "/dashboard" })} className="roja_btn roja_btn-secondary text-xs flex items-center gap-1.5">
					<ArrowLeft className="w-4 h-4" />
					<span>Kembali ke Dashboard</span>
				</button>
				<button type="submit" className="roja_btn roja_btn-warning text-white bg-[#ffa800] hover:bg-[#e09400] font-semibold flex items-center gap-2 shadow-lg shadow-[#ffa800]/20" disabled={mutation.isPending}>
					<span>{mutation.isPending ? "Menyimpan..." : "Selanjutnya"}</span>
					<ChevronRight className="w-5 h-5" />
				</button>
			</div>
		</form>
	)
}

export default InvalidPersonalStepContent
