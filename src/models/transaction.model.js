const mongoose = require('mongoose');

const STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  TIMED_OUT: 'TIMED_OUT',
};

const TransactionSchema = new mongoose.Schema({
  userId : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rawTransaction : {
    type: String,
    required: true,
  },
  gasLimit: {
    type: BigInt,
    required: true,
  },
  gasFees : {
    type: BigInt,
  },
  gasPrice : {
    type: BigInt,
  },
  cumulativeGasUsed: {
    type: BigInt,
  },
  gasUsed : {
    type: BigInt,
  },
  contractAddress : {
    type: String,
    required: true,
  },
  sender : {
    type: String,
  },
  transactionHash : {
    type: String,
  },
  value: {
    type: BigInt,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(STATUS),
    default: STATUS.PENDING,
  },
  attempts : {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction;
