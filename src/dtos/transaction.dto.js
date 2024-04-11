const joi = require('joi');

const transaction = {
    body: joi.object().keys({
        rawTransactions: joi.array().items(joi.string()).required(),
        numberOfAttempts: joi.number().required(),
        timeout: joi.number().required(),
    }),
    query: joi.object().keys({}),
    params: joi.object().keys({})
}



module.exports = { transaction }