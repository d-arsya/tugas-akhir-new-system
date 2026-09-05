import type { AcademicYear } from "../../entities/academic-year.entity"
import type { Registrant } from "../../entities/registrant.entity"

export function generateRegistrantId(
	academicYear: AcademicYear | null,
	latestRegistrant: Registrant | null,
): string {
	const currentYear = academicYear?.year
		? academicYear.year.substring(0, 4)
		: new Date().getFullYear().toString()
	const prefix = `PR${currentYear}`
	const startSerialStr = academicYear?.serialNumber || "0001"
	const padLength = startSerialStr.length > 0 ? startSerialStr.length : 4

	let nextSeqStr: string
	if (latestRegistrant?.registrantId && latestRegistrant.registrantId.startsWith(prefix)) {
		const currentSeqStr = latestRegistrant.registrantId.substring(prefix.length)
		const currentSeqNum = parseInt(currentSeqStr, 10)
		const nextNum = isNaN(currentSeqNum) ? 1 : currentSeqNum + 1
		const actualPadLength = Math.max(padLength, currentSeqStr.length)
		nextSeqStr = nextNum.toString().padStart(actualPadLength, "0")
	} else {
		const startNum = parseInt(startSerialStr, 10)
		const initialNum = isNaN(startNum) ? 1 : startNum
		nextSeqStr = initialNum.toString().padStart(padLength, "0")
	}

	return `${prefix}${nextSeqStr}`
}
