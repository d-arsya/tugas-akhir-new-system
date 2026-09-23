import { useEffect, useMemo, useState, type JSX } from "react"
import { useNavigate } from "@tanstack/react-router"

import type { AccountancyDelegatePayload } from "@roja/types"

import LegacyDeletePage from "@/components/legacy/legacy-delete-page"
import LegacySelect from "@/components/legacy/legacy-select"
import { useAccountancyDeleteStep } from "@/hooks/use-accountancy"
import type { LegacyDeletePageSubmit } from "@/hooks/use-legacy-delete-page"

/**
 * The body both `accountancy/delete/*.blade.php` pages share. The plain confirm has no picker;
 * "Pindahkan anak akun" carries a `<select name="parent_id" data-plugin-selectTwo>` of the
 * candidate parents, the two-copy grey helper text and the same warning paragraph.
 *
 * Copy corrected (brief rule 4): the delegate page was copy-pasted from the Jenjang module and
 * still said "Buat jenjang terlebih dahulu", "Atau hapus data kelas ke menu terkait" and
 * "Jenjang <name> akan dihapus…" on a page that deletes an **akun**. All three name the akun now.
 */
type AccountancyDeleteCardProps =
	| { accountancyId: number; step: "delete"; submit: LegacyDeletePageSubmit<void> }
	| { accountancyId: number; step: "delegate-child"; submit: LegacyDeletePageSubmit<AccountancyDelegatePayload> }

const BACK_TO = "/accountancy"
// Legacy's first option is `<option value="" title="Select" selected disabled>`
const PLACEHOLDER = { value: "", label: "Select" }
/** Verbatim, including the space before the colon. */
const DELEGATE_HEADING = "Pindahkan data anak akun ke induk akun lain :"

const AccountancyDeleteCard = (props: AccountancyDeleteCardProps): JSX.Element | null => {
	const navigate = useNavigate()
	const { data } = useAccountancyDeleteStep(props.accountancyId, props.step)
	const [destination, setDestination] = useState("")

	// The destroy icon picked this page when the tree rendered; if the children moved since, the
	// server names the step that does apply and we walk there instead of showing a stale form.
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
			// Legacy submits with nothing selected and lets the validator answer "Kolom pilih induk
			// wajib untuk dipilih."; `Number("")` is 0, which no account has.
			onConfirm={() => props.submit.submit({ parentId: Number(destination) })}
		>
			<LegacySelect value={destination} options={options} onChange={setDestination} mutedText={destination === ""} />
		</LegacyDeletePage>
	)
}

export default AccountancyDeleteCard
