var express = require('express');
var router = express.Router();
var app = require('./app')
var knexConfig = require('../knexfile.js');
var knex = require('knex')(knexConfig);
var redis = require("redis"),
    client = redis.createClient();



router.get('/', function(request, response, next) {
	console.log('Get some!');
	cache.lrange('tweets', 0, -1, function(err, results) {
		if (results.length < 1) {
		knex('tweets').select().then(function(results) {
			// set the cache
			cache.lpush('tweets', results);
			//response to browser
			response.render('template', {tweets: results});
		})
	} else {
		response.render('index', {tweets: results});
	}
})
}, 3000);