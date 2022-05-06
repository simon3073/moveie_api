const mongoose = require('mongoose');

let movieSchema = mongoose.Schema({
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
	FaveMovies: [{ type: mongoose.Schema.Types.Number, ref: 'Movie' }]
});

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
