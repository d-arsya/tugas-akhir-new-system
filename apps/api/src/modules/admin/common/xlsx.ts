import type { Response } from "express"

export const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

export type XlsxFile = { fileName: string; buffer: Buffer }

export const sendXlsx = (res: Response, file: XlsxFile): void => {
	res.setHeader("Content-Type", XLSX_TYPE)
	res.setHeader("Content-Disposition", `attachment; filename="${file.fileName}"; filename*=UTF-8''${encodeURIComponent(file.fileName)}`)
	res.send(file.buffer)
}
