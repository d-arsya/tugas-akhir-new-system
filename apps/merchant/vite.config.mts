/// <reference types='vitest' />
import { defineConfig } from "vite"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin"
import { nxCopyAssetsPlugin } from "@nx/vite/plugins/nx-copy-assets.plugin"
import { resolve } from "path"

export default defineConfig(() => ({
	root: import.meta.dirname,
	cacheDir: `../../node_modules/.vite/apps/merchant`,
	server: {
		port: 4202,
		host: "localhost",
	},
	preview: {
		port: 4202,
		host: "localhost",
	},
	resolve: {
		alias: {
			"@": resolve(import.meta.dirname, "src"),
		},
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
		outDir: `../../dist/apps/merchant`,
		emptyOutDir: true,
		reportCompressedSize: true,
		commonjsOptions: { transformMixedEsModules: true },
	},
	test: {
		name: "merchant",
		watch: false,
		globals: true,
		environment: "jsdom",
		include: ["{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		reporters: ["default"],
		coverage: {
			reportsDirectory: `../../coverage/apps/merchant`,
			provider: "v8" as const,
		},
	},
}))
