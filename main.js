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
const accountSid = 'ACc5111c9af49fa8aa356c34a15b81ec4e';
const authToken = '620c95240c450f4e164737f23dc547d8';
const client = require('twilio')(accountSid, authToken);
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));

var arr = []
const arr2 = []
let f
var uname
var userid
var aa
var useremail
var udob
var uphonenumber

//Useful functions
function getRandomNumber(l) {
    return Math.floor(Math.random() * l);
}

function rancolour() {
    let a = getRandomNumber(255);
    let b = getRandomNumber(255);
    let c = getRandomNumber(255);
    return (`rgb(${a}, ${b}, ${c})`);
}

function validatePassword(password, minLength) {
    // Define the special characters, lowercase, uppercase, and numeric patterns
    const specialChars = /[!@#$%^&*(),.?":{}|<>]/;
    const lowercase = /[a-z]/;
    const uppercase = /[A-Z]/;
    const digits = /[0-9]/;

    // Check if password meets the minimum length
    if (password.length < minLength) {
        return false;
    }

    // Check if password contains at least one special character
    if (!specialChars.test(password)) {
        return false;
    }

    // Check if password contains at least one lowercase letter
    if (!lowercase.test(password)) {
        return false;
    }

    // Check if password contains at least one uppercase letter
    if (!uppercase.test(password)) {
        return false;
    }

    // Check if password contains at least one digit
    if (!digits.test(password)) {
        return false;
    }

    // If all conditions are met, return true
    return true;
}

function add15DaysToDate(dateString) {
    // Parse the input date string
    const inputDate = new Date(dateString);

    // Check if the date is valid
    if (isNaN(inputDate)) {
        return "Invalid date format";
    }

    // Add 15 days to the date
    inputDate.setDate(inputDate.getDate() + 15);

    // Format the date to ddd MMM DD YYYY
    const options = { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' };
    const formattedDate = inputDate.toLocaleDateString('en-US', options);

    return formattedDate;
}

function compareDates(dateString1, dateString2) {
    // Create Date objects from the input date strings
    let date1 = new Date(dateString1);
    let date2 = new Date(dateString2);

    // Compare the dates
    if (date1 < date2) {
        return -1;
    } else if (date1 > date2) {
        return 1;
    } else {
        return 0;
    }
}

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({
    extended: true
}))

app.post('/loginpage', async (req, res) => {
    uname = req.body.name;
    let upassword = req.body.password;
    // console.log(upassword)
    let find = await userdetails.find({ name: uname })

    if (find.length > 0) {
        if (upassword === find[0].password) {
            aa = 1
            res.redirect("/landingpage")
            userid = find[0]._id
            useremail = find[0].email
            udob=find[0].dob
            uphonenumber=find[0].phonenumber
            // console.log(find[0].email)
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
    udob="-"
    var cou = 0
    let allusernames = await userdetails.find({})
    for (let i = 0; i < allusernames.length; i++) {
        if (allusernames[i].name == uname) {
            cou = 1
        }
    }

    if (cou == 1) {
        notifier.notify({
            title: 'Username already exists',
            message: 'Try using another usernamee'
        });
        // res.redirect("/signup")

    }

    if (!(uemail.endsWith("@iitdh.ac.in"))) {
        // res.redirect("/signup")
        notifier.notify({
            title: 'You need permission to access this please contact admin or',
            message: 'Try signingup with your collage mail'
        });
        cou++
    }

    if (!(validatePassword(upassword, 8))) {
        // res.redirect("/signup")
        notifier.notify({
            title: 'Password should be strong',
            message: 'Password should must contain atleast : one specialcharacter, one lowercase, one uppercase, one digit'
        });
        cou++
    }

    if (cou > 0) {
        res.redirect("/signup")
    }
    else {
        let date = new Date();
        let fdate1 = `${date}`.split("GMT")[0]
        let fdate = fdate1.slice(0, fdate1.length - 9).slice(4)
        let backcolour=rancolour()
        let lettercolour=rancolour()
        let data = await userdetails.create({
            name: uname,
            password: upassword,
            email: uemail,
            phonenumber: uphonenumber,
            lastdatepassword:fdate,
            profilebackgroundcolour:backcolour,
            profileletter:lettercolour
        })
        aa = 1
        userid = data._id
        useremail = data.email
        // console.log(data._id)
        res.redirect("/landingpage")
    }
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


async function name() {
    let fin = await details.find({})
    for (let i = 0; i < fin.length; i++) {
        arr.push(fin[i].title)
    }
    // console.log(arr[0])
}
name()

//Search allpage
app.get('/search', async (req, res) => {

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
    if(b.length==0){
        res.render('search', { b ,nobooks:"No books found"});
    }
    else{
        res.render('search', { b,nobooks:"-" });
    }

})

//Starting/Landing page
app.get('/landingpage', async (req, res) => {
    let allbooks = await details.find({})
    if (typeof useremail == "undefined") {
        res.redirect("/login")
    }
    else {
        let branch1 = `${useremail[0]}${useremail[1]}`
        let branch = branch1.toLowerCase()
        // console.log(`${useremail[0]}${useremail[1]}`)
        if (branch == 'cs' || branch == 'mc') {
            f1 = await details.find({ department: "Computer Science" })
            // console.log(f1)
        }
        else if (branch == 'me') {
            f1 = await details.find({ department: "Mechanical Engineering" })
            // console.log(f1)
        }
        else if (branch == 'ee') {
            f1 = await details.find({ department: "Electrical Engineering" })
            // console.log(f1)
        }
        else if (branch == 'ce') {
            f1 = await details.find({ department: "Civil Engineering" })
            // console.log(f1)
        }
        else if (branch == 'ch') {
            f1 = await details.find({ department: "Chemical Engineering" })
            // console.log(f1)
        }
        else if (branch == 'ep') {
            f1 = await details.find({ department: "Engineering Physics" })
            // console.log(f1)
        }
        else {
            f1 = await details.find({ department: "Computer Science" })

        }
        // console.log(f1.length)
        let l = allbooks.length
        let num = []
        for (let i = 0; i < 10; i++) {
            num.push(getRandomNumber(l))
        }
        let randombooks = []
        for (let i = 0; i < 10; i++) {
            randombooks.push(allbooks[num[i]])
        }
        res.render("landingpage", { b: randombooks, b1: f1 })

        let f2 = await userdetails.find({ name: uname })
        let nowdate = new Date();
        let nowdate1 = `${nowdate}`.split("GMT")[0]

        if (aa == 1) {
            for (let i = 0; i < f2[0].mybooks.length; i++) {

                if (compareDates((nowdate1), (f2[0].mybooks[i].returndate)) == 1) {
                    notifier.notify({
                        title: ` ${f2[0].mybooks[i].title} must be returned`,
                        message: `Please return the ${f2[0].mybooks[i].title} book`
                    })

                    // client.messages
                    //     .create({
                    //         body: `Please return ${f2[0].mybooks[i].title} book author-${f2[0].mybooks[i].author}`,
                    //         from: '+17073949308',  // Replace with your Twilio phone number
                    //         to: '+918500819116'      // Replace with the recipient's phone number
                    //     })
                    //     .then(message => console.log('Message sent successfully. SID: ' + message.sid))
                    //     .catch(err => console.error('Error sending message:', err));
                }
            }
            aa = 0
        }
    }



    //Redirecting to buynowpage
    arr.forEach((element) => {
        // console.log(`/${element.replaceAll(" ", "%20")}`)
        app.get(`/${element.replaceAll(" ", "%20")}`, async (req, res) => {
            f = await details.find({ title: element })
            let ff = await details.find({ department: f[0].department })
            res.render('buynow', { bookdetails: f[0], b1: ff })
        })
        app.get(`/${element.replaceAll(" ", "%20")}w`, async (req, res) => {
            f = await details.find({ title: element })
            let ff = await details.find({ department: f[0].department })
            res.render('buynoww', { bookdetails: f[0], b1: ff })
        })


        app.get(`/mybook/${element.replaceAll(" ", "%20")}`, async (req, res) => {
            // console.log(`/mybook/${element.replaceAll(" ", "%20")}`)
            res.send("helo world");
        })


        app.post('/mywishlists', async (req, res) => {
            // console.log(userid)
            var variable = 0
            let mywishlistdata = await userdetails.find({ name: uname })
            mywishlistdata[0].mywishlist.forEach(element => {
                if (element.title == f[0].title && element.author == f[0].author) {
                    variable = 1
                }
            });

            if (variable == 0) {
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
            }
            res.redirect("/wishlist")

        })



    });

    // console.log(f2)
})

//From buynowpage to mybooks listpage
app.post('/mybooks', async (req, res) => {
    // console.log(f[0])
    if (f[0].count == 0) {
        var variable = 0
        let mywishlistdata = await userdetails.find({ name: uname })
        mywishlistdata[0].mywishlist.forEach(element => {
            if (element.title == f[0].title && element.author == f[0].author) {
                variable = 1
            }
        });

        if (variable == 0) {
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
        }
        res.redirect("/wishlist")

    }
    else {
        //Decreasing count by one as one book is ordered
        f[0].count = f[0].count - 1;

        //To delete _id key from f[0]
        let str = `${f[0]}`
        let str1 = str.trim().replaceAll("\n", "").split(")")[1]
        let str2 = str.trim().replaceAll("\n", "").replaceAll(" ", "").slice()
        let oid = f[0]._id

        //Adding date
        let date = new Date();
        let fdate1 = `${date}`.split("GMT")[0]
        let fdate = fdate1.slice(0, fdate1.length - 9)
        //To test the alert if returndate is over or near
        // let fdate = 'Tue Jun 18 2024'
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
        let wishlistbooks=await userdetails.find({name:uname})
        let len=wishlistbooks[0].mywishlist.length
        for(let i=0;i<len;i++){
            if(wishlistbooks[0].mywishlist[i].title==fobj.title){
                await userdetails.updateOne(
                    { name:uname },
                    { $pull: { mywishlist: { title:fobj.title } } }
                );
            }
        }
        res.redirect("/orders")
    }
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
app.get('/orders', async (req, res) => {
    // console.log(uname)
    if (typeof uname == 'undefined') {
        res.redirect("/login")
    }
    else {

        let mybooksdata = await userdetails.find({ name: uname })
        if (mybooksdata[0].mybooks.length == 0) {
            res.render('orders', { b: mybooksdata[0].mybooks, noof: "You havent ordered any books yet",try1:"Try ordering from wishlist" })
        }
        // console.log(mybooksdataa[0].mybooks)
        else {
            res.render('orders', { b: mybooksdata[0].mybooks, noof: " ",try1:" "})
        }
        
        
    }

})

app.get('/wishlist', async (req, res) => {
    if (typeof uname == 'undefined') {
        res.redirect("/login")
    }
    else {
        let mywishlistdata = await userdetails.find({ name: uname })
        if (mywishlistdata[0].mywishlist.length == 0) {
            res.render('wishlist', { b: mywishlistdata[0].mywishlist, noof: "You havent added any books yet" })
        }
        // console.log(mybooksdataa[0].mybooks)
        else {
            res.render('wishlist', { b: mywishlistdata[0].mywishlist, noof: " " })
        }

    }
})


app.get('/profile', async (req, res) => {
    if (typeof uname == 'undefined') {
        res.redirect("/login")
    }
    let udetails = await userdetails.find({ name: uname })
    res.render('userprofile', { udetails: udetails[0] })
})

app.post('/edit', async (req, res) => {
    let unamenew = req.body.name;
    let uphonenumbernew = req.body.phonenumber;
    let udobnew = req.body.dob;
  
    if (typeof uname == 'undefined') {
        res.redirect("/login")
    }
    else {
        var cou = 0
        let allusernames = await userdetails.find({})
        for (let i = 0; i < allusernames.length; i++) {
            if (allusernames[i].name == unamenew) {
                cou = 1
            }
        }

        if (cou == 1) {
            notifier.notify({
                title: 'Username already exists',
                message: 'Try using another username'
            });
            res.redirect("/editprofile")
        }
        else {
            if(unamenew==""){
                unamenew=uname
            }
            if(uphonenumbernew==""){
                 uphonenumbernew=uphonenumber
            }
            if(udobnew==""){
                udobnew=udob
            }
            await userdetails.updateOne({ name: uname }, { $set: { phonenumber: uphonenumbernew, dob: udobnew, name: unamenew } })
            uname = unamenew
            res.redirect("/landingpage")
        }
    }
})
app.post('/changep', async (req, res) => {
    let oldpassword = req.body.oldpassword;
    let newpassword = req.body.newpassword;
    let confirmpassword = req.body.confirmpassword;
    let variable1 = 0
    if (typeof uname == 'undefined') {
        res.redirect("/login")
    }
    else {
        if (!(validatePassword(newpassword, 8))) {
            notifier.notify({
                title: 'Password should be strong',
                message: 'Password should must contain atleast : one specialcharacter, one lowercase, one uppercase, one digit'
            });
            variable1 = 1
        }
        else {
            let oldp = await userdetails.find({ name: uname })
            if (oldpassword === oldp[0].password) {
                if (newpassword === confirmpassword) {
                    let date = new Date();
                    let fdate1 = `${date}`.split("GMT")[0]
                    let fdate = fdate1.slice(0, fdate1.length - 9).slice(4)
                    await userdetails.updateOne({ name: uname }, { $set: { password: newpassword , lastdatepassword: fdate} })
                    res.redirect("/landingpage")
                }
                else {
                    notifier.notify({
                        title: 'Paassword dont matched',
                        message: '.'
                    });
                    variable1 = 1
                }
            }
            else {
                notifier.notify({
                    title: 'Please enter correct password',
                    message: 'Check old password correctly'
                });
                variable1 = 1
            }
            if (variable1 == 1) {
                res.redirect("/changepassword")
            }

        }
    }

})

app.get('/editprofile', (req, res) => {
    res.render('editprofile', { foo: "foo" })
})

app.get('/changepassword', (req, res) => {
    res.render('changepassword', { foo: "foo" })
})
async function removebook(){
let allbooks=await details.find({})
allbooks.forEach(element => {
    app.get(`/wishlist/${element.title.replaceAll(" ","%20")}`,async(req,res)=>{
        if(typeof uname==='undefined'){
            res.redirect("/login")
        }
        else{
            await userdetails.updateOne(
                { name:uname },
                { $pull: { mywishlist: { title:element.title } } }
            );
            res.redirect("/wishlist")
        }
    })
});
}
removebook()


app.listen(port, () => {
    console.log(`Example listening on port ${port}`)
})
