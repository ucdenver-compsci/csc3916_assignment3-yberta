/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */
require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');
var Review = require('./Reviews');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});

router.post('/movies', authJwtController.isAuthenticated, function(req, res){
    if (!req.body.title || !req.body.releaseDate || !req.body.genre || !req.body.actors) {
        res.status(400).json({
            success: false,
            msg: "Please provide title, date, genre, and at least 3 actors of the movie."
        });
    }
        else{
            var movie = new Movie();
            movie.title = req.body.title;
            movie.releaseDate = req.body.releaseDate;
            movie.genre = req.body.genre;
            movie.actors = req.body.actors;

            movie.save(function(err){
                if (err){
                    res.status(401).json({success: false, msg: "Error saving movie."});
                }
                else{
                    res.json({success: true, msg: "Movie saved successfully."});
                }
            });
        }
});

router.get('/movies', authJwtController.isAuthenticated, function(req,res){
    Movie.find({}, function(err, movies){
        if (err) {
            return res.status(500).send(err);
        }else{
        res.json(movies);
        }
    });
});

router.get('/movies/:movieParameter',authJwtController.isAuthenticated, function(req, res){
    Movie.findOne({title: req.params.movieParameter}, function(err, movie){
        if (err) res.status(500).send(err);
        else if (!movie) res.status(404).json({msg:"Movie not found."});
        else res.json(movie);
    });
});

router.put('/movies/:movieParameter', authJwtController.isAuthenticated, function(req, res){
    Movie.findOneAndUpdate({title: req.params.movieParameter}, req.body,{new: true},function(err, movie){
        if(err) res.status(500).send(err);
        else if (!movie) res.status(404).json({msg: "Movie not found."});
        else res.json(movie);
    });
});

router.delete('/movies/:movieParameter', authJwtController.isAuthenticated, function(req, res){
    Movie.findOneAndDelete({title: req.params.movieParameter}, function(err, movie){
        if(err) res.status(500).send(err);
        else if (!movie) res.status(500).json({msg: "Movie not found."});
        else res.json({message: 'Movie successfully deleted.'});
    });
});

router.post('/reviews', authJwtController.isAuthenticated, function(req, res){
    if(!req.body.movieId || !req.body.review || !req.body.rating ){
        return res.status(400).json({
            success: false,
            message: "Please provide movieId, review, and a rating."
        });
    }else{
        var review = new Review();
        review.movieId = req.body.movieId;
        review.username = req.body.username;
        review.review = req.body.review;
        review.rating = req.body.rating;

        review.save(function(err){
            if (err){
                return res.status(500).json({
                    success: false,
                    message: "Error saving review."
                });
            }else{
                res.json({
                    success: true,
                    message: "Review created!"
                });
            }
        });
    }
});

router.get('/reviews/:movieId', function(req, res){
    Review.find({movieId: req.params.movieId}, function(err, movies){
        if(err){
            return res.status(500).send(err);
        }else if(req.body.length===0){
            return res.status(404).json({msg:"No movies found."});
        }else{
            res.json(review);
        }
    });

});


app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


