"use strict";

const { trainTicketsModel, seats } = require('./models/train.model')
const { userModel } = require('./models/user.model')
const { v4: uuidv4 } = require('uuid');
class Tickets {
    constructor() {

    }

    async getCoachData() {
        const data = await trainTicketsModel.find();
        const obj = data[0];
        return obj;
    }

    async availableSeats() {
        try {
            return await this.getCoachData();
        } catch (err) {
            console.log(err)
        }
    }

    async bookTicket(req) {
        try {
            let emailId = req.emailId;
            let obj = {};let exUser = {};
            let tickets = req.tickets;
            const existingUser = await this.getBookedTicketsByEmail(emailId);
            let userBookedSeats = {};
            if (existingUser) {
                exUser = {
                    ticketsBooked: existingUser['ticketsBooked'],
                    ticketsDetails: existingUser['ticketsDetails']
                }
                // obj = existingUser
                userBookedSeats = existingUser['seats']
            } else {
                obj = JSON.parse(JSON.stringify(req));
                delete obj.tickets;
                obj['userId'] = uuidv4()

            }
            console.log("----ushuu--", obj, exUser, userBookedSeats);
            // create entry
            let cData = await this.getCoachData();
            let tempCoachData = {
                seatsAvailable: cData.seatsAvailable,// minus to be booked tickets
                seatRowWise: cData.seatRowWise,
                status: cData.status,// update to full if seats available = 0
                currentRow: cData.currentRow,// update row
                ticketsBooked: cData.ticketsBooked //add to be booked tickets
            }
            if (tickets <= cData.totalSeatsInCoach && cData.seatsAvailable >= tickets) {
                let rowToAdd = -1;

                // 0,2,4,6,8,10      1,3,5,7,9,11
                let filledSeats = 0;
                for (let i = cData.currentRow; i < 12; i++) {
                    if (filledSeats < tickets) {
                        if ((i % 2) === 0) {
                            if (filledSeats < tickets) {
                                let columns = []
                                let lp=7;
                                if(i===11) lp=3
                                for (let j = 0; j < lp; j++) {
                                    if (filledSeats < tickets && tempCoachData.seatRowWise[i][j] === 0) {
                                        tempCoachData.seatRowWise[i][j] = 1
                                        columns.push(j);
                                        filledSeats++
                                    }
                                }
                                userBookedSeats[`Row${i}`] = columns
                                columns = [];
                            }

                        } else {
                            if (filledSeats < tickets) {
                                let revcolumns = [];
                                let sp = 6;
                                if(i===11) sp = 2;
                                for (let j = sp; j >= 0; j--) {
                                    if (filledSeats < tickets && tempCoachData.seatRowWise[i][j] === 0) {
                                        tempCoachData.seatRowWise[i][j] = 1
                                        revcolumns.push(j);
                                        filledSeats++
                                    }
                                }
                                userBookedSeats[`Row${i}`] = revcolumns
                                revcolumns = [];

                            }
                        }
                        rowToAdd++;
                    }
                }


                // update train doc
                tempCoachData['seatsAvailable'] = tempCoachData.seatsAvailable - tickets;
                tempCoachData['ticketsBooked'] = tempCoachData.ticketsBooked + tickets;
                tempCoachData['currentRow'] = this.currRow(tempCoachData['ticketsBooked']);
                // tempCoachData['currentRow'] = tempCoachData.currentRow + rowToAdd;
                if (tempCoachData.seatsAvailable === 0) {
                    tempCoachData['status'] = "FULL"
                }
                console.log("----currentRow----", tempCoachData)
                let mainModelData = this.createDataToUpdate(tempCoachData);
                let userDataUpdate;
                if (existingUser && existingUser._id) {
                    console.log("----eusers----", exUser, userBookedSeats)
                    // update user doc
                    exUser['ticketsBooked'] = exUser['ticketsBooked'] + tickets;
                    let tDetails = {
                        date: new Date(),
                        numberOfTickets: tickets
                    }
                    exUser['ticketsDetails'] = tDetails;
                    exUser['seats'] = userBookedSeats;

                    userDataUpdate = this.createUserDataToUpdate(exUser)
                } else {
                    // create user doc
                    obj['ticketsBooked'] = tickets;
                    let ticketsDetails = [], tDetails = {
                        date: new Date(),
                        numberOfTickets: tickets
                    }
                    ticketsDetails.push(tDetails);
                    obj['ticketsDetails'] = ticketsDetails;
                    obj['seats'] = userBookedSeats;
                }

                console.log("--------------before creation -userDataUpdate----", userDataUpdate, obj);
                if (filledSeats === tickets) {
                    let userDoc, resp;
                    if (existingUser && existingUser._id) {
                        userDoc = await userModel.findOneAndUpdate({ emailId: existingUser.emailId }, userDataUpdate, { new: true });
                    } else {
                        userDoc = await userModel.create([obj], {})
                    }
                    resp = await trainTicketsModel.findOneAndUpdate({ findField: "TICKETS" }, mainModelData, { new: true });
                    if (resp._id) {
                        return {
                            coach: resp,
                            user: userDoc
                        }
                    } else {
                        console.log("------here2 else")
                        return { message: "Some error occured" }
                    }
                } else {
                    console.log("------here1 else")
                    return { message: "Some error occured" }
                }



            }
        } catch (err) {
            console.log(err)
        }
    }

