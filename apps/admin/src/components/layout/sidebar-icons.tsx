import { useId, type JSX, type ReactNode } from "react"

import { cn } from "@roja/utils"

export type SidebarIconName =
	| "dashboard"
	| "report"
	| "ewallet"
	| "academic"
	| "finance"
	| "master"
	| "other"

type IconProps = { className?: string }

// Stops turn white while the owning `group/link` is hovered, focused or highlighted (legacy sidebar.css)
const HIGHLIGHT_STOP_CLASS =
	"transition-all duration-500 group-hover/link:[stop-color:#fff] group-focus-visible/link:[stop-color:#fff] group-data-[highlight=true]/link:[stop-color:#fff]"

type GradientIconProps = IconProps & {
	from: string
	to: string
	width?: number
	viewBox?: string
	render: (fill: string) => ReactNode
}

const GradientIcon = ({
	className,
	from,
	to,
	width = 24,
	viewBox = "0 0 24 24",
	render,
}: GradientIconProps): JSX.Element => {
	// useId output contains characters that are unsafe inside url(#...)
	const id = `grad-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width={width} height={24} viewBox={viewBox} className={cn("inline-block shrink-0 align-middle", className)}>
			<defs>
				<linearGradient id={id} x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
					<stop offset="0" stopColor={from} className={HIGHLIGHT_STOP_CLASS} />
					<stop offset="1" stopColor={to} className={HIGHLIGHT_STOP_CLASS} />
				</linearGradient>
			</defs>
			{render(`url(#${id})`)}
		</svg>
	)
}

const GEAR_OUTER =
	"M18.622,9.75h.128a2.25,2.25,0,0,1,0,4.5h-.065a.5.5,0,0,0-.358.835l.045.045a2.251,2.251,0,1,1-3.183,3.183l-.039-.039a.5.5,0,0,0-.841.349v.128a2.25,2.25,0,0,1-4.5,0,.524.524,0,0,0-.363-.514.485.485,0,0,0-.532.092l-.045.045A2.251,2.251,0,1,1,5.687,15.19l.039-.039a.5.5,0,0,0-.349-.841H5.25a2.25,2.25,0,0,1,0-4.5.524.524,0,0,0,.514-.363.485.485,0,0,0-.092-.532l-.045-.045A2.251,2.251,0,1,1,8.81,5.687l.039.039a.487.487,0,0,0,.538.1L9.495,5.8a.486.486,0,0,0,.255-.424V5.25a2.25,2.25,0,0,1,4.5,0v.065a.491.491,0,0,0,.3.449.485.485,0,0,0,.532-.092l.045-.045A2.251,2.251,0,1,1,18.313,8.81l-.039.039a.488.488,0,0,0-.1.538l.023.108A.486.486,0,0,0,18.622,9.75Z"
const GEAR_INNER = "M12,15a3,3,0,1,0-3-3A3,3,0,0,0,12,15Z"

const renderGear = (fill: string): ReactNode => (
	<>
		<path d={GEAR_OUTER} opacity="0.3" fill={fill} />
		<path d={GEAR_INNER} fillRule="evenodd" fill={fill} />
	</>
)

export const DashboardIcon = (p: IconProps): JSX.Element => (
	<GradientIcon {...p} from="#feb683" to="#ff8993" render={(fill) => (
		<>
			<path d="M2.561,10.682,4.682,8.561a1.5,1.5,0,0,1,2.121,0l2.121,2.121a1.5,1.5,0,0,1,0,2.121L6.8,14.925a1.5,1.5,0,0,1-2.121,0L2.561,12.8A1.5,1.5,0,0,1,2.561,10.682Zm12,0,2.121-2.121a1.5,1.5,0,0,1,2.121,0l2.121,2.121a1.5,1.5,0,0,1,0,2.121L18.8,14.925a1.5,1.5,0,0,1-2.121,0L14.561,12.8A1.5,1.5,0,0,1,14.561,10.682Z" fillRule="evenodd" opacity="0.3" fill={fill} />
			<path d="M8.561,16.682l2.121-2.121a1.5,1.5,0,0,1,2.121,0l2.121,2.121a1.5,1.5,0,0,1,0,2.121L12.8,20.925a1.5,1.5,0,0,1-2.121,0L8.561,18.8A1.5,1.5,0,0,1,8.561,16.682Zm0-12,2.121-2.121a1.5,1.5,0,0,1,2.121,0l2.121,2.121a1.5,1.5,0,0,1,0,2.121L12.8,8.925a1.5,1.5,0,0,1-2.121,0L8.561,6.8A1.5,1.5,0,0,1,8.561,4.682Z" fillRule="evenodd" fill={fill} />
		</>
	)} />
)

