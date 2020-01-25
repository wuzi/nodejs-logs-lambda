import Joi from '@hapi/joi'

const Log = Joi.object({
  origin: Joi.string().required(),
  type: Joi.string().required(),
  message: Joi.string().required(),
  params: Joi.object()
})

export default Log
