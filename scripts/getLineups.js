const axios = require("axios");
const db = require("../db");
const BASE_API_URL = 'https://www.balldontlie.io/api/v1/';

class LineupAPI {
    // Basic request configuration for easier API request management
    static async request(endpoint, paramsOrData = {}, verb = "get") {
        
        console.debug("API Call:", endpoint, paramsOrData, verb);

        try {
            return (await axios({
                method: verb,
                url: `${BASE_API_URL}/${endpoint}`,
                [verb === "get" ? "params" : "data"]: paramsOrData
            })).data;
            // axios sends query string data via the "params" key,
            // and request body data via the "data" key,
            // so the key we need depends on the HTTP verb
        }

        catch (err) {
            console.error("API Error:", err.response);
            let message = err.response.data.message;
            throw Array.isArray(message) ? message : [message];
        }
    }

    static async getLineupsOnDate(date) {
        try {
            const res = await db.query(`SELECT * FROM lineups WHERE date=$1`,[date])
            return res.rows;    
        } catch (err) {
            throw new Error("Error when getting lineups on date.")
        }    
    }

    static async getLineupById(id) {
        try {
            const res = await db.query(`SELECT * FROM lineups WHERE id=$1`, [id]);
            return res.rows[0];
        } catch (err) {
            throw new Error("Error when getting lineup by id.");
        }
    }

    static async getPlayersByLineupId(id) {
        try {
            const lineup = await this.getLineupById(id);
            // console.log("lineup from getLineupById", lineup);
            let players = [];
            if (lineup) {
                for (let key in lineup) {
                    if (key.includes('player')) {
                        let player = await db.query(`SELECT * FROM players WHERE name=$1`, [lineup[key]]);
                        if (player.rows[0]) {
                            players.push(player.rows[0]);    
                        }                        
                    }
                }
            }
            // console.log("players after getPlayersBylineupid", players);
            return players;
        } catch (err) {
            throw new Error("Error when getting players by lineup id.");
        }
    }

    static async updateLineup(id, lineup, date) {
        try {
            await this.deleteLineupFromDB(id);
            await this.writeLineupToDB(lineup, date);
            return `Lineup ${id} is deleted and re-written.`;
        } catch (err) {
            throw new Error("Error when updating Lineup.");
        }
    }

    static async updateScore(id, score) {
        try {
            // console.log("id and score in updateScore function", id, " ", score);
            const res = await db.query(`UPDATE lineups SET score=$1 WHERE id=$2 RETURNING id, score`, [score, id]);
            // return `${res.rows[0].id} is updated with score of ${res.rows[0].score}.`;
            return res.rows[0].score;
        } catch (err) {
            throw new Error("Error when updating score in lineup.");
        }
    }

    static async writeLineupToDB(lineup, date) {
        try {
            const res = await db.query(`INSERT INTO lineups (player1) VALUES ($1) RETURNING id`,
                [lineup[0].name]);
            let count = 1;
            let total_value = 0;
            for (let player of lineup) {
                await db.query(`UPDATE lineups SET player${count} = $1 WHERE id=$2`,
                    [
                        player.name,
                        res.rows[0].id
                    ]
                );
                count += 1;
                total_value += player.value;
            }
            const re = await db.query(`UPDATE lineups SET date = $1, total_value=$2 WHERE id=$3 RETURNING id`, [date, total_value, res.rows[0].id]);
            return `Lineup ${re.rows[0].id} is written to DB`;
        } catch (err) {
            throw new Error(err);
        }
    }

    static async deleteLineupFromDB(id) {
        try {
            await db.query(`DELETE FROM lineups WHERE id=$1`, [id]);
            return `Lineup ${id} deleted.`;
        } catch(err) {
            throw new Error("Error when deleting contents in lineups table.");
        }
    }
}

module.exports = LineupAPI;
