import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

const SettingPage = (): JSX.Element => {
	return (
		<div className="flex flex-col gap-4">
			<h1 className="text-2xl font-bold text-[var(--heading-txt-inverse)]">Pengaturan Akun</h1>
			<p className="text-xs text-[var(--muted-txt-color)]">Ubah password & pengaturan 2FA.</p>
		</div>
	)
}

export const Route = createFileRoute("/_member/setting")({
	component: SettingPage,
})

export default SettingPage
