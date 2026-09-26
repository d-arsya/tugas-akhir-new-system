let createdStudentGradeId: number | null = null

export const setCreatedFlash = (studentGradeId: number): void => {
	createdStudentGradeId = studentGradeId
}

export const peekCreatedFlash = (studentGradeId: number): boolean => createdStudentGradeId === studentGradeId

export const clearCreatedFlash = (): void => {
	createdStudentGradeId = null
}
