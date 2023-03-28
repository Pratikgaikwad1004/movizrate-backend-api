const mongoose = require("mongoose");
const { Schema } = mongoose;

const OTTSchema = new Schema({
  movieId: {
    type: Schema.Types.ObjectId,
    ref: "Movie",
    rewuired: true
  },
  ottname: {
    type: String,
    required: true
  }
});

const Ott = mongoose.model("ott", OTTSchema);
Ott.createIndexes();
module.exports = Ott;
