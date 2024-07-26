# Transaction-sequencer

## Documentation of APIs

[Documentation](https://documenter.getpostman.com/view/26216494/2sA3BhduRL)

## Contents

[Project Description](#project-description)

[Database schema for Transactions](#database-schema-for-transactions)

[Deployment Architecture](#deployment-architecture)

[To run Locally](#to-run-locally)

## Project Description

### Overview
This project provides a robust and scalable solution for processing raw blockchain transactions on the Ethereum Sepolia testnet. It goes beyond basic processing by offering insightful analytics to empower users with a comprehensive understanding of their transactions.

### **Key Features**

#### **Raw Transaction Processing**
Efficiently handle raw blockchain transactions, enabling seamless interaction with the Sepolia testnet.

#### **Advanced Analytics**
Extract valuable insights from processed transactions using a variety of filters, including:

- **Transaction Sender**: Identify the originating address for each transaction.
- **Transaction Value**: Gain clarity on the amount of Ether (ETH) transferred.
- **Contract Interacted With**: Determine if the transaction interacted with a smart contract, and if so, its address.
- **Transaction Status**: Track the current state of the transaction (e.g., pending, successful, failed).
- **Gas Fees**: Analyze the total cost incurred for transaction execution.
- **Gas Price**: Understand the price paid per unit of gas used in the transaction.

#### **Scalable Storage**
Leverage MongoDB's schema-based approach (provided) to store processed transactions in a highly scalable manner. This schema ensures efficient data retrieval and filtering based on desired criteria.

## Database schema for Transactions

The project leverages Mongoose, a popular Object Document Mapper (ODM) for MongoDB, to define a comprehensive schema for storing transaction data. This schema outlines the following properties for each transaction:

- **userId**: 
  - **Required**: A reference to the user who initiated the transaction (assuming a user management system is in place).
  
- **rawTransaction**: 
  - **Required**: The raw transaction data in its original format.
  
- **gasLimit**: 
  - **Required**: The maximum amount of gas allowed for transaction execution (stored as a BigInt for large numbers).
  
- **gasFees**: 
  - The total gas cost incurred for the transaction (BigInt).
  
- **gasPrice**: 
  - The price paid per unit of gas used (BigInt).
  
- **cumulativeGasUsed**: 
  - The total gas used by the transaction on the blockchain (BigInt).
  
- **gasUsed**: 
  - The gas actually consumed during transaction execution (BigInt).
  
- **contractAddress**: 
  - The address of the smart contract interacted with (if applicable).
  
- **sender**: 
  - The address of the transaction originator.
  
- **transactionHash**: 
  - A unique identifier for the transaction on the blockchain.
  
- **value**: 
  - **Required**: The amount of ETH transferred in the transaction (BigInt).
  
- **status**: 
  - The current transaction status (e.g., "PENDING", "SUCCESS", "FAILED", "TIMED_OUT").
  
- **attempts**: 
  - The number of times the transaction has been attempted (default: 0).


## Deployment Architecture

This project is deployed on an Oracle Cloud Compute Instance running Ubuntu. The architecture utilizes a combination of containerization and a reverse proxy for secure access.

**Components:**

* **OS:** Ubuntu
* **Containerization:** Docker
* **App Server:** Docker container hosting the application code
* **Reverse Proxy:** Nginx
* **TLS Termination:** Nginx
* **SSL Certificate:** Let's Encrypt certificate obtained using Certbot

**Deployment Details:**

1. The application server runs within a Docker container (isolation & portability).
2. Nginx is installed and configured on the same compute instance.
3. Nginx acts as a reverse proxy, routing traffic to the app server container.
4. TLS termination is handled by Nginx, offloading encryption/decryption tasks.
5. An SSL certificate obtained from Let's Encrypt using Certbot is installed on Nginx (enables HTTPS).

This configuration provides a secure and scalable deployment architecture for the project.


## To run Locally

To Run this project with the docker image

```bash
  docker pull dharmikjethva/lyncassgn
```

```bash
  docker run dharmikjethva/lyncassgn
```
To deploy by cloning git repository

```bash
  git clone https://github.com/dharmikjethva30/LYNC-Backend-Developer-Task.git
```
```bash
  npm i
```
Then create .env in root directory which should look like in the below format

```bash
MONGO_URL=<YOUR_URL_GOES_HERE>
REDIS_URL=<YOUR_URL_GOES_HERE>
JWT_SECRET=<YOUR_SECRET_GOES_HERE>
INFURA_API_KEY=<YOUR_API_KEY_GOES_HERE>
```

then

```bash
  node src/app.js
```


