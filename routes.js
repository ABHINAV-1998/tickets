"use strict";
const express = require('express');
const router = express.Router();
const {Tickets} = require('./ticket');

const ticket = new Tickets()

router.get('/available-seats', async function(req, res) {
        let resp = await ticket.availableSeats();
        console.log("----here---", resp);
        res.send(`Available seats is ${JSON.stringify(resp)}`)
});

router.post('/book-ticket', async function (req, res) {
    console.log("----here---")
    const resp = await ticket.bookTicket(req)
});

router.get('/users-booked-ticket/:emailId', async function(req, res) {
    console.log("----here---")
    let emailId = req.params.emailId;
    let resp = await ticket.getBookedTicketsByEmail(emailId);
    res.send(`Available seats is ${resp}`)
});

router.get('/all-booked-ticket-details/', async function(req, res) {
    console.log("----here---")
    let emailId = req.params.emailId;
    let resp = await ticket.getAllBookedTickets();
    res.send(`Available seats is ${resp}`)
});

// this should delete all data in users collection and restore default in traintickets model
router.get('/delete-all-booked-tickets/', async function(req, res) {
    console.log("----here---")
    let emailId = req.params.emailId;
    let resp = await ticket.deleteAllBookedTickets();
    res.send(`Deleted all booked seats`)
});






module.exports = router;