import type { JSX } from "react"

type AcademicRowActionsProps = { onEdit: () => void; onDelete: () => void }

/**
 * The `<div class="actions">` cell `MajorController@list` and `GradeService::createActionButtons`
 * build: a detail icon that opens the edit modal and a destroy icon that opens `#modalDelete`.
 *
 * `.table .actions a` is `inline-block` with `margin-right: 5px`, zeroed on the last child; the
 * `{" "}` reproduces the newline Blade leaves between the two anchors. Neither `href` is real —
 * both handlers call `preventDefault()` — so the port renders buttons.
 */
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
