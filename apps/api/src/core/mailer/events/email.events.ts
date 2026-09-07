export class RegistrantPasswordEvent {
	constructor(
		public readonly to: string,
		public readonly data: {
			fullName: string
			registrantId: string
			password: string
			loginUrl: string
		},
	) {}
}

export class ResetPinEvent {
	constructor(
		public readonly to: string,
		public readonly data: {
			name: string
			resetUrl: string
		},
	) {}
}

export class EmailVerificationEvent {
	constructor(
		public readonly to: string,
		public readonly data: {
			name: string
			verifyUrl: string
		},
	) {}
}

export class ForgotPasswordEvent {
	constructor(
		public readonly to: string,
		public readonly data: {
			name: string
			resetUrl: string
		},
	) {}
}
