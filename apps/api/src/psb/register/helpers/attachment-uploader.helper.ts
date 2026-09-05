import * as crypto from "crypto"
import type { StorageService } from "../../../core/storage/storage.service"

export interface RegistrationFiles {
	attachCertificate?: Express.Multer.File[]
	attachPhoto?: Express.Multer.File[]
	attachFamilyCard?: Express.Multer.File[]
	attachKsp?: Express.Multer.File[]
	attachKip?: Express.Multer.File[]
	attachReportCard?: Express.Multer.File[]
	attachBirthCertificate?: Express.Multer.File[]
}

export interface UploadedAttachments {
	attachCertificate: string | null
	attachPhoto: string | null
	attachFamilyCard: string | null
	attachKsp: string | null
	attachKip: string | null
	attachReportCard: string | null
	attachBirthCertificate: string | null
}

export async function uploadRegistrantAttachments(
	storageService: StorageService,
	registrantId: string,
	files: RegistrationFiles,
): Promise<UploadedAttachments> {
	const uploadField = async (fileList?: Express.Multer.File[]): Promise<string | null> => {
		if (!fileList?.[0]) return null
		const file = fileList[0]
		const targetPath = `psb/attachments/${registrantId}/${crypto.randomUUID()}-${file.originalname}`
		return storageService.upload(file, targetPath)
	}

	const [
		attachCertificate,
		attachPhoto,
		attachFamilyCard,
		attachKsp,
		attachKip,
		attachReportCard,
		attachBirthCertificate,
	] = await Promise.all([
		uploadField(files.attachCertificate),
		uploadField(files.attachPhoto),
		uploadField(files.attachFamilyCard),
		uploadField(files.attachKsp),
		uploadField(files.attachKip),
		uploadField(files.attachReportCard),
		uploadField(files.attachBirthCertificate),
	])

	return {
		attachCertificate,
		attachPhoto,
		attachFamilyCard,
		attachKsp,
		attachKip,
		attachReportCard,
		attachBirthCertificate,
	}
}
