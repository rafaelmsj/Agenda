import 'dotenv/config';
import express from 'express'
const app = express()
import cors from 'cors'
import bodyParser from 'body-parser'
app.use(cors())

import Router from './routes/routes.js'

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

app.use('/', Router)

app.listen(3000, () => {
    console.log('App Online!')
})