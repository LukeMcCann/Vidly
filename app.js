'use strict';

require('dotenv').config();

const port = process.env.PORT || 3000;

const fs = require('fs');
const express = require('express');
const Joi = require('joi');
const app = express();

let genres = [];

fs.readFile(`${__dirname}/data/data.json`, (err, data) => {
    if (err) throw err;
    genres = JSON.parse(data);
});

app.use(express.json());

app.get('/', (req, res) => {
    return res.status(200).send('Welcome to Vidly API!');
});

app.get('/api/genres', (req, res) => {
    return res.status(200).send(genres);
});

app.get('/api/genres/:id', (req, res) => {
    const genre = genres.find(g => g.id === parseInt(req.params.id));
    return !genre ? res.status(404).send('404 Not Found!') : res.status(200).send(genre);
});

app.post('/api/genres', (req, res) => {
    const schema = Joi.object({
        name: Joi.string().min(3).required(),
    });

    const result = schema.validate(req.body);


    const genre = {
        id: genres.length+1, 
        name: req.body.name,
    };

    genres.push(genre);
    return res.status(201).send(genre);
});



app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});