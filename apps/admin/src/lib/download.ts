const REVOKE_DELAY_MS = 1000

export const saveBlob = (blob: Blob, fileName: string): void => {
	const url = URL.createObjectURL(blob)
	const link = document.createElement("a")
	link.href = url
	link.download = fileName
	document.body.appendChild(link)
	link.click()
	link.remove()
	window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS)
}
