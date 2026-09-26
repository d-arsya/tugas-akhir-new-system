import type { JSX, ReactNode } from "react"
import { Link } from "@tanstack/react-router"

import { cn } from "@roja/utils"

import { useAdminLayout } from "./admin-layout-context"
import type { SidebarRoutePath } from "./sidebar-menu"

export type AdminBreadcrumb = {
	label: string
	to?: SidebarRoutePath
	/** Legacy `li.tbr_breadcrumbs_parent`: a three-dot crumb whose links appear on hover */
	dropdown?: AdminBreadcrumb[]
	/**
	 * A pre-built crumb body, for the parameterised links the deeper Biaya Santri pages use
	 * (`studentCost.grade`, `studentCost.accounts`). `to` cannot express those: TanStack types
	 * `params` per route, which a generic `Record<string, string>` cannot satisfy. Compose the
	 * `<Link>` yourself and style it with `CRUMB_LINK_CLASS`. Takes precedence over `to`.
	 */
	node?: ReactNode
}

type AdminPageTitleProps = {
	title: string
	// Items after the home icon; the last one is the current page
	breadcrumbs: AdminBreadcrumb[]
	/**
	 * Legacy `<h2 class="pr-2">…</h2><span class="tbr_label …">{{ $count }}</span>` headers
	 * (e.g. registrant-page-header.blade.php): `.pr-2` (0.5rem !important, every breakpoint) on the
	 * title, and app.css 2423 `.page-header .tbr_label { float: left; top: calc(50% - 15px) }`, which
	 * is 10px inside the 50px header. Pass the label itself (e.g. a `LegacyLabel`).
	 */
	titleAddon?: ReactNode
}

// boxicons "bx-home-alt" (\ea75) glyph, sized like the legacy icon font (1.4rem). The 0.5px margin
// stands in for the letter-spacing the legacy <i> inherits from the body
const HomeIcon = (): JSX.Element => (
	<svg viewBox="0 -960 1024 1024" width="1.4rem" height="1.4rem" fill="currentColor" className="mr-[0.5px] inline-block align-middle" aria-hidden="true">
		<path transform="scale(1,-1)" d="M213.461 21.333h597.333c47.061 0 85.333 38.272 85.333 85.333v384c0 11.307-4.48 22.187-12.501 30.165l-341.333 341.333c-16.683 16.683-43.648 16.683-60.331 0l-341.333-341.333c-8.021-7.979-12.501-18.859-12.501-30.165v-384c0-47.061 38.272-85.333 85.333-85.333zM426.795 106.667v213.333h170.667v-213.333h-170.667zM213.461 473.003l298.667 298.667 298.667-298.667 0.043-366.336h-128.043v213.333c0 47.061-38.272 85.333-85.333 85.333h-170.667c-47.061 0-85.333-38.272-85.333-85.333v-213.333h-128v366.336z" />
	</svg>
)

const CRUMB_TEXT_CLASS = "inline-block align-middle text-[12px] leading-[20px] font-normal"

/** The styling a caller must reuse when it supplies its own <Link> through `node`. */
export const CRUMB_LINK_CLASS = cn(CRUMB_TEXT_CLASS, "text-white transition-all duration-500 hover:text-[var(--secondary)]")

/** Same, for a `node` placed inside a three-dot dropdown, whose items are full-width blocks. */
export const CRUMB_DROPDOWN_LINK_CLASS = cn(
	CRUMB_TEXT_CLASS,
	"block bg-[#17283C] px-[16px] py-[5px] text-center text-white transition-all duration-500 hover:text-[var(--secondary)]",
)

const Separator = (): JSX.Element => (
	<span className="mx-[20px] mt-[2px] inline-block h-[8px] w-[8px] rounded-[8px] bg-[var(--primary)] align-middle" />
)

const DotsIcon = (): JSX.Element => (
	<svg xmlns="http://www.w3.org/2000/svg" width="13" height="3" viewBox="0 0 13 3" className="inline-block align-middle" aria-hidden="true">
		<circle cx="1.5" cy="1.5" r="1.5" fill="#fff" />
		<circle cx="6.5" cy="1.5" r="1.5" fill="#fff" />
		<circle cx="11.5" cy="1.5" r="1.5" fill="#fff" />
	</svg>
)

