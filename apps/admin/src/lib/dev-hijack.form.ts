import type { AdminApi } from "@roja/api-client"
import type { SettingFormGroups, SettingFormItem, SettingFormType } from "@roja/types"

// WS-C owns this file: Form Data Santri mocks.
// The rows are the real `tbr_setting_forms` (ids 1-69), because the legacy grouping, the section
// letters and the tab layout all depend on the fixed ids and the sub-group names.

type FormHijack = Pick<AdminApi, "getSettingForms" | "updateSettingForm">

const delay = (ms = 250): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/** [id, type, default, custom_name, "status visibility registrant_required admin_required", group, sub_group, helper] */
type Row = [number, SettingFormType, string | null, string | null, string, string, string | null, string | null]

const ROWS: Row[] = [
	[1, "basic input", "Nama Lengkap (sesuai akta)", "Nama Lengkap (sesuai akta)", "1111", "personal data", null, null],
	[2, "basic input", "Nama Panggilan", "Nama Panggilan", "1110", "personal data", null, null],
	[3, "combo box", "Agama", "Agama", "0010", "personal data", null, "Islam, Kristen, Katolik, Hindu, Buddha, Konghucu"],
	[4, "radio button", "Jenis Kelamin", "Jenis Kelamin", "1110", "personal data", null, "Laki-laki, Perempuan"],
	[5, "basic input", "Tempat Lahir", "Tempat Lahir", "1110", "personal data", null, null],
	[6, "datepicker", "Tanggal Lahir", "Tanggal Lahir", "1110", "personal data", null, null],
	[7, "radio button", "Kewarganegaraan atau Kartu Keluarga", "Kewarganegaraan atau Kartu Keluarga", "1110", "personal data", null, "WNI, WNA"],
	[8, "radio button", "Tinggal Bersama", "Tinggal Bersama", "1110", "personal data", null, "Orang Tua, Wali"],
	[9, "input number", "Anak ke", "Anak ke", "1110", "personal data", null, "1, 2, 3, atau 4"],
	[10, "combo box", "Keadaan", "Keadaan", "1110", "personal data", null, "Ayah & Ibu, Yatim Piatu, Yatim"],
	[11, "combo box", "Status dalam keluarga", "Status dalam keluarga", "1110", "personal data", null, "Anak Kandung, Anak Tiri, Anak Asuh/Angkat"],
	[12, "input number", "Nomor HP yang bisa dihubungi", "Nomor HP yang bisa dihubungi", "1110", "personal data", null, null],
	[13, "address group", "Alamat", "Alamat", "1110", "personal data", null, "Provinsi, Kabupaten, Kecamatan, Kelurahan, Jalan, RT, RW, Dusun"],
	[14, "input number", "NISN (Nomor Induk Siswa Nasional)", "NISN (Nomor Induk Siswa Nasional)", "1101", "personal data", null, null],
	[15, "input number", "NIK (Nomor Induk Kependudukan)", null, "0011", "personal data", null, null],
	[16, "input number", "No. Rekening Solo Pintar (Jika menerima)", "Dapat informasi Pondok Roja dari mana?", "1110", "personal data", null, null],
	[17, "input number", "No. Kartu Indonesia Pintar (Jika Menerima)", "Alasan mendaftar di Pondok Roja?", "1110", "personal data", null, null],
	[18, "input number", "Nomor Ijazah", "Kelas saat mendaftar di Pondok Roja", "1110", "personal data", null, null],
	[19, "basic input", "Nama Sekolah", "Nama Sekolah Asal", "1110", "personal data", null, null],
	[20, "input number", "Telepon Sekolah", "Telepon Sekolah", "1000", "personal data", null, null],
	[21, "location group", "Alamat Sekolah", "Alamat Sekolah", "1010", "personal data", null, "Provinsi, Kabupaten, Kecamatan, Kelurahan, Jalan, Dusun, Kode Pos"],
	[22, "accordion label", "Data Kesehatan Kamu", "Data Kesehatan Kamu", "1111", "identity data", "data kesehatan kamu", null],
	[23, "basic input", "Berat dan Tinggi Badan", "Berat dan Tinggi Badan", "1100", "identity data", "data kesehatan kamu", "Tinggi dan berat badan pendaftar"],
	[24, "combo box", "Golongan Darah", "Golongan Darah", "1100", "identity data", "data kesehatan kamu", "A, B, AB, O"],
	[25, "radio button", "Kondisi Penglihatan", "Kondisi Penglihatan", "1100", "identity data", "data kesehatan kamu", "Normal, Berkacamata"],
	[26, "radio button", "Kondisi Pendengaran", "Kondisi Pendengaran", "1100", "identity data", "data kesehatan kamu", "Normal, Kurang Peka Suara"],
	[27, "combo box", "Imunisasi yang Diberikan", "Imunisasi yang Diberikan", "0000", "identity data", "data kesehatan kamu", "Lengkap, Tidak Lengkap, Tidak Imunisasi"],
	[28, "basic input", "Riwayat Penyakit yang Pernah Diderita", "Riwayat Penyakit yang Pernah Diderita", "1110", "identity data", "data kesehatan kamu", null],
	[29, "accordion label", "Prestasi Belajar Yang Pernah Kamu Raih", "Prestasi Belajar Yang Pernah Kamu Raih", "1111", "identity data", "prestasi belajar yang pernah kamu raih", null],
	[30, "basic input", null, null, "1100", "identity data", "prestasi belajar yang pernah kamu raih", null],
	[31, "accordion label", "Prestasi Dinniyah", "Prestasi Dinniyah", "1111", "identity data", "prestasi dinniyah", null],
	[32, "radio button", "Membaca", "Membaca", "1000", "identity data", "prestasi dinniyah", "Jilid, Al-Quran"],
	[33, "basic input", "Menghafal Al-Quran", "Isi apabila  pernah mendapat prestasi dalam bidang menghafal Al Quran", "1100", "identity data", "prestasi dinniyah", null],
	[34, "accordion label", "Bakat Menonjol Lain Beserta Prestasi", "Bakat Menonjol Lain Beserta Prestasi", "1111", "identity data", "bakat menonjol lain beserta prestasi", null],
	[35, "basic input", null, null, "1100", "identity data", "bakat menonjol lain beserta prestasi", null],
	[36, "accordion label", "Ayah Kandung & Ibu Kandung", null, "1111", "family data", "ayah kandung & ibu kandung", null],
	[37, "basic input", "Nama Lengkap Ayah", "Nama Lengkap Ayah", "1111", "family data", "ayah kandung & ibu kandung", null],
	[38, "combo box", "Agama Ayah", "Agama Ayah", "0010", "family data", "ayah kandung & ibu kandung", "Islam, Kristen, Katolik, Hindu, Buddha, Konghucu"],
	[39, "basic input", "Kewarganegaraan Ayah", "Kewarganegaraan Ayah", "1110", "family data", "ayah kandung & ibu kandung", null],
	[40, "combo box", "Pendidikan Terakhir Ayah", "Pendidikan Terakhir Ayah", "1110", "family data", "ayah kandung & ibu kandung", "Tidak Sekolah, SD, SMP, SMA, Diploma, S1, S2, S3"],
	[41, "input number", "Nomor Telepon Ayah", "Nomor Telepon/WA Ayah", "1111", "family data", "ayah kandung & ibu kandung", null],
	[42, "input number", "Nomor Whatsapp Ayah", "Nomor Whatsapp Ayah", "0000", "family data", "ayah kandung & ibu kandung", null],
	[43, "basic input", "Pekerjaan atau Profesi Ayah", "Pekerjaan atau Profesi Ayah", "1100", "family data", "ayah kandung & ibu kandung", null],
	[44, "basic input", "Nama Lengkap Ibu", "Nama Lengkap Ibu", "1111", "family data", "ayah kandung & ibu kandung", null],
	[45, "combo box", "Agama Ibu", "Agama Ibu", "0000", "family data", "ayah kandung & ibu kandung", "Islam, Kristen, Katolik, Hindu, Buddha, Konghucu"],
	[46, "basic input", "Kewarganegaraan Ibu", "Kewarganegaraan Ibu", "1110", "family data", "ayah kandung & ibu kandung", null],
	[47, "combo box", "Pendidikan Terakhir Ibu", "Pendidikan Terakhir Ibu", "1110", "family data", "ayah kandung & ibu kandung", "Tidak Sekolah, SD, SMP, SMA, Diploma, S1, S2, S3"],
	[48, "input number", "Nomor Telepon Ibu", "Nomor Telepon/WA Ibu", "1110", "family data", "ayah kandung & ibu kandung", null],
	[49, "input number", "Nomor Whatsapp Ibu", "Nomor Whatsapp Ibu", "0000", "family data", "ayah kandung & ibu kandung", null],
	[50, "basic input", "Pekerjaan atau Profesi Ibu", "Pekerjaan atau Profesi Ibu", "1100", "family data", "ayah kandung & ibu kandung", null],
	[51, "accordion label", "Alamat Orang Tua", null, "1111", "family data", "alamat orang tua", null],
	[52, "basic input", "", null, "1000", "family data", "alamat orang tua", "Provinsi, Kabupaten, Kecamatan, Kelurahan, Jalan, RT, RW, Dusun"],
	[53, "accordion label", "Identitas Wali", "Di Isi apabila memiliki wali selain orang Tua", "1111", "guardian data", "identitas wali", null],
	[54, "basic input", "Nama Lengkap Wali", "Nama Lengkap Wali", "1100", "guardian data", "identitas wali", null],
	[55, "combo box", "Agama Wali", "Agama Wali", "0000", "guardian data", "identitas wali", "Islam, Kristen, Katolik, Hindu, Buddha, Konghucu"],
	[56, "basic input", "Kewarganegaraan Wali", "Kewarganegaraan Wali", "1100", "guardian data", "identitas wali", null],
	[57, "combo box", "Pendidikan Terakhir Wali", "Pendidikan Terakhir Wali", "1100", "guardian data", "identitas wali", "Tidak Sekolah, SD, SMP, SMA, Diploma, S1, S2, S3"],
	[58, "input number", "Nomor Telepon Wali", "Nomor Telepon /WA Wali", "1100", "guardian data", "identitas wali", null],
	[59, "input number", "Nomor WhatsApp Wali", "Nomor WhatsApp Wali", "0000", "guardian data", "identitas wali", null],
	[60, "basic input", "Pekerjaan atau Profesi Wali", "Pekerjaan atau Profesi Wali", "1100", "guardian data", "identitas wali", null],
	[61, "accordion label", "Alamat Wali", null, "1111", "guardian data", "alamat wali", null],
	[62, "address group", null, null, "1100", "guardian data", "alamat wali", "Provinsi, Kabupaten, Kecamatan, Kelurahan, Jalan, RT, RW, Dusun"],
	[63, "upload", "Ijazah / SHUS / M (Surat Hasil US)", "Ijazah / SHUS / M (Surat Hasil US) dapat menyusul setelah lulus", "0000", "attachment data", null, null],
	[64, "upload", "Pas photo 3 x 4 cm", "Pas photo 3 x 4 cm", "0000", "attachment data", null, null],
	[65, "upload", "Kartu keluarga (KK)", "Kartu keluarga (KK)", "0000", "attachment data", null, null],
	[66, "upload", "KSP (Jika Menerima)", "Bukti pembayaran Pendaftaran Rp 300.000 (berupa foto kwitansi/transfer)", "0010", "attachment data", null, null],
	[67, "upload", "KIP (Jika Menerima)", "KIP (Jika Menerima)", "1000", "attachment data", null, null],
	[68, "upload", "Nilai Raport", "Nilai Raport Terakhir (dapat menyusul)", "0000", "attachment data", null, null],
	[69, "upload", "Akta Kelahiran", "Akta Kelahiran", "1100", "attachment data", null, null],
]

