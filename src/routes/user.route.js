const express = require('express')
const route = express.Router()
const dto = require('../dtos/user.dto')

const { signup, getKey } = require('../controllers/user.controller')
const validate = require('../middlewares/validate.middleware')
const auth = require('../middlewares/auth.middleware')

route.post('/signup',validate(dto.auth), signup)
route.post('/getKey',validate(dto.auth), getKey)

module.exports = route