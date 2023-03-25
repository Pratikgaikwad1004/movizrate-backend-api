const mongoose = require("mongoose");
const { Schema } = mongoose;

const ActorsSchema = new Schema({
    image: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    }
});

const Actor = mongoose.model("actors", ActorsSchema);
Actor.createIndexes();
module.exports = Actor;
