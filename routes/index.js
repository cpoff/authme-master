var express = require('express');
var router = express.Router();
var app = require('../app')
var knexConfig = require('../knexfile.js');
var knex = require('knex')(knexConfig);
router.get('/', function(request, response, next) {
    var username;
    if (request.cookies.username) {
        username = request.cookies.username;
    }
    else {
        username = null;
    }
    response.render('index', {
        title: "Let's do this",
        username: username
    });
});
router.post('/register', function(request, response) {
    var username = request.body.username,
        password = request.body.password,
        password_confirm = request.body.password_confirm,
        database = app.get('database');
    database('users')
        .where({
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
                console.log('Yes!');
                database('users')
                    .insert({
                        username: username,
                        password: password,
                    })
                    .then(function() {
                        response.cookie('username', username)
                        response.redirect('/');
                    });
                return;
            }
            else {
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
module.exports = router;