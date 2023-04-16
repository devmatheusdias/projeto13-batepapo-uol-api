import Joi from "joi"

export const nameSchema = Joi.object({
    name: Joi.string().required() /*name deve ser string não vazia (caso algum erro seja encontrado, retornar status 422).*/
})
