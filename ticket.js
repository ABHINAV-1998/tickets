"use strict";

const {trainTicketsModel, seats} = require('./models/train.model')
const {userModel} = require('./models/user.model')
const { v4: uuidv4 } = require('uuid');
class Tickets {
    constructor() {

    }

    async availableSeats() {
        try {
            const data = await trainTicketsModel.find();
            const obj = data[0];
            return obj;
        } catch(err) {
            console.log(err)
        }
    }

    async bookTicket(req) {
        try {
            const data = await trainTicketsModel.find();
            const seatsData = data[0];
            let emailId = req.emailId;
            let obj = {
                firstName: "Abhinav",
                lastName: "Kumar",
                age: 25,
                userId: uuidv4(),
                phone: 7000408963

            }
            const existingUser = await this.getBookedTicketsByEmail(emailId);
            if(existingUser) {
                // update entry
            } else {
                // create entry
            }
        } catch(err) {
            console.log(err)
        }
    }

    async getBookedTicketsByEmail(emailId) {
        try {
            const data = await userModel.find({emailId: emailId});
            if (data && data.length > 0) {
                return data;
            }
        } catch(err) {
            console.log(err)
        }
    }

    async getAllBookedTickets(req, res) {
        try {
            return await userModel.find();
        } catch(err) {
            console.log(err)
        }
    }

    async deleteAllBookedTickets(req, res) {
        try {
            const data = await userModel.deleteMany({});
            const updatedData = await this.updateTicketModel(req)
            console.log('data delete--', data, updatedData);
        } catch(err) {
            console.log(err)
        }
    }

    async createDefault() {
        const defaultData = await trainTicketsModel.create([{
            totalSeatsInCoach: 80,
            seatsAvailable: 80,
            seatRowWise: seats,
            ticketsBooked: 0,
            status: "AVAILABLE"
        }], {})
        console.log("-----defaultData---", defaultData);
    }
    async updateTicketModel(data) {
        let dataToUpdate = this.createDataToUpdate(data);
        const resp = await trainTicketsModel.findOneAndUpdate({findField: "TICKETS"}, dataToUpdate);
        const defaultData = await trainTicketsModel.create([{
            totalSeatsInCoach: 80,
            seatsAvailable: 80,
            seatRowWise: seats,
            ticketsBooked: 0,
            status: "AVAILABLE",
            findField: "TICKETS"
        }], {})
        console.log("-----defaultData---", defaultData);
    }

    createDataToUpdate(data) {
        const updateData = { $set: {} }
        if (data.seatsAvailable) {
            updateData["$set"]["seatsAvailable"] = data.seatsAvailable;
          }
          if (data.failureCount) {
            updateData["$set"]["ticketsBooked"] = data.ticketsBooked;
          }
          if (data.status) {
            updateData["$set"]["status"] = data.status;
          }
          if (data.seatRowWise) {// update 1 to the corresponding seat
            updateData["$set"]["parentStatus"] = data.seatRowWise;
          }
        return updateData;
    }


}

module.exports.Tickets = Tickets;