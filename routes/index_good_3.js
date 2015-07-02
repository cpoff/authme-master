var express = require('express');
var router = express.Router();
var app = require('../app')
var knexConfig = require('../knexfile.js');
var knex = require('knex')(knexConfig);
var uuid = require('node-uuid');
var nodemailer = require('nodemailer');
var nonce = uuid.v4();


var nonce = uuid.v4();
console.log(nonce);

    // --------------------
    // BUILD INDEX PAGE
    // --------------------
router.get('/', function(request, response, next) {
    var username;
    if (request.cookies.username != undefined) {
        username = request.cookies.username;
        database = app.get('database');
        database('tweets')
            .select()
            .then(function(retreivePosts) {
                retreivePosts.sort(function(a, b) {
                    if (a.post_number < b.post_number) {
                        return -1;
                    }
                    if (a.post_number > b.post_number) {
                        return 1;
                    }
                    else {
                        return 0;
                    }
                })
                response.render('index', {
                    username: username,
                    tweets: retreivePosts
                });
            })
    }
    else {
        username = null;
        response.render('index', {
            title: "Let's do this",
            username: username
                // Tweets: tweets
        });
    }
});
    // --------------------
    // REGISTER
    // --------------------
router.post('/register', function(request, response) {
    var username = request.body.username,
        password = request.body.email,
        password = request.body.password,
        password_confirm = request.body.password_confirm,
        database = app.get('database');
        database('users').where({
            'username': username
        })
        .then(function(records) {
            if (records.length > 0) {
                response.render('index', {
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
                console.log('Incomplete');
                return;
            }
            if (password === password_confirm) {
                response.render('pending'),
                console.log("Got it.")
            } else {
                response.render('index', {
                user: null,
                error: "Got it."
                })
            }
        });

// create reusable transporter object using SMTP transport 
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'curt.poff@gmail.com',
        pass: 'f@tback2069'
    }
});
 
// NB! No need to recreate the transporter object. You can use 
// the same transporter object for all e-mails 
 
// setup e-mail data with unicode symbols 
var mailOptions = {
    from: 'Curt Poff ✔ <curt.poff@gmail.com>', // sender address 
    to: 'curt.poff@gmail.com', // list of receivers 
    subject: 'Hello ✔', // Subject line 
    text: 'Get some ✔', // plaintext body 
    html: '<b>Get some ✔</b>' // html body 
};
 
// send mail with defined transport object 
transporter.sendMail(mailOptions, function(error, info) {
    if(error) {
        console.log(error);
    } else { 
        console.log('Message sent: ' + info.response);
    }
});



// validate email using nonce
// send email for verification, then redirect to 'pending' jade view

            //     database('users').insert({
            //             username: username,
            //             password: password,
            //         })
            //         .then(function() {
            //             response.cookie('username', username)
            //             response.redirect('/');
            //         });
            //     return;
            // }
});


// add new route for validate user (GET)
// router.get('/verify_email/:nonce', function(request, response) {

    // --------------------
    // LOGIN
    // --------------------
router.post('/login', function(request, response) {
    var username = request.body.username,
        password = request.body.password,
        database = app.get('database');
    database('users')
        .where({
            'username': username
        })
        .then(function(records) {
            if (records.length === 0) {
                response.render('index', {
                    title: "You don't exist!",
                    user: null,
                    error: "No such user"
                });
            }
            else {
                var user = records[0];
                if (user.password === password) {
                    response.cookie('username', username);
                    response.redirect('/');
                }
                else {
                    response.render('index', {
                        title: 'ERROR!',
                        user: null,
                        error: "Learn how to type, you jackass!"
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
    database('tweets')
        .insert({
            twit: tweet,
            username: tweeter,
            dateTime: new Date(Date.now())
        })
        .then(function() {
            response.redirect('/');
        });
});

module.exports = router;

