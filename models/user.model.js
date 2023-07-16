"use strict";

const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid');
const Schema = mongoose.Schema;

const subSchema = new mongoose.Schema({
    date: Date,
    numberOfTickets: Number
});

const userModel = new Schema({
    userId: { type: String, index: true, default: uuidv4(),unique: true  },
    firstName: { type: "string", required: true },
    lastName: { type: "string", required: true },
    emailId: { type: "string", required: true, unique: true, index: true },
    phone: { type: Number, required: false },
    age: {type: Number},
    ticketsBooked: {type: Number},
    ticketsDetails: [subSchema],
    status: {type:String}
  }, { timestamps: true, versionKey: false });

module.exports = {
    userModel : mongoose.model(
  "users",
  userModel
)};
