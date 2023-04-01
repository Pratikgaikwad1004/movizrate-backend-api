const mongoose = require("mongoose");
const { Schema } = mongoose;

const MovieSchema = new Schema({
    image: {
        type: String,
        required: true
    },
    posterImage: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    videoID: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    totalratings: {
        type: Number,
        default: 0
    },
    upcomming: {
        type: Boolean,
        default: false
    }
});

const Movie = mongoose.model("movies", MovieSchema);
Movie.createIndexes();
module.exports = Movie;
