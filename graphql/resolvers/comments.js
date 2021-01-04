const { UserInputError, AuthenticationError } = require('apollo-server')
const Post = require('../../models/Posts')
const checkAuth = require('../../utils/check-auth')
module.exports = {
    Mutation: {
        async createComment(parent, { postId, body }, context) {
            const { username } = checkAuth(context)
            if (body.trim() == '') throw new UserInputError('Empty comment', {
                errors: {
                    body: 'Comment body must not empty'
                }
            })

            const post = await Post.findById(postId)
            if (post) {
                console.log(post)
                post.comments.unshift({
                    body,
                    username,
                    createdAt: new Date().toISOString()
                })
                const savedPost = await post.save()
                return savedPost
            } else throw new UserInputError('Post not found')

        },
        async deleteComment(parent, { postId, commentId }, context) {
            const { username } = checkAuth(context)
            const post = await Post.findById(postId)

            if (post) {
                const commentIndex = post.comments.findIndex(c => c.id === commentId)
                console.log(commentIndex)
                if (post.comments[commentIndex].username === username) {
                    post.comments.splice(commentIndex, 1)
                    await post.save()
                    return post
                } throw new AuthenticationError('Action not allowed')

            } throw new UserInputError('Post not found')
        }
    }
}