const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const https = require('https');
const { xss } = require('express-xss-sanitizer')
const client = require('prom-client')

require('dotenv').config();

const sanitizer = require('./middlewares/sanitizer.middleware');
const userRoutes = require('./routes/user.route');
const transactionRoutes = require('./routes/transaction.route');

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const counter = new client.Counter({
  name: 'my_counter',
  help: 'Example of a counter',
});

const histogram = new client.Histogram({
  name: 'my_histogram',
  help: 'Example of a histogram',
  labelNames: ['code'],
  buckets: [0.1, 5, 15, 50, 100, 500],
});

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss())
app.use(sanitizer);

const connect = () => {
  mongoose.connect(process.env.MONGO_URL)
      .then(() => console.log('Connected to MongoDB'))
      .catch((err) => console.log(err))
}
app.use('/user', userRoutes);
app.use('/transaction', transactionRoutes);


app.get('/', (req, res)=> 
  res.send({ message: 'Hello' })
)

app.get('/metrics', (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(client.register.metrics());
})

app.use((req, res)=> 
  res.send({ message: 'Requested endpoint not found' })
)

const httpsOptions = {
  key: fs.readFileSync('./keys/server.key'),
  cert: fs.readFileSync('./keys/server.crt'),
};

https.createServer(httpsOptions, app).listen(PORT, async() => {
  await connect();
  console.log(`Server is running on port ${PORT}`);
});
