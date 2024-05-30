import Joi from "joi"

export const getFlightsSchema = Joi.object({
    departureStart: Joi.string().isoDate().required(),
    departureEnd: Joi.string().isoDate().required(),
    duration: Joi.number().optional(),
    airline: Joi.string().optional()
})

