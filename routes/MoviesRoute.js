const express = require("express");
const router = express.Router();
const fs = require('fs');

const multer = require("multer");
const Actor = require("../models/ActorsSchema");
const MovieActors = require("../models/MovieActors");
const Movie = require("../models/MovieSchema");
const Ott = require("../models/OTTSchema");
const getuser = require("../middleware/getuser");
const Rating = require("../models/RatingSchema");
const Review = require("../models/ReviewSchema");
const User = require("../models/UserSchema");
const Playlist = require("../models/PlaylistSchema");
const Carousel = require("../models/CarouselSchema");

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
    const { image, posterImage, name, genre, type, videoID, desc, upcomming } = req.body;

    try {
        const movie = await Movie.create({
            image: image,
            posterImage: posterImage,
            name: name,
            genre: genre,
            desc: desc,
            type: type,
            videoID: videoID,
            upcomming: upcomming
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
        // console.log(actor);

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
        // console.log(movie);

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
        const movies = await Movie.find({ type: "movie", upcomming: false }).sort({ _id: -1 }).limit(10);
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
        const movies = await Movie.find({ type: "tvseries", upcomming: false }).sort({ _id: -1 }).limit(10);
        if (!movies) {
            return res.status(400).json({ error: "Can't get TV-Series" })
        }
        res.json({ series: movies });
    } catch (error) {
        console.log(error);
    }
});

router.post("/getmovie/:movieid", async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.movieid)
        if (!movie) {
            return res.status(400).json({ error: "Can't get TV-Series" })
        }
        res.json({ movie: movie });
    } catch (error) {
        console.log(error);
    }
});


router.post("/addott", async (req, res) => {
    try {

        const { movieID, ottname } = req.body

        if (!movieID) {
            return res.status(400).json({ error: "Enter movieID" })
        }

        if (!ottname) {
            return res.status(400).json({ error: "Enter ottname" })
        }
        const movie = await Ott.findOne({ movieId: movieID, ottname: ottname });
        if (movie) {
            return res.status(400).json({ error: "Movie Already Added" })
        }

        const addmovie = Ott.create({
            movieId: req.body.movieID,
            ottname: req.body.ottname
        })

        if (addmovie) {
            return res.json({ status: true });
        }

        res.status(400).json({ msg: "Not Uploaded" })
    } catch (error) {
        console.log(error);
    }
});


router.post("/getottmovies", async (req, res) => {
    try {

        const primevideo = await Ott.find({ ottname: "primevideo" }).sort({ _id: -1 }).limit(10);
        const netflix = await Ott.find({ ottname: "netflix" }).sort({ _id: -1 }).limit(10);
        const hotstar = await Ott.find({ ottname: "hotstar" }).sort({ _id: -1 }).limit(10);

        const primevideoData = await Movie.find({
            _id: primevideo.map((ele) => {
                return ele.movieId;
            })
        });

        const netflixData = await Movie.find({
            _id: netflix.map((ele) => {
                return ele.movieId;
            })
        });

        const hotstarData = await Movie.find({
            _id: hotstar.map((ele) => {
                return ele.movieId;
            })
        });

        res.json({ primevideo: primevideoData, netflix: netflixData, hotstar: hotstarData });
    } catch (error) {
        console.log(error);
    }
});


router.post("/addrating", getuser, async (req, res) => {
    try {
        const user = req.user;
        const movie = req.body.movie;
        const rating = req.body.rating;

        const checkRating = await Rating.findOne({ movieId: movie, userId: user.id })

        if (!rating || !movie) {
            return res.status(400).json({ error: "Fields are empty" })
        }

        const ratemovie = await Movie.findById(movie);
        if (!checkRating) {

            ratemovie instanceof Movie
            ratemovie.totalratings = ratemovie.totalratings + 1;
            ratemovie.rating = ratemovie.rating + rating;

            await ratemovie.save();

            const ratings = await Rating.create({
                userId: user.id,
                movieId: movie,
                rating: rating
            });

            if (ratings) {
                return res.send(true);
            }
        } else {
            return res.json({ msg: "Rating already exists" });
        }

        res.send(true)
    } catch (error) {
        console.log(error);
    }
})

router.post("/getratedmovie/:movieId", getuser, async (req, res) => {
    try {
        const user = req.user.id

        const rating = await Rating.findOne({ movieId: req.params.movieId, userId: user });

        if (!rating) {
            return res.send(false);
        }
        res.json({ rating: rating.rating });
    } catch (error) {
        console.log(error);
    }
})

router.post("/addreview/:movieID", getuser, async (req, res) => {
    try {
        const { review } = req.body;
        const user = req.user.id;

        if (!review) {
            return res.json({ error: "Review is required" });
        }

        const oldreview = await Review.findOne({ userId: user, movieId: req.params.movieID });

        if (oldreview) {
            return res.json({ error: "Review already exists" });
        }

        const myuser = await User.findById(user);

        const newreview = await Review.create({
            movieId: req.params.movieID,
            userId: user,
            review: review,
            name: myuser.name
        });

        if (!newreview) {
            return res.json({ error: "Review not added" });
        }

        res.send(true);
    } catch (error) {
        console.log(error);
    }
})

