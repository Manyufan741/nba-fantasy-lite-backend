/** Express app for nba-fantasy-lite. */

const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());


const teamsRoutes = require("./routes/teams");
const gamesRoutes = require("./routes/games");
const playersRoutes = require("./routes/players");
const lineupsRoutes = require("./routes/lineups");
const socreRoutes = require("./routes/scores");
const allRoutes = require("./routes/all");

app.use("/games", gamesRoutes);
app.use("/teams", teamsRoutes);
app.use("/players", playersRoutes);
app.use("/lineups", lineupsRoutes);
app.use("/scores", socreRoutes);
app.use("/all", allRoutes);


/** 404 handler */

app.use(function (req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use(function (err, req, res, next) {
  if (err.stack) console.log(err.stack);

  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


module.exports = app;
