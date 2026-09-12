import { applyDecorators, SetMetadata, Type } from "@nestjs/common"
import { ApiExtraModels, ApiResponse, getSchemaPath } from "@nestjs/swagger"
import { RESPONSE_MESSAGE_KEY } from "./response-message.decorator"

export const ApiResponseWrapped = <TModel extends Type<any>>(options: {
	status: number
	description?: string
	type?: TModel
	isArray?: boolean
	isPaginated?: boolean
	schema?: any
}) => {
	const decorators = []
	let dataSchema: any = { type: "object" }

	if (options.type) {
		decorators.push(ApiExtraModels(options.type))
		dataSchema = options.isArray
			? {
					type: "array",
					items: { $ref: getSchemaPath(options.type) },
			  }
			: {
					$ref: getSchemaPath(options.type),
			  }
	} else if (options.schema) {
		dataSchema = options.schema
	}

	const properties: any = {
		success: { type: "boolean", example: true },
		message: { type: "string", example: options.description || "Operasi berhasil" },
		data: dataSchema,
	}

	if (options.isArray || options.isPaginated) {
		properties.meta = {
			type: "object",
			properties: {
				page: { type: "number", example: 1 },
				limit: { type: "number", example: 10 },
				total: { type: "number", example: 25 },
				totalPages: { type: "number", example: 3 },
			},
			nullable: true,
		}
	}

	const apiResponseOptions: any = {
		status: options.status,
		schema: {
			type: "object",
			properties,
			required: ["success", "message", "data"],
		},
	}

	if (options.description !== undefined) {
		apiResponseOptions.description = options.description
		decorators.push(SetMetadata(RESPONSE_MESSAGE_KEY, options.description))
	}

	decorators.push(ApiResponse(apiResponseOptions))

	return applyDecorators(...decorators)
}
