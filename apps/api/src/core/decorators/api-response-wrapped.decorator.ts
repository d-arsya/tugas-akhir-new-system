import { applyDecorators, Type } from "@nestjs/common"
import { ApiExtraModels, ApiResponse, getSchemaPath } from "@nestjs/swagger"

export const ApiResponseWrapped = <TModel extends Type<any>>(options: {
	status: number
	description?: string
	type?: TModel
	isArray?: boolean
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

	const apiResponseOptions: any = {
		status: options.status,
		schema: {
			type: "object",
			properties: {
				success: { type: "boolean", example: true },
				message: { type: "string", example: "OK" },
				data: dataSchema,
			},
			required: ["success", "message", "data"],
		},
	}

	if (options.description !== undefined) {
		apiResponseOptions.description = options.description
	}

	decorators.push(ApiResponse(apiResponseOptions))

	return applyDecorators(...decorators)
}
