import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]): string => {
	return twMerge(clsx(inputs))
}

export const truncate = (str: string, maxLength: number): string => {
	if (str.length <= maxLength) return str
	return `${str.slice(0, maxLength)}...`
}

export const generateInitials = (name: string): string => {
	return name
		.split(" ")
		.map((word) => word[0])
		.join("")
		.toUpperCase()
		.slice(0, 2)
}

export const slugify = (str: string): string => {
	return str
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "")
}
