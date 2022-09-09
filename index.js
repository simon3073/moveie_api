/**
 * express module requirement
 * @const
 */
const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
require('./passport')
require('dotenv').config()

// Mongoose Imports to set-up schemas and query db
const mongoose = require('mongoose')
const Models = require('./models')
const Movies = Models.Movie
const User = Models.User
const Director = Models.Director
const Actor = Models.Actor
const Genre = Models.Genre

// for localhost
// mongoose.connect('mongodb://localhost:27017/moviedb', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// for MongoDB Cloud Deployment
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// Import Authorisation & cors
const allowedOrigins = [
  'http://localhost:8080',
  'http://testsite.com',
  'http://localhost:1234',
  'http://localhost:4200',
  'https://simon3073.github.io',
  'https://80s-movies-app.netlify.app',
]
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          'The CORS policy for this application doesn’t allow access from origin ' +
          origin
        return callback(new Error(message), false)
      }
      return callback(null, true)
    },
  })
)
// app.use(cors());

/**
 * This function receives a string (search term)
 * and returns it in capital case
 * @param {string} term The term being searched for
 * @return {string} The term returned in Capital Case
 */
const capitaliseTerm = (term) => {
  return term.replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase())
}

// Morgan logging to Terminal
const accessLog = fs.createWriteStream(path.join(__dirname, 'log.txt'), {
  flags: 'a',
})
app.use(morgan('common'))
app.use(morgan('combined', { stream: accessLog }))

// to parse body to JSON
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Passport set up
require('./auth')(app) // (app) added to pass Express to auth.js
require('./resetPassword')(app) // (app) added to pass Express to auth.js
const passport = require('passport')

/**
 * GET: Returns a list of ALL movies to the user
 * populate return with Genre, Director and Actor data
 * @async
 * @function /movies
 * @returns {Object[]} movies
 * @requires passport
 */
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const movies = await Movies.find()
        .populate('Genre')
        .populate('Actor')
        .populate('Director')
        .exec()
      res.status(201).json(movies)
    } catch (error) {
      console.error(error)
      res.status(500).send(`Error: ${error}`)
    }
  }
)

/**
 * GET: Returns the information of a movie using :movie title in the url
 * populate return with Genre, Director and Actor data
 * @async
 * @function /movies/info/:movie
 * @returns {Object[]} movie
 * @requires passport
 */
app.get(
  '/movies/info/:movie',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const capitalisedSearchTerm = capitaliseTerm(req.params.movie)
      const movie = await Movies.findOne({ Title: capitalisedSearchTerm })
        .populate('Genre')
        .populate('Actor')
        .populate('Director')
        .exec()
      res.status(201).json(movie)
    } catch (error) {
      console.error(error)
      res.status(500).send(`Error: ${error}`)
    }
  }
)

/**
 * GET: Returns the information of a movies director using :director name in the url
 * populate return with MoviesDirected data
 * @async
 * @function /movies/director/:name
 * @returns {Object[]} director
 * @requires passport
 */

app.get(
  '/movies/director/:name',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const capitalisedSearchTerm = capitaliseTerm(req.params.name)
      const director = await Director.findOne({ Name: capitalisedSearchTerm })
        .populate('MoviesDirected')
        .exec()
      res.status(201).json(director)
    } catch (error) {
      console.error(error)
      res.status(500).send(`Error: ${error}`)
    }
  }
)

/**
 * GET: Returns all movies with a genre identified using :genre name in the url
 * populate return with Genre, Director and Actor data
 * @async
 * @function /movies/genre/:genre
 * @returns {Object[]} movies
 * @requires passport
 */
app.get(
  '/movies/genre/:genre',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const capitalisedSearchTerm = capitaliseTerm(req.params.genre)
      const genre = await Genre.findOne({ Genre: capitalisedSearchTerm }).exec()
      const movies = await Movies.find({ Genre: genre._id })
        .populate('Genre')
        .populate('Actor')
        .populate('Director')
        .exec()
      if (movies.length === 0) {
        res
          .status(204)
          .send(`There were no movies in the genre of ${capitalisedSearchTerm}`)
      } else {
        res.status(201).json(movies)
      }
    } catch (error) {
      console.error(error)
      res.status(500).send(`Error: ${error}`)
    }
  }
)

/**
 * GET: Returns the information of an actor using :name in the url
 * populate return with Movie data
 * @async
 * @function /movies/actor/:name
 * @returns {Object[]} director
 * @requires passport
 */
app.get(
  '/movies/actor/:name',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const capitalisedSearchTerm = capitaliseTerm(req.params.name)
      const actor = await Actor.findOne({ Name: capitalisedSearchTerm })
        .populate('Movies')
        .exec()
      res.status(201).json(actor)
    } catch (error) {
      console.error(error)
      res.status(500).send(`Error: ${error}`)
    }
  }
)

