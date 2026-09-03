import {
	BeforeInsert,
	BeforeUpdate,
	CreateDateColumn,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm"

export abstract class BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@CreateDateColumn({ name: "created_at", default: () => "CURRENT_TIMESTAMP" })
	createdAt: Date

	@UpdateDateColumn({ name: "updated_at", default: () => "CURRENT_TIMESTAMP" })
	updatedAt: Date

	@BeforeInsert()
	setCreatedAt() {
		const now = new Date()
		if (!this.createdAt) {
			this.createdAt = now
		}
		if (!this.updatedAt) {
			this.updatedAt = now
		}
	}

	@BeforeUpdate()
	setUpdatedAt() {
		this.updatedAt = new Date()
	}
}
