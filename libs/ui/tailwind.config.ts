import type { Config } from "tailwindcss"

const config: Config = {
    darkMode: ["class"],
    content: [
		"./src/**/*.{ts,tsx}",
		"../../apps/*/src/**/*.{ts,tsx}",
	],
	theme: {
    	extend: {
    		fontFamily: {
    			sans: [
    				'Montserrat',
    				'sans-serif'
    			]
    		},
    		colors: {
    			primary: 'rgb(var(--primary-rgb) / <alpha-value>)',
    			secondary: 'rgb(var(--secondary-rgb) / <alpha-value>)',
    			danger: 'rgb(var(--danger-rgb) / <alpha-value>)',
    			warning: 'rgb(var(--warning-rgb) / <alpha-value>)',
    			success: 'rgb(var(--success-rgb) / <alpha-value>)',
    			info: 'rgb(var(--info-rgb) / <alpha-value>)'
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out'
    		}
    	}
    },
}

export default config
