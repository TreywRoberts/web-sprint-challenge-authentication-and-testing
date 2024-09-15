const router = require('express').Router();
const {jwtSecret} = require('../secrets/index.js')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('./../../data/dbConfig')
const {checkIfUsernameandPassword, checkIfUsernameExist} = require('./auth-middleware')

router.post('/register', checkIfUsernameandPassword, checkIfUsernameExist, async (req, res, next) => {
  const credentials = req.body

    const rounds = process.env.BCRYPT_ROUNDS || 8
    const hash = bcryptjs.hashSync(credentials.password, rounds)
    credentials.password = hash
  try{
    await db('users').insert(credentials)
    const user = await db('users').where('username', credentials.username).first()
    const newUser = {id: user.id, username: user.username, password: user.password}
    res.status(201).json(newUser)
  }catch(err){
    next(err)
  }


  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */


});

router.post('/login', checkIfUsernameandPassword, async (req, res, next) => {
  const {username, password} = req.body
  try{
    const user = await db('users').where('username', username).first()
    if(user && bcryptjs.compareSync(password, user.password)){
      const token = buildToken(user)
      res.status(200).json({message: `Welcome, ${username}`, token})
    } else {
      res.status(401).json({message: 'Invalid credentials'})
    }

  }catch(err){
    next(err)
  }

  
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
});
function buildToken(user) {
  const payload = {
    // claims
    subject: user.user_id,
    username: user.username,
  }
  const config = {
    expiresIn: '1d',
  }
  return jwt.sign(
    payload, jwtSecret, config
  )
}

module.exports = router;
