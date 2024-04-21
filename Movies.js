const mongoose = require('mongoose');
const Schema = mongoose.Schema;

try {
    mongoose.connect(process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected"));
}catch (error) {
    console.log("could not connect");
}
mongoose.set('useCreateIndex', true);
// Movie schema
const MovieSchema = new Schema({
    title: {type: String, required: true, index: true},
    releaseDate: {type:Date, required: true},
    genre:{
        type: String,
        enum: [
            'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Thriller', 'Western', 'Science Fiction'
        ],
    },
    actors:[{
        actorName: String,
        characterName: String,
    }],
    avgRating: {type: Number, default: 0},
    imageUrl : String
});

/*const reviewSchema = new mongoose.Schema({
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
    username: String,
    review: String,
    rating: { type: Number, min: 0, max: 5 }
});*/


MovieSchema.index({ title: 1, releaseDate: 1 }, { unique: true });
// return the model
const Movie = mongoose.model('Movie', MovieSchema);

/*reviewSchema.index({ movieId: 1});
//return
const Review = mongoose.model('Review', reviewSchema);*/

const addMovies = [
    {
        title: "The Godfather",
        releaseDate: new Date('1972-03-24'),
        genre: 'Drama',
        actors: [{actorName: "Al Pacino", characterName: "Michael Corleone"}, {actorName: "Marlon Brando", characterName: "Vito Corleone"}, {actorName: "James Caan", characterName:"Sonny Corleone"}
        ],
        imageUrl : "https://assignment3react.s3.us-east-2.amazonaws.com/theGodfather.jpg"
    },
    {
        title: "Seven",
        releaseDate: new Date('1995-09-22'),
        genre: 'Mystery',
        actors: [{actorName: "Morgan Freeman", characterName: "William Somerset"}, {actorName: "Brad Pitt", characterName: "David Mills"},{actorName:"Kevin Spacey", characterName:"John Doe"}
        ],
        imageUrl : "https://assignment3react.s3.us-east-2.amazonaws.com/MV5BZDgyZmY5MmItY2I3Ny00NjA4LWFhNmItMGQ4ZGJhZDk5YjU3XkEyXkFqcGdeQXVyMTAzMDM4MjM0._V1_.jpg"
    },
    {
        title: "Scarface",
        releaseDate: new Date('1983-12-09'),
        genre: 'Thriller',
        actors: [{actorName: "Al Pacino", characterName: "Tony Montana"}, {actorName: "Steven Bauer", characterName: "Manny Ribera"}, {actorName: "Michelle Pfeiffer", characterName: "Elvira Hancock"}
        ],
        imageUrl : "https://assignment3react.s3.us-east-2.amazonaws.com/MV5BNjdjNGQ4NDEtNTEwYS00MTgxLTliYzQtYzE2ZDRiZjFhZmNlXkEyXkFqcGdeQXVyNjU0OTQ0OTY%40._V1_.jpg"
    },
    {
        title: "The Sandlot",
        releaseDate: new Date('1993-04-07'),
        genre: 'Comedy',
        actors: [{actorName: "Thomas Guiry", characterName: "Scottie Smalls"}, {actorName: "Mike Vitar", characterName:"Benjamin Franklin Rodriguez"}, {actorName: "Patrick Renna", characterName:"Hamilton Porter"}
        ],
        imageUrl : "https://assignment3react.s3.us-east-2.amazonaws.com/The-sandlot-scaled.jpg"
    },
    {
        title: "The Pursuit of Happyness",
        releaseDate: new Date('2006-12-15'),
        genre: 'Drama',
        actors: [{actorName: "Will Smith", characterName: "Chris Gardner"}, {actorName: "Brian Howe", characterName: "Jay Twistie"}, {actorName: "Jaden Smith", characterName: "Christopher"}
        ],
        imageUrl : "https://assignment3react.s3.us-east-2.amazonaws.com/thepursuitofhappyness_onesheet_1400x2100.png"
    },
    {
        title: "Inception",
        releaseDate: new Date('2010-07-16'),
        genre: 'Science Fiction',
        actors: [{actorName: "Leonardo DiCaprio", characterName: "Cobb"}, {actorName: "Joseph Gordon-Levitt", characterName: "Arthur"}, {actorName: "Cillian Murphy", characterName: "Fischer"}
        ],
        imageUrl : "https://assignment3react.s3.us-east-2.amazonaws.com/inception.jpg"
    }
];

Movie.create(addMovies, function(err, movies){
    if (err){
        console.error("Error adding movies", err);
    } else{
        console.log("Movies added", movies)
    }
});

module.exports = Movie;