import type { JSX } from "react"

import type { SocietyField } from "@roja/utils"
import { cn } from "@roja/utils"

import LegacyTextarea from "@/components/legacy/legacy-textarea"

import { FieldError, INVALID_CLASS, PhoneInput, SocietyFrame, SocietyRadios, SocietySelect, SocietyText } from "./society-controls"
import SocietyDateInput from "./society-date-input"
import { valueOf, type SocietyFieldContext } from "./society-field-context"

const radioId = (column: string, value: string): string => (column === "hearing_condition" ? `hearing_${value}` : value)

export const radioShown = (field: SocietyField, value: string): string => {
	const [first, second] = field.options ?? []
	return second !== undefined && value === second.value ? second.value : (first?.value ?? "")
}

const optionsFor = (ctx: SocietyFieldContext, field: SocietyField): { value: string; label: string }[] =>
	(field.options ?? []).map((option) =>
		ctx.layout === "horizontal" && (field.id === 38 || field.id === 45) && option.value === "katolik"
			? { value: option.value, label: "Khatolik" }
			: { value: option.value, label: option.label },
	)

const PAIR_COL: Record<number, string> = {
	9: "mb-[8px] w-1/2 px-[15px] min-[768px]:w-1/2 min-[992px]:w-5/12",
	23: "mb-[8px] w-full px-[15px] min-[768px]:w-1/2",
}

type SocietyFieldProps = { ctx: SocietyFieldContext; field: SocietyField }

const SocietyFieldView = ({ ctx, field }: SocietyFieldProps): JSX.Element | null => {
	const [column = ""] = field.columns
	const label = ctx.lookup.label(field.labelId ?? field.id)
	const info = ctx.lookup.info(field.id)
	const error = ctx.errors[column]
	const invalid = error !== undefined
	const { disabled, layout } = ctx
	const horizontal = layout === "horizontal"
	const set = (name: string) => (value: string) => ctx.set(name, value)

	switch (field.widget) {
		case "text":
			return (
				<SocietyFrame layout={layout} htmlFor={column} label={label} info={info}>
					<SocietyText name={column} value={valueOf(ctx, column)} onChange={set(column)} disabled={disabled} invalid={invalid} />
					<FieldError message={error} />
				</SocietyFrame>
			)

		case "number-pair":
			return (
				<SocietyFrame layout={layout} htmlFor={column} label={label} info={info} stackedClassName="mb-[8px]">
					<div className="mx-[-15px] flex flex-wrap">
						{field.columns.map((name) => (
							<div key={name} className={PAIR_COL[field.id]}>
								<SocietyText
									name={name}
									type="number"
									value={valueOf(ctx, name)}
									onChange={set(name)}
									placeholder={field.placeholders?.[name] ?? ""}
									disabled={disabled}
									invalid={ctx.errors[name] !== undefined}
									numeric={horizontal && field.id === 9}
								/>
								<FieldError message={ctx.errors[name]} />
							</div>
						))}
					</div>
				</SocietyFrame>
			)

		case "phone":
			return (
				<SocietyFrame layout={layout} htmlFor={column} label={label} info={info}>
					<PhoneInput name={column} value={valueOf(ctx, column)} onChange={set(column)} disabled={disabled} invalid={invalid} numeric={horizontal} />
					<FieldError message={error} />
				</SocietyFrame>
			)

		case "select": {
			const select = (
				<>
					<SocietySelect
						id={column}
						value={valueOf(ctx, column)}
						options={optionsFor(ctx, field)}
						placeholder="Select"
						onChange={set(column)}
						disabled={disabled}
						invalid={invalid}
					/>
					<FieldError message={error} />
				</>
			)
			return (
				<SocietyFrame layout={layout} htmlFor={column} label={label} info={info}>
					{field.id === 24 ? (
						<div className="mx-[-15px] flex flex-wrap">
							<div className="w-full px-[15px] min-[768px]:w-1/2">{select}</div>
						</div>
					) : (
						select
					)}
				</SocietyFrame>
			)
		}

		case "radio":
			return (
				<SocietyFrame layout={layout} htmlFor={column} label={label} info={info}>
					<SocietyRadios
						name={column}
						value={radioShown(field, valueOf(ctx, column))}
						options={(field.options ?? []).map((option) => ({ ...option, id: radioId(column, option.value) }))}
						onChange={set(column)}
						disabled={disabled}
					/>
					<FieldError message={error} />
				</SocietyFrame>
			)

		case "date":
			return (
				<SocietyFrame layout={layout} htmlFor={column} label={label} info={info}>
					<SocietyDateInput name={column} value={valueOf(ctx, column)} onChange={set(column)} disabled={disabled} invalid={invalid} />
					<FieldError message={error} />
				</SocietyFrame>
			)

		case "textarea":
			return (
				<SocietyFrame layout={layout} htmlFor={column} label={label} info={info} fieldCols={7}>
					<LegacyTextarea
						name={column}
						id={column}
						rows={3}
						noResize
						spellCheck={false}
						placeholder={field.placeholders?.[column] ?? ""}
						value={valueOf(ctx, column)}
						disabled={disabled}
						onChange={(event) => ctx.set(column, event.target.value)}
						className={cn(invalid && INVALID_CLASS)}
					/>
					<FieldError message={error} />
				</SocietyFrame>
			)

		default:
			return null
	}
}

export default SocietyFieldView
