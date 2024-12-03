const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectId;
const path = require("path");
const fs = require("fs");
const cors = require("cors")

const app = express();
const PORT = 3000;

app.use(cors()) // Enable cross-origin requests
app.use(express.json()); // Parse incoming JSON requests

// Logger Middleware: Logs HTTP method, URL, and timestamp for each request
app.use((req, res, next) => {
    console.log(`[${new Date()}] ${req.method} ${req.url}`);
    next();
});

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

// Routes 

// Search for courses by query (matches subject or location)
app.get("/search", async (req, res) => {
    const query = req.query.q // Get the query from search

    try {
        const results = await db.collection("courses").find({
            // $text: {  $search: query  } // Execute the text search
            $or: [
                { subject: { $regex: query, $options: "i" } },
                { location: { $regex: query, $options: "i" } }
            ]
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

// Retrieve all documents from a specific collection
app.get("/collection/:collectionName", (req, res, next) => {
    req.collection.find({}).toArray((error, results) => {
        if (error) return next(error) // Pass database errors to error-handling middleware
        res.send(results); // Send the retrieved documents to the client
    });
});

// Retrieve a specific document by ID from a specific collection
app.get("/collection/:collectionName/:id", async (req, res, next) => {
    try {
        const result = await req.collection.findOne({ _id: new ObjectID(req.params.id) });
        if (!result) {
            return res.status(404).send({ error: "Document not found" });
        }
        res.send(result); // Send the retrieved document to the client
    } catch (error) {
        next(error); // Pass errors to the error-handling middleware
    }
});

// Update a document by ID
app.put("/collection/:collectionName/:id", (req, res, next) => {
    const updatedData = req.body; // Get the updated course data from the request body

    if (updatedData.spaces !== undefined) {
        req.collection.updateOne(
            {_id: new ObjectID(req.params.id)},
            {$set: req.body},
            {safe: true, multi: false},
            (error, result) => {
                if (error) return next(error)
                    res.send((result.result.n === 1) ? {msg: "success"} : {msg: "error"});
            }
        );
    }
});

// Save an order
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on localhost:${PORT}`);
});

