const axios = require("axios");
const db = require("../db");
const BASE_API_URL = 'https://www.balldontlie.io/api/v1/';
const GameAPI = require("./getGames");
const LineupAPI = require("./getLineups");

class ScoreAPI {
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

    static async getAllScores(date) {
        const lineups = await LineupAPI.getLineupsOnDate(date); //lineups : [{lineup}, {lineup}, ...];
        let players = [];
        let scores = {};    
        if (lineups) {
            for (let lineup of lineups) {
                players = await LineupAPI.getPlayersByLineupId(lineup.id);
                let totalScore = await this.calculateScore(players, date);
                let score = await LineupAPI.updateScore(lineup.id, totalScore);
                scores[lineup.id] = score;
            }    
        }
        return scores; //{lineupId: lineupScore, lineupId: lineupScore, ...}
    }

    static async calculateScore(players, date) {
        let scores = [];
        for (let player of players) {            
            let res = await this.request(`stats`, { "player_ids[]": player.player_id, "dates[]": date });
            if (res.data[0]) {
                let stat = res.data[0];
                scores.push(stat.pts + stat.reb * 1.2 + stat.ast * 1.5 + (stat.stl + stat.blk) * 2 - stat.turnover * 1.5);
            }         
        }
        let total_score = scores.reduce(((accu, curr) => accu + curr), 0);
        total_score = Number(total_score.toFixed(2));
        return total_score;
    }

    static async getPlayerId(name) {
        try {
            const res = await db.query(`SELECT player_id FROM players WHERE name=$1`, [name]);
            if (res.rows[0]) {
                return res.rows[0].player_id;
            }
            return res.rows[0]; //would be "undefined"
        } catch (err) {
            throw new Error(err);
        }
    }

    static async getPerformance(name, date) {
        const playerId = await this.getPlayerId(name);
        const gameRes = await GameAPI.getAllGames({ "dates[]": date });
        try {
            const timer = ms => new Promise(res => setTimeout(res, ms));
            for (let game of gameRes.data) {
                let res = await this.request(`stats`, { "player_ids[]": playerId, "game_ids[]": game.id });
                await timer(1200);
                if (res.data[0]) {
                    let stat = res.data[0];
                    let score = stat.pts + stat.reb * 1.2 + stat.ast * 1.5 + (stat.stl + stat.blk) * 2 - stat.turnover * 1.5;
                    return { name: name, pts: stat.pts, reb: stat.reb, ast: stat.ast, stl: stat.stl, blk: stat.blk, turnover: stat.turnover, score:score };
                }
            }        
            return { name: name, pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, turnover:0, score:0 };    
        } catch (err) {
            console.log("Error in getPerformance");
            throw new Error(err);
        }    
    }

    static async updatePlayerAndLineupScores(date) {
        const lineups = await LineupAPI.getLineupsOnDate(date); //lineups : [{lineup}, {lineup}, ...];
        let players = []
        let result = {};
        let scores = [];
        if (lineups) {
            for (let lineup of lineups) {
                players = await LineupAPI.getPlayersByLineupId(lineup.id);
                for (let player of players) { 
                    let res = await this.request(`stats`, { "player_ids[]": player.player_id, "dates[]": date });
                    if (res.data[0]) {
                        let stat = res.data[0];
                        let score = stat.pts + stat.reb * 1.2 + stat.ast * 1.5 + (stat.stl + stat.blk) * 2 - stat.turnover * 1.5;
                        score = Number(score.toFixed(2));
                        result[player.name] = { pts: stat.pts || 0, reb: stat.reb || 0, ast: stat.ast || 0, stl: stat.stl || 0, blk: stat.blk || 0, turnover: stat.turnover || 0, score: score || 0 };
                        // console.log("result in updatePlayerAndLineupScores", result);
                        scores.push(score);
                    }            
                }
                let total_score = scores.reduce(((accu, curr) => accu + curr), 0);
                total_score = Number(total_score.toFixed(2));
                await LineupAPI.updateScore(lineup.id, total_score);
                scores = []; //reset scores
            }    
        }
        return result; //result be like {'player name':{pts: 10, reb: 4, ...}, 'player name2': {}, ...}
    }
}

module.exports = ScoreAPI;