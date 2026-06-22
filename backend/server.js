const express = require('express');
require('dotenv').config();

const db = require('./src/config/db');
const app = express();

app.get('/', (req, res) => {
    res.send('Intelligent Exam Seating Arrangement System API!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


