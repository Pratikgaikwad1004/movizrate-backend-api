const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReviewSchema = new Schema({
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
    review: {
        type: String,
        required: true
    }
});

const Review = mongoose.model("review", ReviewSchema);
Review.createIndexes();
module.exports = Review;
