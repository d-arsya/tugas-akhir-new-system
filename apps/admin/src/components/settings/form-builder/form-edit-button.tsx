import type { JSX } from "react"

import { EditIcon } from "@/components/settings/form-builder/form-builder-icons"

const EDIT_BUTTON_CLASS =
	"flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-[6px] border-0 bg-[rgba(228,0,126,0.16)] p-[2px] whitespace-normal transition-all duration-300 outline-none hover:bg-[var(--primary)] focus:bg-[var(--primary)]"

type FormEditButtonProps = { onEdit: () => void }

const FormEditButton = ({ onEdit }: FormEditButtonProps): JSX.Element => (
	<button
		type="button"
		onClick={(event) => {
			event.currentTarget.blur()
			onEdit()
		}}
		className={EDIT_BUTTON_CLASS}
		aria-label="Edit keterangan"
	>
		<EditIcon />
	</button>
)

export default FormEditButton
