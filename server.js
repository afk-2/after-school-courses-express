const express = require("express"); //Import express
const app = express(); // Create an express application
const MongoClient = require("mongodb").MongoClient;
const path = require("path");
const fs = require("fs");
const PORT = 3000;

// Logger Middleware
app.use((req, res, next) => {
    console.log("Request URL: " + req.url);
    console.log("Request date: " + new Date());
    next();
});

// CORS Middleware
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST, PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    next();
});

// Database Connection
let db;

MongoClient.connect("mongodb+srv://abdurahman:afk@cluster0.jlckz.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err, client) => {
    db = client.db("Webstore");
});

// Middleware to serve static files from the 'static' directory
app.use((req, res, next) => {
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

