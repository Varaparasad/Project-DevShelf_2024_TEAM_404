const mongooose=require('mongoose')
const { stringify } = require('querystring')

const subsc1 = new mongooose.Schema({
    title: String,
    description: String,
    author: String,
    genre: String,
    department: String,
    vendor: String,
    vendor_id: Number,
    publisher: String,
    publisher_id: Number,
    date:String,
    returndate:String
})
const subsc2 = new mongooose.Schema({
    title: String,
    description: String,
    author: String,
    genre: String,
    department: String,
    vendor: String,
    vendor_id: Number,
    publisher: String,
    publisher_id: Number
})


let sc=new mongooose.Schema({
    name:String,
    password:String,
    lastdatepassword:String,
    email:String,
    dob:String,
    phonenumber:Number,
    mybooks:[subsc1],
    mywishlist:[subsc2],
    profilebackgroundcolour:String,
    profileletter:String
})

module.exports= new mongooose.model('userdetails',sc)
