const transactionModel = require('../models/transaction.model');
const mongoose = require('mongoose');

const getGasFeesAnalytics = async (req, res) => {
    try {
        const userId = req.user;
        const analytics = await transactionModel.aggregate([
            { 
                $match: { 
                    userId :  new mongoose.Types.ObjectId(userId)
                } 
            },
            {
                $group: {
                    _id: null,
                    totalGasFees: { $sum: '$gasFees' },
                    avgGasFees: { $avg: '$gasFees' },
                    minGasFees: { $min: '$gasFees' },
                    maxGasFees: { $max: '$gasFees' },
                }
            },
            {
                $project: {
                    _id: 0,
                    totalGasFees: 1,
                    avgGasFees: { $round: ['$avgGasFees', 2] },
                    minGasFees: 1,
                    maxGasFees: 1,
                }
            }
        ]);

        if (analytics.length === 0) {
            return {
                totalGasFees: 0,
                avgGasFees: 0,
                minGasFees: 0,
                maxGasFees: 0,
            };
        }

        return res.status(200).json({ gasFeesData: analytics[0] });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: error.message });
    }
}

const getGasPriceAnalytics = async (req, res) => {
    try {
        const userId = req.user;

        const analytics = await transactionModel.aggregate([
            { 
                $match: { 
                    userId :  new mongoose.Types.ObjectId(userId) } 
            },
            {
                $group: {
                    _id: null,
                    totalGasPrice: { $sum: '$gasPrice' },
                    avgGasPrice: { $avg: '$gasPrice' },
                    minGasPrice: { $min: '$gasPrice' },
                    maxGasPrice: { $max: '$gasPrice' },
                }
            },
            {
                $project: {
                    _id: 0,
                    totalGasPrice: 1,
                    avgGasPrice: { $round: ['$avgGasPrice', 2] },
                    minGasPrice: 1,
                    maxGasPrice: 1,
                }
            }
        ]);

        if (analytics.length === 0) {
            return {
                totalGasPrice: 0,
                avgGasPrice: 0,
                minGasPrice: 0,
                maxGasPrice: 0,
            };
        }

        return res.status(200).json({ gasPricesData: analytics[0] });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: error.message });
    }
}

const getTransactionValueAnalytics = async (req, res) => {
    try {
        const userId = req.user;

        const transactionValueData = await transactionModel.aggregate([
            {
                $match: { 
                    userId: new mongoose.Types.ObjectId(userId), 
                    status: 'SUCCESS' 
                }
            },
            {
                $group: {
                    _id: null,
                    totalTransactionValue: { $sum: '$value' },
                    avgTransactionValue: { $avg: '$value' },
                    maxTransactionValue: { $max: '$value' },
                    minTransactionValue: { $min: '$value' }
                }
            }
        ]);

        return res.status(200).json({ transactionValueData: transactionValueData[0] });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: error.message });
    }
}

const getTransactionStatusAnalytics = async (req, res) => {
    try {
        const userId = req.user;

        const analytics = await transactionModel.aggregate([
            { 
                $match: { 
                    userId :  new mongoose.Types.ObjectId(userId) } 
            },
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
          ]);
          console.log(analytics);
        

        return res.status(200).json({ analytics : analytics });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: error.message });
    }
}

module.exports = { 
    getGasFeesAnalytics, 
    getGasPriceAnalytics, 
    getTransactionValueAnalytics, 
    getTransactionStatusAnalytics 
}