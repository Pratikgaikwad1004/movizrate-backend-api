const mongoose = require("mongoose");
const { Schema } = mongoose;

const PlaylistSchema = new Schema({
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
});

const Playlist = mongoose.model("playlist", PlaylistSchema);
Playlist.createIndexes();
module.exports = Playlist;
