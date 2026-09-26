import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Cron, CronExpression } from "@nestjs/schedule"
import { InjectDataSource } from "@nestjs/typeorm"
import { DataSource } from "typeorm"

import type { Env } from "@core/config/env.validation"
import { TIMEZONE } from "@admin/common/sql"

/**
 * Stamps the arrears snapshot onto invoices that have gone overdue: which academic year,
 * grade and sub-grade the santri was in at the time. The reporting module reads all three.
 *
 * Legacy is `App\Console\Commands\CheckInvoiceDueDate` (`invoice:duedate`), scheduled
 * `->daily()` in `Console\Kernel.php:30` — but ALSO called synchronously via
 * `Artisan::call('invoice:duedate')` at the end of `publishInvoice`, i.e. once per santri
 * inside a mass-publish loop. Each call re-scans the whole invoice table and then issues one
 * UPDATE per matching row. Publishing a grade of 98 santri ran it 98 times inside the web
 * request. Here it is only the scheduled job, and the publish path no longer triggers it.
 *
 * Two legacy behaviours are kept deliberately:
 *   * the snapshot is taken from the santri's **currently active** grade row, reached through
 *     `student_id` rather than the invoice's own `student_grade_id`. Because the job runs
 *     daily and only ever fills a NULL, "currently active" is in practice "where the santri
 *     was when this went overdue", which is what the column means;
 *   * soft-deleted grade rows count (`studentGradesTrashed`), so a santri who has since left
 *     still stamps the class they were actually in.
 *
 * One legacy bug is not kept: `->last()` on an empty collection yields null and the next line
 * dereferences it, so a single invoice whose santri has no grade row at all takes down the
 * whole command. The set-based statement below simply skips those rows.
 */
@Injectable()
export class InvoiceDueDateScheduler {
	private readonly logger = new Logger(InvoiceDueDateScheduler.name)

	constructor(
		@InjectDataSource()
		private readonly dataSource: DataSource,
		private readonly configService: ConfigService<Env, true>,
	) {}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: TIMEZONE })
	async stampArrears(): Promise<void> {
		if (!this.configService.get("SCHEDULER_ENABLED", { infer: true })) return

		try {
			const stamped = await this.run()
			if (stamped > 0) this.logger.log(`Menandai ${stamped} tagihan menunggak dengan kelas saat jatuh tempo`)
		} catch (error: unknown) {
			// A cron failure must not take the process down
			this.logger.error("Gagal menandai tagihan menunggak", error)
		}
	}

	/** Exposed so the verification scripts can run one pass without waiting for midnight. */
	async run(): Promise<number> {
		// RETURNING rather than a driver row count: TypeORM's `query()` shape for a bare
		// UPDATE differs between drivers, but a RETURNING clause always yields rows.
		const rows = await this.dataSource.query<{ id: string }[]>(STAMP_ARREARS_SQL)
		return rows.length
	}
}

/**
 * `firstWhere('grade_status', 'active')` picks the first active row in the relation's natural
 * (id-ascending) order; the `->last()` fallback picks the highest id. The ORDER BY reproduces
 * both: active rows win, ties among them go to the lowest id, and with no active row at all
 * the highest id is taken.
 *
 * No `deleted_at IS NULL` filter — legacy reads the trashed relation on purpose.
 *
 * `due_date < now()` is legacy's comparison, kept verbatim including its off-by-one:
 * `due_date` is a `date`, so Postgres widens it to local midnight, and the job runs at
 * 00:00 — which means an invoice is stamped as arrears at the very start of the day it
 * falls due, not the day after. Tightening it to `< today` would quietly shift which
 * academic year thousands of existing rows are attributed to, so it stays as it is.
 */
const STAMP_ARREARS_SQL = `
	UPDATE tbr_student_invoices AS i
	   SET due_date_academic_year = p.current_academic_year,
	       due_date_grade         = p.grade::text,
	       due_date_sub_grade     = p.sub_grade,
	       updated_at             = now()
	  FROM (
	        SELECT due.id AS invoice_id,
	               sg.current_academic_year,
	               sg.grade,
	               sg.sub_grade
	          FROM tbr_student_invoices AS due
	          CROSS JOIN LATERAL (
	                SELECT g.current_academic_year, g.grade, g.sub_grade
	                  FROM tbr_student_grades AS g
	                 WHERE g.student_id = due.student_id
	                 ORDER BY (g.grade_status = 'active') DESC,
	                          CASE WHEN g.grade_status = 'active' THEN g.id END ASC,
	                          g.id DESC
	                 LIMIT 1
	          ) AS sg
	         WHERE due.due_date < now()
	           AND due.status = 'unpaid'
	           AND due.due_date_academic_year IS NULL
	  ) AS p
	 WHERE i.id = p.invoice_id
	RETURNING i.id`
