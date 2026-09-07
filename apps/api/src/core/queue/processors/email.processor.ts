import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import type { Job } from "bullmq"
import { EMAIL_QUEUE } from "@core/queue/queue.constants"

@Processor(EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
	private readonly logger = new Logger(EmailProcessor.name)

	async process(job: Job): Promise<void> {
		this.logger.log(`Processing email job: ${job.name} (id: ${job.id})`)
	}
}
