import {
	BadRequestException,
	ConflictException,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from "@nestjs/common"
import { DataSource } from "typeorm"

import { throwFieldErrors } from "@core/errors/field-errors"
import {
	ACCOUNTANCY_BY_ID_SQL,
	ACCOUNTANCY_CHILD_CANDIDATES_SQL,
	ACCOUNTANCY_DESCENDANTS_SQL,
	ACCOUNTANCY_EXISTS_SQL,
	ACCOUNTANCY_INSERT_SQL,
	ACCOUNTANCY_OPTIONS_SQL,
	ACCOUNTANCY_ROOT_CANDIDATES_SQL,
	ACCOUNTANCY_TREE_SQL,
	ACCOUNTANCY_UPDATE_SQL,
	DELETE_ACCOUNTANCY_SQL,
	MOVE_ACCOUNTANCY_CHILDREN_SQL,
	type AccountancyOptionSqlRow,
	type AccountancySqlRow,
	type AccountancyTreeSqlRow,
} from "@admin/billing/accountancy-sql"
import type { AccountancyDelegateInput, AccountancyWriteInput } from "@admin/billing/dto/accountancy-admin.dto"
import type { AdminRedirectResult } from "@admin/common/admin-response.dto"

export type AccountancyDeleteTarget = "delete" | "delegate-child"

export type AccountancyRow = {
	id: number
	name: string | null
	/** Depth-first pre-order depth, root = 0 — drives the `Child.svg` indent. */
	level: number
	group: "income" | "expense" | null
	groupLabel: string
	deleteTarget: AccountancyDeleteTarget
	hasChildren: boolean
}

export type AccountancyDetail = {
	id: number
	name: string | null
	isParent: boolean
	parentId: number | null
	group: "income" | "expense" | null
	isStudentCost: boolean
	note: string | null
}

export type AccountancyOption = { id: number; name: string | null }

export type AccountancyDeleteStep = {
	id: number
	name: string | null
	step: AccountancyDeleteTarget
	parents: AccountancyOption[]
	redirect: string | null
}

const STEPS: readonly AccountancyDeleteTarget[] = ["delete", "delegate-child"]

// `resources/lang/id/admin.php`, plus the two literals `AccountancyController` hard-codes.
const CREATE_SUCCESS = "Data berhasil disimpan ke dalam basis data."
const CREATE_FAILED = "Terjadi kesalahan. Data gagal disimpan ke dalam basis data."
/** `update()` answers a hard-coded string rather than `Lang::get('admin.update-success')`. */
const UPDATE_SUCCESS = "Data berhasil diupdate."
const UPDATE_FAILED = "Data gagal diupdate."
const DELETE_SUCCESS = "Data berhasil dihapus dari basis data."
/** Verbatim: both destroy handlers drop the trailing full stop the lang file has. */
const DELETE_FAILED = "Data gagal dihapus dari basis data"

const ACCOUNTANCIES_PATH = "/accountancy"
const stepPath = (id: number, step: AccountancyDeleteTarget): string => `${ACCOUNTANCIES_PATH}/${id}/${step}`

/** `AccountancyService::getGroup` — anything but the two enum values renders an empty cell. */
const groupLabelOf = (group: string | null): string => {
	if (group === "income") return "Pemasukan"
	if (group === "expense") return "Pengeluaran"
	return ""
}

/**
 * `parent_id` is a varchar. A root holds NULL; legacy's create form could also leave the empty
 * string there (the DTO documents why), and nothing in the schema stops junk. Anything that is
 * not a plain integer is read as "no parent", which is how the tree query treats it too.
 */
const toParentId = (value: string | null): number | null => {
	if (value === null) return null
	const trimmed = value.trim()
	return /^\d+$/.test(trimmed) ? Number(trimmed) : null
}

const toOption = (row: AccountancyOptionSqlRow): AccountancyOption => ({ id: Number(row.id), name: row.name })

/**
 * Port of the legacy `AccountancyController` (Data Master ▸ Keuangan ▸ Akun) — a self-referencing
 * tree whose delete flow branches on whether the account has children: no children links the plain
 * confirm, children link the "Pindahkan anak akun" page.
 *
 * Fixed rather than replicated (plan decisions):
 *  - a root account stores `parent_id = NULL`. Legacy's `#childData` hides its inputs with the HTML
 *    `hidden` attribute, which does not exclude them from `serialize()`, so creating a root posted
 *    `parent_id=""`; the row was written and then never appeared again, because `list()` filters
 *    `WHERE parent_id IS NULL`. There are zero such rows in the database — itself the evidence that
 *    nobody ever managed to create a root through that form.
 *  - `note` is validated at the real varchar(191) width, not legacy's `max:500`.
 *  - the `group` rule keys off the real `isParent` rather than PHP's loose `null == 0`.
 *  - re-parenting and the delete run in one transaction; legacy had none, so a failure halfway
 *    left the children moved and the parent alive.
 *  - a chosen parent is checked for existence, and for being this account or one of its own
 *    descendants. Legacy validated `required` only, and with no foreign keys either mistake
 *    silently detached a whole subtree from the tree — invisible on every page, forever.
 */
@Injectable()
export class AccountancyAdminService {
	private readonly logger = new Logger(AccountancyAdminService.name)

	constructor(private readonly dataSource: DataSource) {}

	async findAll(): Promise<AccountancyRow[]> {
		const rows = await this.dataSource.query<AccountancyTreeSqlRow[]>(ACCOUNTANCY_TREE_SQL)
		return rows.map((row) => ({
			id: Number(row.id),
			name: row.name,
			level: Number(row.level),
			group: row.group,
			groupLabel: groupLabelOf(row.group),
			// `AccountancyService::getAction` swaps the destroy href per row on the child count
			deleteTarget: row.hasChildren ? "delegate-child" : "delete",
			hasChildren: row.hasChildren,
		}))
	}

	/** `Accountancy::all()` — both selects on the index page offer every account. */
	async findOptions(): Promise<AccountancyOption[]> {
		const rows = await this.dataSource.query<AccountancyOptionSqlRow[]>(ACCOUNTANCY_OPTIONS_SQL)
		return rows.map(toOption)
	}

	async findOne(id: number): Promise<AccountancyDetail> {
		return this.toDetail(await this.requireAccountancy(id))
	}

	async create(dto: AccountancyWriteInput): Promise<{ message: string }> {
		await this.requireParent(dto)
		try {
			await this.dataSource.query(ACCOUNTANCY_INSERT_SQL, this.writeParams(dto))
		} catch (error) {
			this.logger.error(error instanceof Error ? error.message : String(error))
			throw new InternalServerErrorException(CREATE_FAILED)
		}
		return { message: CREATE_SUCCESS }
	}

	async update(id: number, dto: AccountancyWriteInput): Promise<{ message: string }> {
		await this.requireAccountancy(id)
		await this.requireParent(dto, id)
		try {
			await this.dataSource.query(ACCOUNTANCY_UPDATE_SQL, [id, ...this.writeParams(dto)])
		} catch (error) {
			this.logger.error(error instanceof Error ? error.message : String(error))
			throw new InternalServerErrorException(UPDATE_FAILED)
		}
		return { message: UPDATE_SUCCESS }
	}

	async findStep(id: number, step: AccountancyDeleteTarget): Promise<AccountancyDeleteStep> {
		if (!STEPS.includes(step)) throw new BadRequestException("Langkah hapus tidak dikenal.")
		const row = await this.requireAccountancy(id)
		const target: AccountancyDeleteTarget = row.hasChildren ? "delegate-child" : "delete"
		return {
			id: Number(row.id),
			name: row.name,
			step,
			parents: step === "delegate-child" ? await this.findDelegateCandidates(row) : [],
			// The destroy icon was chosen when the list rendered; the children may have moved since
			redirect: target === step ? null : stepPath(id, target),
		}
	}

	/** `destroy` — the plain confirm, which the list only links when the account has no children. */
	async remove(id: number): Promise<AdminRedirectResult> {
		const row = await this.requireAccountancy(id)
		// Legacy never re-checked, so a stale tab could delete a parent and strand every descendant
		// where no page can reach them. The delegate page exists precisely to avoid that.
		if (row.hasChildren) throw new ConflictException(DELETE_FAILED)

		try {
			await this.dataSource.query(DELETE_ACCOUNTANCY_SQL, [id])
		} catch (error) {
			this.logger.error(error instanceof Error ? error.message : String(error))
			throw new InternalServerErrorException(DELETE_FAILED)
		}
		return { message: DELETE_SUCCESS, redirect: ACCOUNTANCIES_PATH }
	}

	/** Re-parents the **direct** children only, then deletes — grandchildren move with their parent. */
	async delegateChild(id: number, dto: AccountancyDelegateInput): Promise<AdminRedirectResult> {
		await this.requireAccountancy(id)

		const descendants = await this.descendantIds(id)
		if (dto.parentId === id || descendants.includes(dto.parentId)) {
			// Re-parenting a subtree into itself makes a cycle: the rows survive but no longer hang
			// off any root, so they disappear from every page. Legacy's picker excluded them and its
			// handler did not.
			throwFieldErrors({ parentId: ["Kolom pilih induk wajib untuk dipilih."] })
		}
		const destination = await this.dataSource.query<{ id: string }[]>(ACCOUNTANCY_EXISTS_SQL, [dto.parentId])
		if (destination.length === 0) throwFieldErrors({ parentId: ["Kolom pilih induk wajib untuk dipilih."] })

		try {
			await this.dataSource.transaction(async (manager) => {
				await manager.query(MOVE_ACCOUNTANCY_CHILDREN_SQL, [String(id), String(dto.parentId)])
				await manager.query(DELETE_ACCOUNTANCY_SQL, [id])
			})
		} catch (error) {
			this.logger.error(error instanceof Error ? error.message : String(error))
			throw new InternalServerErrorException(DELETE_FAILED)
		}
		return { message: DELETE_SUCCESS, redirect: ACCOUNTANCIES_PATH }
	}

	/**
	 * `showDelegateChild`'s two `when()` branches: deleting a root offers the other roots, deleting
	 * a child offers every other non-root that is not inside its own subtree.
	 */
	private async findDelegateCandidates(row: AccountancySqlRow): Promise<AccountancyOption[]> {
		const id = Number(row.id)
		const rows =
			toParentId(row.parent_id) === null
				? await this.dataSource.query<AccountancyOptionSqlRow[]>(ACCOUNTANCY_ROOT_CANDIDATES_SQL, [id])
				: await this.dataSource.query<AccountancyOptionSqlRow[]>(ACCOUNTANCY_CHILD_CANDIDATES_SQL, [
						id,
						String(id),
					])
		return rows.map(toOption)
	}

	private async descendantIds(id: number): Promise<number[]> {
		const rows = await this.dataSource.query<{ id: string }[]>(ACCOUNTANCY_DESCENDANTS_SQL, [String(id)])
		return rows.map((row) => Number(row.id))
	}

	/**
	 * The column order `ACCOUNTANCY_INSERT_SQL` and `ACCOUNTANCY_UPDATE_SQL` share. `parent_id` is
	 * varchar, so the id goes in as a string; the DTO has already forced it (and `group`) to null
	 * for a root, which is the fix for the invisible-root bug.
	 */
	private writeParams(dto: AccountancyWriteInput): [string, boolean, string | null, string | null, boolean, string | null] {
		return [
			dto.name,
			dto.isParent,
			dto.parentId === null ? null : String(dto.parentId),
			dto.group,
			dto.isStudentCost,
			dto.note ?? null,
		]
	}

	/** A child's chosen parent must exist, and must not be the account itself or one of its own. */
	private async requireParent(dto: AccountancyWriteInput, id?: number): Promise<void> {
		if (dto.isParent || dto.parentId === null) return

		if (id !== undefined && (dto.parentId === id || (await this.descendantIds(id)).includes(dto.parentId))) {
			throwFieldErrors({ parentId: ["Kolom pilih induk akun wajib dipilih."] })
		}
		const parent = await this.dataSource.query<{ id: string }[]>(ACCOUNTANCY_EXISTS_SQL, [dto.parentId])
		if (parent.length === 0) throwFieldErrors({ parentId: ["Kolom pilih induk akun wajib dipilih."] })
	}

	private toDetail(row: AccountancySqlRow): AccountancyDetail {
		return {
			id: Number(row.id),
			name: row.name,
			isParent: row.is_parent === true,
			parentId: toParentId(row.parent_id),
			group: row.group,
			isStudentCost: row.is_student_cost === true,
			note: row.note,
		}
	}

	private async requireAccountancy(id: number): Promise<AccountancySqlRow> {
		const [row] = await this.dataSource.query<AccountancySqlRow[]>(ACCOUNTANCY_BY_ID_SQL, [id])
		// Legacy route-model binding: a missing account is a 404 before the handler runs
		if (!row) throw new NotFoundException("Akun tidak ditemukan.")
		return row
	}
}
