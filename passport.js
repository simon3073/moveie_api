const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./models.js');
const passportJWT = require('passport-jwt');

const User = Models.User;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

// referred to as local in the authenticate function
passport.use(
	new LocalStrategy(
		{
			usernameField: 'Username',
			passwordField: 'Password'
		},
		(username, password, callback) => {
			console.log(`${username} ${password}`);
			User.findOne({ Username: username }, (error, user) => {
				if (error) {
					console.log(error);
					return callback(error);
				}
				if (!user) {
					console.log('Incorrect username');
					return callback(null, false, { message: 'Incorrect username' });
				}

				if (!user.validatePassword(password)) {
					// check saved hashed password against provided hashed password on login
					console.log('Incorrect Password');
					return callback(null, false, { message: 'Incorrect password' });
				}
				return callback(null, user);
			});
		}
	)
);

// referred to as jwt in the authenticate function
passport.use(
	new JWTStrategy(
		{
			jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
			secretOrKey: 'your_jwt_secret'
		},
		(jwtPayload, callback) => {
			return User.findById(jwtPayload._id)
				.then((user) => {
					return callback(null, user);
				})
				.catch((error) => {
					return callback(error);
				});
		}
	)
);