// Legacy `alpabhetIcon` skips the accordion labels when it decides whether a section is hidden
const ACCORDION_IDS = [22, 29, 31, 34, 36, 51, 53, 61]

const toItem = ([id, type, defaultLabel, customName, flags, group, subGroup, helper]: Row): SettingFormItem => ({
	id,
	type,
	helper,
	group,
	subGroup,
	label: customName ?? defaultLabel ?? "",
	defaultLabel,
	customName,
	status: flags[0] === "1",
	visibility: flags[1] === "1",
	registrantRequired: flags[2] === "1",
	adminRequired: flags[3] === "1",
})

let items: SettingFormItem[] = ROWS.map(toItem)

const range = (from: number, to: number): SettingFormItem[] => items.filter((entry) => entry.id >= from && entry.id <= to)

const bySubGroup = (subGroup: string): SettingFormItem[] => items.filter((entry) => entry.subGroup === subGroup)

// Legacy `SettingFormService::alpabhetIcon`: a fully hidden section gets "" and skips its letter
const letters = (group: string): string[] => {
	const subGroups: string[] = []
	for (const entry of items) {
		if (entry.group !== group) continue
		const key = entry.subGroup ?? ""
		if (!subGroups.includes(key)) subGroups.push(key)
	}

	let taken = 0
	return subGroups.map((subGroup) => {
		const visible = items.some(
			(entry) => entry.subGroup === subGroup && !ACCORDION_IDS.includes(entry.id) && entry.status && entry.visibility,
		)
		if (!visible) return ""
		const letter = String.fromCharCode(65 + taken)
		taken += 1
		return letter
	})
}

