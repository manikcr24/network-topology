const express = require('express')
const router = require('./src/router')

const PORT = process.env.PORT || 80

const app = express()
app.use('/ajira/process', router)

app.get('/', (req, res) => res.sendFile(__dirname+'/src/index.html'))


app.listen(PORT, () => console.log(`server running at ${PORT}`))