const express = require('express');
const morgan = require('morgan');
const app = express();

// Temporary Data for Bonus Task
let movies = [
	{
		Title: 'Planes, Trains & Automobiles',
		Released: '1987',
		Director: 'John Hughes',
		Description: 'A Chicago advertising man must struggle to travel home from New York for Thanksgiving, with a lovable oaf of a shower curtain ring salesman as his only companion.',
		imdbRating: 7.6,
		imgURL: 'https://m.media-amazon.com/images/M/MV5BMjAwMDA2ODAwMV5BMl5BanBnXkFtZTYwMjkyNzE5._V1_.jpg',
		Genre: ['Comedy', 'Drama'],
		Actor: ['John Candy', 'Steve Martin']
	},
	{
		Title: 'Commando',
		Released: '1985',
		Director: 'Mark L Lester',
		Description: 'A retired Special Forces colonel tries to save his daughter, who was abducted by his former subordinate.',
		imdbRating: 6.7,
		imgURL: 'https://m.media-amazon.com/images/M/MV5BZWE0ZjFhYjItMzI5MC00MDllLWE4OGMtMzlhNGQzN2RjN2MwXkEyXkFqcGdeQXVyNDc2NjEyMw@@._V1_.jpg',
		Genre: ['Action', 'Adventure', 'Thriller'],
		Actor: ['Arnold Schwarzenegger', 'Dan Hedaya']
	},
	{
		Title: 'Rambo',
		Released: '1982',
		Director: 'Ted Kotcheff',
		Description: 'A veteran Green Beret is forced by a cruel Sheriff and his deputies to flee into the mountains and wage an escalating one-man war against his pursuers.',
		imdbRating: 7.7,
		imgURL: 'https://m.media-amazon.com/images/M/MV5BODBmOWU2YWMtZGUzZi00YzRhLWJjNDAtYTUwNWVkNDcyZmU5XkEyXkFqcGdeQXVyNDk3NzU2MTQ@._V1_.jpg',
		Genre: ['Action', 'Adventure', 'Thriller'],
		Actor: ['Sylvester Stallone', 'Richard Crenna']
	}
];

// GET REQUESTS

// Morgan logging to Terminal
app.use(morgan('common'));

// Return a json list of all the movies
app.get('/movies', (req, res) => {
	res.json(movies);
});

// Return a specific movie's details list of all the movies
app.get('/movies/info/:movie', (req, res) => {
	res.json(
		movies.find((movie) => {
			return movie.Title === req.params.movie;
		})
	);
});

// Return a directors bio
app.get('/bio/:director', (req, res) => {
	res.send('Return a directors bio');
});

// Return movies of a genre
app.get('/movies/genre/:genre', (req, res) => {
	res.send('Return movies of a genre');
});

// Return movies with an actor
app.get('/movies/actor/:name', (req, res) => {
	res.send('Return movies with an actor');
});

// Return movies with a minimum rating no
app.get('/movies/rating/:rating', (req, res) => {
	res.send('Return movies with a minimum rating number');
});

// Create an account
app.post('/account', (req, res) => {
	res.send('Create an account');
});

// get account details
app.get('/account/:id', (req, res) => {
	res.send('Get account details');
});

// Update Account details
app.put('/account/:id', (req, res) => {
	res.send('Update Account details');
});

// Deregister an account
app.delete('/account/:id', (req, res) => {
	res.send('Deregister an Account');
});

// Add movie to list
app.put('/account/movies/:movie', (req, res) => {
	res.send('Add movie to account list');
});

// Remove movie form account list
app.delete('/account/movies/:movie', (req, res) => {
	res.send('Remove movie form account list');
});

// Serve files from Public Folder
app.use(express.static('public'));

// listen for requests
app.listen(8080, () => {
	console.log('Your app is listening on Port 8080');
});
