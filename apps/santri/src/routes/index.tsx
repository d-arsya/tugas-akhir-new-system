import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

const IndexPage = (): JSX.Element => {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				minHeight: "100vh",
				fontFamily: "Montserrat, sans-serif",
				flexDirection: "column",
				gap: "8px",
			}}
		>
			<h1 style={{ fontSize: "24px", color: "var(--primary)" }}>
				Pondok Roja — Santri
			</h1>
			<p style={{ color: "var(--muted-txt-color)" }}>Phase 0 bootstrap complete ✓</p>
		</div>
	)
}

export const Route = createFileRoute("/")({
	component: IndexPage,
})