    currRow(data) {
        console.log("----data--", data)
        switch (true) {
            case data < 7:
                return 0
                break
            case data >= 7 && data < 14:
                return 1
                break
            case data >= 14 && data < 21:
                return 2
                break
            case data >= 21 && data < 28:
                return 3
                break
            case data >= 28 && data < 35:
                return 4
                break
            case data >= 35 && data < 42:
                return 5
                break
            case data >= 42 && data < 49:
                return 6
                break
            case data >= 49 && data < 56:
                return 7
                break
            case data >= 56 && data < 63:
                return 8
                break
            case data >= 63 && data < 70:
                return 9
                break
            case data >= 70 && data < 77:
                return 10
                break
            case data >= 77 && data < 81:
                return 11
                break
            default:
                return -1
        }
    }

    async getBookedTicketsByEmail(emailId) {
        try {

            const data = await userModel.find({ emailId: emailId });
            console.log("------dfg---", emailId, data);
            if (data && data.length > 0) {
                return data[0];
            }
        } catch (err) {
            console.log(err)
        }
    }

    async getAllBookedTickets(req, res) {
        try {
            return await userModel.find();
        } catch (err) {
            console.log(err)
        }
    }

    async deleteAllBookedTickets(req, res) {
        try {
            const data = await userModel.deleteMany({});
            const updatedData = await this.updateTicketModel(req)
            console.log('data delete--', data, updatedData);
        } catch (err) {
            console.log(err)
        }
    }

    async createDefault() {
        const docCount = await trainTicketsModel.countDocuments();
        console.log('count--', docCount);
        if (docCount === 0) {
            const defaultData = await trainTicketsModel.create([{
                totalSeatsInCoach: 80,
                seatsAvailable: 80,
                seatRowWise: seats,
                ticketsBooked: 0,
                status: "AVAILABLE"
            }], {})
            console.log("-----defaultData---", defaultData);
        }
    }
    async updateTicketModel(data) {
        let dataToUpdate = this.createDataToUpdate(data);
        const resp = await trainTicketsModel.findOneAndUpdate({ findField: "TICKETS" }, dataToUpdate);
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
        if (data.ticketsBooked) {
            updateData["$set"]["ticketsBooked"] = data.ticketsBooked;
        }
        if (data.status) {
            updateData["$set"]["status"] = data.status;
        }
        if (data.seatRowWise) {// update 1 to the corresponding seat
            updateData["$set"]["seatRowWise"] = data.seatRowWise;
        }
        if (data.currentRow) {
            updateData["$set"]["currentRow"] = data.currentRow;
        }
        return updateData;
    }

    createUserDataToUpdate(data) {
        const updateData = { $set: {}, $push: {} }
        if (data.ticketsBooked) {
            updateData["$set"]["ticketsBooked"] = data.ticketsBooked;
        }
        if (data.seats) {
            updateData["$set"]["seats"] = data.seats;
        }
        if (data.ticketsDetails) {
            updateData["$push"]["ticketsDetails"] = data.ticketsDetails;
        }

        return updateData;
    }


}

module.exports.Tickets = Tickets;