const db = require('./../../data/dbConfig')


const checkIfUsernameandPassword =  (req, res, next) =>{
    const {username, password} = req.body
    if(!username || !password){
        res.status(401).json({message: 'username and password required'})
    } else {
        next()
    }
}

const checkIfUsernameExist = async (req, res, next)=>{
    const {username} = req.body
    const user = await db('users').where('username', username).first()
    if(user && user.username){
        res.status(401).json({message: 'username is taken'})
    } else {
        next()
    }
}

module.exports = {
    checkIfUsernameandPassword,
    checkIfUsernameExist
}