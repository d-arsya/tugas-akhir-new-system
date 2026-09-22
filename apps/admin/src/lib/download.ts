// Saves a downloaded file (e.g. an Excel export fetched with the auth header) under its name
export const saveBlob = (blob: Blob, fileName: string): void => {
	const url = URL.createObjectURL(blob)
	const link = document.createElement("a")
	link.href = url
	link.download = fileName
	document.body.appendChild(link)
	link.click()
	link.remove()
	// Let the browser start the download before releasing the object URL
	window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
