/**
 * One query-key root for the whole Akademik menu (Santri, PSB, Alumni). The three sub-menus write
 * into each other — PSB approval creates a santri, Lulus creates an alumni, an alumni delete
 * reactivates the santri — so every Akademik write invalidates `akademikKeys.all` and every page
 * refetches (reads use `staleTime: 0`, like legacy's full page reloads). Lesson from Dompet
 * (2026-09-26): two key roots left pages stale after a write.
 *
 * Each workstream nests its own keys under its branch, e.g.
 *   [...akademikKeys.student, "roster", academicYearId, grade, levelId]
 */
export const akademikKeys = {
	all: ["admin-akademik"] as const,
	student: ["admin-akademik", "student"] as const,
	registrant: ["admin-akademik", "registrant"] as const,
	alumni: ["admin-akademik", "alumni"] as const,
	society: ["admin-akademik", "society"] as const,
}
