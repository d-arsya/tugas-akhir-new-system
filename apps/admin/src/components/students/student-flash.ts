// `session()->flash('success', true)` after the wizard's final save (`Student\AttachmentController:75`): the
// edit page shows its "berhasil menambahkan" alert on the next visit only. Kept in memory, like a flash.

let createdStudentGradeId: number | null = null

export const setCreatedFlash = (studentGradeId: number): void => {
	createdStudentGradeId = studentGradeId
}

/** True only for the grade row just created; the page clears it once mounted (`clearCreatedFlash`). */
export const peekCreatedFlash = (studentGradeId: number): boolean => createdStudentGradeId === studentGradeId

export const clearCreatedFlash = (): void => {
	createdStudentGradeId = null
}
