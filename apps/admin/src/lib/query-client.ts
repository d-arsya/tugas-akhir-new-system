import { QueryClient } from "@tanstack/react-query"

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5,
			retry: (failureCount, error) => {
				if (
					error instanceof Error &&
					"status" in error &&
					typeof (error as { status: unknown }).status === "number" &&
					(error as { status: number }).status >= 400 &&
					(error as { status: number }).status < 500
				) {
					return false
				}
				return failureCount < 2
			},
			refetchOnWindowFocus: false,
		},
		mutations: { retry: false },
	},
})

export default queryClient