// header.css 85-137: hidden with `scale(0,0)`, revealed on hover, with the Polygon.svg arrow on top
const CrumbDropdown = ({ items }: { items: AdminBreadcrumb[] }): JSX.Element => (
	<ol className="absolute left-[-90px] z-[1] mt-[-6px] w-[194px] origin-center scale-0 rounded-[10px] bg-[#17283C] px-0 py-[10px] opacity-0 shadow-[0px_3px_16px_0px_rgba(0,0,0,0.08)] transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 before:absolute before:top-[-16px] before:left-[calc(50%-12px)] before:h-[24px] before:w-[24px] before:bg-[url('/assets/svg/etc/Polygon.svg')] before:bg-contain before:bg-center before:bg-no-repeat before:content-['']">
		{items.map((item, index) => (
			<li key={`${item.label}-${index}`} className="block">
				{item.node ? (
					item.node
				) : item.to ? (
					<Link to={item.to} className={CRUMB_DROPDOWN_LINK_CLASS}>
						{item.label}
					</Link>
				) : (
					<span className={cn(CRUMB_TEXT_CLASS, "block px-[16px] py-[5px] text-center text-white/[0.26]")}>{item.label}</span>
				)}
			</li>
		))}
	</ol>
)

// Port of the legacy `<header class="page-header">` (Porto `html.fixed.sidebar-left-sm` + header.css)
const AdminPageTitle = ({ title, breadcrumbs, titleAddon }: AdminPageTitleProps): JSX.Element => {
	const { collapsed } = useAdminLayout()

	return (
		<header
			className={cn(
				"relative z-[1001] mx-[-15px] mb-[20px] h-[50px] bg-[#111E2C] p-0 pr-[80px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.08)] md:pr-0",
				"md:fixed md:top-[60px] md:right-0 md:m-0 md:transition-all md:duration-300",
				collapsed ? "md:left-[73px]" : "md:left-[250px]",
			)}
		>
			{/* "!" utilities: globals.css styles h1–h6 outside any @layer, which beats plain utilities */}
			<h2
				className={cn(
					"float-left m-0! -ml-px! box-content inline-block h-[50px] max-w-full overflow-hidden px-[15px] text-ellipsis whitespace-nowrap md:max-w-none md:overflow-visible md:pr-[22px] md:pl-[20px] md:whitespace-normal text-[16px]! leading-[50px]! font-medium! tracking-[0.8px]! text-white!",
					titleAddon !== undefined && "pr-[8px]!",
				)}
			>
				{title}
			</h2>
			{titleAddon !== undefined ? <span className="relative top-[10px] float-left">{titleAddon}</span> : null}
			<div className="text-right">
				{/* Legacy hides the breadcrumbs below 768px */}
				<ol className="m-0 mr-[30px] hidden p-0 md:inline-block text-[0px] leading-[50px]">
					<li className="relative inline-block font-light text-[#C3C3C3]">
						<Link to="/" className={cn(CRUMB_TEXT_CLASS, "text-white transition-all duration-500 hover:text-[var(--secondary)]")}>
							<HomeIcon />
						</Link>
						{breadcrumbs.length > 0 ? <Separator /> : null}
					</li>
					{breadcrumbs.map((crumb, index) => (
						<li key={`${crumb.label}-${index}`} className="group relative inline-block font-light text-[#C3C3C3]">
							{crumb.node ? (
								crumb.node
							) : crumb.dropdown ? (
								<>
									<DotsIcon />
									<CrumbDropdown items={crumb.dropdown} />
								</>
							) : crumb.to ? (
								<Link to={crumb.to} className={cn(CRUMB_TEXT_CLASS, "text-white transition-all duration-500 hover:text-[var(--secondary)]")}>
									{crumb.label}
								</Link>
							) : (
								<span className={cn(CRUMB_TEXT_CLASS, "text-white/[0.26]")}>{crumb.label}</span>
							)}
							{index < breadcrumbs.length - 1 ? <Separator /> : null}
						</li>
					))}
				</ol>
			</div>
		</header>
	)
}

export default AdminPageTitle
