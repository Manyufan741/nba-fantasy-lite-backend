/** Routes for games */

const express = require("express");
const router = new express.Router();

const LineupAPI = require("../scripts/getLineups");

/** GET /onDate  =>  {lineups: [{lineup}, {lineup},...]}  
*/

router.get("/onDate", async function (req, res, next) {
    try {
        const date = req.query[0];        
        const lineups = await LineupAPI.getLineupsOnDate(date);
        return res.json({lineups});
    } catch (err) {
        return next(err);
    }
});

/** GET /:id  =>  {lineup: [id, date, player1, player2, ...]}  
*/

router.get("/:id/players", async function (req, res, next) {
    try {
        const id = Number(req.params.id);        
        const players = await LineupAPI.getPlayersByLineupId(id);
        return res.json({players});
    } catch (err) {
        return next(err);
    }
});

/** POST /
 * write lineup(date, player1, player2, ..., total_value) to DB
*/

router.post("/", async function (req, res, next) {
    try {
        // console.log("backend starts", req.body);
        const lineup = req.body.lineup;
        const date = req.body.date;
        const message = await LineupAPI.writeLineupToDB(lineup, date);
        return res.json({ message });
    } catch (err) {
        return next(err);
    }
});

/** POST /
 * delete and re-write a lineup(date, player1, player2, ..., total_value) to DB
*/

router.post("/edit/:id", async function (req, res, next) {
    try {
        // console.log("backend starts", req.body);
        const id = req.params.id;
        const lineup = req.body.lineup;
        const date = req.body.date;
        const message = await LineupAPI.updateLineup(id, lineup, date);
        return res.json({ message });
    } catch (err) {
        return next(err);
    }
});



/** DELETE /
 * delete a lineup using id
*/

router.delete("/:id", async function (req, res, next) {
    try {
        const id = Number(req.params.id);
        const message = await LineupAPI.deleteLineupFromDB(id);   
        return res.json({message});
    } catch (err) {
        console.log("Error when deleting lineup from DB");
        return next(err);
    }
});

module.exports = router;