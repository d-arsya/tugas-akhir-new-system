import { defineConfig } from "vite"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import tsconfigPaths from "vite-tsconfig-paths"
import { resolve } from "path"

export default defineConfig(() => ({
	root: import.meta.dirname,
	cacheDir: `../../node_modules/.vite/apps/psb`,
	server: {
		port: 4200,
		host: "localhost",
	},
	preview: {
		port: 4200,
		host: "localhost",
	},
	resolve: {
		alias: {
			"@": resolve(import.meta.dirname, "src"),
		},
		tsconfigPaths: true,
	},
	plugins: [
		TanStackRouterVite({
			routesDirectory: "./src/routes",
			generatedRouteTree: "./src/routeTree.gen.ts",
		}),
		react(),
		tailwindcss(),
	],
	build: {
		outDir: `../../dist/apps/psb`,
		emptyOutDir: true,
		reportCompressedSize: true,
		commonjsOptions: { transformMixedEsModules: true },
	}
}))
