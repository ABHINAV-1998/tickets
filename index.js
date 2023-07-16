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


async function init() {
    await connectToMongoDb();
    initializeServer();

}

async function connectToMongoDb() {
    const mongoUrl = 'mongodb+srv://abhinaviitbhilai:tU7x3j7tejBnTyqT@cluster0.etvfl8h.mongodb.net/ticket-booking?retryWrites=true&w=majority';
    try {
        const client = await mongoose.connect(mongoUrl, { 
            useUnifiedTopology: true,
            useNewUrlParser: true
        })
        console.log("connected to db...")
        const data = await trainTicketsModel.find({});

        console.log("-----data---", data);
        if (data && data.length === 0) {
            console.log("------hiii----", ticket)
            try {
                await ticket.createDefault();
            } catch (err) {
                console.log(err)
            }
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