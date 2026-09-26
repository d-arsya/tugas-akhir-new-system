import type { JSX } from "react"

export type SystemTabIconName = "hard-drive" | "paper-plane" | "shield"

type SystemTabIconProps = { name: SystemTabIconName; active: boolean }

const SystemTabIcon = ({ name, active }: SystemTabIconProps): JSX.Element => {
	const fill = active ? "var(--warning)" : "#abb4be"

	return (
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
			{name === "hard-drive" ? (
				<>
					<path
						d="M20.79,11.34,17.45,4.66A3,3,0,0,0,14.76,3H9.24A3,3,0,0,0,6.55,4.66L3.21,11.34a2,2,0,0,0-.21.9V18a3,3,0,0,0,3,3H18a3,3,0,0,0,3-3V12.24A2,2,0,0,0,20.79,11.34ZM8.34,5.55A1,1,0,0,1,9.24,5h5.52a1,1,0,0,1,.9.55L18.38,11H5.62ZM18,19H6a1,1,0,0,1-1-1V13H19v5A1,1,0,0,1,18,19Z"
						fill={fill}
					/>
					<path d="M16,15H12a1,1,0,0,0,0,2h4a1,1,0,0,0,0-2Z" fill={fill} />
					<circle cx="1" cy="1" r="1" transform="translate(7 15)" fill={fill} />
				</>
			) : null}
			{name === "paper-plane" ? (
				<path
					d="M21,4a1.31,1.31,0,0,0-.06-.27V3.64a.884.884,0,0,0-.49-.49h-.09A.86.86,0,0,0,20.05,3H20a1,1,0,0,0-.3,0L1.7,9a1,1,0,0,0,0,1.9l8.53,2.84,2.84,8.53a1,1,0,0,0,1.9,0l6-18A1,1,0,0,0,21,4ZM16.3,6.29l-5.57,5.57L5.16,10ZM14,18.84l-1.86-5.57L17.71,7.7Z"
					fill={fill}
				/>
			) : null}
			{name === "shield" ? (
				<path
					d="M12,21.85a2,2,0,0,1-1-.25l-.3-.17A15.17,15.17,0,0,1,3,8.23V8.09A2,2,0,0,1,4,6.34L11,2.4a2,2,0,0,1,2,0l7,3.94a2,2,0,0,1,1,1.75v.14a15.17,15.17,0,0,1-7.72,13.2l-.3.17A2,2,0,0,1,12,21.85Zm0-17.7L5,8.09v.14a13.15,13.15,0,0,0,6.7,11.45l.3.17.3-.17A13.15,13.15,0,0,0,19,8.23V8.09Z"
					fill={fill}
				/>
			) : null}
		</svg>
	)
}

export default SystemTabIcon
