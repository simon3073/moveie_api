const jwtSecret = 'your_jwt_secret';
const jwt = require('jsonwebtoken');
const passport = require('passport');

require('./passport');

const generateJWTToken = (user) => {
	return jwt.sign(user, jwtSecret, {
		subject: user.Username, // Username to be encoded in JWT
		expiresIn: '7d', // When the JWT will expire
		algorithm: 'HS256' // algorithm to encode the values
	});
};

// Exported from and imported to the main "index.js" file to catch all /login requests
module.exports = (router) => {
	router.post('/login', (req, res) => {
		passport.authenticate('local', { session: false }, (error, user, info) => {
			if (error || !user) {
				// If there has been an error or the user cannot be found
				return res.status(400).json({
					message: 'Something is not right',
					user: user
				});
			}
			req.login(user, { session: false }, (error) => {
				if (error) {
					res.send(error); // error check to stop anything
				}
				let token = generateJWTToken(user.toJSON()); // if a username/password match has been found < create a JWT Token
				return res.json({ user, token }); // ES6 Shorthand
			});
		})(req, res);
	});
};
