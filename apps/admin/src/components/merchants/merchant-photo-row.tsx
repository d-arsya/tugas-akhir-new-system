import { useState, type JSX } from "react"

import LegacyFormRow from "@/components/legacy/legacy-form-row"

/**
 * `assets/svg/etc/ic_no-photo.svg` — the green "No Photo" disc legacy falls back to. Inlined
 * rather than copied into the shared public assets, because only this page uses it.
 */
const NoPhoto = (): JSX.Element => (
	<svg width="90" height="90" viewBox="0 0 93 93" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="No Photo">
		<circle cx="46.5" cy="46.5" r="46.5" fill="#8DC31E" />
		<text
			x="46.5"
			y="46.5"
			textAnchor="middle"
			dominantBaseline="central"
			fill="#ffffff"
			fontFamily="'Open Sans', Arial, sans-serif"
			fontSize="12"
		>
			No Photo
		</text>
	</svg>
)

/**
 * `merchant/detail.blade.php` — the only row the detail page adds to the create form, between
 * "Nomor Telepon" and "Status Akun". It is **display only**: there is no upload anywhere in the
 * admin merchant CRUD, and the image is served from the merchant app's storage via
 * `config('app.merchant_url')`, so a cross-origin 404 falls back to the placeholder.
 *
 * `.form-group.row.align-items-center` — this row centres its label against the 90px avatar.
 */
const MerchantPhotoRow = ({ photoUrl }: { photoUrl: string | null }): JSX.Element => {
	const [broken, setBroken] = useState(false)

	return (
		<LegacyFormRow label="Foto" htmlFor="photo" className="items-center">
			{photoUrl && !broken ? (
				// `.rounded-circle.object-fit-cover.ms-5` — bootstrap 4 has no `ms-*`, so the class is inert
				<img
					id="preview-merchant-photo"
					src={photoUrl}
					alt="Foto merchant"
					width={90}
					height={90}
					onError={() => setBroken(true)}
					className="h-[90px] w-[90px] rounded-full object-cover"
				/>
			) : (
				<NoPhoto />
			)}
		</LegacyFormRow>
	)
}

export default MerchantPhotoRow
