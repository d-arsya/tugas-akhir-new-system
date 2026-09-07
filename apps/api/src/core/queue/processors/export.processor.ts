import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import type { Job } from "bullmq"
import { EXPORT_QUEUE } from "@core/queue/queue.constants"

@Processor(EXPORT_QUEUE)
export class ExportProcessor extends WorkerHost {
	private readonly logger = new Logger(ExportProcessor.name)

	async process(job: Job): Promise<void> {
		this.logger.log(`Processing export job: ${job.name} (id: ${job.id})`)
	}
}
