import type { JSX } from "react"

import AdminPageTitle from "@/components/layout/admin-page-title"
import { useDelegateLevel, type LevelDelegateStep } from "@/hooks/use-levels"

import LevelDeleteCard from "./level-delete-card"

type LevelDelegatePageProps = { levelId: number; step: LevelDelegateStep }

const STEP_COPY: Record<LevelDelegateStep, { heading: string; noun: string }> = {
	"delegate-major": { heading: "Pindahkan data jurusan ke jenjang lain :", noun: "jurusan" },
	"delegate-grade": { heading: "Pindahkan data kelas ke jenjang lain :", noun: "kelas" },
	"delegate-registrant": { heading: "Pindahkan data PSB ke jenjang lain :", noun: "PSB" },
	"delegate-student": { heading: "Pindahkan data santri ke jenjang lain :", noun: "santri" },
}

const LevelDelegatePage = ({ levelId, step }: LevelDelegatePageProps): JSX.Element => {
	const submit = useDelegateLevel(levelId, step)
	const { heading, noun } = STEP_COPY[step]

	return (
		<>
			<AdminPageTitle title="Hapus Jenjang" breadcrumbs={[{ label: "…", dropdown: [{ label: "Data Master", to: "/levels" }] }, { label: "Akademik", to: "/levels" }, { label: "Jenjang", to: "/levels" }, { label: "Hapus" }]} />

			<LevelDeleteCard levelId={levelId} step={step} heading={heading} noun={noun} submit={submit} />
		</>
	)
}

export default LevelDelegatePage
