var express = require('express');
var router = express.Router();
var app = require('../app')
var knexConfig = require('../knexfile.js');
var knex = require('knex')(knexConfig);
var pwd = require('pwd');
router.get('/', function(request, response, next) {
    var username;
    if (request.cookies.username != undefined) {
        username = request.cookies.username;
        database = app.get('database');
        database('tweets').select().then(function(retreivePosts) {
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
                // Tweets: tweets
        });
    };
});
//        --------------------
//        REGISTRATION
//        --------------------
//        The user's registration info:  
router.post('/register', function(request, response) {
    var username = request.body.username,
        password = request.body.password,
        password_confirm = request.body.password_confirm,
        database = app.get('database');
    database('users').where({
        'username': username
    }).then(function(records) {
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
            var raw = {
                name: username,
                password: password
            };
            var stored = {
                name: 'username',
                salt: '',
                hash: ''
            };
            //            function register(raw) {
            pwd.hash(raw.password, function(err, salt, hash) {
                stored = {
                    name: raw.name,
                    salt: salt,
                    hash: hash
                };
                console.log(stored);
                database('users').insert({
                    //HASH/SALT INSERT TO DB HERE
                    username: stored.name,
                    salt: stored.salt,
                    hash: stored.hash
                }).then(function() {
                    response.cookie('username', username)
                    response.redirect('/');
                })
                return;
            });
            //            }
            //            register(raw);
        } else {
            response.render('index', {
                error: "Bad pwd, fool."
            })
            console.log('Nope');
        }
    })
});

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
            //                function authenticate(attempt) {
            pwd.hash(password, user.salt, function(err, hash) {
                if (hash === user.hash) {
                    console.log('Success!')
                    response.cookie('username', username);
                    response.redirect('/');
                }
            })
        };
    })
});

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