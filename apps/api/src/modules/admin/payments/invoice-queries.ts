import type { DataSource } from "typeorm"

import type { CardSqlRow, LinkSqlRow } from "@admin/payments/invoice-format"
import { StudentGrade } from "@santri/entities/student-grade.entity"
import { StudentInvoiceTransaction } from "@santri/entities/student-invoice-transaction.entity"
import { StudentTransaction } from "@santri/entities/student-transaction.entity"
import { Student } from "@santri/entities/student.entity"
import { AcademicYear } from "@shared/master/entities/academic-year.entity"
import { Level } from "@shared/master/entities/level.entity"

export const findStudentCardRow = (
	dataSource: DataSource,
	studentGradeId: number,
): Promise<CardSqlRow | undefined> =>
	dataSource
		.createQueryBuilder(StudentGrade, "sg")
		.select("sg.id", "studentGradeId")
		.addSelect("s.id", "studentId")
		.addSelect("s.nis", "nis")
		.addSelect("sg.fullname", "fullName")
		.addSelect("sg.attachPhoto", "photoPath")
		.addSelect("ay.year", "academicYear")
		.addSelect("l.name", "levelName")
		.addSelect("sg.grade", "grade")
		.addSelect("sg.subGrade", "subGrade")
		.addSelect("sg.fatherFullname", "fatherName")
		.leftJoin(Student, "s", "s.id = sg.studentId")
		.leftJoin(Level, "l", "l.id = sg.levelId")
		.leftJoin(AcademicYear, "ay", "ay.id = s.academicYearId")
		.where("sg.id = :studentGradeId", { studentGradeId })
		.andWhere("sg.deletedAt IS NULL")
		.getRawOne<CardSqlRow>()

export const findBillLinks = async (dataSource: DataSource, invoiceIds: number[]): Promise<LinkSqlRow[]> => {
	if (invoiceIds.length === 0) return []
	return dataSource
		.createQueryBuilder(StudentInvoiceTransaction, "sit")
		.select("sit.studentInvoiceId", "studentInvoiceId")
		.addSelect("sit.studentTransactionId", "studentTransactionId")
		.addSelect("sit.pay", "pay")
		.addSelect("sit.amount", "amount")
		.addSelect("st.status", "status")
		.leftJoin(StudentTransaction, "st", "st.id = sit.studentTransactionId")
		.where("sit.studentInvoiceId IN (:...invoiceIds)", { invoiceIds })
		.getRawMany<LinkSqlRow>()
}
