const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let movieSchema = mongoose.Schema({
	_id: { type: Number, required: true },
	Title: { type: String, required: true },
	ReleaseYear: { type: Number, required: true },
	Description: { type: String, required: true },
	imdbRating: { type: Number, required: true },
	imgURL: String,
	Genre: [{ type: mongoose.Schema.Types.Number, ref: 'Genre' }],
	Actor: [{ type: mongoose.Schema.Types.Number, ref: 'Actor' }],
	Director: [{ type: mongoose.Schema.Types.Number, ref: 'Director' }]
});

let userSchema = mongoose.Schema({
	Username: { type: String, required: true },
	Password: { type: String, required: true },
	Email: { type: String, required: true },
	Birthday: Date,
	FavouriteMovies: [{ type: mongoose.Schema.Types.Number, ref: 'Movie' }]
});

userSchema.statics.hashPassword = (password) => {
	return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
	return bcrypt.compareSync(password, this.Password);
};

let directorsSchema = mongoose.Schema({
	_id: { type: Number, required: true },
	Name: { type: String, required: true },
	Bio: { type: String, required: true },
	Born: { type: String, required: true },
	imgURL: String,
	Died: String,
	MoviesDirected: [{ type: mongoose.Schema.Types.Number, ref: 'Movie' }]
});

let actorsSchema = mongoose.Schema({
	_id: { type: Number, required: true },
	Name: { type: String, required: true },
	Bio: { type: String, required: true },
	Born: { type: String, required: true },
	imgURL: String,
	Movies: [{ type: mongoose.Schema.Types.Number, ref: 'Movie' }]
});

let genresSchema = mongoose.Schema({
	Genre: { type: String, required: true },
	_id: { type: Number, required: true }
});

const Movie = mongoose.model('Movie', movieSchema);
const User = mongoose.model('User', userSchema);
const Director = mongoose.model('Director', directorsSchema);
const Actor = mongoose.model('Actor', actorsSchema);
const Genre = mongoose.model('Genre', genresSchema);

module.exports.Movie = Movie;
module.exports.User = User;
module.exports.Director = Director;
module.exports.Actor = Actor;
module.exports.Genre = Genre;
