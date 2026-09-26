import type { JSX, ReactNode } from "react"

import LegacyButton from "@/components/legacy/legacy-button"
import LegacyModal from "@/components/legacy/legacy-modal"

type AcademicEditModalProps = {
	open: boolean
	loading: boolean
	title: string
	submitting: boolean
	onCancel: () => void
	onSubmit: () => void
	children: ReactNode
}

const LOADING_TITLE = "Edit keterangan"

const AcademicEditModal = ({
	open,
	loading,
	title,
	submitting,
	onCancel,
	onSubmit,
	children,
}: AcademicEditModalProps): JSX.Element => (
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
				<LegacyButton variant="primary" loading={submitting} onClick={loading ? undefined : onSubmit}>
					Simpan
				</LegacyButton>
			</>
		}
	>
		{loading ? (
			<div className="text-center">
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
