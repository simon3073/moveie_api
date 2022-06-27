const jwtSecret = 'your_jwt_secret';
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const passport = require('passport');

const Models = require('./models');
const User = Models.User;

require('./passport');

const generateJWTToken = (user) => {
	return jwt.sign(user, jwtSecret, {
		subject: user.Username, // Username to be encoded in JWT
		expiresIn: '7d', // When the JWT will expire
		algorithm: 'HS256' // algorithm to encode the values
	});
};

const passportAuth = (req, res) => {
	passport.authenticate('local', { session: false }, (error, user) => {
		if (error || !user) {
			// If there has been an error or the user cannot be found
			console.error(error);
			return res.status(400).json({
				message: `Sorry, this user's login details cannot be found`,
				error: error,
				user: user
			});
		}
		req.login(user, { session: false }, (error) => {
			if (error) {
				res.send(error); // error check to stop anything
			}
			const token = generateJWTToken(user.toJSON()); // if a username/password match has been found < create a JWT Token
			return res.json({ user, token }); // ES6 Shorthand
		});
	})(req, res);
};

// Exported from and imported to the main "index.js" file to catch all /login requests
module.exports = (router) => {
	router.post('/login', (req, res) => {
		passportAuth(req, res);
	});

	router.post('/register', [check('Username', 'Username is required').isLength({ min: 4 }), check('Username', 'Username contains non alphanumeric chars - not allowed').isAlphanumeric(), check('Password', 'Password is required').not().isEmpty(), check('Email', 'Email does not appear to be valid').isEmail()], async (req, res) => {
		console.log('register');
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
			}
			passportAuth(req, res); // Login to system
		} catch (error) {
			console.error(error);
			res.status(500).send(`Error: ${error}`);
		}
	});
};