export const ReportIcon = (p: IconProps): JSX.Element => (
	<GradientIcon {...p} from="#3aeaad" to="#2cf" render={(fill) => (
		<>
			<path d="M8,3v.5A1.5,1.5,0,0,0,9.5,5h5A1.5,1.5,0,0,0,16,3.5V3h2a2,2,0,0,1,2,2V21a2,2,0,0,1-2,2H6a2,2,0,0,1-2-2V5A2,2,0,0,1,6,3Z" fillRule="evenodd" opacity="0.3" fill={fill} />
			<path d="M11,2a1,1,0,0,1,2,0h1.5a.5.5,0,0,1,.5.5v1a.5.5,0,0,1-.5.5h-5A.5.5,0,0,1,9,3.5v-1A.5.5,0,0,1,9.5,2Z" fillRule="evenodd" fill={fill} />
			<rect width="5" height="2" rx="1" transform="translate(7 10)" opacity="0.3" fill={fill} />
			<rect width="9" height="2" rx="1" transform="translate(7 14)" opacity="0.3" fill={fill} />
		</>
	)} />
)

export const EwalletIcon = (p: IconProps): JSX.Element => (
	<GradientIcon {...p} from="#6866e9" to="#6866e9" render={(fill) => (
		<>
			<rect width="10" height="12" rx="2" transform="translate(2 2)" fill={fill} opacity="0.3" />
			<path d="M4,6H20a2,2,0,0,1,2,2V20a2,2,0,0,1-2,2H4a2,2,0,0,1-2-2V8A2,2,0,0,1,4,6ZM18,16a2,2,0,1,0-2-2A2,2,0,0,0,18,16Z" fill={fill} fillRule="evenodd" />
		</>
	)} />
)

export const AcademicIcon = (p: IconProps): JSX.Element => (
	<GradientIcon {...p} from="#6aa5e3" to="#6866e9" render={(fill) => (
		<>
			<path d="M13,18.945V20h1a2,2,0,0,1,2,2H8a2,2,0,0,1,2-2h1V18.945a8.972,8.972,0,0,1-5.206-2.427L4.739,17.674a1,1,0,1,1-1.477-1.348l1.788-1.959a1,1,0,0,1,1.515.044A7,7,0,1,0,16.121,4.341,1,1,0,1,1,17.3,2.726,9,9,0,0,1,13,18.945Z" fill={fill} />
			<circle cx="6" cy="6" r="6" transform="translate(6 4)" opacity="0.3" fill={fill} />
		</>
	)} />
)

export const FinanceIcon = (p: IconProps): JSX.Element => (
	<GradientIcon {...p} from="#c694f9" to="#ab64f4" width={24.195} viewBox="0 0 24.195 24" render={(fill) => (
		<g transform="translate(0.195)">
			<path d="M2,6H21a1,1,0,0,1,1,1V17a1,1,0,0,1-1,1H2a1,1,0,0,1-1-1V7A1,1,0,0,1,2,6Zm9.5,10a4,4,0,1,0-4-4A4,4,0,0,0,11.5,16Z" transform="matrix(0.966, 0.259, -0.259, 0.966, 3.498, -2.568)" fillRule="evenodd" opacity="0.3" fill={fill} />
			<path d="M2,6H21a1,1,0,0,1,1,1V17a1,1,0,0,1-1,1H2a1,1,0,0,1-1-1V7A1,1,0,0,1,2,6Zm9.5,10a4,4,0,1,0-4-4A4,4,0,0,0,11.5,16Zm0-2a2,2,0,1,0-2-2A2,2,0,0,0,11.5,14Z" fillRule="evenodd" fill={fill} />
		</g>
	)} />
)

