import type { JSX } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { psbApi } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import { Download } from "lucide-react"
import {
	Button,
	Skeleton,
	RojaCard,
} from "@roja/ui"
import { PsbJourneyTracker } from "@/components/dashboard/PsbJourneyTracker"
import { StatusHeroCard } from "@/components/dashboard/StatusHeroCard"
import { AnnouncementResultCard } from "@/components/dashboard/AnnouncementResultCard"
import PageHeader from "@/components/page-header"

const DashboardPage = (): JSX.Element => {
	const { data, isLoading } = useQuery({
		queryKey: ["dashboard"],
		queryFn: () => psbApi.getDashboard(),
	})

	if (isLoading) {
		return (
			<RojaCard className="w-full flex flex-col gap-6 p-6 md:p-8">
				<div className="flex justify-between items-center pb-4 border-b">
					<div className="flex flex-col gap-2">
						<Skeleton className="h-8 w-64 rounded-lg" />
						<Skeleton className="h-4 w-48 rounded" />
					</div>
					<Skeleton className="h-10 w-36 rounded-lg" />
				</div>
				<Skeleton className="h-24 w-full rounded-2xl" />
				<Skeleton className="h-40 w-full rounded-2xl" />
			</RojaCard>
		)
	}

	const reg = data?.registrant
	const announcement = data?.announcement
	const statusInfo = data?.statusInfo

	// Determine active status: statusInfo.status -> fallback resolution
	let rawStatus = statusInfo?.status
	if (!rawStatus) {
		if (reg?.approvalStatus && reg.approvalStatus !== "wait") {
			rawStatus = reg.approvalStatus
		} else if (reg?.dataValidation && reg.dataValidation !== "valid") {
			rawStatus = reg.dataValidation
		} else if (reg?.registrationPath === "indent") {
			if (reg?.indentTest === "failed" && !reg?.regularTest) rawStatus = "indent_failed"
			else if (reg?.indentTest === "success") rawStatus = "indent_test_passed"
			else if (reg?.dataValidation === "valid") rawStatus = "data_valid"
			else rawStatus = "wait"
		} else {
			if (reg?.regularTest === "success") rawStatus = "regular_test_passed"
			else if (reg?.regularTest === "failed") rawStatus = "regular_test_failed"
			else if (reg?.dataValidation === "valid") rawStatus = "data_valid"
			else rawStatus = "wait"
		}
	}
	if (rawStatus === "reject") rawStatus = "failed"
	const status = rawStatus === "indent failed" ? "indent_failed" : rawStatus
	const validationNote = statusInfo?.description || reg?.dataValidationNote

	const levelLabel = reg?.levelId === 1 ? "Setingkat SMP" : reg?.levelId === 2 ? "Setingkat SMA" : "Pondok Roja"
	const printType =
		status === "approve"
			? "accepted"
			: status === "failed"
				? "rejected"
				: status === "indent_failed"
					? "indent-rejected"
					: "registration"
	const printLabel = status === "approve" ? "Cetak Surat Kelulusan" : "Cetak Bukti PSB"
	const registrantIdParam = reg?.id ? String(reg.id) : ""

	const printAction = registrantIdParam ? (
		<Button asChild variant="roja-primary" size="sm" className="shadow-xs font-semibold">
			<Link
				to="/print/$type/$registrantId"
				params={{ type: printType, registrantId: registrantIdParam }}
				target="_blank"
				className="flex items-center gap-2"
			>
				<Download className="w-4 h-4" />
				<span>{printLabel}</span>
			</Link>
		</Button>
	) : undefined

	const isFinalAnnouncement = status === "approve" || status === "failed" || status === "indent_failed"

	return (
		<RojaCard className="w-full flex flex-col gap-6 md:gap-7 p-6 md:p-8">
			<PageHeader
				title={`Assalaamu'alaikum, ${reg?.fullname || reg?.fullName || ""}`}
				subtitle={
					reg ? `ID: ${reg.registrantId || "-"}  •  Jenjang: ${levelLabel}` : undefined
				}
				action={printAction}
			/>

			{/* 1. Admission Journey Progress Tracker */}
			<PsbJourneyTracker
				status={status}
				registrationPath={reg?.registrationPath}
				dataValidation={reg?.dataValidation}
				regularTest={reg?.regularTest}
				indentTest={reg?.indentTest}
				approvalStatus={reg?.approvalStatus}
			/>

			{/* 2. Status Hero Card (Untuk status selain Final Announcement Card) */}
			{!isFinalAnnouncement && (
				<StatusHeroCard
					status={status}
					validationNote={validationNote}
					registrationPath={reg?.registrationPath}
					registrantName={reg?.fullname || reg?.fullName}
				/>
			)}

			{/* 3. Final Announcement Result Card (Approve / Failed / Indent Failed) */}
			{isFinalAnnouncement && (
				<AnnouncementResultCard status={status} announcement={announcement} nis={reg?.nis} />
			)}
		</RojaCard>
	)
}

export const Route = createFileRoute("/_member/dashboard")({
	component: DashboardPage,
})

export default DashboardPage

