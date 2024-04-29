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
const {Types} = require("mongoose");

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
    Movie.aggregate([
        {
            $lookup: {
                from: "reviews",
                localField: "_id",
                foreignField: "movieId",
                as: "movieReviews"
            }
        },
        {
            $addFields: {
                avgRating: { $avg: "$movieReviews.rating" }
            }
        },
        {
            $sort: { avgRating: -1 }
        }
    ]).exec((err, movies) => {
        if (err) {
            console.error("Error in aggregation: ", err);
            return res.status(500).send(err);
        }
        res.json(movies);
    });
});

/*router.get('/movies/:movieParameter',authJwtController.isAuthenticated, function(req, res){
    Movie.findOne({title: req.params.movieParameter}, function(err, movie){
        if (err) res.status(500).send(err);
        else if (!movie) res.status(404).json({msg:"Movie not found."});
        else res.json(movie);
    });
});*/


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
        review.username = req.user.username;
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

router.get('/reviews', function(req, res){
    Review.find({}, function(err, review){
        if(err){
            return res.status(500).send(err);
        }else if(req.body.length===0){
            return res.status(404).json({msg:"No movies found."});
        }else{
            res.json(review);
        }
    });

});


router.get('/movies/:movieId', authJwtController.isAuthenticated, function(req, res){
    var movieSearch = new Movie();
    movieSearch.movieId = req.params.movieId;
    if (req.query.reviews === 'true') {
        Movie.aggregate([
            {
                $lookup: {
                    from: "reviews", // name of the foreign collection
                    localField: "_id", // field in the orders collection
                    foreignField: "movieId", // field in the items collection
                    as: "movieReviews" // output array where the joined items will be placed
                }
            },
            {
                $match: { _id: Types.ObjectId(req.params.movieId) } // Ensure this is the first stage
            }, {
                $addFields: {
                    avgRating: {$avg: '$movieReviews.rating'}
                }
            },
            {
                $sort: {avgRating: -1}
            }
        ]).exec(function (err, movies) {
            if (err) {
                res.status(500).send({message: "Issue fetching movie"});
            } else if (!movies || movies.length === 0) {
                res.status(404).json({success: false, message: "No movies found."});
            } else {
                res.json(movies[0]);
            }
        });
    } else {
        Movie.findById(req.params.movieId, function(err, movie){
            if (err) res.status(500).send(err);
            else if (!movie) res.status(404).json({msg:"Movie not found."});
            else res.json(movie);
        });
    }
});
app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


