const express = require('express')
const cors=require("cors")


const app = express()
const port = 5000
app.use(cors({
  origin:"*",
}))
app.use(express.json())

app.use('/api/amazn',require('./routes/amazn'))






app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
