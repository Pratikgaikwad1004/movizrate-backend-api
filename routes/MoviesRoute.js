const express = require("express");
const router = express.Router();
const fs = require('fs');

const multer = require("multer");
const Actor = require("../models/ActorsSchema");
const MovieActors = require("../models/MovieActors");
const Movie = require("../models/MovieSchema");

// Code for upload image using multer
const storageImage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "images/");
    },
    filename: function (req, file, cb) {
        let fileExeArr = file.originalname.split(".");
        let extension = fileExeArr[fileExeArr.length - 1];
        cb(null, Date.now() + `.${extension}`);
    },
    fileFilter: function (req, file, cb) {
        if (file === null) {
            return cb(new Error("File cannot be empty."));
        }
    },
});
const uploadImage = multer({ storage: storageImage });

router.post("/uploadimage", uploadImage.single("file"), (req, res) => {
    if (req.file === null) {
        res.status(400).json({ msg: "No file found" });
    }
    res.json({
        filePath: `http://localhost:3000/${req.file.filename}`,
        fileName: req.file.filename,
        msg: "Image uploaded",
    });
})


router.delete("/deleteimage/:name", (req, res) => {
    const path = "images/"
    fs.unlinkSync(path + req.params.name);
    res.json({ deleted: true });
})


router.post("/uploadmovie", async (req, res) => {
    const { image, posterImage, name, genre, type, videoID, desc } = req.body;

    try {
        const movie = await Movie.create({
            image: image,
            posterImage: posterImage,
            name: name,
            genre: genre,
            desc: desc,
            type: type,
            videoID: videoID
        });

        if (!movie) {
            return res.status(400).json({ msg: "Not Uploaded" })
        }

        res.json({ uploaded: true });
    } catch (error) {
        res.json({ error })
    }

})


router.post("/addactor", async (req, res) => {
    const { image, name, type } = req.body;

    try {
        const actor = await Actor.create({
            image: image,
            name: name,
            type: type
        });

        if (!actor) {
            return res.status(400).json({ msg: "Not Uploaded" })
        }

        res.json({ uploaded: true });
    } catch (error) {
        res.json({ error })
    }

});


router.post("/searchactor/:name", async (req, res) => {
    try {
        const actor = await Actor.find({ name: { "$regex": req.params.name, "$options": "i" } });
        console.log(actor);

        if (actor.length === 0) {
            return res.status(400).json({ msg: "No actors" })
        }

        res.json({ actors: actor });
    } catch (error) {
        res.json({ error })
    }

});

router.post("/searchmovie/:name", async (req, res) => {
    try {
        const movie = await Movie.find({ name: { "$regex": req.params.name, "$options": "i" } });
        console.log(movie);

        if (movie.length === 0) {
            return res.status(400).json({ msg: "No actors" })
        }

        res.json({ movies: movie });
    } catch (error) {
        res.json({ error })
    }

});

router.post("/addmovieactor", async (req, res) => {
    const { movieID, actorID } = req.body;
    try {
        const movie = await MovieActors.findOne({ movieId: movieID, actorId: actorID });
        if (movie) {
            return res.status(400).json({ error: "Movie and Actor already added" })
        }
        const movieactors = await MovieActors.create({
            movieId: movieID,
            actorId: actorID
        });

        if (!movieactors) {
            return res.status(400).json({ error: "Not Uploaded" })
        }

        res.json({ msg: true });
    } catch (error) {
        res.json({ error })
    }
});


router.post("/getlatestmovies", async (req, res) => {
    try {
        const movies = await Movie.find({ type: "movie" }).sort({ _id: -1 }).limit(10);
        if (!movies) {
            return res.status(400).json({ error: "Can't get movies" })
        }
        res.json({ movies: movies });
    } catch (error) {
        console.log(error);
    }
});

router.post("/getmoviecast/:movieid", async (req, res) => {
    try {
        const movieactors = await MovieActors.find({ movieId: req.params.movieid });
        if (movieactors.length === 0) {
            return res.status(400).json({ error: "Can't get movie actors" })
        }

        const actors = await Actor.find({
            _id: movieactors.map((ele) => {
                return ele.actorId;
            })
        })
        res.json({ actors: actors });
    } catch (error) {
        console.log(error);
    }
});

router.post("/getlatesttvseries", async (req, res) => {
    try {
        const movies = await Movie.find({ type: "tvseries" }).sort({ _id: -1 }).limit(10);
        if (!movies) {
            return res.status(400).json({ error: "Can't get TV-Series" })
        }
        res.json({ series: movies });
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
