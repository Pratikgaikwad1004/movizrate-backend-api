const mongoose = require("mongoose");
const { Schema } = mongoose;

const MovieActorsSchema = new Schema({
    movieId: {
        type: Schema.Types.ObjectId,
        ref: "Movie",
        required: true
    },
    actorId: {
        type: Schema.Types.ObjectId,
        ref: "Actor",
        required: true
    },
});

const MovieActors = mongoose.model("movieactors", MovieActorsSchema);
MovieActors.createIndexes();
module.exports = MovieActors;
