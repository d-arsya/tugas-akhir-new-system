export type AcademicYearFormValues = {
	startYear: string
	endYear: string
	costDateStart: string
	costDateEnd: string
	activeKbm: string
	note: string
	serialNumber: string
	status: boolean
	type: "reguler" | "indent"
	isCurrent: boolean
}

export const EMPTY_ACADEMIC_YEAR_FORM: AcademicYearFormValues = {
	startYear: "",
	endYear: "",
	costDateStart: "",
	costDateEnd: "",
	activeKbm: "",
	note: "",
	serialNumber: "",
	status: false,
	type: "reguler",
	isCurrent: false,
}
