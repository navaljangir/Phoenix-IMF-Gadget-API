import express from 'express'
import v1Router from './src/routes/v1'
import { config } from 'dotenv'
config()

const app = express()
app.use(express.json())

app.use('/api/v1' , v1Router )

app.use((req, res, next) => {
    res.status(404).json({ message: 'Don\'t act smart. Why don\'t you listen to your legend boss, Go check out the docs'});
});

app.get('/' , (req, res)=>{
    res.status(200).json({
        message : 'Hi agent, i told you, you will need me one day, Aaah here you go, you are at the right place. Here you can manage your gadget.You might be smart enough to find out how it will work but it\'s better to use docs',
        docs: ''
    })
})

app.listen(3000 , ()=>{
    console.log(`Server running at http://localhost:3000`)
})