export const MasterIcon = (p: IconProps): JSX.Element => (
	<GradientIcon {...p} from="#6fe3ff" to="#2fc7f5" render={(fill) => (
		<>
			<path d="M4.857,1h6.879a1.5,1.5,0,0,1,.969.355l4.764,4.029A1.5,1.5,0,0,1,18,6.529V19.083C18,20.874,17.98,21,16.143,21H4.857C3.02,21,3,20.874,3,19.083V2.917C3,1.126,3.02,1,4.857,1ZM8,12a1,1,0,0,0,0,2h7a1,1,0,0,0,0-2Zm0,4a1,1,0,0,0,0,2h3a1,1,0,0,0,0-2Z" opacity="0.3" fill={fill} />
			<path d="M6.857,3h7.879a1.5,1.5,0,0,1,.969.355l4.764,4.029A1.5,1.5,0,0,1,21,8.529V21.083C21,22.874,20.98,23,19.143,23H6.857C5.02,23,5,22.874,5,21.083V4.917C5,3.126,5.02,3,6.857,3ZM8,12a1,1,0,0,0,0,2h7a1,1,0,0,0,0-2Zm0,4a1,1,0,0,0,0,2h3a1,1,0,0,0,0-2Z" fill={fill} />
		</>
	)} />
)

export const GearIcon = (p: IconProps): JSX.Element => (
	<GradientIcon {...p} from="#c694f9" to="#ab64f4" render={renderGear} />
)

export const UserIcon = (p: IconProps): JSX.Element => (
	<GradientIcon {...p} from="#6aa5e3" to="#6866e9" render={(fill) => (
		<>
			<path d="M12,11a4,4,0,1,1,4-4A4,4,0,0,1,12,11Z" opacity="0.3" fill={fill} />
			<path d="M3,20.2c.388-4.773,4.261-7.2,8.983-7.2C16.771,13,20.7,15.293,21,20.2a.687.687,0,0,1-.751.8H3.727A1.107,1.107,0,0,1,3,20.2Z" fill={fill} />
		</>
	)} />
)

export const LogoutIcon = (p: IconProps): JSX.Element => (
	<GradientIcon {...p} from="#FEB683" to="#FF8993" render={(fill) => (
		<>
			<path d="M14.007-7.006a1,1,0,0,0-1,1,1,1,0,0,0,1,1h1a4,4,0,0,0,4-4v-6a4,4,0,0,0-4-4h-12a4,4,0,0,0-4,4v6a4,4,0,0,0,4,4h1a1,1,0,0,0,1-1,1,1,0,0,0-1-1h-1a2,2,0,0,1-2-2v-6a2,2,0,0,1,2-2h12a2,2,0,0,1,2,2v6a2,2,0,0,1-2,2Z" transform="translate(21.007 21.007) rotate(-90)" opacity="0.3" fill={fill} />
			<rect width="2" height="12" rx="1" transform="translate(20 11) rotate(90)" opacity="0.3" fill={fill} />
			<path d="M21.793,9.793a1,1,0,0,1,1.414,1.414l-3,3a1,1,0,0,1-1.414,0l-3-3a1,1,0,0,1,1.414-1.414L19.5,12.086Z" transform="translate(7.5 31.5) rotate(-90)" fill={fill} />
		</>
	)} />
)

export const SIDEBAR_ICONS: Record<SidebarIconName, (p: IconProps) => JSX.Element> = {
	dashboard: DashboardIcon,
	report: ReportIcon,
	ewallet: EwalletIcon,
	academic: AcademicIcon,
	finance: FinanceIcon,
	master: MasterIcon,
	other: GearIcon,
}

// simple-line-icons "icon-arrow-down" (\e604) glyph, sized to 1em like the icon font
export const ArrowDownIcon = ({ className }: IconProps): JSX.Element => (
	<svg viewBox="0 -960 1024 1024" width="1em" height="1em" fill="currentColor" className={className} aria-hidden="true">
		<path transform="scale(1,-1)" d="M8.2002 684.6c0 8.59961 3.40039 17.4014 10 24.001c13.2002 13.2002 34.7998 13.2002 48 0l451.8 -451.8l445.2 445.2c13.2002 13.2002 34.7998 13.2002 48 0s13.2002 -34.7998 0 -48l-469.2 -469.4c-13.2002 -13.2002 -34.7998 -13.2002 -48 0l-475.8 475.8 c-6.7998 6.7998 -10 15.3994 -10 24.199z" />
	</svg>
)

// Font Awesome 5 "fa-bars" (legacy mobile sidebar toggle)
export const BarsIcon = ({ className }: IconProps): JSX.Element => (
	<svg viewBox="0 0 448 512" width="0.875em" height="1em" fill="currentColor" className={className} aria-hidden="true">
		<path d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z" />
	</svg>
)
