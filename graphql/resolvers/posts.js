const { AuthenticationError, UserInputError } = require('apollo-server')
const Posts = require('../../models/Posts')
const checkAuth = require('../../utils/check-auth')

module.exports = {
    Query: {
        async getPosts() {
            console.log('getPosts')
            try {
                const posts = await Posts.find().sort({ createdAt: -1 })
                return posts
            } catch (err) {
                throw new Error(err)
            }
        },
        async getPost(parent, { postId }) {
            console.log('getPost')
            try {
                const post = await Posts.findById(postId)

                if (post) {
                    return post
                } else {
                    throw new Error('Post not found')
                }
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    Mutation: {
        async createPost(parent, { body }, context) {
            console.log('createPost')

            const user = checkAuth(context)

            if (body.trim() === '') throw new Error('Post body must not be empty!')

            const newPost = new Posts({
                body,
                user: user.id,
                username: user.username,
                createdAt: new Date().toISOString()
            })

            const post = await newPost.save()

            context.pubsub.publish('NEW_POST', {
                newPost: post
            })
            return post
        },
        async deletePost(parent, { postId }, context) {
            const user = checkAuth(context)
            try {
                const post = await Posts.findById(postId)

                if (user.username === post.username) {
                    await post.delete()

                    return 'Post deleted successfully'
                } else {
                    throw new AuthenticationError('Action not allowed!')
                }
            } catch (err) {
                throw new Error(err)
            }
        },
        async likePost(parent, { postId }, context) {
            const { username } = checkAuth(context)

            const post = await Posts.findById(postId)
            if (post) {
                if (post.likes.find(like => like.username === username)) {
                    //Post already likes, unlike it
                    post.likes = post.likes.filter(like => like.username !== username)
                } else {
                    //Not liked , like post
                    post.likes.push({
                        username,
                        createdAt: new Date().toISOString()
                    })
                }
                await post.save()
                return post
            } else throw new UserInputError('Post not found')
        }
    },
    Subcription: {
        newPost: {
            subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator('NEW_POST')
        }
    }
}

