/// <reference types="multer" />
import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
	DeleteObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import type { Env } from "@core/config/env.validation"

@Injectable()
export class StorageService {
	private readonly s3Client: S3Client
	private readonly bucket: string

	constructor(private readonly configService: ConfigService<Env, true>) {
		this.s3Client = new S3Client({
			region: configService.get("AWS_REGION", { infer: true }) ?? "ap-southeast-1",
			endpoint: configService.get("AWS_S3_URL", { infer: true }) ?? "http://minio:9000",
			forcePathStyle: true,
			credentials: {
				accessKeyId: configService.get("AWS_ACCESS_KEY_ID", { infer: true }) ?? "",
				secretAccessKey: configService.get("AWS_SECRET_ACCESS_KEY", { infer: true }) ?? "",
			},
		})
		this.bucket = configService.get("AWS_S3_BUCKET", { infer: true }) ?? ""
	}

	async upload(file: Express.Multer.File, key: string): Promise<string> {
		await this.s3Client.send(
			new PutObjectCommand({
				Bucket: this.bucket,
				Key: key,
				Body: file.buffer,
				ContentType: file.mimetype,
			}),
		)

		const s3Url = (this.configService.get("AWS_S3_URL", { infer: true }) ?? "").replace(/\/+$/, "")
		return `${s3Url}/${this.bucket}/${key}`
	}

	/** Same as `upload`, for callers that hold the bytes rather than a multipart file. */
	async uploadBuffer(buffer: Buffer, key: string, contentType: string): Promise<string> {
		await this.s3Client.send(
			new PutObjectCommand({
				Bucket: this.bucket,
				Key: key,
				Body: buffer,
				ContentType: contentType,
			}),
		)

		const s3Url = (this.configService.get("AWS_S3_URL", { infer: true }) ?? "").replace(/\/+$/, "")
		return `${s3Url}/${this.bucket}/${key}`
	}

	async getUrl(filePath: string): Promise<string> {
		if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
			return filePath
		}

		// Legacy local files: return a signed URL via legacy endpoint
		const legacyBase = this.configService.get("LEGACY_FILES_BASE_PATH", { infer: true })
		if (legacyBase && filePath.startsWith(legacyBase)) {
			const relativePath = filePath.replace(legacyBase, "")
			const appUrl = this.configService.get("APP_URL", { infer: true })
			return `${appUrl}/api/files/legacy${relativePath}`
		}

		const s3Url = (this.configService.get("AWS_S3_URL", { infer: true }) ?? "").replace(/\/+$/, "")
		return `${s3Url}/${this.bucket}/${filePath}`
	}

	async delete(urlOrKey: string): Promise<void> {
		let key = urlOrKey
		const s3Url = (this.configService.get("AWS_S3_URL", { infer: true }) ?? "").replace(/\/+$/, "")
		const prefix = `${s3Url}/${this.bucket}/`
		if (key.startsWith(prefix)) {
			key = key.replace(prefix, "")
		}
		await this.s3Client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
	}
}
