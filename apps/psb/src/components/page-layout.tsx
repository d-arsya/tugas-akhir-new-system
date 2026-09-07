import type { JSX, ReactNode } from "react"
import { PageLayout as BasePageLayout, type PageLayoutProps as BasePageLayoutProps } from "@roja/ui"
import Header from "@/components/header"

export interface PageLayoutProps extends Omit<BasePageLayoutProps, "header"> {
	children: ReactNode
}

export const PageLayout = (props: PageLayoutProps): JSX.Element => {
	return <BasePageLayout header={<Header />} {...props} />
}

export default PageLayout
