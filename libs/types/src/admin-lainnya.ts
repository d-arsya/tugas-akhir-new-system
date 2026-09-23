// Contract for the admin "Lainnya" menu: Pengelola, Authentication Log, Pengaturan
// (Pengumuman PSB, Form Data Santri, Profil Pondok, Profil Saya, Sistem).
// Ported 1:1 from the legacy Laravel admin, so the wording and shapes follow the legacy pages.

/** Values stored in `tbr_users.role`. */
export type AdminRole = "Superadmin" | "Admin" | "Bendahara" | "Kasir E-Wallet"

export type AdminGender = "male" | "female"

export type AdminPageMeta = {
	page: number
	limit: number
	total: number
	totalPages: number
}

// --- Pengelola (legacy UserController) -------------------------------------------------

export type AdminUserRow = {
	id: number
	name: string | null
	email: string | null
	role: string | null
	/** Already formatted in Asia/Jakarta, e.g. "22 September 2026 jam 10:05". */
	createdAt: string
	/** Unix seconds — legacy renders this in a hidden span so the column sorts by date. */
	createdAtTs: number
	isBlocked: boolean
}

export type AdminUserDetail = {
	id: number
	name: string | null
	email: string | null
	role: string | null
	gender: AdminGender | null
	isBlocked: boolean
}

export type AdminUserPayload = {
	name: string
	gender: AdminGender
	role: string
	isBlocked: boolean
	/** Only sent on create; legacy ignores it when updating. */
	email?: string
}

// --- Buat Password (legacy Auth\CreatePasswordController) ------------------------------

export type CreatePasswordCheck = {
	email: string
	name: string | null
	role: string | null
}

export type CreatePasswordPayload = {
	token: string
	email: string
	password: string
	passwordConfirmation: string
	/** null when the meter says the password is weak and the box is unchecked. */
	weakPassword?: boolean | null
}

// --- Authentication Log (legacy AuthLogController) -------------------------------------

/** Every field arrives ready to render, like the legacy controller's row array. */
export type AuthLogRow = {
	id: number
	email: string | null
	/** Browser name from the user agent ("Google Chrome", "Tidak diketahui"). */
	browser: string
	os: string | null
	duration: string | null
	/** Indonesian relative time, e.g. "2 hari yang lalu". */
	lastSeen: string
	/** "22 September 2026 jam 10:05:09". */
	lastLogin: string | null
	lastLogout: string | null
	loginStatus: string | null
}

export type AuthLogPage = {
	data: AuthLogRow[]
	meta: AdminPageMeta
}

export type AuthLogParams = {
	page?: number
	limit?: number
	search?: string
	sortBy?: string
	sortDir?: "asc" | "desc"
}

// --- Profil Saya (legacy MyprofileController) ------------------------------------------

export type MyProfile = {
	id: number
	name: string | null
	email: string | null
	role: string | null
	gender: AdminGender | null
	weakPassword: boolean
}

export type MyProfilePayload = {
	name: string
	gender: AdminGender
	password?: string
	passwordConfirmation?: string
	weakPassword?: boolean | null
}

// --- Pengumuman PSB (legacy SettingAnncsController) ------------------------------------

export type SettingAnnouncement = {
	id: number
	successDesc: string | null
	failedDesc: string | null
	failedIndentTestDesc: string | null
	/** dd/mm/yyyy, like the legacy accessor. */
	dateStart: string | null
	dateEnd: string | null
	information: string | null
	additionalInformation: string | null
}

export type SettingAnnouncementPayload = {
	successDesc: string
	failedDesc: string
	failedIndentTestDesc: string
	dateStart: string
	dateEnd: string
	information: string
	additionalInformation?: string | null
}

// --- Form Data Santri (legacy SettingFormController) -----------------------------------

export type SettingFormType =
	| "paragraph"
	| "basic input"
	| "input number"
	| "radio button"
	| "checkbox"
	| "datepicker"
	| "combo box"
	| "address group"
	| "location group"
	| "upload"
	| "texteditor"
	| "accordion label"

export type SettingFormItem = {
	id: number
	type: SettingFormType
	helper: string | null
	group: string | null
	subGroup: string | null
	/** `custom_name ?? default` — the label shown across the apps. */
	label: string
	defaultLabel: string | null
	customName: string | null
	status: boolean
	visibility: boolean
	registrantRequired: boolean
	adminRequired: boolean
}

/** Letters per sub-group, in order; "" marks a section that stays hidden on the PSB form. */
export type SettingFormAlphabet = {
	identity: string[]
	family: string[]
	guardian: string[]
}

export type SettingFormGroups = {
	personalDatas: SettingFormItem[]
	previousSchools: SettingFormItem[]
	identityNumbers: SettingFormItem[]
	healthDatas: SettingFormItem[]
	achievments: SettingFormItem[]
	religiousAchievments: SettingFormItem[]
	gifts: SettingFormItem[]
	familyDatas: SettingFormItem[]
	familyAddress: SettingFormItem[]
	guardianDatas: SettingFormItem[]
	guardianAddress: SettingFormItem[]
	attachments: SettingFormItem[]
	alphabet: SettingFormAlphabet
}

export type SettingFormPatch = {
	status?: boolean
	visibility?: boolean
	customName?: string
	adminRequired?: boolean
	registrantRequired?: boolean
}

/** Legacy returns the whole re-rendered page; we return just what the panel needs. */
export type SettingFormPatchResult = {
	id: number
	message: string
	item: SettingFormItem
	alphabet: SettingFormAlphabet
}

// --- Profil Pondok (legacy SettingSchoolController) ------------------------------------

export type AdminSchoolSetting = {
	id: number
	name: string | null
	slogan: string | null
	/** Stored without the 62 prefix, which the form shows as a static addon. */
	phone: string | null
	provinceId: number | null
	regencyId: number | null
	districtId: number | null
	fullAddress: string | null
	logo: string | null
	favicon: string | null
	/** Resolved preview URLs; null when the stored file is missing. */
	logoUrl: string | null
	faviconUrl: string | null
}

export type AdminSchoolPayload = {
	name: string
	slogan?: string | null
	phone?: string | null
	provinceId: number | string
	regencyId: number | string
	districtId: number | string
	fullAddress: string
	logo?: File | null
	favicon?: File | null
	emptyLogo?: boolean
	emptyFavicon?: boolean
}

// --- Sistem (legacy SettingController) -------------------------------------------------

export type SmtpEncryption = "ssl" | "tls"

export type SystemSetting = {
	id: number
	backupFrequency: number
	fromName: string | null
	smtpHost: string | null
	smtpPort: string | null
	typeOfEncryption: SmtpEncryption | null
	smtpUsername: string | null
	/** Legacy shows it in clear on the form. */
	smtpPassword: string | null
	enabled2fa: boolean
}

export type SmtpPayload = {
	fromName: string
	smtpHost: string
	typeOfEncryption: SmtpEncryption
	smtpUsername: string
	smtpPassword: string
}

export type AdminMessageResult = {
	message: string
}