router.post("/getmoviereviews/:movieID", async (req, res) => {
    try {
        const reviews = await Review.find({ movieId: req.params.movieID }).sort({ _id: -1 }).select("-userId").select("-movieId");

        res.json({ reviews: reviews });
    } catch (error) {
        console.log(error);
    }
});

router.post("/addinplaylist/:movieID", getuser, async (req, res) => {
    try {
        const user = req.user.id;
        const movieID = req.params.movieID;

        const playlist = await Playlist.findOne({ userId: user, movieId: movieID });

        if (playlist) {
            return res.json({ error: "Movie already in playlist" });
        }

        const newplaylist = await Playlist.create({
            movieId: movieID,
            userId: user
        });

        if (!newplaylist) {
            return res.json({ error: "Movie not added to playlist" });
        }

        res.send(true);

    } catch (error) {
        console.log(error);
    }
});

router.post("/getallplaylistmovies", getuser, async (req, res) => {
    try {
        const user = req.user.id;

        const playlist = await Playlist.find({ userId: user });

        const movies = await Movie.find({
            _id: playlist.map((ele) => {
                return ele.movieId;
            })
        });

        res.json({ playlist: movies });

    } catch (error) {
        console.log(error);
    }
})

router.post("/getupcommingmovies", async (req, res) => {
    try {
        const movies = await Movie.find({ upcomming: true }).sort({ _id: -1 }).limit(10);
        if (!movies) {
            return res.status(400).json({ error: "Can't get TV-Series" })
        }
        res.json({ upcomming: movies });
    } catch (error) {
        console.log(error);
    }
});

router.post("/addincarousel/:movieID", async (req, res) => {
    try {
        const movieID = req.params.movieID;

        const movie = await Movie.findById(movieID);
        if (!movie) {
            return res.status(400).json({ error: "Movie not found" });
        }

        const oldcarousel = await Carousel.findOne({ movieId: movieID });

        if (oldcarousel) {
            return res.status(400).json({ error: "Carousel already exists" });
        }
        const carousel = await Carousel.create({
            movieId: movieID
        });
        if (!carousel) {
            return res.status(400).json({ error: "Can't add carousel" });
        }

        res.json(true);
    } catch (error) {
        console.log(error);
    }
});

router.post("/getcarouselmovies", async (req, res) => {
    try {
        const carouselmovies = await Carousel.find({});

        if (!carouselmovies) {
            return res.status(400).json({ error: "Can't get carousel movies" });
        }

        const movies = await Movie.find({
            _id: carouselmovies.map(ele => {
                return ele.movieId;
            })
        });

        if (!movies) {
            return res.status(400).json({ error: "Can't get carousel movies" });
        }


        res.json({ movies: movies });
    } catch (error) {
        console.log(error);
    }
});

router.delete("/deletecarouselmovie/:movieID", async (req, res) => {
    try {
        const movieID = req.params.movieID;

        const carousel = await Carousel.findOneAndDelete({ movieId: movieID });

        if (!carousel) {
            return res.status(400).json({ error: "Can't delete carousel movie" });
        }

        res.send(true)
    } catch (error) {

    }
});

router.delete("/deletefromplaylist/:movieID", getuser, async (req, res) => {
    try {
        const movieID = req.params.movieID;
        const user = req.user;

        const playlist = await Playlist.findOneAndDelete({ movieId: movieID, userId: user });

        if (!playlist) {
            return res.status(400).json({ error: "Some error occured" });
        }

        res.send(true);

    } catch (error) {
        console.log(error);
    }
});

router.post("/getmostratedmovies", async (req, res) => {
    try {
        const movies = await Movie.find({ type: "movie" }).sort({ "totalratings": -1 }).limit(10);

        res.send(movies)
    } catch (error) {
        console.log(error);
    }
});

router.post("/getmostratedtvseries", async (req, res) => {
    try {
        const movies = await Movie.find({ type: "tvseries" }).sort({ "totalratings": -1 }).limit(10);

        res.send(movies)
    } catch (error) {
        console.log(error);
    }
});

router.post("/getagewiserating/:movieID", async (req, res) => {
    try {
        const todayDate = new Date()
        let year = todayDate.getFullYear();

        const { age } = req.body

        if (!age) {
            return res.status(400).json({ error: "Some error occured" });
        }

        const highage = year - age;

        const users = await User.find({}).select("-password");

        const ageWiseUsers = users.filter((ele) => {
            const userAge = new Date(ele.bdate).getFullYear();

            if (userAge <= highage && userAge >= (highage - 4)) {
                return ele;
            }
            return null;
        })

        const ratings = await Rating.find({ userId: ageWiseUsers.map(ele => ele._id), movieId: req.params.movieID });

        let totalratings = 0;

        ratings.forEach((ele) => {
            totalratings += ele.rating;
        })

        res.send({ rating: parseFloat(totalratings / ratings.length) })
    } catch (error) {
        console.log(error);
    }
});


module.exports = router;
