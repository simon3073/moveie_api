const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


/**
 * movieSchema for each movie returned from /movies API
 * @constructor Movie
 */
let tokenSchema = mongoose.Schema({
	userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600,// this is the expiry time in seconds
  },
});

/**
 * movieSchema for each movie returned from /movies API
 * @constructor Movie
 */
let movieSchema = mongoose.Schema({
	_id: { type: Number, required: true },
	Title: { type: String, required: true },
	ReleaseYear: { type: Number, required: true },
	Description: { type: String, required: true },
	imdbRating: { type: Number, required: true },
	imgURL: String,
	imgURL_thumb: String,
	imgURL_load: String,
	Genre: [{ type: mongoose.Schema.Types.Number, ref: 'Genre' }],
	Actor: [{ type: mongoose.Schema.Types.Number, ref: 'Actor' }],
	Director: [{ type: mongoose.Schema.Types.Number, ref: 'Director' }]
});

/**
 * userSchema for user data returned from /account/[username] API
 * @constructor User
 */
let userSchema = mongoose.Schema({
	Username: { type: String, required: true },
	Password: { type: String, required: true },
	Email: { type: String, required: true },
	Birthday: Date,
	ResetToken: tokenSchema, 
	FavouriteMovies: [{ type: mongoose.Schema.Types.Number, ref: 'Movie' }]
});

/**
 * HashSyncs a password
 * @constructor
 * @param {string} password - The user password from login
 * @return {hash} encrypted password
 */
userSchema.statics.hashPassword = (password) => {
	return bcrypt.hashSync(password, 10);
};

/**
 * compares hashed passwords
 * @constructor
 * @param {string} password - The user password from login
 * @return {boolean} 0 (valid) -1 (not valid)
 */
userSchema.methods.validatePassword = function (password) {
	return bcrypt.compareSync(password, this.Password);
};

/**
 * directorsSchema for user data returned from /movies/director/[name] API
 * @constructor Director
 */
let directorsSchema = mongoose.Schema({
	_id: { type: Number, required: true },
	Name: { type: String, required: true },
	Bio: { type: String, required: true },
	Born: { type: String, required: true },
	imgURL: String,
	Died: String,
	MoviesDirected: [{ type: mongoose.Schema.Types.Number, ref: 'Movie' }]
});


/**
 * actorsSchema for user data returned from /movies/actor/[name] API
 * @constructor Actor
 */
let actorsSchema = mongoose.Schema({
	_id: { type: Number, required: true },
	Name: { type: String, required: true },
	Bio: { type: String, required: true },
	Born: { type: String, required: true },
	imgURL: String,
	Movies: [{ type: mongoose.Schema.Types.Number, ref: 'Movie' }]
});

/**
 * genresSchema for user data returned from /movies/genre/[genre] API
 * @constructor Genre
 */
let genresSchema = mongoose.Schema({
	Genre: { type: String, required: true },
	_id: { type: Number, required: true }
});

const Token = mongoose.model('Token', tokenSchema)
const Movie = mongoose.model('Movie', movieSchema);
const User = mongoose.model('User', userSchema);
const Director = mongoose.model('Director', directorsSchema);
const Actor = mongoose.model('Actor', actorsSchema);
const Genre = mongoose.model('Genre', genresSchema);

module.exports.Token = Token;
module.exports.Movie = Movie;
module.exports.User = User;
module.exports.Director = Director;
module.exports.Actor = Actor;
module.exports.Genre = Genre;
