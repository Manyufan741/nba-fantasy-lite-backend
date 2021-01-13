/** Routes for games */

const express = require("express");
const router = new express.Router();

const ScoreAPI = require("../scripts/getScores");

/** GET /  =>  {lineups: [{lineup}, {lineup},...]}  
*/

router.get("/", async function (req, res, next) {
    try {
        const date = req.query.date;
        // console.log("date in /scores", date);
        const scores = await ScoreAPI.getAllScores(date);
        return res.json({scores});
    } catch (err) {
        return next(err);
    }
});

/** GET /:name/performance  =>  {pts: 10, reb: 9, ast: 9, ...]}  
*/

router.get("/:name/performance", async function (req, res, next) {
    try {
        const name = req.params.name;
        const date = req.query.date;
        console.log("name in /scores/name/performance", name);
        const stats = await ScoreAPI.getPerformance(name, date);
        return res.json({stats});
    } catch (err) {
        return next(err);
    }
});

/** GET /:name/performance  =>  {pts: 10, reb: 9, ast: 9, ...]}  
*/

router.get("/all-performance", async function (req, res, next) {
    try {
        const date = req.query.date;
        console.log("date in /scores/all-performance", date);
        const playerStats = await ScoreAPI.updatePlayerAndLineupScores(date);
        return res.json({playerStats});
    } catch (err) {
        return next(err);
    }
});


module.exports = router;