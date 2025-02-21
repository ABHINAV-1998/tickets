"use strict";
const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const users = require('./models/user.model')
const {trainTicketsModel, seats} = require('./models/train.model')
const {Tickets} = require('./ticket');
const ticket = new Tickets()
const router = require('./routes')
const app = express();
const PORT = 3000;
require('dotenv').config();
const mongoUrl = "mongodb+srv://mongouser:password.mongodb.net/ticket-booking?retryWrites=true&w=majority";
// const mongoUrl = process.env.LOCAL;

async function init() {
    await connectToMongoDb();
    initializeServer();

}

async function connectToMongoDb() {
    try {
        await mongoose.connect(mongoUrl, { 
            useUnifiedTopology: true,
            useNewUrlParser: true
        })
        console.log("connected to db...")
        try {
            await ticket.createDefault();
        } catch (err) {
            console.log(err)
        }
    } catch (err) {
        console.log("mongo not connected")
        console.log(err)
        process.exit()
    }
}

async function initializeServer() {

    app.use(bodyParser.json())

    app.use('/api',router);

    app.get('/healthcheck', (req, res) => {
        res.send('Service is running')
    })

    app.listen(PORT, function (err) {
        if (err) console.log(err);
        console.log("Server listening on PORT", PORT);
    });

}
init();
