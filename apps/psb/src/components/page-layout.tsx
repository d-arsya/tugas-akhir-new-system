import type { JSX, ReactNode } from "react"
import { PageLayout as BasePageLayout, type PageLayoutProps as BasePageLayoutProps } from "@roja/ui"
import Header from "@/components/header"

export interface PageLayoutProps extends Omit<BasePageLayoutProps, "header"> {
	children: ReactNode
}

export const PageLayout = ({ version = "1.1.2", ...props }: PageLayoutProps): JSX.Element => {
	return <BasePageLayout header={<Header />} version={version} showVersion={false} {...props} />
}

export default PageLayout
