const express = require('express');
const morgan = require('morgan');
const app = express();

// GET REQUESTS

// Morgan logging
app.use(morgan('common'));

// Default Response
app.get('/', (req, res) => {
	res.send('80s Movie App');
});

// Return JSON Object of movies
app.get('/movies', (req, res) => {
	res.json({
		'Fave 80s Movies': ['Bull Durham', 'The Breakfast Club', 'Sixteen Candles', 'Planes, Trains & Automobiles', 'Weird Science', "National Lampoon's Vacation", 'Pretty in Pink', 'Commando', 'Twins', 'Karate Kid']
	});
});

// Serve files from Public Folder
app.use(express.static('public'));

// listen for requests
app.listen(8080, () => {
	console.log('Your app is listening');
});
