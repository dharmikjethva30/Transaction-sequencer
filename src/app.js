const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const https = require('https');
const { xss } = require('express-xss-sanitizer')
const client = require('prom-client')
const morgan = require('morgan')

require('dotenv').config();

const sanitizer = require('./middlewares/sanitizer.middleware');
const userRoutes = require('./routes/user.route');
const transactionRoutes = require('./routes/transaction.route');
const analyticsRoute = require('./routes/analytics.route');

const app = express();
const PORT = 3000;

const register = new client.Registry();

client.collectDefaultMetrics({
    app: 'Transaction-Proccesing-app',
    prefix: 'node_',
    timeout: 10000,
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    register
});

// To store Logs
// const fs = require('fs')
// let accessLogStream = fs.createWriteStream('./access.log', { flags: 'a' })
// app.use(morgan("combined", { stream: accessLogStream }))


app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss())
app.use(sanitizer);
app.use(morgan("combined"))

const connect = () => {
  mongoose.connect(process.env.MONGO_URL)
      .then(() => console.log('Connected to MongoDB'))
      .catch((err) => console.log(err))
}
app.use('/user', userRoutes);
app.use('/transaction', transactionRoutes);
app.use('/analytics', analyticsRoute);



app.get('/', (req, res)=> 
  res.send({ message: 'Hello' })
)

app.get('/metrics', async(req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
})

app.use((req, res)=> 
  res.status(404).send({ message: 'Requested endpoint not found' })
)

const httpsOptions = {
  key: fs.readFileSync('./keys/server.key'),
  cert: fs.readFileSync('./keys/server.crt'),
};

https.createServer(httpsOptions, app).listen(PORT, async() => {
  connect();
  console.log(`Server is running on port ${PORT}`);
});
