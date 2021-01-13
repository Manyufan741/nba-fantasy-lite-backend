/** Routes for teams */

const express = require("express");
const router = new express.Router();

const TeamAPI = require("../scripts/getTeams");

/** GET all teams  =>  {teams: [team, team]}  
 * request example : { "per_page": 100 }
*/

router.get("/", async function (req, res, next) {
  try {
    const teams = await TeamAPI.writeTeamsToDB();
    return res.json({teams});
  }

  catch (err) {
    return next(err);
  }
});

/** GET teams that are playing on the specified date  =>  {teams: [team, team]}  
 * request example: { "dates[]": '2019-12-25' }
*/

router.get("/onDate", async function (req, res, next) {
  try {
    const teams = await TeamAPI.updateTeamStatus(req.query);
    return res.json({teams});
  }

  catch (err) {
    return next(err);
  }
});

module.exports = router;
