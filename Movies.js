const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect(process.env.DB);
// Movie schema
const MovieSchema = new Schema({
    title: {type: String, required: true, index: true},
    releaseDate: Date,
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
});

// return the model
const Movie = mongoose.model('Movie', MovieSchema);

const addMovies = [
    {
        title: "The Godfather",
        releaseDate: new Date('1972-03-24'),
        genre: 'Drama',
        actors: [{actorName: "Al Pacino", characterName: "Michael Corleone"}, {actorName: "Marlon Brando", characterName: "Vito Corleone"}, {actorName: "------", characterName:"------"}
        ]
    },
    {
        title: "Seven",
        releaseDate: new Date('1995-09-22'),
        genre: 'Mystery',
        actors: [{actorName: "Morgan Freeman", characterName: "William Somerset"}, {
            actorName: "Brad Pitt",
            characterName: "David Mills"
        },{
            actorName:"-------",
            characterName:"------"
        }
        ]
    },
    {
        title: "Scarface",
        releaseDate: new Date('1983-12-09'),
        genre: 'Thriller',
        actors: [{actorName: "Al Pacino", characterName: "Tony Montana"}]
    },
    {
        title: "The Sandlot",
        releaseDate: new Date('1993-04-07'),
        genre: 'Comedy',
        actors: [{actorName: "Thomas Guiry", characterName: "Scottie Smalls"}]
    },
    {
        title: "The Pursuit of Happyness",
        releaseDate: new Date('2006-12-15'),
        genre: 'Drama',
        actors: [{actorName: "Will Smith", characterName: "Chris Gardner"}]
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