/*
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

// Set some defaults (required if your JSON file is empty)
db.defaults({ posts: [], user: {}, count: 0 })
    .write()

// Add a post
db.get('posts')
    .push({ id: 1, title: 'lowdb is awesome'})
    .write()

// Set a user using Lodash shorthand syntax
db.set('user.name', 'typicode')
    .write()

// Increment count
db.update('count', n => n + 1)
    .write()
*/
require("./Data/streamTest");