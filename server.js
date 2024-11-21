const express = require("express"); //Import express
const app = express(); // Create an express application
const PORT = 3000;

app.get('/', (req, res) => {
    res.send("Hello world");
});

app.listen(PORT, () => {
    console.log(`Server is running on localhost:${PORT}`);
});

