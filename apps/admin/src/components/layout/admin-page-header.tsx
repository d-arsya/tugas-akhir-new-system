import type { JSX, ReactNode } from "react"

export interface AdminPageHeaderProps {
	title?: string
	subtitle?: string
	actions?: ReactNode
}

export function AdminPageHeader({
	actions,
}: AdminPageHeaderProps): JSX.Element | null {
	if (!actions) return null
	return (
		<div className="flex items-center justify-end gap-2 pb-1">
			{actions}
		</div>
	)
}

export default AdminPageHeader
