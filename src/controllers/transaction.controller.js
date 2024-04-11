const web3 = require('web3');
const transactionModel = require('../models/transaction.model');
const txDecoder = require('ethereum-tx-decoder');
const Redis = require('ioredis')
const WeB3 = new web3.Web3('https://sepolia.infura.io/v3/87cc502142774c14b5744cb8f1d7db98');
var JSONbig = require('json-bigint');

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
        const contractAddress = decoded.to.toString('hex');
        
        const transaction = new transactionModel({
            userId : userId,
            rawTransaction,
            gasLimit: BigInt(decoded.gasLimit),
            contractAddress,
            value: BigInt(decoded.value),
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
                            transaction.gasPrice = result.effectiveGasPrice
                            transaction.cumulativeGasUsed = result.cumulativeGasUsed
                            transaction.gasUsed = result.gasUsed
                            transaction.gasFees = transaction.gasPrice * transaction.gasUsed
                            transaction.transactionHash = result.transactionHash.toString('hex')
                            transaction.sender = result.from.toString('hex');
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
            userId: userId,
        }

        if (sender) query.sender = sender.toString()
        if (value) query.value = BigInt(value);
        if (contractAddress) query.contractAddress = contractAddress.toString();
        if (!sender && !value && !contractAddress){
            return res.status(400).json({ message: 'Please provide a filter' });
        }

        let transactions = await transactionModel.find(query);
        transactions = JSONbig.parse(JSONbig.stringify(transactions));

        return res.status(200).json({transactions});
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: error.message });
    }
}


module.exports = {
    addTransaction,
    filterTransactions
}
    



    

