"use strict";

const mongoose = require('mongoose')
const uuidv4 = require('uuid').v4();
const Schema = mongoose.Schema;

const array = []
for(let i=0;i<12;i++) {
    let arr;
    if(i=== 11) {
        arr = new Array(3).fill(0);
    } else {
        arr = new Array(7).fill(0);
    }
    array.push(arr);
}

const trainTicketsModel = new Schema({
    totalSeatsInCoach: { type: Number, default:80 },
    seatsAvailable: {type: Number, default: 80},
    seatRowWise: {type: Array, default: array },
    ticketsBooked: {type: Number, default: 0},
    status: {type:String, default: "AVAILABLE"},//available, full
    findField: {type:String, default: "TICKETS"},// change to coach: SLEEPER
    currentRow: {type: Number, default: 0}
  }, { timestamps: true, versionKey: false });

module.exports = {
    trainTicketsModel: mongoose.model(
        "trainTickets",
        trainTicketsModel
    ),
    seats: array
};
