const { ApolloServer, PubSub } = require('apollo-server')
const mongoose = require('mongoose')
//Import Relative Files
const { DB_URI } = require('./config.js')
const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')

const pubsub = new PubSub()

const PORT = process.env.port || 5000

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req, pubsub })
})

mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log(`mongo-db connected`)
    return server.listen({ port: PORT })
}).then(res => {
    console.log(`Server running at ${res.url}`)
}).catch(err => {
    console.error(err)
})