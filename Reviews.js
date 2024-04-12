const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect(process.env.DB);

const reviewSchema = new mongoose.Schema({
    movieId: { type: Schema.Types.ObjectId, ref: 'Movie' },
    username: String,
    review: String,
    rating: { type: Number, min: 0, max: 5 }
});


reviewSchema.index({ movieId: 1});
//return
const Review = mongoose.model('Review', reviewSchema);


module.exports = Review;