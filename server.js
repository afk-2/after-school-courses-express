const express = require("express"); //Import express
const app = express(); // Create an express application
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectId;
const path = require("path");
const fs = require("fs");
const cors = require("cors")
const PORT = 3000;

// Logger Middleware
app.use((req, res, next) => {
    console.log("Request method: " + req.method);
    console.log("Request URL: " + req.url);
    console.log("Request date: " + new Date());
    next();
});

// CORS and JSON parsing middleware
app.use(cors())
app.use(express.json());

// Database Connection
let db;

MongoClient.connect("mongodb+srv://abdurahman:afk@cluster0.jlckz.mongodb.net/", (err, client) => {
    if (err) {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1); // Exit the process if the connection fails
    }
    db = client.db("Webstore");
    console.log("Connected to MongoDB!");

    /*  Created text index on 'subject', 'location', 'price', and 'spaces' for full-text search */

    // db.collection("courses").createIndex({ 
    //     subject: "text", 
    //     location: "text", 
    //     price: "text", 
    //     spaces: "text" 
    // });
});

// Search route
app.get("/search", async (req, res) => {
    const query = req.query.q // Get the query from search

    try {
        const results = await db.collection("courses").find({
            $text: {  $search: query  } // Execute the text search
        }).toArray();

        if (results.length === 0) {
            return res.status(404).json({ message: "No matching courses found" });
        }

        res.json(results);
    } catch (error) {
        console.error("Error performing search:", error);
        res.status(500).json({ message: "Error performing search" });
    }
});

// Get the collection name
app.param("collectionName", (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);

    return next();
});

// Retrieving all the courses
app.get("/collection/:collectionName", (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results);
    });
});

// Get course by ID
app.get("/collection/:collectionName/:id", async (req, res, next) => {
    try {
        const result = await req.collection.findOne({ _id: new ObjectID(req.params.id) });
        if (!result) {
            return res.status(404).send({ error: "Document not found" });
        }
        res.send(result);
    } catch (error) {
        next(error); // Pass errors to the error-handling middleware
    }
});

// Update course
app.put("/collection/:collectionName/:id", (req, res, next) => {
    req.collection.updateOne(
        {_id: new ObjectID(req.params.id)},
        {$set: req.body},
        {safe: true, multi: false},
        (error, result) => {
            if (error) return next(error)
                res.send((result.result.n === 1) ? {msg: "success"} : {msg: "error"});
        }
    );
});

// Save order information
app.post("/collection/orders", (req, res, next) => {
    const orderData = req.body; // Access the order information sent from the front-end

    db.collection("orders").insertOne(orderData, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Failed to save order", error: err });
        }
        res.status(201).json({ message: 'Order saved successfully!', order: orderData });
    });
});


// Middleware to serve static files from the 'static' directory
app.use("/static",(req, res, next) => {
    const filePath = path.join(__dirname, "static", req.url);
    fs.stat(filePath, (error, fileInfo) => {
        if (error) {
            next();
            return
        }
        if (fileInfo.isFile()) res.sendFile(filePath);
        else next();
    });
});

// File not found error message
app.use((req, res, next) => {
    res.status(404);
    res.send("File not found!");
});

app.listen(PORT, () => {
    console.log(`Server is running on localhost:${PORT}`);
});

