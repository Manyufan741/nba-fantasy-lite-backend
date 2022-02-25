const axios = require("axios");
const db = require("../db");
const BASE_API_URL = 'https://www.balldontlie.io/api/v1/';
const TeamAPI = require("./getTeams");

class PlayerAPI {
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
        } catch (err) {
            // console.error("API Error:", err.response);
            // let message = err.response.data.message;
            // throw Array.isArray(message) ? message : [message];
            throw new Error("API error! Too many requests.");
        }    
    }

    // Get players and their stats
    static async getPlayers() {
        const pageInfo = await this.request(`players`, { 'per_page': 100, 'page': 29 });
        const totalPages = pageInfo.meta.total_pages;
        for (let i = 29; i <= totalPages; i++) {
            try {
                const res = await this.request(`players`, { 'per_page': 100, 'page': i });
                const timer = ms => new Promise(res => setTimeout(res, ms));
                for (let player of res.data) {
                    let fullName = player.first_name + ' ' + player.last_name;
                    await this.getPlayerSeasonAvg(player.id, fullName, player.team.full_name);    
                    await timer(1200);
                }
            } catch (err) {
                // console.log("API Error:", err.response);
                // throw err.response;
                throw new Error("API error during getPlayers.");
            }
        }
    }
    //Get players' 2019 season stats
    static async getPlayerSeasonAvg(playerId, playerName, playerTeam) {
        try {
            const playerStats = await this.request(`season_averages`, { 'season': 2021, 'player_ids[]': playerId });
            // console.log("player stats: ", playerStats.data);
            if (playerStats.data.length !== 0) {
                await this.writePlayerToDB(playerStats.data[0], playerName, playerTeam);
            }
        } catch(err) {
            // console.log("API Error:", err.response);
            // throw err.response;
            throw new Error("API error during getPlayerSeasonAvg.")
        }
    }

    //Write players' name, stats and teams into DB
    static async writePlayerToDB(playerStats, playerName, playerTeam) {        
        try {
            const checkExist = await db.query(`SELECT name FROM players WHERE name=$1`, [playerName]);
            if (checkExist.rows[0]) {
                return;
            } else {
                let playerVal = this.getValue(playerStats);
                console.log(`Writing ${playerName}, his value is ${playerVal}.`);
                await db.query(`INSERT INTO players (name, player_id, points, rebounds, assists, steals, blocks, turnovers, team, value) 
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                    [
                        playerName,
                        playerStats.player_id,
                        playerStats.pts,
                        playerStats.reb,
                        playerStats.ast,
                        playerStats.stl,
                        playerStats.blk,
                        playerStats.turnover,
                        playerTeam,
                        playerVal
                    ]);
            }    
        } catch (err) {
            throw new Error("Error writing player info into DB.");
        }                    
    }

    static getValue(stats) {
        const val = Math.round(stats.pts * 1 + (stats.reb * 1.2) + (stats.ast * 1.5) + (stats.stl * 2) + (stats.blk * 2) - (stats.turnover * 1.5));
        if (val <= 0) {
            return 1;
        }
        return val;
    }

    //Get all the players in the database
    static async getAll() {
        try {
            const players = await db.query(`SELECT * FROM players`);
            return players.rows;
        } catch {
            throw new Error("Errors when getting all the players.")
        }
    }

    //Get the players that are going to play in the upcoming day
    static async getPlayersOnDate(query) {
        await TeamAPI.updateTeamStatus(query);
        let players = [];
        try {
            const teams = await db.query(`SELECT full_name FROM teams WHERE playupcoming=true`);
            if (teams.rows.length !== 0) {
                for (let team of teams.rows) {
                    let teamPlayers = await db.query(`SELECT * FROM players WHERE team=$1`, [team.full_name]);
                    for (let player of teamPlayers.rows) {
                        players.push(player);    
                    }                  
                }
            }
            // console.log(players);
            return players;
        } catch {
            throw new Error("Errors happen when getPlayerOnDate.");
        }
    }

    //Search for players from database
    static async searchPlayersFromDB(name) {
        try {
            let searchTerm = `%${name}%`;
            // console.log(`Searching ${name} in DB...`);
            let players = await db.query(`SELECT * FROM players WHERE name ILIKE $1`, [searchTerm]);
            if (!players.rows[0]) {
                const error = new Error(`Cannot find players with name ${name}`);
                error.status = 404;
                throw error;
            }
            // console.log("players.rows", players.rows);
            return players.rows;
        } catch(err) {
            throw err;
        }
    }

    static async getPlayerImage(name) {
        try {
            // console.log("name", name);
            const res = await db.query(`SELECT image FROM players WHERE name=$1`, [name]);
            // console.log(res);
            return { name, image: res.rows[0].image };
        }
        catch (err) {
            console.log("Error when getting player image.");
            throw new Error(err);
        }
    }
}

module.exports = PlayerAPI;

// Player.getPlayers();
// PlayerAPI.getPlayersOnDate({ "seasons[]": 2019, "dates[]": '2019-12-25' });

