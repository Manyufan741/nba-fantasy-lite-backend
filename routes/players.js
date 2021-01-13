/** Routes for players */

const express = require("express");
const router = new express.Router();

const PlayerAPI = require("../scripts/getPlayers");

/** GET all players  =>  {players: [player, player]}  
*/

router.get("/", async function (req, res, next) {
  try {
      const players = await PlayerAPI.getAll();
    return res.json({players});
  } catch (err) {
    return next(err);
  }
});

/** GET players that are playing on the specified date  =>  {players: [player, player]}  
 * request example: { "dates[]": '2019-12-25' }
*/

router.get("/onDate", async function (req, res, next) {
  try {
      const players = await PlayerAPI.getPlayersOnDate(req.query);
      return res.json({players});
  }  catch (err) {
    return next(err);
  }
});

/** GET /:name  => search for players with name  {players: [player, player]}  
*/

router.get("/:name", async function (req, res, next) {
  try {
      const players = await PlayerAPI.searchPlayersFromDB(req.params.name);
      return res.json({players});
  } catch (err) {
    return next(err);
  }
});

/** GET /:name/image  => search for player's image  {image: "....png"}  
*/

router.get("/:name/image", async function (req, res, next) {
  try {
      const playerImage = await PlayerAPI.getPlayerImage(req.params.name);
      return res.json({playerImage});
  } catch (err) {
    return next(err);
  }
});



module.exports = router;