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
  gasFees : {
    type: Number,
    required: true,
  },
  gasLimit : {
    type: Number,
    required: true,
  },
  contractAddress : {
    type: String,
    required: true,
  },
  sender : {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
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
