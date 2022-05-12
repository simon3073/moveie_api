const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./models.js');
const passportJWT = require('passport-jwt');

const Users = Models.User;
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
			Users.findOne({ Username: username }, (error, user) => {
				if (error) {
					console.log(error);
					return callback(error);
				}
				if (!user) {
					console.log('Incorrect username');
					return callback(null, false, { message: 'Incorrect username or password' });
				}
				console.log('Finished');
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
			return Users.findById(jwtPayload._id)
				.then((user) => {
					return callback(null, user);
				})
				.catch((error) => {
					return callback(error);
				});
		}
	)
);
