const Joi = require('joi')

const auth = {
	body: Joi.object().keys({
		userName: Joi.string().required(),
		password: Joi.string().min(8).required()
	}),
	query: Joi.object().keys({}),
	params: Joi.object().keys({})
}



module.exports = { auth }