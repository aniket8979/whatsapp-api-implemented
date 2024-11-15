const app = require('./src/app')

const { baseWebhookURL } = require('./src/config')
require('dotenv').config()
const mongoose = require('mongoose')

// Start the server
const port = process.env.PORT || 3000


// const corsOptions = {
//   origin: '*',
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: '*',
//   credentials: true
// };



mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/wwebjs', {})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));


// Check if BASE_WEBHOOK_URL environment variable is available
if (!baseWebhookURL) {
  console.error('BASE_WEBHOOK_URL environment variable is not available. Exiting...')
  process.exit(1) // Terminate the application with an error code
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
