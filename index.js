const express = require('express')
const router = require('./src/router')
const logging = require('./src/utils/logging')

const info = logging.info

const PORT = process.env.PORT || 4000

const app = express()
app.use('/ajira/process', router)


app.listen(PORT, () => info(`server running at ${PORT}`))