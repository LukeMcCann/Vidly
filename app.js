'use strict';

require('dotenv').config();
const startupDebugger = require('debug')('app:startup');
const dbDebugger = require('debug')('app:db');

const port = process.env.PORT || 3000;

const express = require('express');
const app = express();

const logger = require('./logger');
const auth = require('./authenticator');

const config = require('config');
const morgan = require('morgan');
const helmet = require('helmet');
const fs = require('fs');
const Joi = require('joi');

console.log(`NODE_ENV: ${process.env.NODE_ENV}`); // Print NODE_ENV, undefined if not set
console.log(`app: ${app.get('env')}`); // Print NODE_ENV, defaults to development
console.log(`Application Name ${config.get('name')}`);
console.log(`Mail Host ${config.get('mail.host')}`);
console.log(`Mail Password: ${config.get('mail.password')}`);

let genres = [];

fs.readFile(`${__dirname}/data/data.json`, (err, data) => {
    if (err) throw err;
    genres = JSON.parse(data);
});

app.use(express.json()); // add Json middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(helmet()); // Secure HTTP headers

if (app.get('env') === 'development') {
    app.use(morgan('tiny')); // Logger middleware
    startupDebugger('Morgan enabled...');
}

// Connect to DB
 dbDebugger('Connected to the database...');

app.use(auth);
app.use(logger); // add Custom middleware

app.get('/api/genres', (req, res) => {
    return res.status(200).send(genres);
});

app.get('/api/genres/:id', (req, res) => {
    const genre = genres.find(g => g.id === parseInt(req.params.id));
    return !genre ? res.status(404).send('404 Not Found!') : res.status(200).send(genre);
});

app.post('/api/genres', (req, res) => {
    const { error } = validateGenre(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const genre = {
        id: genres.length+1, 
        name: req.body.name,
    }

    genres.push(genre);
    writeGenresToJson(genres);
    
    return res.status(201).send(genre);
});

app.put('/api/genres/:id', (req, res) => {
    const genre = genres.find(g => g.id === parseInt(req.params.id));
    if (!genre) return res.status(404).send('404 Not Found!');

    const { error } = validateGenre(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    genres[req.params.id-1].name = req.body.name;
    writeGenresToJson(genres);

    return res.send(genre);
});

app.delete('/api/genres/:id', (req, res) => {
    const genre = genres.find(g => g.id === parseInt(req.params.id));
    if (!genre) return res.status(404).send('404 Not Found!');

    const index = genres.indexOf(genre);
    genres.splice(index, 1);
    writeGenresToJson(genres);

    return res.status(204).send(genre);
});

function validateGenre(genre) {
    return Joi.object({
        name: Joi.string().min(3).required(),
    }).validate(genre);
}

function writeGenresToJson(genres) {
    fs.writeFile(`${__dirname}/data/data.json`, JSON.stringify(genres), err => {
        if (err) {
            console.error(err);
            return;
        }
    });
}

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});