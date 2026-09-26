import type { JSX, ReactNode } from "react"

import type { SocietyAddressGroup } from "@roja/utils"

import LegacyFormRow from "@/components/legacy/legacy-form-row"
import { useDistricts, useProvinces, useRegencies } from "@/hooks/use-locations"

import { FieldError, SocietySelect, SocietyText, StackedLabel } from "./society-controls"
import { valueOf, type SocietyFieldContext } from "./society-field-context"

const idOf = (value: string): number | null => {
	const id = Number(value)
	return value !== "" && Number.isFinite(id) && id > 0 ? id : null
}

type Option = { value: string; label: string }
const toOptions = (rows: readonly { id: number; name: string }[] | undefined): Option[] =>
	(rows ?? []).map((row) => ({ value: String(row.id), label: row.name }))

const Group = ({ className = "mb-[8px]", children }: { className?: string; children: ReactNode }): JSX.Element => (
	<div className={className}>{children}</div>
)

type AddressProps = {
	ctx: SocietyFieldContext
	group: SocietyAddressGroup
	lastClassName: string
}

const SocietyAddress = ({ ctx, group, lastClassName }: AddressProps): JSX.Element => {
	const provinceValue = valueOf(ctx, group.province)
	const regencyValue = valueOf(ctx, group.regency)
	const provinces = useProvinces()
	const regencies = useRegencies(idOf(provinceValue))
	const districts = useDistricts(idOf(regencyValue))
	const { disabled } = ctx

	const select = (name: string, placeholder: string, options: Option[], onPick: (value: string) => void): JSX.Element => (
		<Group>
			<SocietySelect
				id={name}
				value={valueOf(ctx, name)}
				options={options}
				placeholder={placeholder}
				onChange={onPick}
				disabled={disabled}
				invalid={ctx.errors[name] !== undefined}
			/>
			<FieldError message={ctx.errors[name]} />
		</Group>
	)

	const text = (name: string | undefined, placeholder: string, className?: string, numeric?: boolean): JSX.Element | null =>
		name === undefined ? null : (
			<Group {...(className === undefined ? {} : { className })}>
				<SocietyText
					name={name}
					type={numeric === true ? "number" : "text"}
					value={valueOf(ctx, name)}
					onChange={(value) => ctx.set(name, value)}
					placeholder={placeholder}
					disabled={disabled}
					invalid={ctx.errors[name] !== undefined}
					numeric={numeric === true && ctx.layout === "horizontal"}
				/>
				<FieldError message={ctx.errors[name]} />
			</Group>
		)

	const inputs = (
		<>
			{select(group.province, "Provinsi", toOptions(provinces.data), (value) => {
				ctx.set(group.province, value)
				ctx.set(group.regency, "")
				ctx.set(group.district, "")
			})}
			{select(group.regency, "Kabupaten", toOptions(regencies.data), (value) => {
				ctx.set(group.regency, value)
				ctx.set(group.district, "")
			})}
			{select(group.district, "Kecamatan", toOptions(districts.data), (value) => ctx.set(group.district, value))}
			{group.detail !== undefined ? (
				<>
					{text(group.detail, "Detail Alamat")}
					{text(group.postalCode, "Kode POS", "mb-0", true)}
				</>
			) : (
				<>
					{text(group.village, "Kelurahan")}
					<div className="mx-[-15px] flex flex-wrap">
						<div className="w-full px-[15px] min-[768px]:w-1/2">{text(group.street, "Jalan")}</div>
						<div className="w-full px-[15px] min-[768px]:w-1/4">{text(group.rt, "RT")}</div>
						<div className="w-full px-[15px] min-[768px]:w-1/4">{text(group.rw, "RW")}</div>
					</div>
					{text(group.subVillage, "Dusun", lastClassName)}
				</>
			)}
		</>
	)

	const label = ctx.lookup.label(group.labelId)
	const info = ctx.lookup.info(group.settingId)

	if (ctx.layout === "horizontal") {
		return (
			<LegacyFormRow label={label} htmlFor={group.province} hint={info} labelCols={4} fieldCols={6}>
				{inputs}
			</LegacyFormRow>
		)
	}
	return (
		<>
			<Group>
				<StackedLabel htmlFor={group.province} label={label} info={info} />
			</Group>
			{inputs}
		</>
	)
}

export default SocietyAddress
