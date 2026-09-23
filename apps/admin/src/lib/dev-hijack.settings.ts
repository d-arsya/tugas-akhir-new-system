import type { AdminApi, createSharedApi } from "@roja/api-client"
import type { AdminSchoolSetting, District, MyProfile, Province, Regency, SettingAnnouncement } from "@roja/types"

import { IS_DEV_HIJACK } from "./dev-hijack"

// WS-B owns this file: Profil Saya, Profil Pondok and Pengumuman PSB mocks.
// Values mirror the single rows in `tbr_setting_schools` and `tbr_setting_anncs`.

type SettingsHijack = Pick<
	AdminApi,
	"getMyProfile" | "updateMyProfile" | "getSchool" | "updateSchool" | "getAnnouncement" | "updateAnnouncement"
>

type SharedApi = ReturnType<typeof createSharedApi>
type LocationHijack = Pick<SharedApi, "getProvinces" | "getRegencies" | "getDistricts">

const delay = (ms = 250): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

let profileState: MyProfile = {
	id: 1,
	name: "Super Administrator",
	email: "superadmin@pondokroja.ac.id",
	role: "Superadmin",
	gender: "male",
	weakPassword: false,
}

// The real logo is not in S3 yet, so the mock previews point at the bundled asset
const MOCK_LOGO_URL = "/assets/images/Logo.png"

let schoolState: AdminSchoolSetting = {
	id: 1,
	name: "TMQ (TARBIYYATU MUHAFFIZHATIL QUR'AN) PONDOK ROJA",
	slogan: "Siapapun Berhak Menjadi Apapun Dalam Bingkai Al-Qur'an",
	phone: "81392104443",
	provinceId: 33,
	regencyId: 3311,
	districtId: 3311040,
	fullAddress: "Brumbung RT 03/02 Kelurahan Dukuh",
	logo: "2021/09/23/c60f294640f8bc168cdd4e56f9de7385.png",
	favicon: "2021/09/15/280dc3fbdf5a8e58541cfdeb7f21d281.png",
	logoUrl: MOCK_LOGO_URL,
	faviconUrl: MOCK_LOGO_URL,
}

let announcementState: SettingAnnouncement = {
	id: 1,
	successDesc:
		"<p>Barokalloh,&nbsp;</p><p>Selamat kepada Santriwati dengan Nama \"...\" Kami nyatakan diterima sebgai Santriwati TMQ Pondok Rooihatul Jannah.</p>",
	failedDesc:
		"<p>Kepada Santriwati dengan Nama \"... \" kami mengucapkan mohon maaf belum dapat kami terima bergabung di TMQ Pondok Rooihatul Jannah.</p>",
	failedIndentTestDesc:
		"<p>Mohon maaf Peserta Calon Santriwati Tes Indent dengan Nama\"...\" Belum dapat kami terima dan masih mempunyai kesempatan mengikuti Tes Reguler pada... .</p>",
	dateStart: "01/07/2026",
	dateEnd: "31/07/2026",
	information: "<p>Foto Kopi KK</p>",
	additionalInformation: "<p>Membawa berkas PIP jika mempunyai</p>",
}

// `Y/m/d/<md5>.<ext>`, the key `UploadTraits::uploadFile` writes into the column
const mockKey = (file: File): string => {
	const now = new Date()
	const pad = (value: number): string => String(value).padStart(2, "0")
	const extension = file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase() || "png"
	const hash = Math.random().toString(16).slice(2).padEnd(32, "0").slice(0, 32)
	return `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())}/${hash}.${extension}`
}

