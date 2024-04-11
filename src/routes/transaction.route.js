const express = require('express')
const route = express.Router()
const dto = require('../dtos/transaction.dto')

const { addTransaction, filterTransactions, getGasFeesAnalytics, getGasPricesAnalytics, getTransactionValueAnalytics } = require('../controllers/transaction.controller')
const validate = require('../middlewares/validate.middleware')
const auth = require('../middlewares/auth.middleware')

route.use(auth)
route.post('/addTransaction',validate(dto.transaction), addTransaction)
route.get('/filterTransactions', filterTransactions);
route.get('/gasFeesAnalytics', getGasFeesAnalytics);
route.get('/gasPricesAnalytics', getGasPricesAnalytics);
route.get('/transactionValueAnalytics', getTransactionValueAnalytics);

module.exports = route;