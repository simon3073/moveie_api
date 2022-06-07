const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
const { check, validationResult } = require('express-validator');
require('./passport');

// Mongoose Imports to set-up schemas and query db
const mongoose = require('mongoose');
const Models = require('./models');
const Movies = Models.Movie;
const User = Models.User;
const Director = Models.Director;
const Actor = Models.Actor;
const Genre = Models.Genre;

// for localhost
//mongoose.connect('mongodb://localhost:27017/moviedb', { useNewUrlParser: true, useUnifiedTopology: true });
// for MongoDB Cloud Deployment
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Function using RegExp to capitalise all search requests for Names and Movies
const capitaliseTerm = (term) => {
	return term.replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
};

// Morgan logging to Terminal
const accessLog = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });
app.use(morgan('common'));
app.use(morgan('combined', { stream: accessLog }));

// to parse body to JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Passport set up
const auth = require('./auth')(app); // (app) added to pass Express to auth.js
const passport = require('passport');

// Import Authorisation & cors
// const allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:1234', 'https://simon3073.github.io/'];
// app.use(
// 	cors({
// 		origin: (origin, callback) => {
// 			if (!origin) return callback(null, true);
// 			if (allowedOrigins.indexOf(origin) === -1) {
// 				// If a specific origin isn’t found on the list of allowed origins
// 				let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
// 				return callback(new Error(message), false);
// 			}
// 			return callback(null, true);
// 		}
// 	})
// );

app.use(cors({ origin: '*' }));

// Return a json list of all the movies
app.get('/movies', async (req, res) => {
	//app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const movies = await Movies.find().populate('Genre').populate('Actor').populate('Director').exec();
		res.status(201).json(movies);
	} catch (error) {
		console.error(error);
		res.status(500).send(`Error: ${error}`);
	}
});

// Return a specific movie's details
app.get('/movies/info/:movie', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const capitalisedSearchTerm = capitaliseTerm(req.params.movie);
		const movie = await Movies.findOne({ Title: capitalisedSearchTerm }).populate('Genre').populate('Actor').populate('Director').exec();
		res.status(201).json(movie);
	} catch (error) {
		console.error(error);
		res.status(500).send(`Error: ${error}`);
	}
});

// Return a directors bio
app.get('/movies/director/:name', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const capitalisedSearchTerm = capitaliseTerm(req.params.name);
		const director = await Director.findOne({ Name: capitalisedSearchTerm }).populate('MoviesDirected').exec();
		res.status(201).json(director);
	} catch (error) {
		console.error(error);
		res.status(500).send(`Error: ${error}`);
	}
});

// Return movies of a genre
app.get('/movies/genre/:genre', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const capitalisedSearchTerm = capitaliseTerm(req.params.genre);
		const genre = await Genre.findOne({ Genre: capitalisedSearchTerm }).exec();
		const movies = await Movies.find({ Genre: genre._id }).populate('Genre').populate('Actor').populate('Director').exec();
		if (movies.length === 0) {
			res.status(204).send(`There were no movies in the genre of ${capitalisedSearchTerm}`);
		} else {
			res.status(201).json(movies);
		}
	} catch (error) {
		console.error(error);
		res.status(500).send(`Error: ${error}`);
	}
});

// Return an actor bio
app.get('/movies/actor/:name', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const capitalisedSearchTerm = capitaliseTerm(req.params.name);
		const actor = await Actor.findOne({ Name: capitalisedSearchTerm }).populate('Movies').exec();
		res.status(201).json(actor);
	} catch (error) {
		console.error(error);
		res.status(500).send(`Error: ${error}`);
	}
});

// Return movies with a minimum rating no
app.get('/movies/rating/:rating', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const movies = await Movies.find({ imdbRating: { $gte: req.params.rating } })
			.populate('Genre')
			.populate('Actor')
			.populate('Director')
			.exec();
		if (movies.length === 0) {
			res.status(204).send(`There were no movies with a IMDB rating of ${req.params.rating} or above`);
		} else {
			res.status(201).json(movies);
		}
	} catch (error) {
		console.error(error);
		res.status(500).send(`Error: ${error}`);
	}
});

//  Create an account
app.post('/register', [check('Username', 'Username is required').isLength({ min: 4 }), check('Username', 'Username contains non alphanumeric chars - not allowed').isAlphanumeric(), check('Password', 'Password is required').not().isEmpty(), check('Email', 'Email does not appear to be valid').isEmail()], async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}
		const hashedPassword = User.hashPassword(req.body.Password);
		const user = await User.findOne({ Username: req.body.Username }).exec();
		if (user) {
			return res.status(400).send(`${req.body.Username} already exists`);
		} else {
			const newUser = await User.create({
				Username: req.body.Username,
				Email: req.body.Email,
				Password: hashedPassword,
				Birthday: req.body.Birthday,
				FavouriteMovies: []
			});
			res.status(201).json(newUser);
		}
	} catch (error) {
		console.error(error);
		res.status(500).send(`Error: ${error}`);
	}
});

// get account details
app.get('/account/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const user = await User.findOne({ Username: req.params.username }).populate('FavouriteMovies').exec();
		res.status(201).json(user);
	} catch (error) {
		console.error(error);
		res.status(500).send(`Error: ${error}`);
	}
});

// Update Account details
app.put('/account/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
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

// Delete an account
app.delete('/account/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const user = await User.findOneAndRemove({ Username: req.params.username });
		if (!user) {
			res.status(400).send(`${req.params.username} could not be found`);
		} else {
			res.status(200).send(`${req.params.username} was deregistered`);
		}
	} catch (error) {
		console.error(error);
		res.status(500).send(`Error: ${error}`);
	}

	// User.findOneAndRemove({ Username: req.params.username })
	// 	.then((user) => {
	// 		if (!user) {
	// 			res.status(400).send(`${req.params.username} could not be found`);
	// 		} else {
	// 			res.status(200).send(`${req.params.username} was deregistered`);
	// 		}
	// 	})
	// 	.catch((err) => {
	// 		console.error(err);
	// 		res.status(500).send(`Error: ${err}`);
	// 	});
});

// Add movie to list
app.put('/account/:username/movies/:movie', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const capitalisedMovieParam = capitaliseTerm(req.params.movie);
		const user = await User.findOne({ Username: req.params.username }).exec();
		const movie = await Movies.findOne({ Title: capitalisedMovieParam }).exec();
		await User.updateOne({ Username: user.Username }, { $addToSet: { FavouriteMovies: movie._id } }).exec();
		res.status(200).send(`You added the movie ${capitalisedMovieParam} to your favourites list`);
	} catch (error) {
		console.error(error);
		res.status(500).send(`Error: ${error}`);
	}
});

// Delete movie from list
app.delete('/account/:username/movies/:movie', passport.authenticate('jwt', { session: false }), async (req, res) => {
	try {
		const capitalisedMovieParam = capitaliseTerm(req.params.movie);
		const user = await User.findOne({ Username: req.params.username }).exec();
		const movie = await Movies.findOne({ Title: capitalisedMovieParam }).exec();
		await User.updateOne({ Username: user.Username }, { $pull: { FavouriteMovies: movie._id } }).exec();
		res.status(200).send(`You removed the movie ${capitalisedMovieParam} to your favourites list`);
	} catch (error) {
		console.error(error);
		res.status(500).send(`Error: ${error}`);
	}
});

// Serve files from Public Folder
app.use(express.static('public'));

// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
	console.log(`Listening on Port ${port}`);
});
