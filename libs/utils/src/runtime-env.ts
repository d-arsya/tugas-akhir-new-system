declare global {
	interface Window {
		__ENV__?: Record<string, string>
	}
}

export const getRuntimeEnv = (key: string, fallback = ""): string => {
	if (typeof window !== "undefined" && window.__ENV__?.[key]) {
		return window.__ENV__[key] as string
	}
	return (import.meta.env[key] as string | undefined) ?? fallback
}
