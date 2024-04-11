const express = require('express')
const route = express.Router()
const dto = require('../dtos/transaction.dto')

const { addTransaction, filterTransactions } = require('../controllers/transaction.controller')
const validate = require('../middlewares/validate.middleware')
const auth = require('../middlewares/auth.middleware')

route.use(auth)
route.post('/addTransaction',validate(dto.transaction), addTransaction)
route.get('/filterTransactions', filterTransactions);


module.exports = route;