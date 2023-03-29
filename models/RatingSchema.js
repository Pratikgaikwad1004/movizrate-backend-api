const mongoose = require("mongoose");
const { Schema } = mongoose;

const RatingSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    movieId: {
        type: Schema.Types.ObjectId,
        ref: "Movie",
        required: true
    },
    rating: {
        type: Number,
        required: true
    }
});

const Rating = mongoose.model("rating", RatingSchema);
Rating.createIndexes();
module.exports = Rating;
