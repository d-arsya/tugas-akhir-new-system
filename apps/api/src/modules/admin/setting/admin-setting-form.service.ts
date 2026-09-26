import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"

import { SettingForm } from "@shared/school/entities/setting-form.entity"
import type { SettingFormPatchInput } from "@admin/setting/dto/admin-setting-form.dto"
import {
	buildAlphabet,
	buildSettingFormGroups,
	toSettingFormItem,
	type SettingFormAlphabet,
	type SettingFormGroups,
	type SettingFormItem,
} from "@admin/setting/setting-form-groups"

const UPDATE_SUCCESS = "Data berhasil diupdate."
const UPDATE_FAILED = "Data gagal diupdate."

export type SettingFormPatchResult = {
	id: number
	message: string
	item: SettingFormItem
	alphabet: SettingFormAlphabet
}

// WS-C: legacy SettingFormController@index grouping + SettingFormService::alpabhetIcon
@Injectable()
export class AdminSettingFormService {
	constructor(
		@InjectRepository(SettingForm)
		private readonly settingForms: Repository<SettingForm>,
	) {}

	/** Legacy `SettingForm::orderBy('id')->get()` fanned out into the view's collections. */
	async getGroups(): Promise<SettingFormGroups> {
		return buildSettingFormGroups(await this.loadItems())
	}

	/**
	 * Legacy `update()`: applies the validated subset, then re-renders the whole page so the
	 * browser can scrape the row and the section letters. We return just those two instead.
	 */
	async update(id: number, dto: SettingFormPatchInput): Promise<SettingFormPatchResult> {
		// Laravel route-model binding 404s before the controller's try/catch
		const form = await this.settingForms.findOne({ where: { id } })
		if (!form) throw new NotFoundException("Data tidak ditemukan.")

		try {
			if (dto.status !== undefined) form.status = dto.status
			if (dto.visibility !== undefined) form.visibility = dto.visibility
			if (dto.customName !== undefined) form.customName = dto.customName
			if (dto.adminRequired !== undefined) form.adminRequired = dto.adminRequired
			if (dto.registrantRequired !== undefined) form.registrantRequired = dto.registrantRequired

			await this.settingForms.save(form)
		} catch {
			throw new InternalServerErrorException(UPDATE_FAILED)
		}

		const items = await this.loadItems()
		const item = items.find((entry) => entry.id === id) ?? toSettingFormItem(form)

		return { id, message: UPDATE_SUCCESS, item, alphabet: buildAlphabet(items) }
	}

	private async loadItems(): Promise<SettingFormItem[]> {
		const rows = await this.settingForms.find({ order: { id: "ASC" } })
		return rows.map(toSettingFormItem)
	}
}