const groups = (): SettingFormGroups => ({
	personalDatas: range(1, 13),
	previousSchools: range(19, 21),
	identityNumbers: range(14, 18),
	healthDatas: bySubGroup("data kesehatan kamu"),
	achievments: bySubGroup("prestasi belajar yang pernah kamu raih"),
	religiousAchievments: bySubGroup("prestasi dinniyah"),
	gifts: bySubGroup("bakat menonjol lain beserta prestasi"),
	familyDatas: bySubGroup("ayah kandung & ibu kandung"),
	familyAddress: bySubGroup("alamat orang tua"),
	guardianDatas: bySubGroup("identitas wali"),
	guardianAddress: bySubGroup("alamat wali"),
	attachments: items.filter((entry) => entry.group === "attachment data"),
	alphabet: { identity: letters("identity data"), family: letters("family data"), guardian: letters("guardian data") },
})

export const formHijack: FormHijack = {
	getSettingForms: async () => {
		await delay()
		return groups()
	},

	updateSettingForm: async (id, data) => {
		await delay(200)
		// Legacy `$form->update($request->validated())` — only the posted keys move
		items = items.map((entry) =>
			entry.id === id
				? {
						...entry,
						status: data.status ?? entry.status,
						visibility: data.visibility ?? entry.visibility,
						registrantRequired: data.registrantRequired ?? entry.registrantRequired,
						adminRequired: data.adminRequired ?? entry.adminRequired,
						customName: data.customName ?? entry.customName,
						label: data.customName ?? entry.label,
					}
				: entry,
		)
		const item = items.find((entry) => entry.id === id)
		if (!item) throw new Error("Data gagal diupdate.")
		return { id, message: "Data berhasil diupdate.", item, alphabet: groups().alphabet }
	},
}
