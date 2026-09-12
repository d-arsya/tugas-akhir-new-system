import type { JSX } from "react"
import { useMemo } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createIdentitySchema, type IdentityInput } from "@/schemas/register.schema"
import { psbApi } from "@/lib/api"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronRight } from "lucide-react"
import { isFieldVisible, getFieldLabel, getFieldOptions, getOptionValue } from "@roja/utils"
import { SearchableSelect, Input, Label, Textarea } from "@roja/ui"
import { toast } from "sonner"
import IdentityFormSections from "../forms/IdentityFormSections";

export const InvalidIdentityStepContent = ({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }): JSX.Element => {
	const queryClient = useQueryClient()

	const { data: landingData } = useQuery({
		queryKey: ["landingInfo"],
		queryFn: () => psbApi.getLanding(),
	})
	const formSettings = landingData?.formSettings

	const dynamicSchema = useMemo(() => createIdentitySchema(formSettings), [formSettings])

	const { data: initialData, isLoading } = useQuery({
		queryKey: ["invalidData"],
		queryFn: () => psbApi.getInvalidData(),
	})

	const mutation = useMutation({
		mutationFn: (data: IdentityInput) => psbApi.updateInvalidStep("identity", data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invalidData"] })
			onNext()
		},
	})

	const {
		control,
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<IdentityInput>({
		resolver: zodResolver(dynamicSchema) as unknown as import("react-hook-form").Resolver<IdentityInput>,
		values: (initialData ? (initialData as Record<string, unknown>).identity : {}) as IdentityInput,
		defaultValues: {
			nik: "",
			nisn: "",
			certificateNumber: "",
			ksp: "",
			kip: "",
			weight: 0,
			height: 0,
			bloodType: "A",
			visualCondition: "normal",
			hearingCondition: "normal",
			immunizationGiven: "complete",
			diseaseHistories: [],
			reading: "quran",
			jilidChapter: "",
			quranMemorizing: "",
			learningAchievment: "",
			gift: "",
		},
	})

	const { fields, append, remove } = useFieldArray({
		control,
		name: "diseaseHistories",
	})

	const watchReading = watch("reading")

	const onFormError = (formErrors: Record<string, any>): void => {
		console.error("Form Validation Errors (Invalid Identity):", formErrors)
		toast.error("Mohon periksa kembali kolom yang wajib diisi.")
	}

	if (isLoading) {
		return <div className="text-center py-10 text-xs font-medium text-[var(--grey)]">Memuat data pendaftaran...</div>
	}

	return (
		<form onSubmit={handleSubmit((d) => mutation.mutate(d), onFormError)} className="flex flex-col gap-8">
			<div className="border-l-4 border-l-[#ffa800] pl-4 py-1 mb-2">
				<div className="text-xs font-bold text-[#ffa800] tracking-wide m-0">Perbaiki Data: Sub-step 2 (Identitas & Kesehatan)</div>
				<div className="text-[10px] text-[var(--grey)] mt-0.5">Perbarui nomor identitas dan data kesehatan yang ditandai tidak valid.</div>
			</div>

			<IdentityFormSections
				control={control}
				register={register}
				errors={errors}
				fields={fields}
				append={append}
				remove={remove}
				watchReading={watchReading}
				formSettings={formSettings}
			/>

			<div className="flex justify-between gap-4 mt-8 border-t border-[var(--bg-form-border)] pt-6">
				<button type="button" onClick={onPrev} className="roja_btn roja_btn-secondary text-xs">
					Sebelumnya
				</button>
				<button type="submit" className="roja_btn roja_btn-warning text-white bg-[#ffa800] hover:bg-[#e09400] font-semibold flex items-center gap-2 shadow-lg shadow-[#ffa800]/20" disabled={mutation.isPending}>
					<span>{mutation.isPending ? "Menyimpan..." : "Selanjutnya"}</span>
					<ChevronRight className="w-5 h-5" />
				</button>
			</div>
		</form>
	)
}

export default InvalidIdentityStepContent
