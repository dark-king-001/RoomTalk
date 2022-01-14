// loading express to initiate server
const express = require("express");
const mongoose = require("mongoose");
var session = require('express-session');
var bodyParser = require('body-parser');
const path = require('path');
const querystring = require("querystring");

const loginData = require("./models/loginData");
const chatData = require("./models/chatData");
const roomRegister = require("./models/RoomRegister");
const roomVisited = require("./models/RoomVisited");

const  mongoAtlasUri =
        "mongodb+srv://pk1211:KINGSTAR@indevelopment.biwjr.mongodb.net/gamma?retryWrites=true&w=majority";
//mongoose.connect(mongoAtlasUri,{useNewUrlParser:true, useUnifiedTopology : true})
//    .then( () => {
//        console.log("db online connection Confirmed");
//    })
//    .catch((err) => {
//        console.log("Something went wrong with the dataBase");
//        console.log(err);
//    })
mongoose.connect("mongodb://localhost:27017/gamma",{useNewUrlParser:true, useUnifiedTopology : true})
    .then( () => {
        console.log("db offline connection Confirmed");
    })
    .catch((err) => {
        console.log("Something went wrong with the dataBase");
        console.log(err);
    })
const app = express();
var db = mongoose.connection;
app.set('view engine','ejs');

// setting paths and loading data
app.set('views',path.join(__dirname,'/views'));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

var Chat;
var Visit;
var ChatNo;

