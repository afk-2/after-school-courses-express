const express = require("express"); //Import express
const app = express(); // Create an express application
const PORT = 3000;

// Logger Middleware
app.use((req, res, next) => {
    console.log("Request URL: " + req.url);
    console.log("Request date: " + new Date());
    next();
});

app.listen(PORT, () => {
    console.log(`Server is running on localhost:${PORT}`);
});

