const mongoose = require('mongoose')
const { stringify } = require('querystring')
const sc = new mongoose.Schema({
    title: String,
    description: String,
    author: String,
    genre: String,
    department: String,
    count: Number,
    vendor: String,
    vendor_id: Number,
    publisher: String,
    publisher_id: Number
})
const detalis = new mongoose.model('book_details', sc)
module.exports = detalis
