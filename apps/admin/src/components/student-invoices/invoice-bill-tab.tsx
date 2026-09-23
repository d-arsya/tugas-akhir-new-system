import { useMemo, useState, type JSX } from "react"
import { Link } from "@tanstack/react-router"

import type { InvoiceBillRow } from "@roja/types"
import { cn } from "@roja/utils"

import { legacyButtonClass } from "@/components/legacy/legacy-button"
import LegacyCheckbox from "@/components/legacy/legacy-checkbox"
import LegacyDataTable, { type LegacyColumn } from "@/components/legacy/legacy-data-table"
import LegacyInput from "@/components/legacy/legacy-input"
import LegacySelect from "@/components/legacy/legacy-select"
import LegacyTooltip from "@/components/legacy/legacy-tooltip"
import { EyeOffIcon, EyeOnIcon } from "@/components/student-invoices/invoice-icons"
import InvoiceStatusLabelBadge from "@/components/student-invoices/invoice-status-label"
import { fetchStudentBillRows, studentInvoiceKeys } from "@/hooks/use-student-invoices"
import { useServerTable } from "@/hooks/use-server-table"
import { formatIndoDate, rupiahLabel } from "@/lib/legacy-format"

// `student-invoice/partials/bill.blade.php` + `student-bill-serverside.js` — the Tagihan tab.

const LENGTH_OPTIONS = ["10", "25", "50", "100"].map((value) => ({ value, label: value }))

type Toggle = "active" | "deactive"

/**
 * One eye-toggle. `detail-invoice.js` swaps `tbr_btn-light-*` for the solid variant and flips
 * which of the two nested SVGs carries `d-none`. `tbr_btn-light-success` is not in the shared
 * `LegacyButton` variant map, so both faces are spelled out here from app.css 649-700.
 */
const EyeToggle = ({
	state,
	tone,
	title,
	placement,
	onClick,
}: {
	state: Toggle
	tone: "success" | "primary"
	title: string
	placement: "top" | "left"
	onClick: () => void
}): JSX.Element => {
	const active = state === "active"
	const solid =
		tone === "success"
			? "bg-[var(--success)] text-white shadow-[0px_8px_10px_0px_rgba(var(--success-rgb),0.25)]"
			: "bg-[var(--primary)] text-white shadow-[0px_8px_10px_0px_rgba(var(--primary-rgb),0.25)]"
	const light =
		tone === "success"
			? "bg-[rgba(var(--success-rgb),0.16)] text-[var(--success)] hover:bg-[var(--success)] hover:text-white"
			: "bg-[rgba(var(--primary-rgb),0.16)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"

	return (
		<LegacyTooltip content={title} placement={placement} className="mr-[8px]">
			<button
				type="button"
				aria-pressed={active}
				aria-label={title}
				onClick={onClick}
				className={cn(legacyButtonClass("light", "px-[8px] py-[8px]"), "bg-transparent", active ? solid : light)}
			>
				{active ? <EyeOnIcon /> : <EyeOffIcon fill={tone === "success" ? "#28af52" : "#E4007E"} />}
			</button>
		</LegacyTooltip>
	)
}

type InvoiceBillTabProps = {
	studentGradeId: number
	costOptions: { id: number; name: string | null }[]
	onCreateTransaction: (invoiceIds: number[]) => void
}

