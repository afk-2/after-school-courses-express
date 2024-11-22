const express = require("express"); //Import express
const app = express(); // Create an express application
const path = require("path");
const fs = require("fs");
const PORT = 3000;

// Logger Middleware
app.use((req, res, next) => {
    console.log("Request URL: " + req.url);
    console.log("Request date: " + new Date());
    next();
});

// Static files
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

