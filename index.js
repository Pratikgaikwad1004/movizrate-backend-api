const express = require("express");
const connect = require("./db");
const cors = require("cors");
const config = require("./config.json");
connect();
const app = express();
app.use("", express.static("images"));

const host = config.server.host;
const port = config.server.port;

app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", require("./routes/UserAuth"));
app.use("/api/v1/movies", require("./routes/MoviesRoute"));
app.listen(port, () => {
  console.log(`App is running on http://${host}:${port}`);
});
