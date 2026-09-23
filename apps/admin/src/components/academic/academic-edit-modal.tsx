import type { JSX, ReactNode } from "react"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyModal from "@/components/legacy/legacy-modal"

type AcademicEditModalProps = {
	open: boolean
	/** True while the detail request is in flight — legacy shows a placeholder card. */
	loading: boolean
	/** The real modal title, shown once the fetched markup has replaced the placeholder. */
	title: string
	submitting: boolean
	onCancel: () => void
	onSubmit: () => void
	children: ReactNode
}

// `edit-data-default.js` / `grade/edit-data.js` paint this skeleton before the AJAX returns:
// header "Edit keterangan", a `spinner-grow tbr_spinner-primary` and the Batal/Simpan footer.
// The title is the same for all three modals, whichever row was clicked.
const LOADING_TITLE = "Edit keterangan"

/**
 * The `.tbr_edit_modal` shell the Jurusan, Kelas and Subkelas edit modals share.
 *
 * Legacy's Simpan is a `<button type="submit">` inside a real `<form>` whose click handler
 * calls `specificForm()` and `preventDefault()`s; pressing Enter in a field instead triggers
 * a native POST and navigates away. The port wires the click only, so Enter does nothing.
 */
const AcademicEditModal = ({
	open,
	loading,
	title,
	submitting,
	onCancel,
	onSubmit,
	children,
}: AcademicEditModalProps): JSX.Element => (
	// `.modal-block.modal-block-sm`
	<LegacyModal
		open={open}
		onClose={onCancel}
		size="sm"
		title={loading ? LOADING_TITLE : title}
		footer={
			<>
				<LegacyButton variant="light" className="mr-[8px]" onClick={onCancel}>
					Batal
				</LegacyButton>{" "}
				{/* While the skeleton is up the button is rendered but wired to nothing, like legacy */}
				<LegacyButton variant="primary" loading={submitting} onClick={loading ? undefined : onSubmit}>
					Simpan
				</LegacyButton>
			</>
		}
	>
		{loading ? (
			<div className="text-center">
				{/* `.spinner-grow.tbr_spinner-primary` — bootstrap 4 spinner in `var(--primary)` */}
				<span
					role="status"
					className="inline-block h-[32px] w-[32px] rounded-full bg-current align-text-bottom text-[var(--primary)] opacity-0 [animation:legacy-spinner-grow_0.75s_linear_infinite]"
				>
					<span className="sr-only">Loading...</span>
				</span>
			</div>
		) : (
			children
		)}
	</LegacyModal>
)

export default AcademicEditModal
