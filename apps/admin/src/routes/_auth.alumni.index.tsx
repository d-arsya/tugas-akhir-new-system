import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"

import AlumniIndex from "@/components/alumni/alumni-index"

// Legacy alumni/index.blade.php — "Data Alumni - Pilih Tahun Kelulusan" (tabs Alumni / Archive)
export const Route = createFileRoute("/_auth/alumni/")({
	component: Page,
})

function Page(): JSX.Element {
	return <AlumniIndex />
}

export default Page
