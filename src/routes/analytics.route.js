const express = require('express')
const route = express.Router()

const { getGasFeesAnalytics, getGasPriceAnalytics, getTransactionValueAnalytics, getTransactionStatusAnalytics } = require('../controllers/analytics.controller')
const auth = require('../middlewares/auth.middleware')

route.use(auth)
route.get('/gasFees', getGasFeesAnalytics);
route.get('/gasLimit', getGasPriceAnalytics);
route.get('/transactionValue', getTransactionValueAnalytics);
route.get('/transactionStatus', getTransactionStatusAnalytics);

module.exports = route;