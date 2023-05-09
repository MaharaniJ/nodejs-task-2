const express = require('express');
const app = express();
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const dotenv = require('dotenv').config();
const URL = process.env.DB;
const DB = "hallbooking";

app.listen(process.env.PORT || 3000)

//middleware
app.use(express.json());

app.get('/', function (req, res) {
    res.send("Welcome to Hall booking");
})

//get display the rooms
app.get('/rooms', async function (req, res) {
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db(DB)
        let rooms = await db.collection("rooms").find().toArray();
        await connection.close()
        res.json(rooms)
    }
    catch (error) {
        res.status(500).json({ message: "Something Went Wrong" })

    }
})

//get customers
app.get('/customers', async function (req, res) {
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db(DB);
        let customers = await db.collection("customers".find()).toArray()
        await connection.close()
        res.json(customers)
    }
    catch (error) {
        res.status(500).json({ message: "Somthing Went Wrong" })
    }
})

//insert the rooms
app.post('/room', async function (req, res) {
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db(DB);
        await db.collection("rooms").insertOne(req.body);
        await connection.close();
        res.json({ message: "Room Insert" })
    }
    catch (error) {
        res.status(500).json({ message: "Something Went Wrong" })
    }
})

//insert the customers
app.post('/customer', async function (req, res) {
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db(DB);
        await db.collection("customers").insertOne(req.body);
        await connection.close();
        res.json({ message: "Customer Inserted" })
    }
    catch (error) {
        res.status(500).json({ message: "Something Went Wrong" })
    }
})

//post the  booking rooms
app.post('/customerroom', async function (req, res) {
    try {
        const connection = await mongoClient.connect(URL);
        const db = connection.db(DB);
        await db.collection("customerroom").insertOne(req.body);
        await connection.close();
        res.json({ message: "Booked Rooms in Successfully" })
    }
    catch (error) {
        res.status(500).json({ message: "Something Went Wrong" })
    }
})

//find the booked rooms
app.get('/bookedrooms', async function (req, res) {
    try {
        const pipline = [
            {
                '$lookup': {
                    'from': 'rooms',
                    'localField': 'room no',
                    'foreignField': 'room_no',
                    'as': 'rooms'
                }
            },
            {
                '$addFields': {
                    'reservation': {
                        '$cond': [{
                            '$eq': [
                                '$0.customerroom', []
                            ]
                        }, 'Not Booked', 'Booked'
                        ]
                    }
                }
            }
        ]
        const connection = await mongoClient.connect(URL);
        const db = connection.db(DB);
        let bookingrooms = await db.collection("customerroom").aggregate(pipline).toArray();
        await connection.close();
        res.json(bookingrooms)
    } catch (error) {
        res.status(500).json({ message: "Something Went Wrong" })
    }
})
