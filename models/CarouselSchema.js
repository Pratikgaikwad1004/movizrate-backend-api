const mongoose = require("mongoose");
const { Schema } = mongoose;

const CarouselSchema = new Schema({
    movieId: {
        type: Schema.Types.ObjectId,
        ref: "Movie",
        required: true
    },
});

const Carousel = mongoose.model("carousel", CarouselSchema);
Carousel.createIndexes();
module.exports = Carousel;
