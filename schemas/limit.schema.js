import Joi from "joi"

export const limitSchema = Joi.object({
    limit: Joi.number().min(1)
})


