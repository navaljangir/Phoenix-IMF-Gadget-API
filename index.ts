import express from 'express'
import v1Router from './src/routes/v1'
import { config } from 'dotenv'
config()

const app = express()
app.use(express.json())

app.use('/api/v1' , v1Router )

app.listen(3000 , ()=>{
    console.log(`Server running at http://localhost:3000`)
})