app.get('/',(req,res) => {
    res.redirect('/home');
})
app.get('/home',async (req, res) => {
    if (req.session.RoomID !== undefined){
        Chat = await chatData.find({RoomID : req.session.RoomID});
        Chat.map(doc => doc.Date).sort();
        Chat = Chat.reverse();
    }
    if (req.session.loggedin !== true){
        res.redirect('/login');
    } else {
        const object = {
            siteName : 'Home',
            username : req.session.username,
            isloggedin : req.session.loggedin,
            RoomID : req.session.RoomID,
            Chats : Chat,
            RoomEntered : req.session.RoomEntered
        };
        res.render('home.ejs',{object});
    }
});
app.post('/sendMessage', async (req, res) => {
    if (req.body.Message !== ""){
        const ChatData = {
            sentBy : req.session.username,
            RoomID : req.session.RoomID,
            body : req.body.Message
        };
        console.log("message sent :: " + req.body.Message)
        const newChatdata = new chatData(ChatData);
        newChatdata.save();
    }
    res.redirect('/home');
});
app.get('/signout', (req, res) => {
    req.session.username = undefined;
    req.session.loggedin = false;
    req.session.RoomID = undefined;
    req.session.RoomEntered = false;
    console.log('user signed out ' + req.session.username + " :: " + req.session.loggedin);
    res.redirect('/home');
});
app.get('/LeaveRoom', (req, res) => {
    console.log('user Left The room ' + req.session.username + " :: " + req.session.RoomID);
    req.session.RoomID = undefined;
    req.session.RoomEntered = false;    
    res.redirect('/home');
});
app.get('/switchacc', (req, res) => {
    req.session.username = undefined;
    req.session.loggedin = false;
    req.session.RoomID = undefined;
    req.session.RoomEntered = false;
    const object = {
        siteName : 'Login',
        username : req.session.username,
        isloggedin : req.session.loggedin,
        RoomID : req.session.RoomID,
        RoomEntered : req.session.RoomEntered
    };
    res.render('login.ejs',{object});
});
app.get('/profile',async (req, res) => {
    const docs = await loginData.find({username : req.session.username});
    docs.map(doc => doc.username).sort();

    if (req.session.loggedin === true){
        Visit = await roomVisited.find({visitedBy : req.session.username});
        Visit.map(doc => doc.Date).sort();
        Visit = Visit.reverse();
    }
    const object = {
        siteName : 'Profile',
        username : req.session.username,
        isloggedin : req.session.loggedin,
        Description : docs[0].Description,
        email : docs[0].email,
        RoomID : req.session.RoomID,
        RoomEntered : req.session.RoomEntered,
        Visits : Visit
    };
    res.render('profile.ejs',{object});
});
app.get('/settings',async (req, res) => {
    const object = {
        siteName : 'Settings',
        username : req.session.username,
        isloggedin : req.session.loggedin,
        RoomID : req.session.RoomID,
        RoomEntered : req.session.RoomEntered
    };
    res.render('settings.ejs',{object});
});
app.get('/newRoomID', (req, res) => {
    const object = {
        siteName : 'Room ID Registeration',
        username : req.session.username,
        isloggedin : req.session.loggedin,
        RoomID : req.session.RoomID
    };
    res.render('newRoomID.ejs',{object});
});
app.post('/authnewRoomID', async (req, res) => {
    const docs = await roomRegister.find({RoomID : req.body.newRoomID});
    docs.map(doc => doc.RoomID).sort();
    if (docs[0] === undefined && req.body.newRoomID !== "" && req.session.loggedin === true){
        console.log('Room does not exist registering Room');
        const RoomData = {
            RoomID : req.body.newRoomID,
            createdBy : req.session.username
        };
        const newRoomdata = new roomRegister(RoomData);
        newRoomdata.save();
        req.session.RoomID = req.body.newRoomID;
        res.redirect('/home');
    } else {
        console.log('Room already exists or user is not logged in');
        res.redirect('/newRoomID');
    }
});
app.post('/authRoomID', async (req, res) => {
    const Room = await roomRegister.find({RoomID : req.body.RoomID});
    Room.map(doc => doc.RoomID).sort();
    if (req.body.RoomID) {
        if (Room[0] !== undefined){
            if (req.body.RoomID !== "" && req.session.loggedin === true){
                req.session.RoomID = req.body.RoomID;
                req.session.RoomEntered = true;
                console.log("Room entered :: " + req.session.RoomID);
                const Roomvisit = {
                    visitedBy : req.session.username,
                    RoomID : req.session.RoomID
                };
                const newRoomvisitdata = new roomVisited(Roomvisit);
                newRoomvisitdata.save();
            }
        } else {
            console.log('Room does not exists,incorrect RoomID');
        }
    } else {
        console.log('Please enter ID');
    }
    res.redirect('/home');
});
app.get('/login',(req, res) => {
    const object = {
        siteName : 'Login',
        username : req.session.username,
        isloggedin : req.session.loggedin,
        RoomID : req.session.RoomID
    };
    res.render('login.ejs',{object});
});
app.post('/authlogin',async (req, res) => {
    const docs = await loginData.find({username : req.body.username,password : req.body.password});
    docs.map(doc => doc.username).sort();
    if (req.body.username && req.body.password) {
        if (docs[0] !== undefined){
            req.session.loggedin = true;
            req.session.username = req.body.username;
            console.log('user logged in');
            console.log(req.body.username);
            console.log('is logged in : ' + req.session.loggedin);
        } else {
            console.log('user does not exists,incorrect id or password');
        }
    } else {
        console.log('Please enter Username and Password!');
    }
    res.redirect('/home');
});
app.get('/signup', (req, res) => {
    const object = {
        siteName : 'Signup',
        username : req.session.username,
        isloggedin : req.session.loggedin,
        RoomID : req.session.RoomID
    };
    res.render('signup.ejs',{object});
});
app.post('/authsignup',async (req, res) => {
    const docs = await loginData.find({username : req.body.username});
    docs.map(doc => doc.username).sort();
    if (docs[0] !== undefined){
        res.redirect('/signup');
    } else {
        console.log('user does not exist registering user');
        const formData = {username : req.body.username,
            password : req.body.password,
            Description : "no Description here",
            email : "no Email here"
        };
        const newuserdata = new loginData(formData);
        newuserdata.save();
        req.session.loggedin = true;
        req.session.username = req.body.username;
        res.redirect('/home');
    }
});

app.get('*',(req,res) => {
    res.send("OOPS Page Not Found");
})
app .listen(3000,()=>{
    console.log("listening on port 3000");
})