export const settingsHijack: SettingsHijack = {
	getMyProfile: async () => {
		await delay(200)
		return profileState
	},

	updateMyProfile: async (data) => {
		await delay(300)
		// The mock never stores a password; `weak_password` follows the same rule as the service
		profileState = { ...profileState, name: data.name, gender: data.gender, weakPassword: data.weakPassword === true }
		return { message: "Data berhasil diupdate." }
	},

	getSchool: async () => {
		await delay(200)
		return schoolState
	},

	updateSchool: async (data) => {
		await delay(350)
		schoolState = {
			...schoolState,
			name: data.name,
			slogan: data.slogan ?? null,
			phone: data.phone ?? null,
			provinceId: Number(data.provinceId),
			regencyId: Number(data.regencyId),
			districtId: Number(data.districtId),
			fullAddress: data.fullAddress,
			...(data.emptyLogo === true ? { logo: null, logoUrl: null } : {}),
			...(data.emptyFavicon === true ? { favicon: null, faviconUrl: null } : {}),
			...(data.logo ? { logo: mockKey(data.logo), logoUrl: URL.createObjectURL(data.logo) } : {}),
			...(data.favicon ? { favicon: mockKey(data.favicon), faviconUrl: URL.createObjectURL(data.favicon) } : {}),
		}
		return { message: "Data berhasil diupdate." }
	},

	getAnnouncement: async () => {
		await delay(200)
		return announcementState
	},

	updateAnnouncement: async (data) => {
		await delay(300)
		announcementState = { ...announcementState, ...data, additionalInformation: data.additionalInformation ?? null }
		return { message: "Data berhasil diupdate." }
	},
}

// `Province::all()` and the `location.getRegency` / `location.getDistrict` JSON routes,
// in the primary-key order the legacy selects render
const provinces: Province[] = [
	{ id: 31, name: "DKI Jakarta" },
	{ id: 32, name: "Jawa Barat" },
	{ id: 33, name: "Jawa Tengah" },
	{ id: 34, name: "DI Yogyakarta" },
	{ id: 35, name: "Jawa Timur" },
	{ id: 36, name: "Banten" },
]

const regencies: Regency[] = [
	{ id: 3301, provinceId: 33, name: "Kabupaten Cilacap" },
	{ id: 3302, provinceId: 33, name: "Kabupaten Banyumas" },
	{ id: 3309, provinceId: 33, name: "Kabupaten Boyolali" },
	{ id: 3310, provinceId: 33, name: "Kabupaten Klaten" },
	{ id: 3311, provinceId: 33, name: "Kabupaten Sukoharjo" },
	{ id: 3312, provinceId: 33, name: "Kabupaten Wonogiri" },
	{ id: 3313, provinceId: 33, name: "Kabupaten Karanganyar" },
	{ id: 3374, provinceId: 33, name: "Kota Semarang" },
	{ id: 3401, provinceId: 34, name: "Kabupaten Kulon Progo" },
	{ id: 3402, provinceId: 34, name: "Kabupaten Bantul" },
	{ id: 3403, provinceId: 34, name: "Kabupaten Gunung Kidul" },
	{ id: 3404, provinceId: 34, name: "Kabupaten Sleman" },
	{ id: 3471, provinceId: 34, name: "Kota Yogyakarta" },
]

const districts: District[] = [
	{ id: 3311010, regencyId: 3311, name: "Weru" },
	{ id: 3311020, regencyId: 3311, name: "Bulu" },
	{ id: 3311030, regencyId: 3311, name: "Tawangsari" },
	{ id: 3311040, regencyId: 3311, name: "Sukoharjo" },
	{ id: 3311050, regencyId: 3311, name: "Nguter" },
	{ id: 3311060, regencyId: 3311, name: "Bendosari" },
	{ id: 3311070, regencyId: 3311, name: "Polokarto" },
	{ id: 3311080, regencyId: 3311, name: "Mojolaban" },
	{ id: 3311090, regencyId: 3311, name: "Grogol" },
	{ id: 3311100, regencyId: 3311, name: "Baki" },
	{ id: 3311110, regencyId: 3311, name: "Gatak" },
	{ id: 3311120, regencyId: 3311, name: "Kartasura" },
	{ id: 3310010, regencyId: 3310, name: "Prambanan" },
	{ id: 3310020, regencyId: 3310, name: "Gantiwarno" },
	{ id: 3310030, regencyId: 3310, name: "Wedi" },
]

const locationHijack: LocationHijack = {
	getProvinces: async () => {
		await delay(150)
		return provinces
	},
	getRegencies: async (provinceId) => {
		await delay(150)
		return regencies.filter((regency) => regency.provinceId === provinceId)
	},
	getDistricts: async (regencyId) => {
		await delay(150)
		return districts.filter((district) => district.regencyId === regencyId)
	},
}

/** The Profil Pondok selects read the shared `/location/*` endpoints, so the mocks cover those too. */
export const hijackSharedApi = (realApi: SharedApi): SharedApi => {
	if (!IS_DEV_HIJACK) return realApi
	return { ...realApi, ...locationHijack }
}
