import type { JSX } from "react"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createFamilySchema, type FamilyInput } from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronRight } from "lucide-react"
import { Button } from "@roja/ui"
import { toast } from "sonner"
import { FamilyFormSections } from "../forms/FamilyFormSections"

export const InvalidFamilyStepContent = ({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }): JSX.Element => {
	const queryClient = useQueryClient()

	const { data: landingData } = useQuery({
		queryKey: ["landingInfo"],
		queryFn: () => psbApi.getLanding(),
	})
	const formSettings = landingData?.formSettings

	const dynamicSchema = useMemo(() => createFamilySchema(formSettings), [formSettings])

	const { data: initialData, isLoading } = useQuery({
		queryKey: ["invalidData"],
		queryFn: () => psbApi.getInvalidData(),
	})

	const mutation = useMutation({
		mutationFn: (data: FamilyInput) => psbApi.updateInvalidStep("family", data),
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
	} = useForm<FamilyInput>({
		resolver: zodResolver(dynamicSchema) as unknown as import("react-hook-form").Resolver<FamilyInput>,
		values: (initialData ? (initialData as Record<string, unknown>).family : {}) as FamilyInput,
		defaultValues: {
			fatherName: "",
			fatherStatus: "hidup",
			fatherReligion: "Islam",
			fatherLastEducation: "sma",
			fatherOccupation: "",
			fatherIncome: 0,
			fatherPhone: "",
			motherName: "",
			motherStatus: "hidup",
			motherReligion: "Islam",
			motherLastEducation: "sma",
			motherOccupation: "",
			motherIncome: 0,
			motherPhone: "",
			numberOfSiblings: 0,
			childOrder: 1,
			familyStatus: "complete",
			familyStreet: "",
			familyProvinceId: 0,
			familyRegencyId: 0,
			familyDistrictId: 0,
			familyVillage: "",
			familyRt: "",
			familyRw: "",
			familySubVillage: "",
		},
	})

	const onFormError = (formErrors: Record<string, any>): void => {
		console.error("Form Validation Errors (Invalid Family):", formErrors)
		toast.error("Mohon periksa kembali kolom yang wajib diisi.")
	}

	if (isLoading) {
		return <div className="text-center py-10 text-xs font-medium text-[var(--grey)]">Memuat data pendaftaran...</div>
	}

	return (
		<form onSubmit={handleSubmit((d) => mutation.mutate(d), onFormError)} className="flex flex-col gap-8">
			<div className="border-l-4 border-l-[#ffa800] pl-4 py-1 mb-2">
				<div className="text-xs font-bold text-[#ffa800] tracking-wide m-0">Perbaiki Data: Sub-step 3 (Data Keluarga & Orang Tua)</div>
				<div className="text-[10px] text-[var(--grey)] mt-0.5">Perbarui data ayah dan ibu kandung yang ditandai tidak valid.</div>
			</div>

			<FamilyFormSections
				control={control}
				register={register}
				errors={errors}
				setValue={setValue}
				watch={watch}
				formSettings={formSettings}
			/>

			<div className="flex justify-between items-center gap-4 mt-8 border-t border-[var(--bg-form-border)] pt-6">
				<Button type="button" variant="outline" onClick={onPrev}>
					Sebelumnya
				</Button>
				<Button type="submit" variant="roja-warning" disabled={mutation.isPending}>
					<span>{mutation.isPending ? "Menyimpan..." : "Selanjutnya"}</span>
					<ChevronRight className="w-5 h-5 ml-1" />
				</Button>
			</div>
		</form>
	)
}

export default InvalidFamilyStepContent
