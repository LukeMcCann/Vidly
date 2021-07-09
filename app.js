'use strict';

require('dotenv').config();

const port = process.env.PORT || 3000;

const fs = require('fs');
const express = require('express');
const app = express();

let genres = {};

fs.readFile(`${__dirname}/data/data.json`, (err, data) => {
    if (err) throw err;
    genres = JSON.parse(data);
});

app.use(express.json());

app.get('/', (req, res) => {
    return res.send('Welcome to Vidly API!');
});

app.get('/api/genres', (req, res) => {
    return res.send(genres);
});

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});