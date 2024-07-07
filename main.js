const express = require('express')
const app = express()
const port = 3000
const mongoose = require('mongoose')
const connect = mongoose.connect("mongodb://localhost:27017/library")
const userdetails = require('./models/userschema.js')
const details = require('./models/schema.js')
// const mybooks = require('./models/schema2.js')
const bodyparser = require('body-parser')
const notifier = require('node-notifier');
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));

var arr = []
const arr2 = []
let f
var uname
var userid

// app.use('/homepage',homepage)


app.use(bodyparser.json())
app.use(bodyparser.urlencoded({
    extended: true
}))

app.post('/loginpage', async (req, res) => {
    uname = req.body.name;
    let upassword = req.body.password;
    // console.log(upassword)
    let find = await userdetails.find({ name: uname })
    // console.log(find.length)
    // console.log(find[0])
    if (find.length > 0) {
        if (upassword === find[0].password) {
            res.redirect("/landingpage")
            userid = find[0]._id
            console.log(find[0]._id)
        }
        else {
            res.redirect("/login")
            notifier.notify({
                title: 'Incorrect password',
                message: 'Please enter correct password'
            });

        }
    }
    else {
        notifier.notify({
            title: 'Username doesnt exist',
            message: 'Please try again or signup if you are new to the website'
        });

    }
})


app.post('/signuppage', async (req, res) => {
    uname = req.body.name;
    upassword = req.body.password;
    uemail = req.body.email;
    uphonenumber = req.body.phonenumber;
    let data = await userdetails.create({
        name: uname,
        password: upassword,
        email: uemail,
        phonenumber: uphonenumber
    })
    userid = data._id
    // console.log(data._id)
    res.redirect("/landingpage")
})

app.get('/login', (req, res) => {
    res.render('loginpage', { foo: 'foo' })
})
app.get('/signup', (req, res) => {
    res.render('signuppage', { foo: 'foo' })
})

app.get('/', (req, res) => {
    res.render('openingpage', { foo: 'foo' })
})





function add15DaysToDate(dateString) {
    // Create a Date object from the input string
    let date = new Date(dateString);

    // Add 15 days to the date
    date.setDate(date.getDate() + 15);

    // Format the new date to match the original format "ddd MMM DD YYYY HH:mm:ss"
    let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let newDateString = `${days[date.getDay()]} ${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')} ${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;

    return newDateString;
}


async function name() {
    let fin = await details.find({})
    for (let i = 0; i < fin.length; i++) {
        arr.push(fin[i].title)
    }
    // console.log(arr[0])
}
name()

//Search allpage
app.get('/next', async (req, res) => {

    var search = ""
    if (req.query.search) {
        search = req.query.search.replaceAll("+", "").trim()
    }
    let b = await details.find({
        $or: [
            { title: { $regex: '.*' + search + '.*', $options: 'i' } },
            { genre: { $regex: '.*' + search + '.*', $options: 'i' } },
            { department: { $regex: '.*' + search + '.*', $options: 'i' } },
            { author: { $regex: '.*' + search + '.*', $options: 'i' } }
        ]
    })
    res.render('index', { b });

})
//Starting/Landing page
app.get('/landingpage', (req, res) => {
    res.render("table", { butto: "but" })
    //Redirecting to buynowpage
    arr.forEach(element => {
        // console.log(`/${element.replaceAll(" ", "%20")}`)
        app.get(`/${element.replaceAll(" ", "%20")}`, async (req, res) => {
            f = await details.find({ title: element })
            // console.log(f[0].title)
            res.render('buy', { bookdetails: f })
        })
        app.get(`/mybook/${element.replaceAll(" ", "%20")}`, async (req, res) => {
            // console.log(`/mybook/${element.replaceAll(" ", "%20")}`)
            res.send("helo world");
        })
        app.get('/mywishlists',async(req,res)=>{
            // console.log(userid)
                let usermywishlist = await userdetails.findOneAndUpdate({ _id: userid },
        {
            $push: {
                mywishlist: {
                    title: f[0].title,
                    description: f[0].description,
                    author: f[0].author,
                    genre: f[0].genre,
                    department: f[0].department,
                    count: f[0].count,
                    vendor: f[0].vendor,
                    vendor_id: f[0].vendor_id,
                    publisher: f[0].publisher,
                    publisher_id: f[0].publisher_id
                }
            }
        })
        res.redirect("/mywishlist")
        })

    });
})

//From buynowpage to mybooks listpage
app.get('/mybooks', async (req, res) => {
    // console.log(f[0])

    f[0].count = f[0].count - 1;

    //To delete _id key from f[0]
    let str = `${f[0]}`
    let str1 = str.trim().replaceAll("\n", "").split(")")[1]
    // let str2=str.trim().replaceAll("\n", "").replaceAll(" ","")
    let oid = f[0]._id

    //Adding date
    let date = new Date();
    let fdate = `${date}`.split("GMT")[0]
    //To test the alert if returndate is over or near
    // let fdate='Tue Jun 18 2024 23:25:01'
    let returndate = add15DaysToDate(fdate);
    str1 = "{" + str1.slice(3, str1.length - 1) + ', date:`${fdate}` , returndate:`${returndate}`}'
    eval('var fobj=' + str1);
    let count = 1;
    // console.log(userid)
    let usermybooks = await userdetails.findOneAndUpdate({ _id: userid },
        {
            $push: {
                mybooks: {
                    title: fobj.title,
                    description: fobj.description,
                    author: fobj.author,
                    genre: fobj.genre,
                    department: fobj.department,
                    // count: fobj.count,
                    vendor: fobj.vendor,
                    vendor_id: fobj.vendor_id,
                    publisher: fobj.publisher,
                    publisher_id: fobj.publisher_id,
                    date: fobj.date,
                    returndate: fobj.returndate
                }
            }
        })


    await details.updateOne({ title: fobj.title }, { $set: { count: f[0].count } })
    res.redirect("/mybook")
})


async function name1() {
    let find2 = await userdetails.find({ name: uname })
    for (let i = 0; i < find2[0].mybooks.length; i++) {
        arr2.push(find2[0].mybooks[i].title)
    }

    arr2.forEach(element => {
        app.get(`/mybook/${element.replaceAll(" ", "%20")}`, async (req, res) => {
            // console.log(`/mybook/${element.replaceAll(" ", "%20")}`)
            res.send("helo world");
        })
    })
}
// name1()


//From homepage to mybooks listpage
app.get('/mybook', async (req, res) => {
    // console.log(uname)
    if (typeof uname == 'undefined') {
        res.redirect("/login")
    }
    else {
        let mybooksdata = await userdetails.find({ name: uname })
        // console.log(mybooksdataa[0].mybooks)
        res.render('mybooks', { b: mybooksdata[0].mybooks })
        // console.log(arr[1])
    }
})

app.get('/mywishlist', async (req, res) => {
    if (typeof uname == 'undefined') {
        res.redirect("/login")
    }
    else {
        let mywishlistdata = await userdetails.find({ name: uname })
        // console.log(mybooksdataa[0].mybooks)
        res.render('mywishlist', { b: mywishlistdata[0].mywishlist })
        
    }
})





app.listen(port, () => {
    console.log(`Example listening on port ${port}`)
})