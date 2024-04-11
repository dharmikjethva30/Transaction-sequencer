const web3 = require('web3');
const transactionModel = require('../models/transaction.model');
const txDecoder = require('ethereum-tx-decoder');
const Redis = require('ioredis')
const mongoose = require('mongoose');
const WeB3 = new web3.Web3('https://sepolia.infura.io/v3/87cc502142774c14b5744cb8f1d7db98');



const redis = new Redis(process.env.REDIS_URL)

const Timeout = (prom, time) => {
    let timer;
    return Promise.race([
        prom,
        new Promise((_r, rej) => timer = setTimeout(rej, time, new Error('Transaction timed out')))
    ]).finally(() => clearTimeout(timer))
    .catch(error => {
        return error;
    });
}

const addTransaction = async (req, res) => {
    try {
    const { rawTransactions, numberOfAttempts, timeout } = req.body;
    const userId = req.user;

    for (let i = 0; i < rawTransactions.length; i++) {
        const rawTransaction = rawTransactions[i];
        const decoded = txDecoder.decodeTx(rawTransaction);
        const gasLimit = decoded.gasLimit.toNumber();
        const contractAddress = decoded.to.toString('hex');
        const to = decoded.to.toString('hex');
        
        const transaction = new transactionModel({
            userId : userId,
            rawTransaction,
            gasLimit: gasLimit,
            gasFees: decoded.gasPrice.toNumber(),
            contractAddress,
            amount: decoded.value.toNumber(),
            sender: to,
            attempts: 0,
        });
            await transaction.save();
            await addTransactionToQueue( transaction._id, 0, timeout, numberOfAttempts);
            
        }
        processTransaction()
        return res.status(200).json({ message: 'Transactions added successfully' });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: error.message });
        }
}

const addTransactionToQueue = async ( transactionID, attempts, timeout, numberOfAttempts) => {
    const data = {
        transactionId: transactionID,
        attempts,
        timeout,
        numberOfAttempts,
    }
    try {
        await redis.lpush('queue', JSON.stringify(data));
    } catch (error) {
        console.log(error);
    }
}

const processTransaction = async () => {
    try {
        while (true) {
            const data = await redis.rpop('queue');
            
            if (data) {
                const { transactionId, attempts, numberOfAttempts, timeout } = JSON.parse(data);
                const transaction = await transactionModel.findById(transactionId)
                    if (attempts < numberOfAttempts) {
                        let result
                        try {
                            result = await Timeout(WeB3.eth.sendSignedTransaction(transaction.rawTransaction),timeout)

                        } catch (error) {
                            console.log(error);
                            transaction.attempts = attempts + 1;
                            await transaction.save();
                            await addTransactionToQueue(transaction._id, attempts + 1, timeout, numberOfAttempts);
                            continue
                        }
                        console.log(result);
                        if(result.message === 'Transaction timed out'){
                            transaction.status = 'TIMED_OUT';
                            transaction.attempts = attempts + 1;
                            await transaction.save();
                            continue
                        }
                        if (result && result.status) {
                            transaction.attempts = attempts + 1;
                            transaction.status = 'SUCCESS';
                            await transaction.save();
                        } else {
                            transaction.attempts = attempts + 1;
                            await transaction.save();
                            await addTransactionToQueue(transaction._id, attempts + 1, timeout, numberOfAttempts);
                        }
                    }
                     else {
                        transaction.status = 'FAILED';
                        await transaction.save();
                    }
            } else {
                break;
            }
        }
    }catch (error) {
        console.log(error);
    }
}

const filterTransactions = async (req, res) => {
    try {
        const { sender, value, contractAddress } = req.query;
        const userId = req.user;

        const query = {
            userId: userId
        };

        if (sender) query.sender = sender;
        if (value) query.amount = { $gte: parseFloat(value) };
        if (contractAddress) query.contractAddress = contractAddress;

        const transactions = await transactionModel.find(query);

        return res.status(200).json({ transactions });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: error.message });
    }
}


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

const getGasPricesAnalytics = async (req, res) => {
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
                    totalGasLimit: { $sum: '$gasLimit' },
                    avgGasLimit: { $avg: '$gasLimit' },
                    minGasLimit: { $min: '$gasLimit' },
                    maxGasLimit: { $max: '$gasLimit' },
                }
            },
            {
                $project: {
                    _id: 0,
                    totalGasLimit: 1,
                    avgGasLimit: { $round: ['$avgGasLimit', 2] },
                    minGasLimit: 1,
                    maxGasLimit: 1,
                }
            }
        ]);
        console.log(analytics);

        if (analytics.length === 0) {
            return {
                totalGasLimit: 0,
                avgGasLimit: 0,
                minGasLimit: 0,
                maxGasLimit: 0,
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
                $match: { userId: userId, status: 'SUCCESS' }
            },
            {
                $group: {
                    _id: null,
                    totalTransactionValue: { $sum: '$amount' },
                    avgTransactionValue: { $avg: '$amount' },
                    maxTransactionValue: { $max: '$amount' },
                    minTransactionValue: { $min: '$amount' }
                }
            }
        ]);

        return res.status(200).json({ transactionValueData: transactionValueData[0] });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: error.message });
    }
}



module.exports = {
    addTransaction,
    filterTransactions,
    getGasFeesAnalytics,
    getGasPricesAnalytics,
    getTransactionValueAnalytics
}
    



    

