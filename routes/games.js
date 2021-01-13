/** Routes for games */

const express = require("express");
const router = new express.Router();

const GameAPI = require("../scripts/getGames");

/** GET /  =>  {games: [game, game]}  
 * request example:  { "dates[]": '2019-12-25' }
*/

router.get("/", async function (req, res, next) {
  try {
    const games = await GameAPI.writeGamesToDB(req.query);
    return res.json({games});
  } catch (err) {
    return next(err);
  }
});

/** GET /onDate  =>  {games: [game, game]}  
*/

router.get("/onDate", async function (req, res, next) {
  try {
    const date = req.query[0];
    // console.log("date in games/onDate", date);
    const games = await GameAPI.getGamesFromDB(date);
    // console.log("games in games/onDate route", games);
    return res.json({games});
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
