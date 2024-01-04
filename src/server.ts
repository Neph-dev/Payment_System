import express from 'express'
import bodyParser from 'body-parser'
import router from './routes'
import schedule from 'node-schedule'
import { schedulePayment } from './helpers/schedulePayment'

const cors = require('cors')

require('dotenv').config()

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 204
}

schedule.scheduleJob('59 23 * * *', schedulePayment)

const app = express()
const PORT = 3001

app.use(bodyParser.json())
app.use(cors(corsOptions))
app.use("/v1/", router)

app.get('/', async (_, res) => {
    res.status(200).send({ status: 200 })
})

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`)
})
