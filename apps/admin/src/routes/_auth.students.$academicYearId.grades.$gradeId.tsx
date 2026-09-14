import { useState, type JSX } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import { PageLoader } from "@roja/ui"
import { StudentLevel3Roster } from "@/components/students/student-level3-roster"
import { StudentBulkActions } from "@/components/students/student-bulk-actions"
import { StudentModals } from "@/components/students/student-modals"
import { toast } from "sonner"

export const Route = createFileRoute("/_auth/students/$academicYearId/grades/$gradeId")({
	component: StudentRosterLevel3Page,
})

function StudentRosterLevel3Page(): JSX.Element {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const { academicYearId, gradeId } = Route.useParams()

	const [search, setSearch] = useState("")
	const [subGradeFilter, setSubGradeFilter] = useState("ALL")
	const [selectedIds, setSelectedIds] = useState<number[]>([])

	const [showCreateModal, setShowCreateModal] = useState(false)
	const [showPromoteModal, setShowPromoteModal] = useState(false)
	const [showRetainModal, setShowRetainModal] = useState(false)
	const [showExcelModal, setShowExcelModal] = useState(false)

	const { data: ayData, isLoading: ayLoading } = useQuery({
		queryKey: ["admin-academic-years"],
		queryFn: () => adminApi.getAcademicYears(),
	})

	const { data: gradesData, isLoading: gradesLoading } = useQuery({
		queryKey: ["admin-grades"],
		queryFn: () => adminApi.getGrades(),
	})

	const { data: majorsData } = useQuery({
		queryKey: ["admin-majors"],
		queryFn: () => adminApi.getMajors(),
	})

	const { data: studentsData, isLoading: studentsLoading } = useQuery({
		queryKey: ["admin-students", search],
		queryFn: () => adminApi.getStudents({ search }),
	})

	const academicYears = ayData?.data || []
	const grades = gradesData?.data || []
	const majors = majorsData?.data || []
	const students = studentsData?.data?.items || []

	const subGrades = grades.flatMap((g: any) => g.subGrades || [])

	const currentAy = academicYears.find((a: any) => String(a.id) === String(academicYearId)) || {
		id: Number(academicYearId),
		year: "2026/2027",
		semester: "Ganjil",
	}

	const currentGrade = grades.find((g: any) => String(g.id) === String(gradeId)) || {
		id: Number(gradeId),
		name: `Kelas ${gradeId}`,
		level: "Tsanawiyah",
	}

	const handleSelectAll = () => {
		if (selectedIds.length === students.length) {
			setSelectedIds([])
		} else {
			setSelectedIds(students.map((s: any) => s.id))
		}
	}

	const toggleSelectOne = (id: number) => {
		setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
	}

	const createMutation = useMutation({
		mutationFn: (dto: any) => adminApi.createStudent(dto),
		onSuccess: (res) => {
			toast.success(res.message || "Santri berhasil ditambahkan!")
			queryClient.invalidateQueries({ queryKey: ["admin-students"] })
			setShowCreateModal(false)
		},
	})

	const promoteMutation = useMutation({
		mutationFn: (dto: any) => adminApi.bulkPromoteStudents({ studentIds: selectedIds, ...dto }),
		onSuccess: (res) => {
			toast.success(res.message || "Bulk naik kelas berhasil diproses!")
			queryClient.invalidateQueries({ queryKey: ["admin-students"] })
			setShowPromoteModal(false)
			setSelectedIds([])
		},
	})

	const retainMutation = useMutation({
		mutationFn: (dto: any) => adminApi.bulkRetainStudents({ studentIds: selectedIds, ...dto }),
		onSuccess: (res) => {
			toast.success(res.message || "Bulk tinggal kelas berhasil diproses!")
			queryClient.invalidateQueries({ queryKey: ["admin-students"] })
			setShowRetainModal(false)
			setSelectedIds([])
		},
	})

	if (ayLoading || gradesLoading || studentsLoading) return <PageLoader />

	return (
		<div className="space-y-6">
			{/* Floating Bulk Action Bar */}
			<StudentBulkActions
				selectedCount={selectedIds.length}
				isMaxGrade={currentGrade?.name?.includes("12") || currentGrade?.name?.includes("9")}
				majors={majors}
				subGrades={subGrades}
				onPromote={() => setShowPromoteModal(true)}
				onRetain={() => setShowRetainModal(true)}
				onGraduate={() => {
					toast.success(`Memproses kelulusan ${selectedIds.length} santri ke alumni!`)
					setSelectedIds([])
				}}
				onChangeMajor={() => {
					toast.success("Mengubah jurusan santri terpilih!")
					setSelectedIds([])
				}}
				onChangeSubGrade={() => {
					toast.success("Mengubah subkelas santri terpilih!")
					setSelectedIds([])
				}}
				onChangeAccountStatus={() => {
					toast.success("Mengubah status akun santri terpilih!")
					setSelectedIds([])
				}}
			/>

			{/* Level 3 Component */}
			<StudentLevel3Roster
				academicYear={currentAy}
				selectedGrade={currentGrade}
				students={students}
				subGrades={subGrades}
				selectedIds={selectedIds}
				search={search}
				subGradeFilter={subGradeFilter}
				onSearchChange={(s) => setSearch(s)}
				onSubGradeFilterChange={(sub) => setSubGradeFilter(sub)}
				onSelectAll={handleSelectAll}
				onToggleSelectOne={toggleSelectOne}
				onBackToGrades={() => {
					navigate({
						to: "/students/$academicYearId/grades" as any,
						params: { academicYearId: String(academicYearId) } as any,
					})
				}}
				onOpenExcelModal={() => setShowExcelModal(true)}
				onOpenCreateModal={() => setShowCreateModal(true)}
			/>

			{/* Modals Dialogue */}
			<StudentModals
				showCreate={showCreateModal}
				showPromote={showPromoteModal}
				showRetain={showRetainModal}
				showExcel={showExcelModal}
				selectedCount={selectedIds.length}
				academicYears={academicYears}
				grades={grades}
				subGrades={subGrades}
				onCloseAll={() => {
					setShowCreateModal(false)
					setShowPromoteModal(false)
					setShowRetainModal(false)
					setShowExcelModal(false)
				}}
				onConfirmCreate={(d) => createMutation.mutate(d)}
				onConfirmPromote={(dto) => promoteMutation.mutate(dto)}
				onConfirmRetain={(dto) => retainMutation.mutate(dto)}
				onImportExcel={(file) => {
					toast.success(`Berhasil mengimpor file ${file.name}!`)
					setShowExcelModal(false)
				}}
			/>
		</div>
	)
}
