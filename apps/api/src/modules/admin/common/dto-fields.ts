import { z } from "zod"

export const blank = (input: unknown): boolean => input === undefined || input === null || input === ""

export const optionalText = z
	.string()
	.trim()
	.optional()
	.transform((value) => (value ? value : undefined))