/**
 * GET: Returns movies with a minimum imdb rating identified in the :rating variable from the url
 * populate return with Genre, Director and Actor data
 * @async
 * @function /movies/rating/:rating
 * @returns {Object[]} movies
 * @requires passport
 */

app.get(
  '/movies/rating/:rating',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const movies = await Movies.find({
        imdbRating: { $gte: req.params.rating },
      })
        .populate('Genre')
        .populate('Actor')
        .populate('Director')
        .exec()
      if (movies.length === 0) {
        res
          .status(204)
          .send(
            `There were no movies with a IMDB rating of ${req.params.rating} or above`
          )
      } else {
        res.status(201).json(movies)
      }
    } catch (error) {
      console.error(error)
      res.status(500).send(`Error: ${error}`)
    }
  }
)

/**
 * GET: Returns user account information, identifying the user with the :name variable from the url
 * populate return with Favourite Movies data
 * @async
 * @function /account/:username
 * @returns {Object[]} user
 * @requires passport
 */
app.get(
  '/account/:username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const user = await User.findOne({ Username: req.params.username })
        .populate('FavouriteMovies')
        .exec()
      res.status(200).json(user)
    } catch (error) {
      console.error(error)
      res.status(500).send(`Error: ${error}`)
    }
  }
)

/**
 * PUT: Update user account information, identifying the user with the :name variable from the url
 * @async
 * @typedef {object} showRequestBody
 * @property {string} name this is name in request body
 * @property {string} password this is password in request body
 * @property {string} email this is email in request body
 * @property {string} birthday this is birthday in request body
 * @function /account/:username
 * @returns {Object[]} updatedUser
 * @requires passport
 */
app.put(
  '/account/:username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const hashedPassword = User.hashPassword(req.body.Password)
    User.findOneAndUpdate(
      { Username: req.params.username },
      {
        $set: {
          Username: req.body.Username,
          Email: req.body.Email,
          Password: hashedPassword,
          Birthday: req.body.Birthday,
        },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err)
          res.status(500).send(`Error: ${err}`)
        } else {
          res.status(201).json(updatedUser)
        }
      }
    )
  }
)

/**
 * DELETE: Delete a user account, identifying the user with the :name variable from the url
 * populate return with Favourite Movies data
 * @async
 * @function /account/:username
 * @returns {string}
 * @requires passport
 */
app.delete(
  '/account/:username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const user = await User.findOneAndRemove({
        Username: req.params.username,
      })
      if (!user) {
        res.status(400).send(`${req.params.username} could not be found`)
      } else {
        res.status(200).send(`${req.params.username} was deregistered`)
      }
    } catch (error) {
      console.error(error)
      res.status(500).send(`Error: ${error}`)
    }
  }
)

/**
 * PUT: Add a movie ID to the users favourites list, identifying the user with the :username variable and movie with the :movie variable from the url
 * @async
 * @function /account/:username/movies/:movie
 * @returns {string}
 * @requires passport
 */
app.put(
  '/account/:username/movies/:movie',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const capitalisedMovieParam = capitaliseTerm(req.params.movie)
      const user = await User.findOne({ Username: req.params.username }).exec()
      const movie = await Movies.findOne({
        Title: capitalisedMovieParam,
      }).exec()
      await User.updateOne(
        { Username: user.Username },
        { $addToSet: { FavouriteMovies: movie._id } }
      ).exec()
      res
        .status(200)
        .send(
          `You added the movie ${capitalisedMovieParam} to your favourites list`
        )
    } catch (error) {
      console.error(error)
      res.status(500).send(`Error: ${error}`)
    }
  }
)

/**
 * DELETE: Remove a movie ID from the users favourites list, identifying the user with the :username variable and movie with the :movie variable from the url
 * @async
 * @function /account/:username/movies/:movie
 * @returns {object} []
 * @requires passport
 */
app.delete(
  '/account/:username/movies/:movie',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const capitalisedMovieParam = capitaliseTerm(req.params.movie)
      const user = await User.findOne({ Username: req.params.username }).exec()
      const movie = await Movies.findOne({
        Title: capitalisedMovieParam,
      }).exec()
      await User.updateOne(
        { Username: user.Username },
        { $pull: { FavouriteMovies: movie._id } }
      ).exec()
      res.status(200).json(user)
    } catch (error) {
      console.error(error)
      res.status(500).send(`Error: ${error}`)
    }
  }
)

// Serve files from Public Folder
app.use(express.static('public'))

// listen for requests
const port = process.env.PORT || 8080
app.listen(port, '0.0.0.0', () => {
  console.log(`Listening on Port ${port}`)
})