const InvoiceBillTab = ({ studentGradeId, costOptions, onCreateTransaction }: InvoiceBillTabProps): JSX.Element => {
	// Legacy's default is both toggles `deactive`, which is NOT "show everything": the server then
	// narrows to `status = 'unpaid' AND reminder < now()`.
	const [paid, setPaid] = useState<Toggle>("deactive")
	const [unpaid, setUnpaid] = useState<Toggle>("deactive")
	const [cost, setCost] = useState("")
	const [checked, setChecked] = useState<number[]>([])

	const table = useServerTable({
		queryKey: studentInvoiceKeys.bills(studentGradeId),
		fetcher: fetchStudentBillRows(studentGradeId),
		extra: { paid, unpaid, ...(cost ? { cost } : {}) },
	})

	const costSelectOptions = useMemo(
		() => [
			{ value: "", label: "Nama Biaya" },
			...costOptions.map((option) => ({ value: option.name ?? "", label: option.name ?? "" })),
		],
		[costOptions],
	)

	const selectable = table.rows.filter((row) => row.selectable)
	const allChecked = selectable.length > 0 && selectable.every((row) => checked.includes(row.id))
	const toggleRow = (id: number, next: boolean): void =>
		setChecked((current) => (next ? [...current, id] : current.filter((value) => value !== id)))

	const columns: LegacyColumn<InvoiceBillRow>[] = [
		{
			key: "checkBox",
			width: "2%",
			header: (
				<LegacyCheckbox
					id="tbr_check_all_header"
					checked={allChecked}
					onChange={(next) => setChecked(next ? selectable.map((row) => row.id) : [])}
					label=""
				/>
			),
			// `addColumn('checkBox')` renders nothing at all unless the invoice is still unpaid
			cell: (row) =>
				row.selectable ? (
					<LegacyCheckbox
						id={`data_${row.id}`}
						name="checkbox-datatable"
						checked={checked.includes(row.id)}
						onChange={(next) => toggleRow(row.id, next)}
						label=""
					/>
				) : null,
		},
		{ key: "no", header: "No", width: "5%", cell: (_row, index) => index },
		{ key: "name", header: "Nama Biaya", sortable: true, cell: (row) => row.name },
		{ key: "amount", header: "Biaya", width: "13%", sortable: true, cell: (row) => rupiahLabel(row.amount) },
		{ key: "paid", header: "Dibayar", width: "13%", sortable: true, cell: (row) => rupiahLabel(row.paid) },
		{ key: "balance", header: "Balance", width: "13%", sortable: true, cell: (row) => rupiahLabel(row.balance) },
		{
			key: "status",
			header: "Status",
			width: "15%",
			sortable: true,
			cell: (row) => <InvoiceStatusLabelBadge label={row.statusLabel} />,
		},
		{
			key: "dueDate",
			header: "Jatuh Tempo",
			width: "13%",
			sortable: true,
			cell: (row) => formatIndoDate(row.dueDate),
		},
		{
			key: "action",
			header: "",
			width: "5%",
			cell: (row) => (
				<div>
					{/* Tailwind's preflight makes `img` a block, which would break the anchor onto its own line */}
					<Link
						to="/student-invoices/bills/$invoiceId"
						params={{ invoiceId: String(row.id) }}
						className="inline-block align-middle"
					>
						<img src="/assets/svg/icons/data_detail.svg" alt="Detail" width={24} height={24} />
					</Link>
				</div>
			),
		},
	]

	return (
		<>
			{/* `.tbr_card_intro` — the heading count is `recordsFiltered`, the caption `recordsTotal` */}
			<div className="relative">
				<div className="mt-[2px] inline-block text-[16px] font-bold">{table.total} Tagihan</div>
				<p className="m-0 text-[var(--grey)]">Dimunculkan dari total {table.totalUnfiltered} tagihan.</p>
			</div>

			<div className="mx-[-15px] flex flex-wrap items-center justify-between">
				<div className="w-full px-[15px] min-[768px]:w-1/4">
					{/* `#tbr_bulk_action` is 60% opaque and click-through until something is ticked */}
					<div
						className={cn(
							"mb-[8px] transition-all duration-500",
							checked.length > 0 ? "opacity-100" : "pointer-events-none cursor-default opacity-60",
						)}
					>
						<button
							type="button"
							onClick={() => onCreateTransaction(checked)}
							className={legacyButtonClass("primary", "mt-[16px]")}
						>
							Buat Pembayaran
						</button>
					</div>
				</div>
				<div className="w-full px-[15px] text-left min-[768px]:w-1/2 min-[768px]:text-right">
					<div className="mb-[16px] min-[768px]:mb-0">
						<p className="mr-[8px] mb-[8px] block text-[var(--grey)] min-[768px]:inline">Tampilkan / Sembunyikan:</p>
						<div className="block min-[768px]:inline">
							<EyeToggle
								state={paid}
								tone="success"
								title="Tagihan sudah dibayar"
								placement="top"
								onClick={() => setPaid((current) => (current === "active" ? "deactive" : "active"))}
							/>
							<EyeToggle
								state={unpaid}
								tone="primary"
								title="Tagihan belum masuk masa pengingat"
								placement="left"
								onClick={() => setUnpaid((current) => (current === "active" ? "deactive" : "active"))}
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="mx-[-15px] mt-[8px] mb-[8px] flex flex-wrap">
				<div className="w-full px-[15px] min-[768px]:w-1/6">
					<div className="mb-[8px] w-3/4">
						<LegacySelect
							value={String(table.state.length)}
							options={LENGTH_OPTIONS}
							searchable={false}
							onChange={(value) => table.setState({ ...table.state, length: Number(value), page: 1 })}
						/>
					</div>
				</div>
				<div className="w-full px-[15px] min-[768px]:w-7/12">
					<div className="mx-[-15px] flex flex-wrap justify-end">
						<div className="w-full px-[15px] min-[768px]:w-5/12">
							<div className="mb-[8px]">
								<LegacySelect
									value={cost}
									options={costSelectOptions}
									mutedText
									className="w-full"
									onChange={(value) => {
										setCost(value)
										table.setState({ ...table.state, page: 1 })
									}}
								/>
							</div>
						</div>
					</div>
				</div>
				<div className="w-full px-[15px] min-[768px]:w-1/4">
					<LegacyInput
						type="text"
						value={table.state.search}
						placeholder="Search"
						className="mb-[8px]"
						onChange={(event) => table.setState({ ...table.state, search: event.target.value, page: 1 })}
					/>
				</div>
			</div>

			<LegacyDataTable
				columns={columns}
				rows={table.rows}
				rowKey={(row) => row.id}
				total={table.total}
				state={table.state}
				onStateChange={table.setState}
				processing={table.processing}
				loaded={table.loaded}
				// DataTables `order: [[7, "asc"]]` — Jatuh Tempo, ascending
				initialSort={{ key: "dueDate", dir: "asc" }}
				minWidth="1000px"
				// `sDom` wraps `l` and `f` in a `d-none` div — this tab renders its own above
				toolbar={false}
				// `datatableRowCallback` paints the cells, not the row, so the hover tint stays below it
				rowClassName={(row) => (row.isOverdue ? "[&>td]:bg-[#FDEDEF]" : undefined)}
			/>
		</>
	)
}

export default InvoiceBillTab
