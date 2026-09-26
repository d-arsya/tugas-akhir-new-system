import type { EntityManager } from "typeorm"

import { EWALLET_STUDENT_TYPE } from "./balance"

/**
 * Legacy `UpdateEwalletStatusWhenStudentDeactiveObserver::updated`
 * (`app/Observers/UpdateEwalletStatusWhenStudentDeactiveObserver.php`, registered in
 * `AppServiceProvider:45`): after **every** `Student::update`, the santri's wallet follows the
 * account — `is_blocked = 1` → `is_active = 0`, `is_blocked = 0` → `is_active = 1`.
 *
 * Eloquent fired it on any update of `tbr_students`, whatever the column. Raw SQL fires nothing,
 * so every write to `tbr_students` in the Akademik ports calls this afterwards, inside the same
 * transaction. A santri without a wallet (306 exist) is a no-op, as in legacy.
 *
 * `ewalletable_id` is a varchar holding the id, hence the `::text` cast.
 */
export const syncStudentWalletActive = async (manager: EntityManager, studentId: number): Promise<void> => {
	await manager.query(
		`UPDATE tbr_ewallets e SET is_active = NOT s.is_blocked, updated_at = now()
		FROM tbr_students s
		WHERE s.id = $1 AND s.is_blocked IS NOT NULL
			AND e.ewalletable_type = $2 AND e.ewalletable_id = s.id::text`,
		[studentId, EWALLET_STUDENT_TYPE],
	)
}

/**
 * `StudentController::update` (`app/Http/Controllers/StudentController.php:446-449`) renames the
 * wallet after the santri's name changes:
 *
 *   Ewallet::where('ewalletable_name', $old)->orWhere('student_name', $old)->update([...])
 *
 * That matched **every** wallet carrying the old name — another santri with the same name, or,
 * for a NULL name, the merchant wallets. Fixed with the user's approval (2026-09-26): only the
 * santri's own wallet is renamed. Both name columns are written, as legacy did.
 */
export const renameStudentWallet = async (manager: EntityManager, studentId: number, fullname: string): Promise<void> => {
	await manager.query(
		`UPDATE tbr_ewallets SET student_name = $1, ewalletable_name = $1, updated_at = now()
		WHERE ewalletable_type = $2 AND ewalletable_id = $3`,
		[fullname, EWALLET_STUDENT_TYPE, String(studentId)],
	)
}
