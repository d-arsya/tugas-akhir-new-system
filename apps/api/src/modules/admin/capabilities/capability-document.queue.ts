import { Injectable } from "@nestjs/common"
import { DataSource } from "typeorm"

import { StorageService } from "@core/storage/storage.service"
import { generateCapabilityPdfInBackground } from "@admin/capabilities/capability-pdf-store"

@Injectable()
export class CapabilityDocumentQueue {
	constructor(
		private readonly storageService: StorageService,
		private readonly dataSource: DataSource,
	) {}

	generateInBackground(capabilityId: number, studentGradeId: number): void {
		generateCapabilityPdfInBackground(this.storageService, this.dataSource, capabilityId, studentGradeId)
	}
}
