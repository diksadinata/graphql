const express = require('express')
const expressGraphQL = require('express-graphql').graphqlHTTP
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql')
const app = express()

const authors = [
    { id: 1, name: 'MURAYAMA' },
    { id: 2, name: 'ODA SENSEI' },
    { id: 3, name: 'TODOROKI' },
    { id: 4, name: 'OIDAKUN' }
]

const films = [
    { id: 1, name: 'DRAGON CITY', authorId: 1 },
    { id: 2, name: 'TENSURA', authorId: 1 },
    { id: 3, name: 'NARUTO', authorId: 1 },
    { id: 4, name: 'GOKU', authorId: 1 },
    { id: 5, name: 'DRAGON BALL', authorId: 2 },
    { id: 6, name: 'KOMISAN THE SERIES', authorId: 3 },
    { id: 7, name: 'BLEATCH', authorId: 3 },
    { id: 8, name: 'ATTACK ON TITAN', authorId: 4 }
]

const FilmType = new GraphQLObjectType({
    name: 'Film',
    description: 'This represents a film written by an author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        author: {
            type: AuthorType,
            resolve: (film) => {
                return authors.find(author => author.id === film.authorId)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represents a author of a film',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        films: {
            type: new GraphQLList(FilmType),
            resolve: (author) => {
                return films.filter(film => film.authorId === author.id)
            }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        film: {
            type: FilmType,
            description: 'A Single Film',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => films.find(film => film.id === args.id)
        },
        films: {
            type: new GraphQLList(FilmType),
            description: 'List of All Films',
            resolve: () => films
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of All Authors',
            resolve: () => authors
        },
        author: {
            type: AuthorType,
            description: 'A Single Author',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id)
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addFilm: {
            type: FilmType,
            description: 'Add a film',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const film = { id: films.length + 1, name: args.name, authorId: args.authorId }
                films.push(film)
                return film
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add an author',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const author = { id: authors.length + 1, name: args.name }
                authors.push(author)
                return author
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}))
app.listen(5000, () => console.log('Server Running'))