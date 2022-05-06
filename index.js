const express = require('express');
const bodyParser = require('body-parser');

const morgan = require('morgan');
const app = express();

// Mongoose Imports to set-up schemas and query db
const mongoose = require('mongoose');
const Models = require('./models');
const Movies = Models.Movie;
const User = Models.User;
mongoose.connect('mongodb://localhost:27017/moviedb', { useNewUrlParser: true, useUnifiedTopology: true });

// GET REQUESTS

// Morgan logging to Terminal
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Return a json list of all the movies
app.get('/movies', (req, res) => {
	Movies.find()
		.then((movies) => {
			res.status(201).json(movies);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send(`Error: ${err}`);
		});
});

// Return a specific movie's details list of all the movies
app.get('/movies/info/:movie', (req, res) => {
	Movies.findOne({ Title: req.params.movie })
		.then((movie) => {
			res.status(201).json(movie);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send(`Error: ${err}`);
		});
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

/*  Create an account 
Expecting JSON format like below 
{
    "Username" : "username",
    "Email" : "useremail@email.com",
    "Password" : "password2022",
    "Birthday" : "2000-01-01T00:00:00Z"
}
*/

app.post('/account', (req, res) => {
	User.findOne({ Username: req.body.Username })
		.then((user) => {
			if (user) {
				return res.status(400).send(`${req.body.Username} already exists`);
			} else {
				User.create({
					Username: req.body.Username,
					Email: req.body.Email,
					Password: req.body.Password,
					Birthday: req.body.Birthday,
					FaveMovies: []
				})
					.then((user) => {
						res.status(201).json(user);
					})
					.catch((err) => {
						console.error(err);
						res.status(500).send(`Error: ${err}`);
					});
			}
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send(`Error: ${err}`);
		});
});

// get account details
app.get('/account/:username', (req, res) => {
	//res.send('Get account details');
	User.findOne({ Username: req.params.username })
		.then((user) => {
			res.status(201).json(user);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send(`Error: ${err}`);
		});
});

// Update Account details
app.put('/account/:username', (req, res) => {
	User.findOneAndUpdate(
		{ Username: req.params.username },
		{
			$set: {
				Username: req.body.Username,
				Email: req.body.Email,
				Password: req.body.Password,
				Birthday: req.body.Birthday
			}
		},
		{ new: true },
		(err, updatedUser) => {
			if (err) {
				console.error(err);
				res.status(500).send(`Error: ${err}`);
			} else {
				res.status(201).json(updatedUser);
			}
		}
	);
});

// Deregister an account
app.delete('/account/:username', (req, res) => {
	User.findOneAndRemove({ Username: req.params.username })
		.then((user) => {
			if (!user) {
				res.status(400).send(`${req.params.username} could not be found`);
			} else {
				res.status(200).send(`${req.params.username} was deregistered`);
			}
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send(`Error: ${err}`);
		});
});

// Add movie to list
app.put('/account/movies/:movie', (req, res) => {
	res.send('Add movie to account list');
});

// Remove movie form account list
app.delete('/account/movies/:movie', (req, res) => {
	res.send('Remove movie from account list');
});

// Serve files from Public Folder
app.use(express.static('public'));

// listen for requests
app.listen(8080, () => {
	console.log('Your app is listening on Port 8080');
});
