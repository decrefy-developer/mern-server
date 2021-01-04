const jwt = require('jsonwebtoken')
const { AuthenticationError } = require('apollo-server')

const { SECRET_KEY } = require('../config.js')

module.exports = (context) => {
    //context = {...headers}
    const autHeader = context.req.headers.authorization
    if (autHeader) {

        const token = autHeader.split('Bearer ')[1]
        if (token) {
            try {
                const user = jwt.verify(token, SECRET_KEY)
                return user
            } catch (err) {
                throw new AuthenticationError('Invalid/Expired token!')
            }
        }
        throw new Error('Authentication token must be Bearer [token]')
    }
    throw new Error('Authorization Header must be provided!')
}