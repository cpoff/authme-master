var express = require('express');
var router = express.Router();
var app = require('../app')
var knexConfig = require('../knexfile.js');
var knex = require('knex')(knexConfig);
var uuid = require('node-uuid');
var nodemailer = require('nodemailer');
var nonce = uuid.v4();
console.log(nonce);
usersToAdd = [];

// --------------------
// REGISTER
// --------------------
router.post('/register', function(request, response) {
    var username = request.body.username,
        email = request.body.email,
        password = request.body.password,
        password_confirm = request.body.password_confirm,
        database = app.get('database');
    database('users').where({
        'username': username
    }).then(function(records) {
        if (records.length > 0) {
            response.render('pending', {
                user: null,
                error: "Please complete all the fields."
            })
            return;
        }
        if (!password || !username) {
            response.render('index', {
                user: null,
                error: "Please fill out the form completely"
            });
            return;
        }
        if (password === password_confirm) {
            response.render('pending'),
                usersToAdd.push({
                    nonce: nonce,
                    username: username,
                    password: password,
                    email: email
                });
        } else {
            response.render('index', {
                user: null,
                error: "Not sure what happened. Try again."
            })
        }
    });
    // create reusable transporter object using SMTP transport 
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'XXX',
            pass: 'XXX'
        }
    });
    // NB! No need to recreate the transporter object. You can use 
    // the same transporter object for all e-mails 
    // setup e-mail data with unicode symbols 
    var mailOptions = {
        from: 'Curt Poff ✔ <XXX>', // sender address 
        to: email, // list of receivers 
        subject: 'Hello ✔', // Subject line 
        text: 'Get some ✔', // plaintext body 
        html: '<a href="http://localhost:3000/verify_email/' +
            nonce + '">Get some!</a>' // html body 
    };
    // send mail with defined transport object 
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email is on the way: ' + info.response);
        }
    });
});
// --------------------
// VERIFICATION
// --------------------
router.get('/verify_email/:nonce', function(request, response) {
    database = app.get('database');
    var returnedNonce = request.params.nonce;
    console.log(usersToAdd);
    // iterate through usersToAdd array and add user to db if nonce match is found
    usersToAdd.forEach(function(user) {
        if (user.nonce === returnedNonce) {
            database('users').insert({
                username: user.username,
                password: user.password
            }).then(function() {
                response.cookie('username', user.username)
                response.redirect('/');
            })
        }
    })
});
// --------------------
// BUILD INDEX PAGE
// --------------------
router.get('/', function(request, response, next) {
    var username;
    if (request.cookies.username != undefined) {
        username = request.cookies.username;
        database = app.get('database');
        database('tweets').select().then(function(retreivePosts) {
            // retreivePosts.reverse
            retreivePosts.sort(function(a, b) {
                if (a.post_number > b.post_number) {
                    return -1;
                }
                if (a.post_number < b.post_number) {
                    return 1;
                } else {
                    return 0;
                }
            })
            response.render('index', {
                username: username,
                tweets: retreivePosts
            });
        })
    } else {
        username = null;
        response.render('index', {
            title: "Let's do this",
            username: username
        });
    }
});
// --------------------
// LOGIN
// --------------------
router.post('/login', function(request, response) {
    var username = request.body.username,
        password = request.body.password,
        database = app.get('database');
    database('users').where({
        'username': username
    }).then(function(records) {
        if (records.length === 0) {
            response.render('index', {
                title: "You don't exist!",
                user: null,
                error: "No such user"
            });
        } else {
            var user = records[0];
            if (user.password === password) {
                response.cookie('username', username);
                response.redirect('/');
            } else {
                response.render('index', {
                    title: 'ERROR!',
                    user: null,
                    error: "Learn how to type, jackass!"
                });
            }
        }
    });
});
// --------------------
// SEND TWEETS
// --------------------
router.post('/sendtweet', function(request, response) {
    var tweet = request.body.tweet,
        tweeter = request.cookies.username,
        database = app.get('database');
    database('tweets').insert({
        twit: tweet,
        username: tweeter,
        dateTime: new Date(Date.now())
    }).then(function() {
        response.redirect('/');
    });
});
module.exports = router;
