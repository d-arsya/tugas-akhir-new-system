import { useEffect, useMemo, useState, type JSX } from "react"
import { useNavigate } from "@tanstack/react-router"

import type { AccountancyDelegatePayload } from "@roja/types"

import LegacyDeletePage from "@/components/legacy/legacy-delete-page"
import LegacySelect from "@/components/legacy/legacy-select"
import { useAccountancyDeleteStep } from "@/hooks/use-accountancy"
import type { LegacyDeletePageSubmit } from "@/hooks/use-legacy-delete-page"

type AccountancyDeleteCardProps =
	| { accountancyId: number; step: "delete"; submit: LegacyDeletePageSubmit<void> }
	| { accountancyId: number; step: "delegate-child"; submit: LegacyDeletePageSubmit<AccountancyDelegatePayload> }

const BACK_TO = "/accountancy"
const PLACEHOLDER = { value: "", label: "Select" }
const DELEGATE_HEADING = "Pindahkan data anak akun ke induk akun lain :"

const AccountancyDeleteCard = (props: AccountancyDeleteCardProps): JSX.Element | null => {
	const navigate = useNavigate()
	const { data } = useAccountancyDeleteStep(props.accountancyId, props.step)
	const [destination, setDestination] = useState("")

	useEffect(() => {
		if (data?.redirect) void navigate({ to: data.redirect, replace: true })
	}, [data?.redirect, navigate])

	const options = useMemo(
		() => [PLACEHOLDER, ...(data?.parents ?? []).map((parent) => ({ value: String(parent.id), label: parent.name ?? "" }))],
		[data?.parents],
	)

	if (!data || data.redirect) return null

	const name = data.name ?? ""

	if (props.step === "delete") {
		return (
			<LegacyDeletePage
				backTo={BACK_TO}
				heading={
					<>
						Yakinkah menghapus akun <span className="text-[var(--danger)]">{name}</span>?
					</>
				}
				description="Data akan dihapus dari database secara permanen. Anda tidak akan bisa mengembalikannya lagi."
				loading={props.submit.submitting}
				onConfirm={() => props.submit.submit()}
			/>
		)
	}

	return (
		<LegacyDeletePage
			backTo={BACK_TO}
			heading={DELEGATE_HEADING}
			helperLines={["Tidak tersedia? Buat akun terlebih dahulu.", "Atau hapus data anak akun ke menu terkait."]}
			description={
				<>
					Akun <span className="font-bold text-[var(--danger)]">{name}</span> akan dihapus secara permanen. Anda
					tidak akan bisa mengembalikannya lagi.
				</>
			}
			loading={props.submit.submitting}
			// No pick posts 0 on purpose so the API answers with its own required message.
			onConfirm={() => props.submit.submit({ parentId: Number(destination) })}
		>
			<LegacySelect value={destination} options={options} onChange={setDestination} mutedText={destination === ""} />
		</LegacyDeletePage>
	)
}

export default AccountancyDeleteCard
