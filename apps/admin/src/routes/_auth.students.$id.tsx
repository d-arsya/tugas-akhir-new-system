import { useState, type JSX } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import { PageLoader } from "@roja/ui"
import { StudentEditWidgetInfo } from "@/components/students/edit/student-edit-widget-info"
import { StudentEditTabs } from "@/components/students/edit/student-edit-tabs"
import { StudentEditWidgetStatus } from "@/components/students/edit/student-edit-widget-status"
import { toast } from "sonner"
import { ArrowLeft, GraduationCap } from "lucide-react"

export const Route = createFileRoute("/_auth/students/$id")({
	component: StudentDetailPage,
})

function StudentDetailPage(): JSX.Element {
	const params = Route.useParams() as { id?: string }
	const studentId = params?.id || "1"

	const { data, isLoading } = useQuery({
		queryKey: ["admin-student-detail", studentId],
		queryFn: () => adminApi.getStudentById(Number(studentId)),
	})

	const student = data?.data

	if (isLoading || !student) return <PageLoader />

	return (
		<div className="space-y-6">
			{/* Page Header Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
				<div className="flex items-center gap-3">
					<Link
						to={"/students" as any}
						className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
					</Link>
					<div>
						<h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
							<GraduationCap className="w-5 h-5 text-[var(--primary)]" />
							Detail & Edit Data Santri: {student.fullName}
						</h2>
						<p className="text-xs text-slate-500 mt-0.5">
							NISP: <span className="font-mono font-bold text-slate-800">{student.nis}</span> • Kelas {student.gradeName} ({student.subGradeName})
						</p>
					</div>
				</div>
			</div>

			{/* 3-Column Layout Matching student/edit.blade.php */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
				{/* Left Column (col-lg-3 equivalent) */}
				<div className="lg:col-span-3">
					<StudentEditWidgetInfo
						student={student}
						onUploadAvatar={(file) => toast.success(`Foto ${file.name} berhasil diunggah!`)}
					/>
				</div>

				{/* Center Column (col-lg-6 equivalent) */}
				<div className="lg:col-span-6">
					<StudentEditTabs student={student} />
				</div>

				{/* Right Column (col-lg-3 equivalent) */}
				<div className="lg:col-span-3">
					<StudentEditWidgetStatus
						student={student}
						onSave={() => toast.success("Perubahan data santri berhasil disimpan!")}
						onPrintPdf={() => toast.info("Membuat profil lengkap santri versi PDF...")}
					/>
				</div>
			</div>
		</div>
	)
}
