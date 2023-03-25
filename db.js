const mongoose = require("mongoose");

const MongoURI = "mongodb://localhost:27017/movizrate";

const connect = () => {
  mongoose.connect(MongoURI);
};

if (connect) {
  console.log("Connected");
} else {
  console.log("Database not connected");
}

module.exports = connect;
