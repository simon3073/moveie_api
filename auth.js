const jwtSecret = 'your_jwt_secret'
const jwt = require('jsonwebtoken')
const sendEmail = require('./sendMail')
const { check, validationResult } = require('express-validator')
const passport = require('passport')
const crypto = require('crypto')
const bcrypt = require('bcrypt')

/** Express router providing user related routes
 * @module models.js
 * @requires Models
 */
const Models = require('./models')
const User = Models.User
const Token = Models.Token

require('./passport')

const generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // Username to be encoded in JWT
    expiresIn: '7d', // When the JWT will expire
    algorithm: 'HS256', // algorithm to encode the values
  })
}

const passportAuth = (req, res) => {
  passport.authenticate('local', { session: false }, (error, user) => {
    if (error || !user) {
      // If there has been an error or the user cannot be found
      console.error(error)
      return res.status(400).json({
        message: `Sorry, this user's login details cannot be found`,
        error: error,
        user: user,
      })
    }
    req.login(user, { session: false }, (error) => {
      if (error) {
        res.send(error) // error check to stop anything
      }
      const token = generateJWTToken(user.toJSON()) // if a username/password match has been found < create a JWT Token
      return res.json({ user, token }) // ES6 Shorthand
    })
  })(req, res)
}

const sendResetEmail = async (user) => {
  try {
    await User.findOneAndUpdate(
      { Username: user.Username },
      { $unset: { ResetToken: '' } }
    )
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hash = bcrypt.hashSync(resetToken, 10)
    const resetTokenObj = await new Token({
      userId: user._id,
      token: hash,
      createdAt: Date.now(),
    })
    await User.findOneAndUpdate(
      { Username: user.Username },
      {
        $set: {
          ResetToken: resetTokenObj,
        },
      }
    )
    const link = `${process.env.CLIENT_URL}/passwordReset?token=${resetToken}&id=${user._id}`
    sendEmail(
      user.Email,
      'Password Reset Request',
      { name: user.Username, link: link },
      './template/requestResetPassword.handlebars'
    )
  } catch (error) {
    console.log(error)
  }
}

// Exported from and imported to the main "index.js" file to catch all /login requests
module.exports = (router) => {
  /**
   * POST: Login and Register a user account
   * @typedef {object} showRequestBody
   * @property {string} name this is name in request body
   * @property {string} password this is password in request body
   * @function /login
   * @param {Express.request} req
   * @param {Express.result} res
   */
  router.post('/login', (req, res) => {
    passportAuth(req, res)
  })

  /**
   * GET: Search for user based on email or username
   * @async
   * @function /account/:username
   * @returns {Object[]} user
   * @requires passport
   */
  router.get('/resetpassword', async (req, res) => {
    try {
      let user = await User.findOne({ Username: req.body.searchterm })
      if (!user) {
        user = await User.findOne({ Email: req.body.searchterm })
        if (!user) {
          res.status(400).send(`User could not be found`)
        } else {
          sendResetEmail(user)
          res.status(200).send(`User found`)
        }
      } else {
        sendResetEmail(user)
        res.status(200).send(`User found`)
      }
    } catch (error) {
      console.error(error)
      res.status(500).send(`Error: ${error}`)
    }
  })

  /**
   * PUT: Update user account information, identifying the user with the :name variable from the url
   * @async
   * @typedef {object} showRequestBody
   * @property {string} name this is name in request body
   * @property {string} password this is password in request body
   * @property {string} email this is email in request body
   * @property {string} birthday this is birthday in request body
   * @param {Express.request} req
   * @param {Express.result} res
   */
  router.post(
    '/register',
    [
      check('Username', 'Username is required').isLength({ min: 4 }),
      check(
        'Username',
        'Username contains non alphanumeric chars - not allowed'
      ).isAlphanumeric(),
      check('Password', 'Password is required').not().isEmpty(),
      check('Email', 'Email does not appear to be valid').isEmail(),
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() })
        }
        const hashedPassword = User.hashPassword(req.body.Password)
        const user = await User.findOne({ Username: req.body.Username }).exec()
        if (user) {
          return res.status(400).send(`${req.body.Username} already exists`)
        } else {
          const newUser = await User.create({
            Username: req.body.Username,
            Email: req.body.Email,
            Password: hashedPassword,
            Birthday: req.body.Birthday,
            FavouriteMovies: [],
          })
        }
        passportAuth(req, res) // Login to system
      } catch (error) {
        console.error(error)
        res.status(500).send(`Error: ${error}`)
      }
    }
  )
}
