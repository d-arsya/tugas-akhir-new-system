import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { routeTree } from "./routeTree.gen"
import queryClient from "@/lib/query-client"
import "./styles.css"


const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	scrollRestoration: true,
})


declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router
	}
}

const root = document.getElementById("root")
if (!root) throw new Error("Root element #root not found in index.html")

ReactDOM.createRoot(root).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
			{import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
		</QueryClientProvider>
	</StrictMode>,
)
