import type { JSX } from "react"

type AcademicRowActionsProps = { onEdit: () => void; onDelete: () => void }

const AcademicRowActions = ({ onEdit, onDelete }: AcademicRowActionsProps): JSX.Element => (
	<div className="align-middle">
		<button type="button" onClick={onEdit} className="mr-[5px] inline-block cursor-pointer align-middle">
			<img src="/assets/svg/icons/data_detail.svg" alt="Detail" width={24} height={24} />
		</button>{" "}
		<button type="button" onClick={onDelete} className="inline-block cursor-pointer align-middle">
			<img src="/assets/svg/icons/data_destroy.svg" alt="Destroy" width={24} height={24} />
		</button>
	</div>
)

export default AcademicRowActions
