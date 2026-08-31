import type { JSX } from "react"
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router"
import useAuthStore from "@/stores/auth.store"
import type { RegistrantStatus } from "@roja/types"
import { useState, useEffect } from "react"
import Header from "@/components/header"

export const Route = createFileRoute("/_member")({
	beforeLoad: () => {
		// Temporary disabled for visual inspection
		/*
		const auth = useAuthStore.getState()
		if (!auth.isAuthenticated) {
			throw redirect({ to: "/login" })
		}
		*/
	},
	component: (): JSX.Element => {
		const auth = useAuthStore()
		const [debugStatus, setDebugStatus] = useState<RegistrantStatus>("wait")

		useEffect(() => {
			const dbStr = localStorage.getItem("roja-psb-mock-db")
			const idStr = localStorage.getItem("roja-mock-current-user-id") || "12345"
			if (dbStr) {
				try {
					const db = JSON.parse(dbStr)
					const reg = db.registrants[parseInt(idStr)]
					if (reg) {
						setDebugStatus(reg.approvalStatus)
					}
				} catch {
					// silent
				}
			}
		}, [auth.user])

		const handleStatusChange = (status: RegistrantStatus): void => {
			setDebugStatus(status)
			const dbStr = localStorage.getItem("roja-psb-mock-db")
			const idStr = localStorage.getItem("roja-mock-current-user-id") || "12345"
			if (dbStr) {
				try {
					const db = JSON.parse(dbStr)
					const reg = db.registrants[parseInt(idStr)]
					if (reg) {
						reg.approvalStatus = status
						if (status === "invalid") {
							reg.dataValidation = "invalid"
							reg.dataValidationNote = "Berkas ijazah buram dan NIK tidak sesuai KK. Harap unggah ulang berkas akta kelahiran dan ijazah asli."
						} else if (status === "fixed") {
							reg.dataValidation = "fixed"
						} else {
							reg.dataValidation = "valid"
						}
						db.registrants[parseInt(idStr)] = reg
						localStorage.setItem("roja-psb-mock-db", JSON.stringify(db))
						window.location.reload()
					}
				} catch {
					// silent
				}
			}
		}

		return (
			<div className="roja_wizard_container min-h-screen flex flex-col relative overflow-hidden bg-[var(--bg-primary)] pt-[70px]">
				{/* Unified Dynamic Header */}
				<Header />

				{/* Background decorative blob shapes */}
				<div className="roja_bg_blobs" />

				{/* Main Content Card Container */}
				<main className="flex-1 relative z-10 px-4 pb-12 pt-[25px] w-full max-w-6xl mx-auto flex items-center justify-center">
					<div className="roja_card_wizard w-full relative overflow-hidden p-8 md:p-12">
						{/* Corner gradient glows inside card */}
						<div className="absolute -top-12 -left-12 w-48 h-48 bg-[var(--primary)] rounded-full blur-[50px] opacity-[0.12] pointer-events-none z-0" />
						<div className="absolute -top-12 -right-12 w-48 h-48 bg-[var(--secondary)] rounded-full blur-[50px] opacity-[0.12] pointer-events-none z-0" />

						<div className="relative z-10 w-full">
							<Outlet />
						</div>
					</div>
				</main>

				{/* Footer bar */}
				<footer className="w-full bg-white border-t border-[var(--bg-form-border)] py-4 px-8 text-center md:flex md:justify-between text-[10px] text-[#abb4be] font-medium mt-auto relative z-10">
					<span>© Copyright 2026 TMQ (TARBIYYATU MUHAFFIZHATIL QUR'AN) PONDOK ROJA. All Rights Reserved.</span>
					<span className="mt-1 md:mt-0 block">Version 1.1.2</span>
				</footer>

				{/* Floating Debug Control Panel */}
				<div className="fixed bottom-4 right-4 bg-white border border-[var(--bg-form-border)] p-4 rounded-xl shadow-xl z-50 flex flex-col gap-2 max-w-xs">
					<span className="text-[10px] font-bold text-[var(--primary)] tracking-wider uppercase">
						🛠️ Simulation Controller
					</span>
					<div className="flex flex-col gap-1">
						<label className="text-[10px] text-[var(--grey)]">Set Approval Status:</label>
						<select
							className="form-control text-xs h-8 min-h-0 py-0 px-2"
							value={debugStatus}
							onChange={(e) => handleStatusChange(e.target.value as RegistrantStatus)}
						>
							<option value="wait">Wait (Menunggu)</option>
							<option value="invalid">Invalid (Re-submit data)</option>
							<option value="fixed">Fixed (Telah diperbaiki)</option>
							<option value="approve">Approve (Diterima)</option>
							<option value="failed">Failed (Ditolak)</option>
							<option value="indent_failed">Indent Failed (Gagal Indent)</option>
						</select>
					</div>
					<span className="text-[9px] text-[var(--grey)]">
						Toggles local DB approval status. Page reloads to apply layouts.
					</span>
				</div>
			</div>
		)
	},
})
