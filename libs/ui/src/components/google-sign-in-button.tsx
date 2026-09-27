import type { JSX } from "react"
import { useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"

type GoogleCredentialResponse = { credential: string }

type GoogleIdentity = {
	initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void
	renderButton: (
		parent: HTMLElement,
		options: { theme: string; size: string; text: string; shape: string; locale: string; width: number },
	) => void
}

type GoogleWindow = { google?: { accounts?: { id?: GoogleIdentity } } }

let gsiScript: Promise<void> | null = null

const loadGoogleIdentity = (): Promise<void> => {
	gsiScript ??= new Promise<void>((resolve, reject) => {
		const script = document.createElement("script")
		script.src = "https://accounts.google.com/gsi/client"
		script.async = true
		script.onload = () => resolve()
		script.onerror = () => {
			gsiScript = null
			reject(new Error("Google Sign-In gagal dimuat"))
		}
		document.head.appendChild(script)
	})
	return gsiScript
}

export const useGoogleClientId = (loadConfig: () => Promise<{ clientId: string | null }>): string | null => {
	const { data } = useQuery({
		queryKey: ["google-config"],
		queryFn: loadConfig,
		staleTime: Infinity,
		retry: false,
	})
	return data?.clientId ?? null
}

export type GoogleSignInButtonProps = {
	clientId: string
	onCredential: (credential: string) => void
	disabled?: boolean
}

export const GoogleSignInButton = ({ clientId, onCredential, disabled = false }: GoogleSignInButtonProps): JSX.Element => {
	const containerRef = useRef<HTMLDivElement>(null)
	const callbackRef = useRef(onCredential)

	useEffect(() => {
		callbackRef.current = onCredential
	}, [onCredential])

	useEffect(() => {
		let cancelled = false
		loadGoogleIdentity()
			.then(() => {
				const container = containerRef.current
				const identity = (window as unknown as GoogleWindow).google?.accounts?.id
				if (cancelled || !container || !identity) return
				identity.initialize({
					client_id: clientId,
					callback: (response) => callbackRef.current(response.credential),
				})
				identity.renderButton(container, {
					theme: "filled_blue",
					size: "large",
					text: "continue_with",
					shape: "pill",
					locale: "id",
					width: Math.max(200, Math.min(container.offsetWidth, 400)),
				})
			})
			.catch(() => undefined)
		return () => {
			cancelled = true
		}
	}, [clientId])

	return (
		<div
			ref={containerRef}
			className={`flex justify-center min-h-[44px] ${disabled ? "pointer-events-none opacity-60" : ""}`}
		/>
	)
}

export default GoogleSignInButton
