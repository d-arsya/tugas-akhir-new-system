import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { routeTree } from "./routeTree.gen"
import queryClient from "@/lib/query-client"
import useAuthStore from "@/stores/auth.store"
import useWizardStore from "@/stores/wizard.store"
import { IS_DEV_HIJACK, hijackAuthUser } from "@/lib/dev-hijack"
import "./styles.css"

if (IS_DEV_HIJACK) {
	const currentAuth = useAuthStore.getState()
	if (!currentAuth.isAuthenticated) {
		currentAuth.login(hijackAuthUser)
	}
	const wizardStore = useWizardStore.getState()
	if (!wizardStore.sessionId) {
		wizardStore.setSession("mock-session-12345", "calonsantri@pondokroja.ac.id", 1)
	}
}


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
