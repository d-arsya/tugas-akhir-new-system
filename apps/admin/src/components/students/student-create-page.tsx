import { useEffect, useState, type JSX } from "react"
import { useNavigate } from "@tanstack/react-router"

import type { SocietyValues } from "@roja/types"

import StudentWizard from "./student-wizard"

export type StudentCreateSearch = { academic_year?: string; grade?: string; level_id?: string }

type StudentCreatePageProps = { search: StudentCreateSearch }

const StudentCreatePage = ({ search }: StudentCreatePageProps): JSX.Element => {
	const navigate = useNavigate()
	const [locked] = useState<SocietyValues | undefined>(() =>
		search.academic_year === undefined && search.grade === undefined && search.level_id === undefined
			? undefined
			: { academic_year_id: search.academic_year ?? "", grade: search.grade ?? "", level_id: search.level_id ?? "" },
	)

	useEffect(() => {
		if (locked) void navigate({ to: "/students/create", search: {}, replace: true })
	}, [locked, navigate])

	return <StudentWizard step="personal" {...(locked ? { lockedValues: locked } : {})} />
}

export default StudentCreatePage
