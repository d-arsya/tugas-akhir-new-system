import type { Config } from "tailwindcss"

const config: Config = {
	content: [
		"./src/**/*.{ts,tsx}",
		"../../apps/*/src/**/*.{ts,tsx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Montserrat", "sans-serif"],
			},
			colors: {
				primary: "rgb(var(--primary-rgb) / <alpha-value>)",
				secondary: "rgb(var(--secondary-rgb) / <alpha-value>)",
				danger: "rgb(var(--danger-rgb) / <alpha-value>)",
				warning: "rgb(var(--warning-rgb) / <alpha-value>)",
				success: "rgb(var(--success-rgb) / <alpha-value>)",
				info: "rgb(var(--info-rgb) / <alpha-value>)",
			},
		},
	},
}

export default config
