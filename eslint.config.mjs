import nx from "@nx/eslint-plugin"

export default [
	...nx.configs["flat/base"],
	...nx.configs["flat/typescript"],
	...nx.configs["flat/javascript"],
	{
		ignores: [
			"**/dist",
			"**/out-tsc",
			"**/node_modules",
			"**/vite.config.*.timestamp*",
			"**/vitest.config.*.timestamp*",
			"**/routeTree.gen.ts",
		],
	},
	{
		files: ["**/*.ts", "**/*.tsx"],
		rules: {
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
			],
			"@nx/enforce-module-boundaries": [
				"error",
				{
					enforceBuildableLibDependency: true,
					allow: ["^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$"],
					depConstraints: [{ sourceTag: "*", onlyDependOnLibsWithTags: ["*"] }],
				},
			],
		},
	},
]
