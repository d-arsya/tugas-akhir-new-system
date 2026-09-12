import { defineConfig } from "vite"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin"
import { nxCopyAssetsPlugin } from "@nx/vite/plugins/nx-copy-assets.plugin"
import { resolve } from "path"

export default defineConfig(() => ({
	root: import.meta.dirname,
	publicDir: resolve(import.meta.dirname, "../../libs/ui/public"),
	cacheDir: `../../node_modules/.vite/apps/psb`,
	server: {
		port: 4300,
		host: "localhost",
	},
	preview: {
		port: 4300,
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
		nxViteTsPaths(),
		nxCopyAssetsPlugin(["*.md"]),
	],
	build: {
		outDir: "dist",
		emptyOutDir: true,
		reportCompressedSize: true,
		commonjsOptions: { transformMixedEsModules: true },
	},
}))
