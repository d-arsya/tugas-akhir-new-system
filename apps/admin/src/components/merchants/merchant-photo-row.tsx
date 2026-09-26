import { useState, type JSX } from "react"

import LegacyFormRow from "@/components/legacy/legacy-form-row"

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

const MerchantPhotoRow = ({ photoUrl }: { photoUrl: string | null }): JSX.Element => {
	const [broken, setBroken] = useState(false)

	return (
		<LegacyFormRow label="Foto" htmlFor="photo" className="items-center">
			{photoUrl && !broken ? (
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
